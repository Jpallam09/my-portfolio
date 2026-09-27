import AnimatedHeaderSection from "../components/AnimatedHeaderSection";

const Hero = () => {
  const text = `Creating responsive, reliable
  web applications while constantly
  learning, building and solving
  real world problems through code.`;

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
