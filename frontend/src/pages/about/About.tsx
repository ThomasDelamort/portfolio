import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {
  SizeMap,
  AlignMap,
  PhotoPanel,
  QuotePanel,
} from "../../types/index.ts";
import panels from "../../data/panels";
import { horizontalWheelDelta } from "../../utils/wheel";

// Sideways wheel travel past the end of the track that counts as "keep going".
const END_PULL_PX = 100;
// Wheel events closer together than this belong to one gesture, momentum
// included. A gesture that arrives at the end never carries on to Contact; only
// a fresh one that starts there does.
const WHEEL_GAP_MS = 250;
// Finger travel past the end that carries on to Contact.
const END_SWIPE_PX = 60;
// Mouse travel before a press turns into a drag.
const DRAG_SLOP = 5;
// Fraction of the track's width the arrow buttons scroll by.
const PAGE_SHARE = 0.8;
// Sub-pixel slack when deciding whether the track is at an edge.
const EDGE_SLACK = 2;

// Sized by height so header, photos and captions fit in one screen on short
// viewports too; the px caps are the sizes used on tall ones.
const sizeMap: SizeMap = {
  sm: "h-[min(36svh,293px)] sm:h-[min(38svh,347px)] aspect-[3/4]",
  md: "h-[min(46svh,375px)] sm:h-[min(48svh,450px)] aspect-[4/5]",
  lg: "h-[min(56svh,420px)] sm:h-[min(58svh,560px)] aspect-square",
};

const alignMap: AlignMap = {
  top: "self-start mt-8",
  center: "self-center",
  bottom: "self-end mb-8",
};

type Edge = "start" | "middle" | "end";

const atEnd = (el: HTMLElement) =>
  el.scrollLeft >= el.scrollWidth - el.clientWidth - EDGE_SLACK;

const edgeOf = (el: HTMLElement): Edge =>
  el.scrollLeft <= EDGE_SLACK ? "start" : atEnd(el) ? "end" : "middle";

interface PanelProps<T> {
  panel: T;
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}

// How far the track has travelled past this panel, roughly -1..1.
const relativeTo = (progress: number, index: number) =>
  progress - index / (panels.length - 1);

const Quote = ({ panel, progress, still }: PanelProps<QuotePanel>) => {
  // The three lines peel apart as the track carries them away.
  const fillX = useTransform(progress, [0, 1], [0, 40]);
  const accentX = useTransform(progress, [0, 1], [0, 100]);

  return (
    <div className="shrink-0 w-75 sm:w-95 self-center">
      <p className="text-3xl sm:text-5xl font-extrabold text-zinc-200 leading-tight tracking-tight">
        {panel.text}
      </p>
      <motion.p
        className="text-3xl sm:text-5xl font-extrabold text-zinc-200 leading-tight tracking-tight"
        style={still ? undefined : { x: fillX }}
      >
        {panel.fill}
      </motion.p>
      <motion.p
        className="text-3xl sm:text-5xl font-extrabold text-red-600 leading-tight tracking-tight"
        style={still ? undefined : { x: accentX }}
      >
        {panel.accent}
      </motion.p>
    </div>
  );
};

const Photo = ({ panel, index, progress, still }: PanelProps<PhotoPanel>) => {
  // The frame bobs on its own depth layer while the photo slides inside it
  // against the direction of travel, like looking through a window.
  const lift = index % 2 === 0 ? 50 : -50;
  const frameY = useTransform(progress, (p) => relativeTo(p, index) * lift);
  const imageX = useTransform(
    progress,
    (p) => `${Math.max(-11, Math.min(11, relativeTo(p, index) * 22))}%`,
  );

  return (
    <motion.figure
      className={`group shrink-0 ${alignMap[panel.align] || "self-center"}`}
      style={still ? undefined : { y: frameY }}
    >
      <div
        className={`relative overflow-hidden rounded-lg border border-white/10 ${sizeMap[panel.size] || sizeMap.md}`}
      >
        <motion.img
          src={panel.image}
          alt={panel.caption}
          draggable={false}
          className="w-full h-full object-cover scale-125 grayscale-40 transition-[filter,scale] duration-700 group-hover:grayscale-0 group-hover:scale-[1.32]"
          style={still ? undefined : { x: imageX }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
      <figcaption className="mt-3 font-mono text-xs flex items-center gap-3">
        <span className="text-red-500 uppercase tracking-wider">
          {panel.caption}
        </span>
        {panel.tag && (
          <>
            <span className="h-px w-6 bg-white/20" />
            <span className="text-gray-500">{panel.tag}</span>
          </>
        )}
      </figcaption>
    </motion.figure>
  );
};

// Last stop on the track: what sideways scrolling past the end carries on to.
const EndCap = ({ onContinue }: { onContinue: () => void }) => (
  <div className="shrink-0 w-60 sm:w-80 self-center">
    <button
      type="button"
      onClick={onContinue}
      className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-red-500">
        Next
      </span>
      <span className="mt-3 flex items-center gap-3 text-3xl sm:text-5xl font-extrabold text-zinc-200 leading-tight tracking-tight transition-colors group-hover:text-white">
        Get in touch
        <ArrowRight className="h-8 w-8 shrink-0 text-red-600 transition-transform group-hover:translate-x-2" />
      </span>
    </button>
  </div>
);

const arrowButton =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:pointer-events-none disabled:opacity-30";

const About = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const still = useReducedMotion() ?? false;
  const [edge, setEdge] = useState<Edge>("start");

  const { scrollXProgress } = useScroll({ container: scrollerRef });

  const goToContact = useCallback(() => navigate("/contact"), [navigate]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => setEdge(edgeOf(scroller));
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);

    // Sideways scrolling past the end carries on down to Contact. The scroller
    // already does the scrolling; this only watches for the push beyond it.
    let lastWheel = -Infinity;
    let startedAtEnd = false;
    let pulled = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = horizontalWheelDelta(e);
      if (dx === null) return; // vertical: the page scrolls on by itself
      if (e.timeStamp - lastWheel > WHEEL_GAP_MS) {
        startedAtEnd = atEnd(scroller);
        pulled = 0;
      }
      lastWheel = e.timeStamp;
      if (!startedAtEnd || dx <= 0 || !atEnd(scroller)) {
        pulled = 0;
        return;
      }
      pulled += dx;
      if (pulled >= END_PULL_PX) {
        startedAtEnd = false;
        goToContact();
      }
    };
    scroller.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", update);
      scroller.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [goToContact]);

  // Touch: a swipe that starts at the end and keeps heading that way.
  const touch = useRef({ x: 0, y: 0, startedAtEnd: false });

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touch.current = {
      x: t.clientX,
      y: t.clientY,
      startedAtEnd: atEnd(e.currentTarget),
    };
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touch.current;
    if (!start.startedAtEnd) return;
    start.startedAtEnd = false;
    const t = e.changedTouches[0];
    const dx = start.x - t.clientX;
    const dy = Math.abs(start.y - t.clientY);
    if (dx >= END_SWIPE_PX && dx > dy * 1.5) goToContact();
  };

  // A mouse has no sideways wheel, so let it drag the track like a finger would.
  const mouse = useRef<{
    id: number;
    x: number;
    left: number;
    dragging: boolean;
  } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    mouse.current = {
      id: e.pointerId,
      x: e.clientX,
      left: e.currentTarget.scrollLeft,
      dragging: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const m = mouse.current;
    if (!m || e.pointerId !== m.id) return;
    const dx = e.clientX - m.x;
    if (!m.dragging) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      m.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.dragging = "true";
    }
    e.currentTarget.scrollLeft = m.left - dx;
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const m = mouse.current;
    if (!m || e.pointerId !== m.id) return;
    mouse.current = null;
    e.currentTarget.dataset.dragging = "false";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // The scroller already handles the arrows; once it is at the end, one more
    // press carries on.
    if (e.key === "ArrowRight" && !e.repeat && atEnd(e.currentTarget)) {
      e.preventDefault();
      goToContact();
    }
  };

  const page = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * scroller.clientWidth * PAGE_SHARE,
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="about"
      className="relative my-24 flex min-h-[calc(100svh-5rem)] flex-col justify-center py-4"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full px-6 shrink-0 flex items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-red-500">
            Who I am
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Christian Neal Paredes
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edge === "start"}
            aria-label="Scroll back"
            className={arrowButton}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={edge === "end" ? goToContact : () => page(1)}
            aria-label={edge === "end" ? "Continue to contact" : "Scroll forward"}
            className={arrowButton}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sideways track. The vertical padding leaves room for the frames to
          bob without the scroller clipping them. */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label="About me, scroll sideways"
        tabIndex={0}
        data-dragging="false"
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="mt-2 flex items-stretch gap-8 sm:gap-16 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 py-10 sm:px-12 cursor-grab select-none data-[dragging=true]:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {panels.map((panel, i) =>
          panel.type === "quote" ? (
            <Quote
              key={i}
              panel={panel}
              index={i}
              progress={scrollXProgress}
              still={still}
            />
          ) : (
            <Photo
              key={i}
              panel={panel}
              index={i}
              progress={scrollXProgress}
              still={still}
            />
          ),
        )}
        <EndCap onContinue={goToContact} />
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 shrink-0">
        <p className="font-mono text-xs text-gray-600">
          ↔ scroll sideways · ↓ scroll down to move on
        </p>
      </div>
    </section>
  );
};

export default About;
