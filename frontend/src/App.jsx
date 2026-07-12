import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./pages/hero/Hero";
import Footer from "./components/Footer";
import Projects from "./pages/projects/Projects";
import Skills from "./pages/skills/Skills";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
