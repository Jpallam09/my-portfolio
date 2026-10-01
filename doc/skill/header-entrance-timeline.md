# Section header entrance timeline

**What you get** — a reusable `<AnimatedHeaderSection />` you drop into every section. It plays on load for the first section and on scroll for the rest, decided by one prop.

**Use when** — "section header animation", "hero title reveal", "page title animation", "heading entrance", "title slides up", "header rises and fades".

Extracted from the `src/components/AnimatedHeaderSection.tsx` pattern.

---

## 1. Ask first

- What is the subtitle, the title, and the supporting paragraph?
- Which sections play on load and which wait for scroll? (Convention: the hero plays on load, everything below waits for scroll.)
- Light section or dark section? This sets the `textColor` prop.

## 2. Create

Create **`src/components/AnimatedHeaderSection.tsx`** — new file. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe) and the responsive type utilities from [tailwind-v4-responsive-text](tailwind-v4-responsive-text.md).

## 3. Paste this

```tsx
import { useRef } from "react";
import { AnimatedTextLines } from "./AnimatedTextLines";
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
    // waits for scroll. withScrollTrigger is false only for the hero (first
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

    // The bit at the end of .from() says WHEN in the timeline to start it.
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
      {/* This clip-path wrapper is the hook for a different reveal style. It
      currently does nothing, but keeping the element means you can animate it
      later with:
        gsap.to(thisElement, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        })
      to wipe the header up from the bottom instead of sliding it. */}
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
```

**IMPORTANT:** this component imports `AnimatedTextLines`. Build that one too
from [line-by-line-text-reveal](line-by-line-text-reveal.md), or the build fails.

## 4. Wire it up

```tsx
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";

// Hero - plays on load
<AnimatedHeaderSection
  subTitle="Software developer"
  title="Your Name"
  text={`First line of copy
    second line of copy`}
  textColor="text-black"
/>

// Every section below the hero - waits for scroll
<AnimatedHeaderSection
  subTitle="What I do"
  title="Skills"
  text={text}
  textColor="text-white"
  withScrollTrigger={true}
/>
```

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `y: "50vh"` | half a viewport | A fixed pixel offset looks different on every screen. `vh` keeps the entrance proportional |
| `ease: "circ.out"` | both tweens | Fast start, long settle. Reads as "thrown into place and caught", which suits a heavy display face |
| Position `"<+0.2"` | 0.2s after previous starts | Overlap rather than queue. The title is already moving before the block finishes, so the header reads as one gesture instead of two |
| `y: "200"` on the title | fixed px, not `vh` | The title is a smaller element; a proportional offset would be too large on tall screens |
| `withScrollTrigger` | default `false` | The hero is above the fold, so gating it on scroll means the user sees a blank title. Everything below the fold must be gated or it animates before it is reachable |
| `scrollTrigger` on the timeline | not on each tween | Attaching it to the timeline gates the entire sequence as one unit |
| `flex-col` → `md:block` title | one word per line on mobile, inline on desktop | The `titleParts` split exists purely to make the mobile stacking possible |

## 6. Do not

- **Do not pre-style the animated element in its final state in CSS.** `gsap.from` animates *from* the values you give it *to* whatever the CSS already says. If the CSS already sets the final look, there is nothing to animate from and the element just appears.
- **Do not set `withScrollTrigger` on the hero.** It is above the fold; the animation would never fire.
- **Do not attach `scrollTrigger` to the individual tweens** when the whole sequence should be gated. Put it on the timeline.
- **Do not use a fixed pixel offset for the wrapper's entrance.** `"50vh"` is the point.
- **Do not forget that `titleParts` splits on spaces.** A title with no space renders as one `<span>`; that is intentional, not a bug.
- **Do not build this before `AnimatedTextLines` exists** — the import will fail the build.

## 7. Done when

- [ ] `AnimatedHeaderSection.tsx` and `AnimatedTextLines.tsx` both exist
- [ ] The hero header animates immediately on page load
- [ ] Every header below the fold stays invisible until scrolled to, then animates once
- [ ] The title starts moving 0.2s after the block, not after it finishes
- [ ] `textColor` switches correctly between light and dark sections
- [ ] No `opacity-0` or `translate-y-*` on the animated elements in CSS
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
