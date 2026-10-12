import skillGroups from "../../data/skills";
import useScrollReveal from "../../hooks/useScrollReveal";
import useMediaQuery from "../../hooks/useMediaQuery";
import Parallax from "../../components/Parallax";

// On the three-column grid the middle column drifts faster than the outer
// two, so the cards separate into depth layers as you scroll past.
const COLUMN_OFFSETS = [20, 70, 20];

const Skills = () => {
  const [revealRef, isVisible] = useScrollReveal();
  const threeColumns = useMediaQuery("(min-width: 768px)");

  return (
    <section
      id="skills"
      ref={revealRef}
      className={`relative w-full py-24 px-6 reveal ${isVisible ? "reveal-visible" : ""}`}
    >
      {/* Oversized outline word sliding sideways behind the cards */}
      <Parallax
        axis="x"
        offset={-180}
        className="pointer-events-none absolute inset-x-0 top-6 -z-10 select-none"
      >
        <p
          aria-hidden="true"
          className="whitespace-nowrap text-center text-[24vw] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(239,68,68,0.14)]"
        >
          STACK
        </p>
      </Parallax>

      <div className="max-w-6xl mx-auto">
        <Parallax offset={-30} className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">
            Skills
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
            Technologies I work with
          </h2>
        </Parallax>

        <div className="grid md:grid-cols-3 gap-8">
          {skillGroups.map((group, i) => (
            <Parallax
              key={group.category}
              offset={threeColumns ? COLUMN_OFFSETS[i % 3] : 20}
            >
              <div className="group/card relative h-full overflow-hidden rounded-2xl border border-red-700/20 bg-zinc-950/80 p-6 transition-colors hover:border-red-700/50">
                {/* ember glow that wakes up on hover */}
                <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-red-700/0 blur-3xl transition-colors duration-500 group-hover/card:bg-red-700/20" />

                <h3 className="relative text-lg font-bold text-red-500 mb-6 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  {group.category}
                </h3>

                <ul className="relative space-y-4">
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
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
