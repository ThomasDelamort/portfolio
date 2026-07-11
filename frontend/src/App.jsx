import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./pages/hero/Hero";
import Footer from "./components/Footer";
import Projects from "./pages/projects/Projects";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Projects />
      </main>
      <Footer />
    </>
  );
}

export default App;
