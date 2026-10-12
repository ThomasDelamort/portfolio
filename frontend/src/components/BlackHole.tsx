import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./blackHoleShader";

// Must match R_OUT and DIST in the fragment shader.
const DISK_RADIUS = 12;
const CAMERA_DIST = 40;

// The ray tracer is fill-rate bound, so the canvas renders below native
// resolution and lets CSS upscale it. Quality drops further if frames run long.
const MAX_PIXEL_RATIO = 1.25;
const START_QUALITY = 0.8;
const MIN_QUALITY = 0.45;
const SLOW_FRAME_MS = 24;

interface BlackHoleProps {
  className?: string;
  /** Camera elevation above the accretion disk, in radians. */
  tilt?: number;
  /** Added to `tilt` every frame, e.g. a scroll-driven value. */
  tiltOffset?: MotionValue<number>;
  /** Disk radius as a fraction of the canvas half-width. */
  zoom?: number;
  /** Lean the camera toward the pointer. */
  followPointer?: boolean;
}

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const BlackHole = ({
  className = "",
  tilt = 0.09,
  tiltOffset,
  zoom = 0.94,
  followPointer = false,
}: BlackHoleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  // The render loop reads the latest props from here instead of restarting.
  const settings = useRef({ tilt, tiltOffset, zoom, followPointer });
  useEffect(() => {
    settings.current = { tilt, tiltOffset, zoom, followPointer };
  }, [tilt, tiltOffset, zoom, followPointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    // One triangle that covers the whole viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uTilt = gl.getUniformLocation(program, "uTilt");
    const uRoll = gl.getUniformLocation(program, "uRoll");
    const uTanFov = gl.getUniformLocation(program, "uTanFov");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let quality = START_QUALITY;
    let raf = 0;
    let running = false;
    let onScreen = false;
    let time = 12; // start mid-rotation so the first frame isn't uniform
    let last = 0;
    let slowFrames = 0;
    let sampledFrames = 0;

    // Pointer lean, eased toward the target every frame.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const w = Math.max(1, Math.round(canvas.clientWidth * ratio * quality));
      const h = Math.max(1, Math.round(canvas.clientHeight * ratio * quality));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const draw = () => {
      const s = settings.current;
      const offset = s.tiltOffset?.get() ?? 0;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uTilt, s.tilt + offset + pointer.y * 0.05);
      gl.uniform1f(uRoll, pointer.x * -0.06);
      gl.uniform1f(uTanFov, DISK_RADIUS / (CAMERA_DIST * s.zoom));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? now - last : 16;
      last = now;
      time += Math.min(dt, 50) / 1000;

      // Ease back upright once the pointer stops being followed.
      const follow = settings.current.followPointer;
      const ease = 1 - Math.exp(-dt / 220);
      pointer.x += ((follow ? pointer.tx : 0) - pointer.x) * ease;
      pointer.y += ((follow ? pointer.ty : 0) - pointer.y) * ease;

      draw();

      // Adaptive quality: step resolution down while frames keep running long.
      sampledFrames += 1;
      if (dt > SLOW_FRAME_MS) slowFrames += 1;
      if (sampledFrames >= 45) {
        if (slowFrames > 30 && quality > MIN_QUALITY) {
          quality = Math.max(MIN_QUALITY, quality - 0.1);
          resize();
        }
        sampledFrames = 0;
        slowFrames = 0;
      }
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(); // repaint immediately so a resize never shows a stretched frame
    });
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "100px" },
    );
    visibility.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      if (!settings.current.followPointer) return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
      setFailed(true);
    };

    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("webglcontextlost", onContextLost);

    resize();
    draw();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      // Don't lose the context here: StrictMode remounts onto the same canvas
      // and getContext() would hand back the dead one.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  if (failed) {
    return (
      <img
        src="/blackhole.webp"
        alt=""
        aria-hidden="true"
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block h-full w-full ${className}`}
    />
  );
};

export default BlackHole;
