import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
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
// Pointer travel before a press turns into a drag.
const DRAG_SLOP = 6;
// Fraction of the screen's width the arrow buttons slide the track by.
const PAGE_SHARE = 0.8;
// Per-millisecond decay of a fling's speed once the pointer lets go.
const FLING_FRICTION = 0.995;
// A fling stops once it slows below this, in px per ms.
const FLING_MIN_SPEED = 0.02;

// Sized by height so header, photos and captions fit the pinned screen on
// short viewports too; the px caps are the sizes used on tall ones.
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

// Last stop on the track: what scrolling on past the end carries on to.
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
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const still = useReducedMotion() ?? false;
  const [edge, setEdge] = useState<Edge>("start");

  // Scrolling down slides the track: the section pins for its whole height
  // and the page scroll through it is the track's position.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // How far the track must slide to bring its last panel into view.
  const maxX = useMotionValue(0);
  const x = useTransform(
    [scrollYProgress, maxX],
    ([p, max]: number[]) => -p * max,
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () =>
      maxX.set(Math.max(track.scrollWidth - window.innerWidth, 0));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [maxX]);

  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setEdge(p <= 0.001 ? "start" : p >= 0.999 ? "end" : "middle"),
  );

  const goToContact = useCallback(() => navigate("/contact"), [navigate]);

  // The stretch of page scroll the track slides over, and how much page scroll
  // moves it by one pixel.
  const span = useCallback(() => {
    const section = sectionRef.current;
    const max = maxX.get();
    if (!section || max <= 0) return null;
    const start = section.getBoundingClientRect().top + window.scrollY;
    const end = start + section.offsetHeight - window.innerHeight;
    return end > start ? { start, end, perPx: (end - start) / max } : null;
  }, [maxX]);

  const atEnd = useCallback(() => {
    const s = span();
    return s !== null && window.scrollY >= s.end - 1;
  }, [span]);

  // Sideways input slides the track `dx` px (positive = on toward the end) by
  // scrolling the page, so it moves exactly as scrolling down would and the two
  // never disagree. It stops at either end of the track instead of scrolling on
  // into Skills or Contact, and returns how much of a forward push was left
  // over past the end.
  const slide = useCallback(
    (dx: number) => {
      const s = span();
      if (!s) return 0;
      const y = window.scrollY;
      const next =
        dx < 0
          ? Math.max(y + dx * s.perPx, Math.min(y, s.start))
          : Math.min(y + dx * s.perPx, Math.max(y, s.end));
      if (next !== y) window.scrollTo({ top: next, behavior: "instant" });
      return dx > 0 ? dx - (next - y) / s.perPx : 0;
    },
    [span],
  );

  // A drag keeps coasting after the pointer lets go, like a native swipe.
  const flingFrame = useRef(0);

  const fling = (velocity: number) => {
    cancelAnimationFrame(flingFrame.current);
    if (still) return;
    let v = velocity;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      v *= FLING_FRICTION ** dt;
      if (Math.abs(v) < FLING_MIN_SPEED) return;
      const before = window.scrollY;
      slide(v * dt);
      if (window.scrollY === before) return; // ran into an end
      flingFrame.current = requestAnimationFrame(step);
    };
    flingFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(flingFrame.current), []);

  // Trackpad swipes and shift + wheel. Vertical scrolling is left alone: it
  // already slides the track. Sideways scrolling past the end carries on to
  // Contact. Non-passive so a sideways swipe can't trigger the browser's back
  // gesture.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let lastWheel = -Infinity;
    let startedAtEnd = false;
    let pulled = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = horizontalWheelDelta(e);
      if (dx === null) return;
      e.preventDefault();
      cancelAnimationFrame(flingFrame.current);
      if (e.timeStamp - lastWheel > WHEEL_GAP_MS) {
        startedAtEnd = atEnd();
        pulled = 0;
      }
      lastWheel = e.timeStamp;
      const past = slide(dx);
      if (!startedAtEnd || past <= 0) {
        if (dx < 0) pulled = 0;
        return;
      }
      pulled += past;
      if (pulled >= END_PULL_PX) {
        startedAtEnd = false;
        goToContact();
      }
    };
    section.addEventListener("wheel", onWheel, { passive: false });
    return () => section.removeEventListener("wheel", onWheel);
  }, [slide, atEnd, goToContact]);

  // Dragging the track sideways with a finger or a mouse. The track is
  // touch-action: pan-y, so a vertical swipe still scrolls the page natively
  // (sliding the track) and only sideways moves reach us.
  const drag = useRef({
    id: -1,
    startX: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0, // px per ms, smoothed
    dragging: false,
    startedAtEnd: false,
    pulled: 0,
  });

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(flingFrame.current);
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      dragging: false,
      startedAtEnd: atEnd(),
      pulled: 0,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    if (!d.dragging) {
      if (Math.abs(e.clientX - d.startX) < DRAG_SLOP) return;
      d.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const dx = e.clientX - d.lastX;
    const dt = Math.max(e.timeStamp - d.lastT, 1);
    d.velocity = 0.7 * d.velocity + 0.3 * (dx / dt);
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    // The track follows the pointer: dragging left moves it on.
    const past = slide(-dx);
    if (d.startedAtEnd && past > 0) d.pulled += past;
    else if (dx > 0) d.pulled = 0;
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    d.id = -1;
    if (!d.dragging) return;
    d.dragging = false;
    if (d.startedAtEnd && d.pulled >= END_SWIPE_PX) {
      goToContact();
      return;
    }
    // A pointer that stopped before letting go carries no momentum.
    if (e.timeStamp - d.lastT <= 80) fling(-d.velocity);
  };

  // The arrow buttons (and arrow keys) step the track a screen at a time; past
  // the end they carry on to Contact.
  const page = (direction: 1 | -1) => {
    if (direction > 0 && atEnd()) {
      goToContact();
      return;
    }
    const s = span();
    if (!s) return;
    const y = window.scrollY;
    const step = window.innerWidth * PAGE_SHARE * s.perPx;
    const top =
      direction < 0
        ? Math.max(y - step, Math.min(y, s.start))
        : Math.min(y + step, Math.max(y, s.end));
    window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      page(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      page(-1);
    }
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      onKeyDown={onKeyDown}
      className="relative h-[300vh] my-24"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden pt-24 pb-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto w-full px-6 mb-10 shrink-0 flex items-end justify-between gap-6">
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
              onClick={() => page(1)}
              aria-label={
                edge === "end" ? "Continue to contact" : "Scroll forward"
              }
              className={arrowButton}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <motion.div
          ref={trackRef}
          className="flex items-stretch gap-8 sm:gap-16 px-6 sm:px-12 will-change-transform cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ x }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          {panels.map((panel, i) =>
            panel.type === "quote" ? (
              <Quote
                key={i}
                panel={panel}
                index={i}
                progress={scrollYProgress}
                still={still}
              />
            ) : (
              <Photo
                key={i}
                panel={panel}
                index={i}
                progress={scrollYProgress}
                still={still}
              />
            ),
          )}
          <EndCap onContinue={goToContact} />
        </motion.div>

        <div className="max-w-6xl mx-auto w-full px-6 mt-8 shrink-0">
          <p className="font-mono text-xs text-gray-600">
            ↓ keep scrolling, down or sideways
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
