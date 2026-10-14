import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import projects from "../../data/projects";
import BlackHoleFlight from "../../components/BlackHoleFlight";
import ProjectModal from "../../components/ProjectModal";
import type { Project } from "../../types/index.ts";

const LAST = projects.length - 1;
const STEP = (Math.PI * 2) / projects.length;

// Matches the h-20 navbar the pinned stage sits under.
const NAV_HEIGHT = 80;
// Viewport heights of scrolling it takes to bring the next project around.
const SCROLL_PER_PROJECT = 55;
// Share of each project's scroll segment spent parked at the front.
const HOLD = 0.4;
// Elevation the orbit is viewed from; the black hole camera uses the same.
const ORBIT_TILT = 0.22;
// The hero views the black hole from lower down; the camera swings up from
// there as the hole flies into the orbit.
const HERO_TILT = 0.12;
const MAX_TAGS = 8;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const pad = (n: number) => String(n + 1).padStart(2, "0");

// Scroll progress -> orbit position. Plateaus at every whole number, so each
// project parks at the front for a beat before the orbit swings on.
const toOrbit = (progress: number) => {
  const f = clamp(progress, 0, 1) * LAST;
  const i = Math.floor(f);
  const t = clamp((f - i - HOLD / 2) / (1 - HOLD), 0, 1);
  return i + t * t * (3 - 2 * t);
};

// Where a card sits when it is `offset` slots away from the front of the
// orbit. cos = 1 is nearest the viewer, -1 is the far side behind the hole.
const pose = (offset: number, width: number, height: number) => {
  const angle = offset * STEP;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const radiusX = width * (width < 640 ? 0.5 : 0.37);
  const radiusY = Math.min(height * 0.3, radiusX * 0.42);
  return {
    x: sin * radiusX,
    y: cos * radiusY,
    sin,
    cos,
    scale: 0.62 / (1 - 0.38 * cos), // perspective: 1 at the front, ~0.45 behind
  };
};

interface OrbitCardProps {
  project: Project;
  index: number;
  orbit: MotionValue<number>;
  stageWidth: MotionValue<number>;
  stageHeight: MotionValue<number>;
  active: boolean;
  onSelect: (index: number) => void;
}

const OrbitCard = ({
  project,
  index,
  orbit,
  stageWidth,
  stageHeight,
  active,
  onSelect,
}: OrbitCardProps) => {
  const transform = useTransform(
    [orbit, stageWidth, stageHeight],
    ([o, w, h]: number[]) => {
      const p = pose(index - o, w, h);
      return `translate(-50%, -50%) translate3d(${p.x}px, ${p.y}px, 0) perspective(1200px) rotateY(${p.sin * -22}deg) scale(${p.scale})`;
    },
  );
  // The black hole sits at z 50: the near half of the orbit passes in front
  // of it, the far half behind, where its shadow swallows the card.
  const zIndex = useTransform(orbit, (o) => {
    const cos = Math.cos((index - o) * STEP);
    return cos >= 0 ? 51 + Math.round(cos * 48) : Math.round((cos + 1) * 48);
  });
  const opacity = useTransform(orbit, (o) => {
    const near = (Math.cos((index - o) * STEP) + 1) / 2;
    return 0.15 + 0.85 * near ** 1.3;
  });
  const filter = useTransform(orbit, (o) => {
    const near = (Math.cos((index - o) * STEP) + 1) / 2;
    return `brightness(${0.35 + 0.65 * near})`;
  });

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`View details for ${project.title}`}
      aria-current={active ? "true" : undefined}
      className="group absolute left-1/2 top-1/2 w-[clamp(190px,52vw,280px)] text-left will-change-transform focus:outline-none md:w-[clamp(240px,23vw,340px)]"
      style={{ transform, zIndex, opacity, filter }}
    >
      <div
        className={`overflow-hidden rounded-xl border bg-zinc-950 shadow-2xl transition-colors duration-500 group-focus-visible:ring-2 group-focus-visible:ring-red-500 ${
          active
            ? "border-red-500/50 shadow-red-950/60"
            : "border-white/10 shadow-black"
        }`}
      >
        <img
          src={project.image}
          alt=""
          draggable={false}
          className="aspect-video w-full object-cover object-top"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span
          className={`truncate transition-colors ${active ? "text-white" : "text-gray-500"}`}
        >
          {project.title}
        </span>
        <span className="text-red-500">{pad(index)}</span>
      </div>
    </motion.button>
  );
};

interface SegmentProps {
  index: number;
  orbit: MotionValue<number>;
  onSelect: (index: number) => void;
}

// One slice of the progress bar; fills as the orbit sweeps toward its project.
const Segment = ({ index, orbit, onSelect }: SegmentProps) => {
  const fill = useTransform(orbit, (o) => clamp(o - index + 1, 0, 1));
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Go to project ${index + 1}`}
      className="group flex-1 py-2 focus:outline-none"
    >
      <span className="relative block h-1 overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/20 group-focus-visible:ring-2 group-focus-visible:ring-red-500">
        <motion.span
          className="absolute inset-0 origin-left rounded-full bg-red-600"
          style={{ scaleX: fill }}
        />
      </span>
    </button>
  );
};

const detailVariants = {
  enter: (dir: number) => ({ opacity: 0, x: 40 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -40 * dir }),
};

interface ProjectsProps {
  /** Marks where the black hole rests in the hero; it flies in from there. */
  heroHole?: RefObject<HTMLElement | null>;
}

const Projects = ({ heroHole }: ProjectsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // From the stage pinning under the navbar to the section's last pixel.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: [`start ${NAV_HEIGHT}px`, "end end"],
  });
  const stepped = useTransform(scrollYProgress, toOrbit);
  const smoothed = useSpring(stepped, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });
  const orbit = reduceMotion ? stepped : smoothed;

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const activeRef = useRef(0);
  // Project shown in the closer-look modal, if any.
  const [selected, setSelected] = useState<number | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  useMotionValueEvent(orbit, "change", (o) => {
    // Hysteresis: hand over only once the orbit is clearly past the midpoint,
    // or a spring settling on x.5 would flicker between two projects.
    if (Math.abs(o - activeRef.current) < 0.6) return;
    const next = clamp(Math.round(o), 0, LAST);
    if (next === activeRef.current) return;
    setDirection(next > activeRef.current ? 1 : -1);
    activeRef.current = next;
    setActive(next);
  });

  const stageWidth = useMotionValue(0);
  const stageHeight = useMotionValue(0);
  const [holeWidth, setHoleWidth] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      stageWidth.set(width);
      stageHeight.set(height);
      // Smaller than where it rests in the hero, so it shrinks on the way in.
      setHoleWidth(Math.min(width * 0.7, height * 1.4));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageWidth, stageHeight]);

  // The orbit is driven by scroll, so jumping to a project means scrolling to
  // the point where it parks at the front.
  const scrollToProject = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const top =
        section.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      const distance = section.offsetHeight - (window.innerHeight - NAV_HEIGHT);
      window.scrollTo({
        top: top + (clamp(index, 0, LAST) / LAST) * distance,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // The modal is portalled, but its key events still bubble through here.
    if (selected !== null) return;
    if (e.key === "ArrowRight" && active < LAST) {
      e.preventDefault();
      scrollToProject(active + 1);
    } else if (e.key === "ArrowLeft" && active > 0) {
      e.preventDefault();
      scrollToProject(active - 1);
    }
  };

  const project = projects[active];
  const hasLive = project.liveUrl !== "" && project.liveUrl !== "#";
  const extraTags = project.tags.length - MAX_TAGS;

  return (
    <section
      id="projects"
      ref={sectionRef}
      onKeyDown={onKeyDown}
      className="relative"
      style={{
        height: `calc(100svh - 5rem + ${LAST * SCROLL_PER_PROJECT}svh)`,
      }}
    >
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] flex-col overflow-hidden">
        {/* Header. z-10 keeps it above the black hole as it flies in. */}
        <div className="relative z-10 mx-auto w-full max-w-6xl shrink-0 px-6 pt-6 sm:pt-10">
          <div className="flex items-end justify-between border-b border-white/10 pb-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-red-500">
                Fullstack
              </span>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Projects
              </h2>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm tabular-nums text-gray-500">
                <span className="text-white">{pad(active)}</span>
                <span className="mx-1">/</span>
                <span>{pad(LAST)}</span>
              </div>
              <p className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 sm:block">
                Scroll to orbit
              </p>
            </div>
          </div>
        </div>

        {/* Orbit stage */}
        <div ref={stageRef} className="relative isolate min-h-0 flex-1">
          {/* Where the black hole docks at the centre of the orbit */}
          <div
            ref={holeRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute left-1/2 top-[44%] aspect-video -translate-x-1/2 -translate-y-1/2"
            style={{ width: holeWidth }}
          />
          {/* The hero's black hole, flown in. It renders here, at z 50 in the
              stage, so the orbiting cards pass in front of and behind it. */}
          <BlackHoleFlight
            from={heroHole}
            to={holeRef}
            landing={sectionRef}
            landTop={NAV_HEIGHT}
            fromTilt={HERO_TILT}
            toTilt={ORBIT_TILT}
          />

          {projects.map((p, i) => (
            <OrbitCard
              key={p.title}
              project={p}
              index={i}
              orbit={orbit}
              stageWidth={stageWidth}
              stageHeight={stageHeight}
              active={i === active}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Active project */}
        <div className="relative z-10 mx-auto w-full max-w-6xl shrink-0 px-6 pb-5 sm:pb-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <div className="relative min-h-44 sm:min-h-40" aria-live="polite">
              <AnimatePresence
                mode="popLayout"
                custom={direction}
                initial={false}
              >
                <motion.div
                  key={active}
                  custom={direction}
                  variants={detailVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                    ease: "easeOut",
                  }}
                >
                  <div className="mb-2 flex items-center gap-3 font-mono text-xs text-gray-500">
                    <span className="text-red-500">{project.year}</span>
                    <span className="h-px w-8 bg-white/20" />
                    <span>{project.tags.length} technologies</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                    {project.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gray-500">
                    {project.tags.slice(0, MAX_TAGS).map((tag) => (
                      <li key={tag} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-red-600" />
                        {tag}
                      </li>
                    ))}
                    {extraTags > 0 && (
                      <li className="text-gray-600">+{extraTags} more</li>
                    )}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-6 lg:justify-end">
              <div className="flex items-center gap-6">
                {hasLive && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 border-b border-red-600 pb-1 text-sm font-semibold text-white transition-colors hover:text-red-400"
                  >
                    View live
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <FaGithub className="h-4 w-4" />
                    Source
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 lg:border-l lg:border-white/10 lg:pl-6">
                <button
                  type="button"
                  onClick={() => scrollToProject(active - 1)}
                  disabled={active === 0}
                  aria-label="Previous project"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToProject(active + 1)}
                  disabled={active === LAST}
                  aria-label="Next project"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 sm:mt-5">
            {projects.map((p, i) => (
              <Segment
                key={p.title}
                index={i}
                orbit={orbit}
                onSelect={scrollToProject}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <ProjectModal
            key={selected}
            project={projects[selected]}
            index={selected}
            total={projects.length}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
