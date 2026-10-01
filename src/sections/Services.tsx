import { useEffect, useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { servicesData } from "../constants";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../lib/gsap";

const Services = () => {
  const text = `I build secure, high-performance full-stack apps
    with smooth UX to drive growth
    not headaches.`;
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Give every card the height of the tallest one, so each card fully covers
  // the one behind it when stacked.
  useEffect(() => {
    const syncHeights = () => {
      const els = serviceRefs.current.filter(
        (el): el is HTMLDivElement => el !== null
      );
      if (!els.length) return;
      els.forEach((el) => (el.style.minHeight = "0px"));
      const tallest = Math.max(...els.map((el) => el.offsetHeight));
      els.forEach((el) => (el.style.minHeight = `${tallest}px`));
    };

    const remeasure = () => {
      syncHeights();
      ScrollTrigger.refresh();
    };

    syncHeights();

    // Measure again after the web fonts and the rest of the page have loaded,
    // because the text changes size when the real font replaces the fallback.
    document.fonts?.ready.then(remeasure);
    window.addEventListener("load", remeasure);
    window.addEventListener("resize", remeasure);
    return () => {
      window.removeEventListener("load", remeasure);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  useGSAP(() => {
    // Every service card's CONTENT slides up on its own as the card reaches the
    // screen. Only the content moves, never the sticky card itself, so the card
    // always stays in place and keeps covering the one behind it.
    // start: "top 80%" = begin when the card's top edge is 80% down the screen,
    // so it's already slightly visible before it starts moving.
    serviceRefs.current.forEach((el, index) => {
      const inner = innerRefs.current[index];
      if (!el || !inner) return;

      gsap.from(inner, {
        y: 200,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        duration: 1,
        ease: "circ.out",
      });
    });
  }, []);

  return (
    <section id="services" className="min-h-screen bg-black rounded-t-4xl">
      <AnimatedHeaderSection
        subTitle={"Behind the scene, Beyond the screen"}
        title={"Service"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      {servicesData.map((service, index) => (
        <div
          ref={(el) => {
            serviceRefs.current[index] = el;
          }}
          key={index}
          className="px-5 pt-6 pb-10 text-white border-t-2 sm:px-10 sm:pb-12 border-white/30"
          style={{
            position: "sticky",
            top: `calc(10vh + ${index * 5}em)`,
            marginBottom: `${(servicesData.length - index - 1) * 5}rem`,
            zIndex: index + 1,
            backgroundColor: "#000",
            overflow: "hidden",
          }}
        >
          <div ref={(el) => {
            innerRefs.current[index] = el;
          }}>
            <div className="flex items-center justify-between gap-4 font-light">
              <div className="flex flex-col gap-4 sm:gap-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl">
                  {service.title}
                </h2>
                <p className="text-base leading-relaxed tracking-wide sm:text-xl sm:tracking-widest lg:text-2xl text-white/60 text-pretty">
                  {service.description}
                </p>
                <div className="flex flex-col gap-2 text-xl sm:gap-4 sm:text-2xl lg:text-3xl text-white/80">
                  {service.items.map((item, itemIndex) => (
                    <div key={`item-${index}-${itemIndex}`}>
                      <h3 className="flex">
                        <span className="mr-6 text-base sm:mr-12 sm:text-lg text-white/30">
                          0{itemIndex + 1}
                        </span>
                        {item.title}
                      </h3>
                      {itemIndex < service.items.length - 1 && (
                        <div className="w-full h-px my-2 bg-white/30" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Services;