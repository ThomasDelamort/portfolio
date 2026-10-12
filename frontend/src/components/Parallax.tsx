import { useRef } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

interface ParallaxProps {
  children?: ReactNode;
  /**
   * Pixels of drift either side of the resting position while the element
   * crosses the viewport. Positive reads as closer (moves faster than the
   * page), negative as farther away (lags behind it).
   */
  offset?: number;
  axis?: "x" | "y";
  className?: string;
}

const Parallax = ({
  children,
  offset = 60,
  axis = "y",
  className,
}: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const shift = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  const style = reduceMotion
    ? undefined
    : axis === "x"
      ? { x: shift }
      : { y: shift };

  return (
    <motion.div ref={ref} className={className} style={style}>
      {children}
    </motion.div>
  );
};

export default Parallax;
