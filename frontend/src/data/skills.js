import {
  SiReact,
  SiTypescript,
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
} from "react-icons/si";
import { FaAws, FaJava, FaPython, FaDocker, FaCss3Alt } from "react-icons/fa";
import { GrArchlinux, GrMysql } from "react-icons/gr";
import { PiFileCSharp } from "react-icons/pi";
import { SiCplusplus } from "react-icons/si";
import { BiLogoCPlusPlus } from "react-icons/bi";
import { TbBrandCSharp } from "react-icons/tb";

const skillGroups = [
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
      { name: "AWS", icon: FaAws },
      { name: "Clerk", icon: SiClerk },
      { name: "Cloudinary", icon: SiCloudinary },
    ],
  },
  {
    category: "Database",
    skills: [
      { name: "MongoDB", icon: SiMongodb },
      { name: "MySQL", icon: GrMysql },
      { name: "PostgreSQL", icon: SiPostgresql },
    ],
  },
  {
    category: "Tools and Platforms",
    skills: [
      { name: "Git", icon: SiGit },
      { name: "GitHub", icon: SiGithub },
      { name: "Docker", icon: FaDocker },
      { name: "Insomnia", icon: SiInsomnia },
      { name: "Vite", icon: SiVite },
      { name: "Render", icon: SiRender },
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
];

export default skillGroups;
