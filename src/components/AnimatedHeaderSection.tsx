import { useRef } from "react";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

type AnimatedHeaderSectionProps = {
  subTitle: string;
  title: string;
  text: string;
  textColor: string;
  withScrollTrigger?: boolean;
};

const AnimatedHeaderSection = ({
  subTitle,
  title,
  text,
  textColor,
  withScrollTrigger = false,
}: AnimatedHeaderSectionProps) => {
  const contextRef = useRef(null);
  const headerRef = useRef(null);
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];
  useGSAP(() => {
    // A timeline runs its tweens one after another by default. This is the
    // whole header entrance: the wrapper slides up, then the text fades in.
    // Passing scrollTrigger on the timeline itself means the WHOLE sequence
    // waits for scroll. withScrollTrigger is false only for the Hero (first
    // thing on the page, so it just plays on load).
    const tl = gsap.timeline({
      scrollTrigger: withScrollTrigger
        ? {
            trigger: contextRef.current, // start when this header reaches the screen
          }
        : undefined,
    });
    tl.from(contextRef.current, {
      y: "50vh", // start half a screen below, then slide up into place
      duration: 1,
      ease: "circ.out",
    });
    // The bit at the end of a .from() says WHEN in the timeline to start it.
    //   "<" = start at the same moment as the previous one
    //   "<+0.2" = start 0.2 seconds after the previous one starts
    // So the title fades in 0.2s after the header block starts sliding up.
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        y: "200",
        duration: 1,
        ease: "circ.out",
      },
      "<+0.2"
    );
  }, []);
  return (
    <div ref={contextRef}>
      {/* Nothing animates this clip-path right now, it was left over from an
      earlier version. Keeping it here means you can animate it later with
      gsap.to(thisElement, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" })
      to reveal the header from the bottom instead of sliding it. */}
      <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
        <div
          ref={headerRef}
          className="flex flex-col justify-center gap-12 pt-16 sm:gap-16"
        >
          <p
            className={`text-sm font-light tracking-[0.5rem] uppercase px-10 ${textColor}`}
          >
            {subTitle}
          </p>
          <div className="px-10">
            <h1
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block ${textColor}`}
            >
              {titleParts.map((part, index) => (
                <span key={index}>{part} </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      <div className={`relative px-10 ${textColor}`}>
        <div className="absolute inset-x-0 border-t-2" />
        <div className="py-12 sm:py-16 text-end">
          <AnimatedTextLines
            text={text}
            className={`font-light uppercase value-text-responsive ${textColor}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeaderSection;
