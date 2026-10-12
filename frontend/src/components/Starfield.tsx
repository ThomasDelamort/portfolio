import { useEffect, useRef } from "react";

// Three depths of stars behind the whole site. Each layer drifts at its own
// fraction of the scroll distance (and leans with the pointer), so near stars
// slide past faster than far ones: parallax depth on every section.
const LAYERS = [
  { density: 140, speed: 0.04, lean: 6, size: [0.5, 1.0], alpha: [0.2, 0.55] },
  { density: 70, speed: 0.1, lean: 14, size: [0.8, 1.5], alpha: [0.3, 0.75] },
  { density: 22, speed: 0.22, lean: 28, size: [1.2, 2.2], alpha: [0.5, 1] },
] as const;

const COLORS = ["255,255,255", "255,236,214", "255,190,140", "255,120,90"];
const COLOR_WEIGHTS = [0.55, 0.25, 0.14, 0.06];

// Faint red nebulae on the slowest layer; y is in screen heights.
const NEBULAE = [
  { x: 0.12, y: 0.9, r: 0.55, rgb: "127,29,29", a: 0.16 },
  { x: 0.88, y: 2.1, r: 0.6, rgb: "154,52,18", a: 0.12 },
  { x: 0.25, y: 3.4, r: 0.5, rgb: "127,29,29", a: 0.14 },
  { x: 0.8, y: 4.6, r: 0.55, rgb: "120,20,40", a: 0.12 },
];
const NEBULA_SPEED = 0.06;
const NEBULA_SPAN = 5.5; // screen heights before the pattern repeats

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  twinkle: number;
  phase: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const pickColor = () => {
  let roll = Math.random();
  for (let i = 0; i < COLORS.length; i += 1) {
    roll -= COLOR_WEIGHTS[i];
    if (roll <= 0) return COLORS[i];
  }
  return COLORS[0];
};

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let layers: Star[][] = [];

    const populate = () => {
      const megapixels = (width * height) / 1_000_000;
      layers = LAYERS.map((layer) =>
        Array.from({ length: Math.round(layer.density * megapixels) }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: rand(layer.size[0], layer.size[1]),
          alpha: rand(layer.alpha[0], layer.alpha[1]),
          color: pickColor(),
          twinkle: rand(0.4, 1.6),
          phase: Math.random() * Math.PI * 2,
        })),
      );
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const widthChanged = window.innerWidth !== width;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Mobile toolbars resize the height constantly; reshuffling the sky on
      // each of those would look like the stars jumping.
      if (widthChanged) populate();
    };

    const wrap = (v: number, span: number) => ((v % span) + span) % span;

    // Eased toward the live values so the stars glide instead of snapping.
    const view = { scroll: window.scrollY, px: 0, py: 0 };
    const target = { scroll: window.scrollY, px: 0, py: 0 };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const n of NEBULAE) {
        const span = NEBULA_SPAN * height;
        const y =
          wrap(n.y * height - view.scroll * NEBULA_SPEED, span) - height;
        const x = n.x * width - view.px * 10;
        const r = n.r * Math.max(width, height);
        if (y + r < 0 || y - r > height) continue;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${n.rgb},${n.a})`);
        g.addColorStop(1, `rgba(${n.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      LAYERS.forEach((layer, i) => {
        const dy = view.scroll * layer.speed + view.py * layer.lean;
        const dx = view.px * layer.lean;
        for (const s of layers[i]) {
          const x = wrap(s.x - dx, width);
          const y = wrap(s.y - dy, height);
          const flicker = reduceMotion
            ? 1
            : 0.7 + 0.3 * Math.sin(time * 0.001 * s.twinkle + s.phase);
          ctx.fillStyle = `rgba(${s.color},${s.alpha * flicker})`;
          if (s.size < 1.3) {
            ctx.fillRect(x, y, s.size, s.size);
          } else {
            ctx.beginPath();
            ctx.arc(x, y, s.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };

    let raf = 0;
    let lastDraw = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const settling =
        Math.abs(target.scroll - view.scroll) > 0.5 ||
        Math.abs(target.px - view.px) > 0.001 ||
        Math.abs(target.py - view.py) > 0.001;

      // Redraw every frame while moving; otherwise only for the slow twinkle.
      if (!settling && now - lastDraw < 66) return;

      view.scroll += (target.scroll - view.scroll) * 0.2;
      view.px += (target.px - view.px) * 0.06;
      view.py += (target.py - view.py) * 0.06;
      lastDraw = now;
      draw(now);
    };

    const onScroll = () => {
      target.scroll = window.scrollY;
    };
    const onPointerMove = (e: PointerEvent) => {
      target.px = (e.clientX / window.innerWidth) * 2 - 1;
      target.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      resize();
      draw(performance.now());
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(frame);
    };

    resize();
    draw(performance.now());
    window.addEventListener("resize", onResize);
    if (!reduceMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
    />
  );
};

export default Starfield;
