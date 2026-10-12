import { useRef } from "react";
import type { RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Download, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import RotatingRole from "./components/RotatingRole";

interface HeroProps {
  /** Marks where the shared black hole rests while the hero is in view. */
  holeRef?: RefObject<HTMLDivElement | null>;
}

const Hero = ({ holeRef }: HeroProps): React.JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // 0 while the hero fills the screen, 1 once it has scrolled out of view.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // The copy lifts off as you leave, while the black hole flies past it.
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const still = reduceMotion ?? false;

  return (
    <section
      id="home"
      ref={sectionRef}
      // z-10: the black hole is drawn by Projects, and this keeps the copy and
      // scrim above it while it rests here and as it flies out.
      className="relative isolate z-10 flex min-h-[calc(100svh-5rem)] w-full items-center overflow-hidden"
    >
      {/* Where the black hole rests: above the copy on small screens, to its
          right on large. BlackHoleFlight draws it here, then flies it down. */}
      <div
        ref={holeRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-1/2 top-[24svh] aspect-video w-[150vw] -translate-x-1/2 -translate-y-1/2 sm:w-[120vw] lg:left-[66%] lg:top-1/2 lg:w-[78vw]"
      />

      {/* Scrim: keeps the copy readable where the disk passes behind it. It
          leaves with the copy, and its bottom edge is feathered so it never
          cuts a line across the hole as the hole flies out below it. */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-[60%] bg-linear-to-r from-black/75 via-black/35 to-transparent mask-[linear-gradient(to_bottom,black_65%,transparent)] lg:block"
        style={still ? undefined : { opacity: copyOpacity }}
      />

      <motion.div
        className="mx-auto w-full max-w-6xl px-6 pt-[44svh] pb-24 lg:pt-0 lg:pb-0"
        style={still ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <div className="max-w-xl space-y-6 text-left">
          <p className="text-2xl text-gray-400">I am</p>
          <h1 className="bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-[clamp(3rem,9vw,9rem)] font-extrabold leading-none text-transparent">
            Neal
          </h1>
          <RotatingRole />
          <p className="max-w-md text-lg text-gray-400">
            Fullstack developer who enjoys turning ideas into clean, functional
            products. I care about the details, from code architecture to
            pixel-perfect UI, and I'm always chasing the next interesting
            problem.
          </p>

          <div className="mt-12 flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
            <a
              href="/resume.pdf"
              download="Neal-Paredes-Resume.pdf"
              className="btn-resume"
            >
              <Download className="h-5 w-5" />
              Resume
            </a>
            <Link to="/contact" className="btn-contact">
              Contact Me
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        style={still ? undefined : { opacity: cueOpacity }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500">
          Scroll to enter orbit
        </span>
        <span className="h-10 w-px animate-pulse bg-linear-to-b from-red-500 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
