import { useState, useEffect } from "react";

const roles = [
  "Fullstack Developer",
  "I use Arch by the way",
  "React Enthusiast",
  "Runner",
  "Swimmer",
  "TKD Blackbelt",
];

const RotatingRole = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter"); // "enter" | "center" | "exit"

  useEffect(() => {
    const toCenter = setTimeout(() => setPhase("center"), 50);
    return () => clearTimeout(toCenter);
  }, [index]);

  useEffect(() => {
    const hold = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => {
        setIndex((i) => (i + 1) % roles.length);
        setPhase("enter");
      }, 500);
    }, 2500);

    return () => clearTimeout(hold);
  }, [index]);

  const phaseClass = {
    enter: "opacity-0 -translate-x-10",
    center: "opacity-100 translate-x-0",
    exit: "opacity-0 translate-x-10",
  }[phase];

  return (
    <h2 className="text-3xl text-red-500 font-semibold h-10 overflow-hidden">
      <span
        className={`inline-block transition-all duration-500 ease-out ${phaseClass}`}
      >
        {roles[index]}
      </span>
    </h2>
  );
};

export default RotatingRole;
