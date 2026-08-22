import {
  SiReact,
  SiJavascript,
  SiTailwindcss,
  SiBootstrap,
  SiHtml5,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiClerk,
  SiCloudinary,
  SiGit,
  SiGithub,
  SiVite,
  SiInsomnia,
  SiPostgresql,
  SiGnubash,
  SiRender,
  SiNeon,
  // SiFastapi,
  SiClaudecode,
  SiClaude,
  SiSqlite,
} from "react-icons/si";
// FaAws
// FaDocker
import { FaJava, FaPython, FaCss3Alt } from "react-icons/fa";
import { GrMysql, GrArchlinux } from "react-icons/gr";
import { BiLogoCPlusPlus } from "react-icons/bi";
import { TbBrandCSharp } from "react-icons/tb";

import type { SkillGroup } from "../types/index.ts";

const skillGroups: SkillGroup[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React", icon: SiReact },
      { name: "Tailwind CSS", icon: SiTailwindcss },
      { name: "Bootstrap", icon: SiBootstrap },
      { name: "HTML 5", icon: SiHtml5 },
      { name: "CSS 3", icon: FaCss3Alt },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js", icon: SiNodedotjs },
      { name: "Express", icon: SiExpress },
      // { name: "FastAPI", icon: SiFastapi },
      // { name: "AWS", icon: FaAws },
      { name: "Clerk", icon: SiClerk },
      { name: "Cloudinary", icon: SiCloudinary },
    ],
  },
  {
    category: "Database",
    skills: [
      { name: "MongoDB", icon: SiMongodb },
      { name: "SQLite", icon: SiSqlite },
      { name: "MySQL", icon: GrMysql },
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Neon", icon: SiNeon },
    ],
  },
  {
    category: "Tools and Platforms",
    skills: [
      { name: "Git", icon: SiGit },
      { name: "GitHub", icon: SiGithub },
      // { name: "Docker", icon: FaDocker },
      { name: "Insomnia", icon: SiInsomnia },
      { name: "Vite", icon: SiVite },
      { name: "Render", icon: SiRender },
      { name: "Arch Linux", icon: GrArchlinux },
    ],
  },
  {
    category: "Programming Languages",
    skills: [
      { name: "Java", icon: FaJava },
      { name: "JavaScript", icon: SiJavascript },
      { name: "C#", icon: TbBrandCSharp },
      { name: "C++", icon: BiLogoCPlusPlus },
      { name: "Python", icon: FaPython },
      { name: "Bash", icon: SiGnubash },
    ],
  },
  {
    category: "AI",
    skills: [
      { name: "Claude", icon: SiClaude },
      { name: "Claude Code", icon: SiClaudecode },
    ],
  },
];

export default skillGroups;
