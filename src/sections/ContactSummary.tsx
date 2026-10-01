import { useRef } from "react";
import Marquee from "../components/Marquee";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import { marqueeRepeat, marqueeValues } from "../constants";

const ContactSummary = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    // You can attach a scroll trigger to a tween that doesn't actually change
    // anything. This one has scroll settings but no animation on purpose: it's
    // just a placeholder so those settings have somewhere to live. This is the
    // trick used to pin (freeze) a section.
    //   pin: true        = freeze this section while you scroll through the range
    //   pinSpacing: true = leave an empty gap the height of the section, so the
    //                    page doesn't jolt when it un-freezes
    //   start / end      = when to start and stop freezing.
    //                      "center center" = when this section's middle lines up
    //                      with the middle of the screen. "+=800" = keep it
    //                      frozen for 800px more of scrolling.
    //   scrub: 0.5       = the frozen content eases into place over 0.5s
    //                      instead of snapping.
    //   markers: false   = turn this on while developing to see the exact
    //                      pixel where the pin starts and ends. Best debugging
    //                      tool ScrollTrigger has.
    //
    // OPEN QUESTION: Lenis wraps this whole page (see App.tsx) and normally
    // smooths the scrolling, but nothing tells ScrollTrigger when Lenis moves.
    // Right now it looks like Lenis is doing nothing at all, because with the
    // `root` prop it scrolls its own wrapper div, and that div grows to fit its
    // content so it has nothing to scroll. The page is probably falling back to
    // normal browser scrolling, which ScrollTrigger handles on its own. If you
    // ever make Lenis actually take over, this pin will be the first thing that
    // drifts - see doc/GSAP-PATTERNS.md for the three lines that connect them.
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        markers: false,
      },
    });
  }, []);
  return (
    <section
      ref={containerRef}
      className="flex flex-col items-center justify-between min-h-screen gap-12 mt-16"
    >
      <Marquee items={marqueeValues} />
      <div className="overflow-hidden font-light text-center contact-text-responsive">
        <p>
          “ Let’s build <br />
          <span className="font-normal">clean</span> &{" "}
          <span className="italic">scalable</span> <br />
          software solutions <span className="text-gold">together</span> “
        </p>
      </div>
      <Marquee
        items={marqueeRepeat("contact me")}
        reverse={true}
        className="text-black bg-transparent border-y-2"
        iconClassName="stroke-gold stroke-2 text-primary"
        icon="material-symbols-light:square"
      />
    </section>
  );
};

export default ContactSummary;
