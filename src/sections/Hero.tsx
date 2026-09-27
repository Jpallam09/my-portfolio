import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
const Hero = () => {
  const text = `I help growing brands and startups gain an
unfair advantage through premium
results driven webs/apps`;
  return (
    <section id="home" className="flex flex-col justify-end min-h-screen">
      <AnimatedHeaderSection
        subTitle={"404 No Bugs Found"}
        title={"Ali Sanati"}
        text={text}
        textColor={"text-black"}
      />
    </section>
  );
};

export default Hero;
