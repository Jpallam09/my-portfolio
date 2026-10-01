import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import { useRef } from "react";

type AnimatedTextLinesProps = {
  text: string;
  className?: string;
};

export const AnimatedTextLines = ({
  text,
  className = "",
}: AnimatedTextLinesProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);
  // Every line break in the text prop becomes its own <span> below, and each one
  // is animated separately. That's why the copy passed in from the sections is
  // written as a multi-line template literal:
  //   const text = `First line
  //     second line`;
  // If you write it as one long line, the whole paragraph animates as a single
  // block and you lose the staggered line-by-line effect.
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  useGSAP(() => {
    if (lineRefs.current.length > 0) {
      // from = "animate FROM these values TO where it already is in the CSS".
      // Because of that, do not pre-set the final look in your CSS, otherwise
      // there is nothing left to animate from.
      // stagger = delay between each line starting, so they cascade in order.
      gsap.from(lineRefs.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: containerRef.current,
        },
      });
    }
  });

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <span
          key={index}
          ref={(el) => {
            lineRefs.current[index] = el;
          }}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line}
        </span>
      ))}
    </div>
  );
};
