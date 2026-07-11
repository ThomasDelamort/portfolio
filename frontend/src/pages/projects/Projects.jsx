import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const projects = [
  {
    title: "Smart Library System",
    description:
      "A smart web-based library system for seamless borrowing, tracking, reservations, approvals, and administration.",
    image: "/projects/L7_0lwHq.jpg",
    tags: ["MongoDB", "ExpressJS", "React", "NodeJS", "AWS S3"],
    liveUrl: "https://smartls.onrender.com/",
    githubUrl: "https://github.com/ThomasDelamort/SmartLibrarySystem",
  },
  {
    title: "Spotify Clone",
    description: "The Fullstack Streaming App",
    image: "/projects/image.png",
    tags: [
      "MongoDB",
      "TailwindCSS",
      "ExpressJS",
      "ReactJS",
      "NodeJS",
      "Cloudinary",
      "Clerk",
      "TypeScript",
      "JavaScript",
    ],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Project Three",
    description:
      "A short description of what this project does and the problem it solves for its users.",
    image: "/project-placeholder-3.jpg",
    tags: ["Vue", "Express", "MongoDB"],
    liveUrl: "#",
    githubUrl: "#",
  },
];

const Projects = () => {
  const [index, setIndex] = useState(0);

  const goTo = (i) => setIndex((i + projects.length) % projects.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const project = projects[index];

  return (
    <section className="w-full bg-black py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">
          Fullstack
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-12">
          Projects
        </h2>

        <div className="relative">
          {/* Slide */}
          <div className="rounded-2xl border-2 border-red-700/30 bg-[#141414] overflow-hidden">
            <div className="w-full aspect-video overflow-hidden bg-zinc-900 border-b border-zinc-400">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-fill"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-white">{project.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-red-400 bg-red-950/40 border border-red-700/30 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors"
                >
                  <FaGithub className="w-4 h-4" />
                  Code
                </a>
              </div>
            </div>
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={prev}
            aria-label="Previous project"
            className="absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next project"
            className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to project ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-red-600"
                  : "w-2.5 bg-red-900/50 hover:bg-red-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
