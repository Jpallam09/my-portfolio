# Scrubbed section scale

**What you get** — a section that shrinks a few percent as it travels up the screen, pulling the eye toward the next section.

**Use when** — "section scales on scroll", "section zoom out on scroll", "section recedes as you leave", "pull focus effect", "shrink section on scroll".

Extracted from the `src/sections/About.tsx` section-scale pattern.

---

## 1. Ask first

- Which section should scale? It needs an `id` you can target, or a ref.
- How much should it shrink? Below `0.9` it starts to look broken; above `0.98` nobody notices.
- Does it have a background colour, or is it transparent over the page? Scaling a transparent section does nothing visible.

## 2. Create

No new component needed — a snippet added to the section's existing `useGSAP` block. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const YourSection = () => {
  useGSAP(() => {
    // The whole section shrinks slightly as it goes past, which pulls the eye
    // down the page. scrub ties it to your scroll position, so it reverses
    // perfectly when you scroll back up.
    // start/end are written as "when the element's <part> reaches <part> of the
    // screen": start when the section's bottom hits 80% down the screen, end
    // when that bottom reaches 20%. So the movement happens over that stretch.
    gsap.to("#your-section", {
      scale: 0.95,
      scrollTrigger: {
        trigger: "#your-section",
        start: "bottom 80%",
        end: "bottom 20%",
        scrub: true,
        markers: false, // set to true while developing to see the exact range
      },
      ease: "power1.inOut",
    });
  });

  return (
    <section id="your-section" className="min-h-screen bg-black">
      {/* content */}
    </section>
  );
};

export default YourSection;
```

## 4. Wire it up

The section needs:

- A unique `id` (or a ref passed as `trigger`, if the id is already taken)
- A background colour, so the scaled edges are visible
- `overflow-x: hidden` on `body` — a scaled section can push its own box
  slightly outside the viewport width

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `scale: 0.95` | 5% shrink | The maximum that reads as a subtle depth cue. `0.8` looks broken, `0.99` is invisible |
| `start: "bottom 80%"` | section bottom 80% down the screen | The range begins as the section is still well below the fold, so the movement is already underway by the time the user sees it |
| `end: "bottom 20%"` | section bottom 20% down the screen | Ends while the section is still substantially visible. Ending at `"top top"` would mean the user has scrolled past it before it finishes |
| `scrub: true` | tied to scroll, not time | The only reason the effect reverses perfectly. Without scrub it would play once and stay scaled |
| `ease: "power1.inOut"` | symmetric ease-in-out | A scrubbed tween ignores `duration` but still honours `ease` as a progress curve. `power1.inOut` spends more of the range at the two extremes, so the section visibly settles before releasing |
| `markers: false` | off by default | Turn on while tuning `start`/`end` — it draws the exact pixel where the range begins and ends. Off before commit |
| Trigger on `#id`, not the element ref | global selector | This is the one case where a global id selector is right: it lets the tween live in any file without threading a ref through |

## 6. Do not

- **Do not add `duration`.** A scrubbed tween's duration comes from the scroll range. Setting one is ignored and only misleads whoever reads it next.
- **Do not use `scrollTrigger` with a `scrub` value above `1`** for this effect. `scrub: 1` adds a one-second lag, so the section visibly trails the page. `true` is correct for a subtle scale.
- **Do not scale a section that has no background.** With a transparent background there is no edge to see moving, so the effect is invisible and you will debug it for nothing.
- **Do not target an `id` that appears more than once.** `gsap.to("#x")` with a duplicated id resolves to the first match only.
- **Do not forget that `scale` transforms the section's children too.** Anything with `position: fixed` inside a scaled ancestor will scale and move with it — a floating button inside a scaling section will drift. Keep fixed elements outside.
- **Do not pair this with `pin` on the same element.** A pinned, scaled element fights the pin spacer. Pick one.
- **Do not leave `markers: true` in.** They render in production.

## 7. Done when

- [ ] The section visibly shrinks as it scrolls up, and expands again on scroll-down
- [ ] The movement begins before the section reaches the viewport and finishes while it is still visible
- [ ] `start` and `end` were verified with `markers: true`, then markers were turned off
- [ ] No `duration` on the tween
- [ ] No `position: fixed` children inside the scaled section
- [ ] `overflow-x: hidden` is set on `body` and no horizontal scrollbar appears
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
