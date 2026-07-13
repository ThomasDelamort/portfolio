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
import { TbBrandCpp } from "react-icons/tb";
import { GrArchlinux, GrMysql } from "react-icons/gr";
import skillGroups from "../../data/skills";

const Skills = () => {
  return (
    <section id="skills" className="w-full py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">
            Skills
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
            Technologies I work with
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {skillGroups.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-red-700/20 bg-[#0d0d0d] p-6 transition-colors hover:border-red-700/50"
            >
              <h3 className="text-lg font-bold text-red-500 mb-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {group.category}
              </h3>

              <ul className="space-y-4">
                {group.skills.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="flex items-center gap-3 text-gray-300 group"
                  >
                    <Icon className="w-6 h-6 text-gray-500 transition-colors group-hover:text-red-500" />
                    <span className="text-sm font-medium group-hover:text-white transition-colors">
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
("");
export default Skills;
