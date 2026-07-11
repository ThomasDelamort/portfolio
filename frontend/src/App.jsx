import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./pages/hero/Hero";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </>
  );
}

export default App;
