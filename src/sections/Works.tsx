import { Icon } from "@iconify/react/dist/iconify.js";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { projects } from "../constants";
import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { gsap } from "../lib/gsap";
import { useGSAP } from "@gsap/react";

const Works = () => {
  const overlayRefs = useRef<Array<HTMLElement | null>>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const text = `Featured projects that have been meticulously
    crafted with passion to drive
    results and impact.`;

  const mouse = useRef({ x: 0, y: 0 });
  const moveX = useRef<((value: number) => void) | null>(null);
  const moveY = useRef<((value: number) => void) | null>(null);

  useGSAP(() => {
    // Mouse move fires roughly 60 times a second, so don't call gsap.to() each
    // time - that creates a brand new tween every event and the page janks.
    // gsap.quickTo() hands you a function you can call as often as you like;
    // it reuses a single animation and just retargets it.
    // x catches up in 1.5s, y takes 2s. The mismatch is on purpose: the image
    // trails the mouse more on one axis, which reads as "it has weight".
    // Same duration on both axes looks robotic and lifeless.
    moveX.current = gsap.quickTo(previewRef.current, "x", {
      duration: 1.5,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(previewRef.current, "y", {
      duration: 2,
      ease: "power3.out",
    });

    // The rows fade in one after another as the list comes into view.
    gsap.from(".project-row", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: 1,
      stagger: 0.3,
      ease: "back.out",
      scrollTrigger: {
        trigger: listRef.current, // the whole list, not one row
      },
    });
  }, []);

  const handleMouseEnter = (index: number) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(index);

    const el = overlayRefs.current[index];
    if (!el) return;

    // Pointer events fire much faster than a 0.15s tween can finish, so moving
    // in and out quickly leaves two animations fighting over the same property
    // and the overlay ends up stuck half-open. killTweensOf() clears whatever
    // was still running before we start a new one.
    gsap.killTweensOf(el);
    // fromTo instead of from, because the overlay may already be partway open
    // from a previous hover - from would snap it shut first (visible flicker),
    // fromTo always starts from exactly these values.
    // clip-path polygon points go around the shape: top-left, top-right,
    // bottom-right, bottom-left. Both bottom corners at "100% 100%" collapses
    // the shape into a flat line along the bottom edge, so raising them to "0%"
    // looks like a curtain being pulled up over the row. Animating clip-path
    // instead of height means the row's contents never move or reflow.
    gsap.fromTo(
      el,
      {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        duration: 0.15,
        ease: "power2.out",
      }
    );

    gsap.to(previewRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (index: number) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(null);

    const el = overlayRefs.current[index];
    if (!el) return;

    gsap.killTweensOf(el);
    gsap.to(el, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      duration: 0.2,
      ease: "power2.in",
    });

    gsap.to(previewRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  // React hands you a SyntheticEvent here, not a plain DOM MouseEvent. Both
  // have clientX/clientY, which is all this needs.
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    // +24 nudges the preview off the cursor so it doesn't sit under it.
    mouse.current.x = e.clientX + 24;
    mouse.current.y = e.clientY + 24;
    moveX.current(mouse.current.x);
    moveY.current(mouse.current.y);
  };

  return (
    <section id="work" className="flex flex-col min-h-screen">
      <AnimatedHeaderSection
        subTitle={"Logic meets Aesthetics, Seamlessly"}
        title={"Works"}
        text={text}
        textColor={"text-black"}
        withScrollTrigger={true}
      />
      <div
        ref={listRef}
        className="relative flex flex-col font-light"
        onMouseMove={handleMouseMove}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="project-row relative flex flex-col gap-1 py-5 cursor-pointer group md:gap-0"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* overlay */}
            <div
              ref={(el) => {
                overlayRefs.current[index] = el;
              }}
              className="absolute inset-0 hidden md:block duration-200 bg-black -z-10 clip-path"
            />

            {/* title */}
            <div className="flex justify-between px-10 text-black transition-all duration-500 md:group-hover:px-12 md:group-hover:text-white">
              <h2 className="lg:text-[32px] text-[26px] leading-none">
                {project.name}
              </h2>
              <Icon icon="lucide:arrow-up-right" className="md:size-6 size-5" />
            </div>
            {/* divider */}
            <div className="w-full h-0.5 bg-black/80" />
            {/* framework */}
            <div className="flex px-10 text-xs leading-loose uppercase transtion-all duration-500 md:text-sm gap-x-5 md:group-hover:px-12">
              {project.frameworks.map((framework) => (
                <p
                  key={framework.id}
                  className="text-black transition-colors duration-500 md:group-hover:text-white"
                >
                  {framework.name}
                </p>
              ))}
            </div>
            {/* mobile preview image */}
            <div className="relative flex items-center justify-center px-10 md:hidden h-100">
              <img
                src={project.bgImage}
                alt={`${project.name}-bg-image`}
                className="object-cover w-full h-full rounded-md brightness-50"
              />
              <img
                src={project.image}
                alt={`${project.name}-image`}
                className="absolute bg-center px-14 rounded-xl"
              />
            </div>
          </div>
        ))}
        {/* desktop Flaoting preview image */}
        <div
          ref={previewRef}
          className="fixed -top-2/6 left-0 z-50 overflow-hidden border-8 border-black pointer-events-none w-240 md:block hidden opacity-0"
        >
          {currentIndex !== null && (
            <img
              src={projects[currentIndex].image}
              alt="preview"
              className="object-cover w-full h-full"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Works;
