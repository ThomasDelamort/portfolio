import { Download, Mail, User, Code2 } from "lucide-react";

const Hero = () => {
  return (
    <>
      <div className="w-full h-full bg-linear-to-t py-20 bg-black via-zinc-950 to-red-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: text content */}
            <div className="space-y-6 text-left">
              <p className="text-gray-400 text-2xl">I am</p>
              <h1 className="text-[clamp(3rem,9vw,9rem)] leading-none font-extrabold bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-transparent">
                Neal
              </h1>
              <h2 className="text-3xl text-red-500 font-semibold">
                Fullstack Developer
              </h2>
              <p className="text-gray-400 text-lg max-w-md">
                Fullstack developer who enjoys turning ideas into clean,
                functional products. I care about the details, from code
                architecture to pixel-perfect UI, and I'm always chasing the
                next interesting problem.
              </p>

              <div className="flex flex-col sm:flex-row w-full mt-12 gap-4 sm:gap-6">
                <button className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 hover:shadow-red-700/50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black">
                  <Download className="w-5 h-5" />
                  Resume
                </button>
                <button className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border-2 border-red-600 px-8 py-3 text-lg font-semibold text-red-500 transition-all hover:bg-red-400 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black">
                  Contact Me
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid place-items-center h-full">
              {/* Ambient outer glow */}
              <div className="col-start-1 row-start-1 w-[clamp(20rem,50vw,42rem)] h-[clamp(20rem,50vw,42rem)] bg-linear-to-br from-red-700 via-orange-600 to-red-900 rounded-full blur-3xl opacity-30" />

              <div
                className="col-start-1 row-start-1 w-[clamp(18rem,44vw,36rem)] h-[clamp(18rem,44vw,36rem)] rounded-full animate-[spin_18s_linear_infinite] blur-md opacity-80"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #fca311 15%, #e71d36 35%, transparent 50%, transparent 60%, #ff8c42 75%, #e71d36 90%, transparent 100%)",
                }}
              />

              <div className="col-start-1 row-start-1 w-[clamp(14rem,38vw,30rem)] h-[clamp(14rem,38vw,30rem)] rounded-full border-2 border-orange-400/70 shadow-[0_0_25px_5px_rgba(251,146,60,0.4)]" />

              <div className="col-start-1 row-start-1 w-[clamp(14rem,38vw,30rem)] h-[clamp(14rem,38vw,30rem)] rounded-full overflow-hidden shadow-2xl shadow-black">
                <img
                  src="/wXA1QT-A.jpg"
                  alt="Neal"
                  className="w-full h-full object-cover grayscale-30 contrast-125 brightness-90 saturate-150"
                  style={{
                    filter:
                      "grayscale(30%) contrast(1.25) brightness(0.9) saturate(1.5) sepia(20%) hue-rotate(-10deg)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Hero;
