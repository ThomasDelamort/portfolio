import type { Section } from "../types/index.ts";

// The site is a single scrolling page; these are its sections in document
// order. Every route renders the whole page, so a path only decides which
// section you land on. Both the navbar and the scroll sync read from here.
const sections: Section[] = [
  { id: "home", path: "/", label: "Home" },
  { id: "projects", path: "/projects", label: "Projects" },
  { id: "skills", path: "/skills", label: "Skills" },
  { id: "about", path: "/about", label: "About" },
  { id: "contact", path: "/contact", label: "Contact" },
];

export default sections;
