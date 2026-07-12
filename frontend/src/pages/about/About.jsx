import { useRef, useState, useEffect } from "react";
import panels from "../../data/panels";

const sizeMap = {
  sm: "w-[220px] sm:w-[260px] aspect-[3/4]",
  md: "w-[300px] sm:w-[360px] aspect-[4/5]",
  lg: "w-[420px] sm:w-[560px] aspect-square",
};

const alignMap = {
  top: "self-start mt-8",
  center: "self-center",
  bottom: "self-end mb-8",
};

const About = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [x, setX] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const rect = section.getBoundingClientRect();
      const scrollDistance = section.offsetHeight - window.innerHeight;

      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);

      const maxX = track.scrollWidth - window.innerWidth;
      setX(progress * maxX);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative h-[300vh] my-24">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="max-w-6xl mx-auto w-full px-6 mb-10">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-red-500">
            Who I am
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Christian Neal Paredes
          </h2>
        </div>

        <div
          ref={trackRef}
          className="flex items-stretch gap-8 sm:gap-16 px-6 sm:px-12 will-change-transform"
          style={{ transform: `translateX(-${x}px)` }}
        >
          {panels.map((panel, i) => {
            if (panel.type === "quote") {
              return (
                <div key={i} className="shrink-0 w-75 sm:w-95 self-center">
                  <p className="text-3xl sm:text-5xl font-extrabold text-zinc-200 leading-tight tracking-tight">
                    {panel.text}
                  </p>
                  <p className="text-3xl sm:text-5xl font-extrabold text-red-600 leading-tight tracking-tight">
                    {panel.accent}
                  </p>
                </div>
              );
            }

            return (
              <figure
                key={i}
                className={`group shrink-0 ${alignMap[panel.align] || "self-center"}`}
              >
                <div
                  className={`relative overflow-hidden rounded-lg border border-white/10 ${sizeMap[panel.size] || sizeMap.md}`}
                >
                  <img
                    src={panel.image}
                    alt={panel.caption}
                    className="w-full h-full object-cover grayscale-40 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
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
              </figure>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto w-full px-6 mt-8">
          <p className="font-mono text-xs text-gray-600">↓ keep scrolling</p>
        </div>
      </div>
    </section>
  );
};

export default About;
