import type { IconType } from "react-icons";

// Panel types
export type PanelSize = "sm" | "md" | "lg";
export type PanelAlign = "top" | "center" | "bottom";

export interface QuotePanel {
    type: "quote";
    text: string;
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
