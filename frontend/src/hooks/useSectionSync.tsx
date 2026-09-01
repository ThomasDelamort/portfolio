import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sections from "../data/sections";

// Matches section[id] { scroll-margin-top: 80px } under the 80px navbar.
const ACTIVE_OFFSET = 120;

// Where `scrollend` is unavailable (Safari), a programmatic scroll counts as
// finished once this long passes with no scroll event. A fixed timer can't be
// used instead: smooth-scroll duration grows with distance, and releasing
// early lets the spy rewrite the URL to a section that is merely passing by.
const SCROLL_QUIET_MS = 150;

// Hard ceiling so suppression can never get stuck on.
const SCROLL_SETTLE_MAX_MS = 3000;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pathToSection = (pathname: string) =>
  sections.find((s) => s.path === pathname);

/**
 * Keeps the URL and the visible section in sync on the single-page site.
 *
 * - Navigating (click, deep link, legacy #hash) scrolls to that section.
 * - Scrolling rewrites the URL to whatever section you're looking at.
 *
 * Both directions share one suppression flag: while a programmatic scroll is
 * in flight the spy must stay quiet, otherwise a cold load on /projects would
 * see the Hero at the top, rewrite the URL to "/", and cancel the deep link
 * before it ever moved.
 */
export default function useSectionSync(loading: boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  const suppressSpy = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const activePath = useRef(location.pathname);
  const didInitialScroll = useRef(false);

  // Scroll to a section and hold the spy off until the motion settles.
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    suppressSpy.current = true;
    if (settleTimer.current !== null) clearTimeout(settleTimer.current);

    let quietTimer: number | null = null;

    const release = () => {
      suppressSpy.current = false;
      if (quietTimer !== null) clearTimeout(quietTimer);
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
      settleTimer.current = null;
      window.removeEventListener("scrollend", release);
      window.removeEventListener("scroll", onScrollTick);
    };

    // Polyfill for `scrollend`: the scroll has settled once it goes quiet.
    const onScrollTick = () => {
      if (quietTimer !== null) clearTimeout(quietTimer);
      quietTimer = window.setTimeout(release, SCROLL_QUIET_MS);
    };

    // `"onscrollend" in window` would narrow window to never here, since the
    // property is in the DOM lib types even where the browser lacks it.
    if (typeof window.onscrollend !== "undefined") {
      window.addEventListener("scrollend", release);
    } else {
      window.addEventListener("scroll", onScrollTick, { passive: true });
      onScrollTick(); // covers the case where the scroll never moves at all
    }
    settleTimer.current = window.setTimeout(release, SCROLL_SETTLE_MAX_MS);

    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  // Legacy #hash links from the old single-page anchors.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const section = sections.find((s) => `#${s.id}` === hash);
    if (section) navigate(section.path, { replace: true });
  }, [navigate]);

  // Scroll when the route changes -- but never in response to the spy's own
  // URL writes, which are tagged with `fromScroll`.
  useEffect(() => {
    activePath.current = location.pathname;

    if ((location.state as { fromScroll?: boolean } | null)?.fromScroll) return;

    const section = pathToSection(location.pathname);
    if (!section) return;

    // The loader locks body overflow, so the first scroll has to wait for it.
    if (loading) return;
    if (!didInitialScroll.current) {
      didInitialScroll.current = true;
      // Landing on "/" is already the top; nothing to animate.
      if (section.path === "/") return;
    }

    scrollToSection(section.id);
  }, [location.pathname, location.state, loading, scrollToSection]);

  // Scroll-spy: rewrite the URL to match the section in view.
  useEffect(() => {
    if (loading) return;

    let frame: number | null = null;

    const measure = () => {
      frame = null;
      if (suppressSpy.current) return;
      if (!document.getElementById(sections[0].id)) return; // e.g. the 404 route

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      let active = sections[0];
      if (atBottom) {
        active = sections[sections.length - 1];
      } else {
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          const el = document.getElementById(sections[i].id);
          if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
            active = sections[i];
            break;
          }
        }
      }

      if (active.path === activePath.current) return;
      activePath.current = active.path;
      navigate(active.path, { replace: true, state: { fromScroll: true } });
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [loading, navigate]);

  // Clear a pending settle timer on unmount.
  useEffect(() => {
    return () => {
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    };
  }, []);
}
