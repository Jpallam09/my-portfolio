import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import SkillsSummary from "./sections/SkillsSummary";
import Skills from "./sections/Skills";
import ReactLenis from "lenis/react";
import About from "./sections/About";
import Projects from "./sections/Projects";
import ContactSummary from "./sections/ContactSummary";
import Contact from "./sections/Contact";

const App = () => {
  return (
    <ReactLenis root className="relative w-screen min-h-screen overflow-x-auto">
      <Navbar />
      <Hero />
      <SkillsSummary />
      <Projects />
      <Skills />
      <About />
      <ContactSummary />
      <Contact />
    </ReactLenis>
  );
};

export default App;
