# Pinned section

**What you get** — a section that freezes in place while you scroll past a fixed distance, holding the viewport still for a beat.

**Use when** — "pin section", "freeze section on scroll", "sticky scroll section", "hold the section while scrolling", "scroll pause".

Extracted from the `src/sections/ContactSummary.tsx` pattern.

---

## 1. Ask first

- Which section pins, and does it need to be `full viewport height`?
- How long should it hold — a fixed pixel distance (`+=800`) or a percentage of the viewport?
- Is anything else on the page also pinned? Pinned sections interact through ScrollTrigger's spacer calculation and overlapping pins are a common source of layout bugs.

## 2. Create

No new component needed — a snippet added to the section's existing `useGSAP` block. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const YourSection = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    // You can put a scrollTrigger on a tween that animates nothing at all.
    // This one is deliberately empty of properties - it exists purely so the
    // pin settings have somewhere to live. That is the standard trick.
    //   trigger        = the element to pin
    //   start: "center center" = pin begins when the element's middle lines up
    //                              with the middle of the screen
    //   end: "+=800 center"     = stay pinned for 800px MORE of scrolling
    //   pin: true               = freeze this element during that range
    //   pinSpacing: true        = leave a gap the height of the element so the
    //                             page does not jolt when it unpins
    //   scrub: 0.5              = smooth the transition into the range
    //   markers: false          = true while developing
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
      className="flex flex-col items-center justify-between min-h-screen gap-12"
    >
      {/* content */}
    </section>
  );
};

export default YourSection;
```

To animate the content *while* pinned, add the properties to the same tween.
The scrubbed `y` and opacity are then driven by scroll position across the pin
range:

```tsx
gsap.from(".pinned-title", {
  y: 100,
  opacity: 0,
  scrollTrigger: {
    trigger: containerRef.current,
    start: "center center",
    end: "+=800 center",
    scrub: 0.5,
    pin: true,
    pinSpacing: true,
  },
});
```

## 4. Wire it up

- The pinned element needs an id or a ref. It should be the outermost element of
  the section, not an inner child — pinning an inner child leaves the rest of the
  section scrolling around it.
- If the section is shorter than the viewport, it will not look pinned. Make it
  `min-h-screen`.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `pin: true` | — | Freezes the element's scroll position for the trigger's duration. Everything else on the page scrolls past underneath |
| `pinSpacing: true` | required unless you manage it | ScrollTrigger inserts a spacer element the height of the pinned element, so the page below does not jump forward when the pin releases. Turning it off without a compensating layout fix makes the next section slam up |
| `start: "center center"` | element centre to viewport centre | The natural "hold" point for a full-height section. `"top top"` pins the instant it touches the top of the screen, which feels abrupt |
| `end: "+=800 center"` | 800px of hold | Relative distance syntax: `+=` extends the range by 800px beyond the start position. The trailing `center` keeps the alignment reference. Adjust this number to change how long it holds |
| `scrub: 0.5` | half a second of catch-up | Smooths the transition into and out of the pinned range. A bare `scrub: true` snaps. This number is the smoothing lag, not a duration |
| `markers: false` | off by default | Turn on to draw the exact pixel where the pin starts and ends. The single most useful debugging flag ScrollTrigger has |
| Empty tween | properties are optional | `gsap.to(el, { scrollTrigger })` with no animatable properties is valid. The trigger is the point, not the animation |

## 6. Do not

- **Do not turn off `pinSpacing` casually.** It is the reason the page does not jolt. If you disable it because of a layout conflict, you must supply the equivalent space yourself.
- **Do not pin an inner element.** Pin the section's outermost wrapper, or the rest of the section scrolls past around the frozen part and it looks broken.
- **Do not nest two pinned sections without testing.** ScrollTrigger's spacer maths assumes the ranges do not overlap. Overlapping pins shift each other.
- **Do not pin an element shorter than the viewport.** There is nothing to hold still against.
- **Do not set `duration` alongside `scrub`.** The range is defined by `start`/`end`; a duration is ignored and only confuses the next reader.
- **Do not pin a `position: fixed` element.** It is already fixed; pinning it double-transforms it and the movement is unpredictable.
- **Do not add `pinType` speculatively.** It exists for transforms and fixed-position edge cases. Leave it alone unless you hit an actual problem.
- **Do not leave `markers: true` in.** They render in production.
- **Do not pin and scale the same element.** A pinned, transformed element fights its own spacer. Pick one — see [scrubbed-scale-reveal](scrubbed-scale-reveal.md) for the alternative.

## 7. Done when

- [ ] The section freezes when it reaches the middle of the viewport
- [ ] It stays frozen for the configured `+=` distance
- [ ] It releases smoothly and the content below it does not jump
- [ ] `start` and `end` were verified with `markers: true`, then markers were turned off
- [ ] The pinned element is the outermost wrapper of the section
- [ ] No `duration` on the tween
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
