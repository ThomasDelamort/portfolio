import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";
import BlackHole from "./BlackHole";

// Share of the flight after which it is headed for the dock: it stops leaning
// toward the pointer, and with reduced motion it jumps there.
const SETTLE = 0.5;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pose {
  x: number;
  y: number;
  w: number;
}

// Centre and width of a marker on screen, as if it sat `dy` pixels lower.
const poseOf = (el: HTMLElement, dy = 0): Pose => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 + dy, w: r.width };
};

interface BlackHoleFlightProps {
  /** 16:9 marker where the hole rests at the top of the page. */
  from?: RefObject<HTMLElement | null>;
  /**
   * 16:9 marker where it docks, inside a sticky stage that pins at `landTop`.
   * Render the flight as a direct child of that (positioned) stage too.
   */
  to: RefObject<HTMLElement | null>;
  /**
   * Section holding the stage. The flight runs while its top rises from the
   * bottom of the screen to `landTop`, i.e. until the stage pins.
   */
  landing: RefObject<HTMLElement | null>;
  landTop: number;
  /** Camera elevation over the disk at each end, in radians. */
  fromTilt: number;
  toTilt: number;
}

/**
 * One black hole shared by two sections. It rests at `from`; as the page
 * scrolls it shrinks away into `to`, landing just as the stage pins.
 * Scrolling back up flies it home again.
 *
 * In flight it is pinned to the screen; docked, it sits in the stage and
 * scrolls natively with it. Either way it lives in the stage's stacking
 * context, so whatever orbits in there still passes in front and behind it.
 */
const BlackHoleFlight = ({
  from,
  to,
  landing,
  landTop,
  fromTilt,
  toTilt,
}: BlackHoleFlightProps) => {
  const holeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const still = reduceMotion ?? false;
  const tiltOffset = useMotionValue(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const hole = holeRef.current;
    const stage = hole?.parentElement;
    if (!hole || !stage) return;

    let raf = 0;
    let wasSettled = false;

    const update = () => {
      raf = 0;
      const dock = to.current;
      const track = landing.current;
      if (!dock || !track) return;
      const origin = from?.current ?? dock;

      const vh = window.innerHeight;
      const travel = Math.max(vh - landTop, 1);
      // 0 until the landing section peeks over the fold, 1 once it has pinned.
      const p = clamp01((vh - track.getBoundingClientRect().top) / travel);
      const docked = still ? p >= SETTLE : p >= 1;

      let pose: Pose;
      let tilt = docked ? toTilt - fromTilt : 0;
      if (docked) {
        pose = poseOf(dock);
      } else if (still) {
        pose = poseOf(origin);
      } else {
        // Both ends held where they rest on screen: the origin as it was
        // before the page moved, the dock as it will be once pinned.
        const start = poseOf(origin, p * travel);
        const end = poseOf(dock, -(1 - p) * travel);
        const t = p * p * (3 - 2 * p);
        // Straight down into the dock, shrinking on the way.
        pose = {
          x: mix(start.x, end.x, t),
          y: mix(start.y, end.y, t),
          w: mix(start.w, end.w, t),
        };
        tilt = (toTilt - fromTilt) * t;
      }

      // The box keeps the larger marker's size and is scaled to the pose, so
      // the canvas never reallocates mid-scroll.
      const base = Math.max(origin.offsetWidth, dock.offsetWidth);
      let { x, y } = pose;
      if (docked) {
        const s = stage.getBoundingClientRect();
        x -= s.left;
        y -= s.top;
      }
      hole.style.position = docked ? "absolute" : "fixed";
      hole.style.width = `${base}px`;
      hole.style.transform = `translate3d(${x - base / 2}px, ${y - (base * 9) / 32}px, 0) scale(${base ? pose.w / base : 0})`;
      tiltOffset.set(tilt);

      const isSettled = p >= SETTLE;
      if (isSettled !== wasSettled) {
        wasSettled = isSettled;
        setSettled(isSettled);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(schedule);
    for (const el of [from?.current, to.current]) {
      if (el) resizeObserver.observe(el);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [from, to, landing, landTop, fromTilt, toTilt, still, tiltOffset]);

  return (
    <div
      ref={holeRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 aspect-video w-0 will-change-transform"
    >
      <div className="absolute inset-x-[22%] inset-y-[30%] rounded-full bg-orange-600/15 blur-[100px]" />
      <BlackHole
        tilt={fromTilt}
        tiltOffset={tiltOffset}
        followPointer={!still && !settled}
      />
    </div>
  );
};

export default BlackHoleFlight;
