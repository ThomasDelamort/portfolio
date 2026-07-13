import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import projects from "../../data/projects";

const INTERVAL = 4500; // matches drakedev's auto-advance timing

const Projects = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  // Clears and restarts the auto-advance interval.
  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % projects.length);
    }, INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(intervalRef.current);
  }, [resetTimer]);

  // Manual nav — both restart the timer so you get a fresh interval after clicking.
  const go = (dir) => {
    setCurrent((c) => (c + dir + projects.length) % projects.length);
    resetTimer();
  };

  const goTo = (i) => {
    setCurrent(i);
    resetTimer();
  };

  const project = projects[current];
  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <section id="projects" className="w-full py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header — eyebrow + heading on a baseline with the counter */}
        <div className="flex items-end justify-between border-b border-white/10 pb-6 mb-12">
          <div>
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-red-500">
              Fullstack
            </span>
            <h2 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              Projects
            </h2>
          </div>
          <div className="font-mono text-sm text-gray-500 tabular-nums">
            <span className="text-white">{pad(current)}</span>
            <span className="mx-1">/</span>
            <span>{pad(projects.length - 1)}</span>
          </div>
        </div>

        {/* Case-study spread */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image side */}
          <div
            key={`img-${current}`}
            className="relative animate-[fadeIn_0.5s_ease-out] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 aspect-video flex items-center justify-center"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-lg pointer-events-none" />
          </div>

          {/* Detail side */}
          <div
            key={`detail-${current}`}
            className="animate-[fadeIn_0.6s_ease-out]"
          >
            <div className="flex items-center gap-3 font-mono text-xs text-gray-500 mb-5">
              <span className="text-red-500">{project.year}</span>
              <span className="h-px w-8 bg-white/20" />
              <span>{project.tags.length} technologies</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {project.title}
            </h3>

            <p className="mt-5 text-gray-400 text-lg leading-relaxed max-w-md">
              {project.description}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-gray-500">
              {project.tags.map((tag) => (
                <li key={tag} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-red-600" />
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-6">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white border-b border-red-600 pb-1 transition-colors hover:text-red-400"
              >
                View live
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
              >
                <FaGithub className="w-4 h-4" />
                Source
              </a>
            </div>
          </div>
        </div>

        {/* Controls — prev/next with a progress bar between them */}
        <div className="mt-16 flex items-center gap-6">
          <button
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-white/15 text-white transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next project"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-white/15 text-white transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Segmented progress — active segment fills over the auto-advance duration */}
          <div className="flex-1 flex items-center gap-2">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to project ${i + 1}`}
                className="group flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
              >
                {i === current ? (
                  <span
                    key={`fill-${current}`}
                    className="block h-full rounded-full bg-red-600"
                    style={{
                      animation: `progressFill ${INTERVAL}ms linear forwards`,
                    }}
                  />
                ) : (
                  <span className="block h-full w-0 rounded-full bg-red-600 group-hover:w-1/3 group-hover:bg-red-800 transition-all duration-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Projects;
