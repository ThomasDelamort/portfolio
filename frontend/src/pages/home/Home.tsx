import { useRef } from "react";
import Hero from "../hero/Hero";
import Projects from "../projects/Projects";
import Skills from "../skills/Skills";
import About from "../about/About";
import Contact from "../contact/Contact";

const Home = () => {
  // One black hole for both: the hero marks where it rests, and Projects
  // flies it from there down into the orbit as you scroll.
  const heroHoleRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Hero holeRef={heroHoleRef} />
      <Projects heroHole={heroHoleRef} />
      <Skills />
      <About />
      <Contact />
    </>
  );
};

export default Home;
