import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import type { Project } from "../types/index.ts";

interface ProjectModalProps {
  project: Project;
  index: number;
  total: number;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ProjectModal = ({ project, index, total, onClose }: ProjectModalProps) => {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const hasLive = project.liveUrl !== "" && project.liveUrl !== "#";

  // Lock page scroll while open, without the layout jumping when the scrollbar
  // disappears, and hand focus back to whatever opened the modal.
  useEffect(() => {
    const root = document.documentElement;
    const opener = document.activeElement as HTMLElement | null;
    const scrollbar = window.innerWidth - root.clientWidth;
    const { overflow, paddingRight } = root.style;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    // Keep Tab inside the dialog.
    const items = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const duration = reduceMotion ? 0 : 0.25;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative my-auto max-h-[88vh] w-[92vw] overflow-y-auto rounded-2xl sm:w-[80vw] border border-red-700/30 bg-zinc-950 shadow-2xl shadow-red-950/40"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration, ease: "easeOut" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:border-red-600 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex items-center justify-center bg-black">
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="block h-auto w-full"
            />
          </div>

          <div className="flex flex-col p-6 sm:p-10">
            <div className="flex items-center gap-3 font-mono text-xs text-gray-500">
              <span className="text-red-500">{project.year}</span>
              <span className="h-px w-8 bg-white/20" />
              <span>
                {pad(index + 1)} / {pad(total)}
              </span>
            </div>

            <h3
              id="project-modal-title"
              className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl"
            >
              {project.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base">
              {project.description}
            </p>

            <h4 className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">
              Built with
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-gray-300"
                >
                  {tag}
                </li>
              ))}
            </ul>

            {(hasLive || project.githubUrl) && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-auto lg:pt-8">
                {hasLive && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 border-b border-red-600 pb-1 text-sm font-semibold text-white transition-colors hover:text-red-400"
                  >
                    View live
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <FaGithub className="h-4 w-4" />
                    Source
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default ProjectModal;
