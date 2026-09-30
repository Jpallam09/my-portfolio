import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

// Each keyword row drifts sideways at its own speed, tied to your scroll
// position, so scrolling back undoes it exactly.
//
// NOTE: there is deliberately no `trigger` on these. A ScrollTrigger with no
// trigger spans the whole page, so this drift gets spread very thin across 8 or
// 9 screens of scrolling. Slow enough that the words are still sitting near
// their CSS offsets (the translate-x-* classes below) by the time you reach this
// section, which is what keeps them readable.
// Don't add a `trigger`, `start` or `end` here. It shortens the range, and the
// large xPercent values below - which are percentages of the row's own width,
// and these rows are full-width blocks, so 100 means a whole screen - will
// slide the words straight off screen before you finish reading them.
const ServiceSummary = () => {
  useGSAP(() => {
    // scrub ties the movement to the scroll position instead of playing once.
    gsap.to("#title-service-1", {
      xPercent: 20,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#title-service-2", {
      xPercent: -30,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#title-service-3", {
      xPercent: 100,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#title-service-4", {
      xPercent: -100,
      scrollTrigger: {
        scrub: true,
      },
    });
  });

    return (
    <section className="mt-20 overflow-hidden font-light leading-snug text-center mb-42
    contact-text-responsive max-lg:text-[6.3vw]!">
      <div id="title-service-1">
        <p>Architecture</p>
      </div>
      <div
        id="title-service-2"
        className="flex items-center justify-center gap-[0.3em] whitespace-nowrap
        translate-x-[1.5vw] lg:gap-3 lg:translate-x-16"
      >
        <p className="font-normal">Development</p>
        <div className="h-1 w-[1em] shrink-0 bg-gold lg:w-32" />
        <p>Deployment</p>
      </div>
      <div
        id="title-service-3"
        className="flex items-center justify-center gap-[0.3em] whitespace-nowrap
        translate-x-[-3vw] lg:gap-3 lg:-translate-x-48"
      >
        <p>API</p>
        <div className="h-1 w-[1em] shrink-0 bg-gold lg:w-32" />
        <p className="italic">Frontends</p>
        <div className="h-1 w-[1em] shrink-0 bg-gold lg:w-32" />
        <p>Scalability</p>
      </div>
      <div
        id="title-service-4"
        className="translate-x-[3vw] lg:translate-x-48"
      >
        <p>Databases</p>
      </div>
    </section>
  );
};

export default ServiceSummary;