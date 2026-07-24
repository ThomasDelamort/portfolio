import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export default function useScrollReveal<T extends HTMLElement = HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
}: ScrollRevealOptions = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}
