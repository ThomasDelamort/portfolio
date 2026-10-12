import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import type {
  SizeMap,
  AlignMap,
  PhotoPanel,
  QuotePanel,
} from "../../types/index.ts";
import panels from "../../data/panels";

const sizeMap: SizeMap = {
  sm: "w-[220px] sm:w-[260px] aspect-[3/4]",
  md: "w-[300px] sm:w-[360px] aspect-[4/5]",
  lg: "w-[420px] sm:w-[560px] aspect-square",
};

const alignMap: AlignMap = {
  top: "self-start mt-8",
  center: "self-center",
  bottom: "self-end mb-8",
};

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

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const still = useReducedMotion() ?? false;

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

  return (
    <section id="about" ref={sectionRef} className="relative h-[300vh] my-24">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden pt-24 pb-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto w-full px-6 mb-10 shrink-0">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-red-500">
            Who I am
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Christian Neal Paredes
          </h2>
        </div>

        <motion.div
          ref={trackRef}
          className="flex items-stretch gap-8 sm:gap-16 px-6 sm:px-12 will-change-transform"
          style={{ x }}
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
        </motion.div>

        <div className="max-w-6xl mx-auto w-full px-6 mt-8 shrink-0">
          <p className="font-mono text-xs text-gray-600">↓ keep scrolling</p>
        </div>
      </div>
    </section>
  );
};

export default About;
