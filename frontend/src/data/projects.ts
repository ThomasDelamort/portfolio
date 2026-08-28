import type { Project } from "../types/index.ts";

const projects: Project[] = [
  {
    title: "Smart Library System",
    description:
      "A web-based library platform for seamless borrowing, tracking, reservations, approvals, and administration.",
    image: "/projects/smartls.png",
    tags: [
      "MongoDB",
      "Express",
      "React",
      "Node.js",
      "Bootstrap",
      "AWS S3",
      "Docker",
    ],
    liveUrl: "https://smartls.onrender.com/",
    githubUrl: "https://github.com/ThomasDelamort/SmartLibrarySystem",
    year: "2026",
  },
  {
    title: "Spotify Clone",
    description:
      "A fullstack music streaming app with real-time playback, admin dashboard, and social listening features.",
    image: "/projects/spotify.png",
    tags: [
      "TypeScript",
      "MongoDB",
      "TailwindCSS",
      "Express",
      "React",
      "NodeJS",
      "Cloudinary",
      "Clerk",
      "Docker",
    ],
    liveUrl: "#",
    githubUrl: "https://github.com/ThomasDelamort/SpotifyClone",
    year: "2026",
  },
  {
    title: "AirSiloy",
    description:
      "An AI Powered IoT-based air quality monitoring system that detects and analyzes environmental air conditions in real time, providing alerts and actionable insights when air quality reaches unhealthy levels.",
    image: "/projects/AirSiloy.png",
    tags: [
      "TypeScript",
      "TailwindCSS",
      "React",
      "FastAPI",
      "Docker",
      "Iot",
      "Bash",
      "Clerk",
    ],
    liveUrl: "",
    githubUrl: "https://github.com/ThomasDelamort/AirSiloy",
    year: "2026",
  },
  {
    title: "Portfolio Website",
    description:
      "The fullstack application that not only showcases my projects but also who I am as a person.",
    image: "/projects/portfolio-website.png",
    tags: [
      "TypeScript",
      "PostgreSQL",
      "Express",
      "React",
      "NodeJS",
      "TailwindCSS",
      "Neon",
    ],
    liveUrl: "https://christiannealparedes.onrender.com/",
    githubUrl: "https://github.com/ThomasDelamort/portfolio",
    year: "2026",
  },
  {
    title: "Ask her out",
    description:
      "This was a fun fullstack project, a very playful way to ask the girl I like out on a date.",
    image: "/projects/onlyYou.png",
    tags: ["PostgreSQL", "Express", "React", "NodeJS", "TailwindCSS", "Neon"],
    liveUrl: "https://will-you-go-out-with-me-zvgh.onrender.com/",
    githubUrl: "https://github.com/ThomasDelamort/willYouGoOutOnADateWithMe",
    year: "2026",
  },
];

export default projects;
