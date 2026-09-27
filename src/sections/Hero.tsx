import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
const Hero = () => {
  const text = `I help growing brands and startups gain an
unfair advantage through premium
results driven webs/apps`;
  return (
    <section id="home" className="flex flex-col justify-end min-h-screen">
      <AnimatedHeaderSection
        subTitle={"Software developer"}
        title={"John Paul Allam"}
        text={text}
        textColor={"text-black"}
      />
    </section>
  );
};

export default Hero;
