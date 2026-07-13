import { useState, useEffect } from "react";
import frames from "../data/gargantuaFrames";

/*
  Animated ASCII Gargantua loading screen.
  Cycles through 36 truecolor ASCII frames (converted from the
  neofetch animation) to spin the black hole. Fades out when `done`.
*/
const FRAME_MS = 60; // ~matches the 0.05s neofetch delay

const Loader = ({ done }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <pre
        aria-hidden="true"
        className="font-mono leading-[1.1] text-[1.1vw] sm:text-[9px] md:text-[11px] select-none"
        style={{ margin: 0 }}
        dangerouslySetInnerHTML={{ __html: frames[frame] }}
      />
      <p className="mt-8 font-mono text-xs tracking-[0.35em] uppercase text-red-500 animate-pulse">
        Entering orbit
      </p>
    </div>
  );
};

export default Loader;
