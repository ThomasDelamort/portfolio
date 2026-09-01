import type { IconType } from "react-icons";

// Section
// One entry per <section id> on the single-page site. `id` must match the
// element id rendered by the corresponding page component.
export interface Section {
  id: string;
  path: string;
  label: string;
}

// Panel types
export type PanelSize = "sm" | "md" | "lg";
export type PanelAlign = "top" | "center" | "bottom";

export interface QuotePanel {
  type: "quote";
  text: string;
  fill: string;
  accent: string;
}

export interface PhotoPanel {
  type: "photo";
  image: string;
  caption: string;
  tag?: string;
  size: PanelSize;
  align: PanelAlign;
}

export type Panel = QuotePanel | PhotoPanel;

// Project Types
export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  year: string;
}

// Skill
export interface Skill {
  name: string;
  icon: IconType;
}

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

// import type { IconType } from "react-icons";

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface SizeMap {
  sm: string;
  md: string;
  lg: string;
}

export interface AlignMap {
  top: string;
  center: string;
  bottom: string;
}
