# Page-wide horizontal drift

**What you get** — full-width rows of large text that slide sideways at different speeds as you scroll, slowly enough that you can still read them.

**Use when** — "words drift sideways", "parallax keywords", "text sliding as you scroll", "sideways parallax", "headline drift effect", "rows moving horizontally on scroll".

Extracted from the `src/sections/SkillsSummary.tsx` pattern.

---

## 1. Ask first

- What are the rows of text or keywords? Each row becomes one drifting block.
- How far should each row travel? Small values (20-30%) read as depth. Large values (100%+) push content off screen.
- Light or dark section?

## 2. Create

No new component needed — a new section component. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

// Each keyword row drifts sideways at its own speed, tied to your scroll
// position, so scrolling back undoes it exactly.
//
// NOTE: there is deliberately no `trigger` on these. A ScrollTrigger with no
// trigger spans the whole page, so this drift gets spread very thin across many
// screens of scrolling. Slow enough that the words are still sitting near their
// CSS offsets when you reach this section, which is what keeps them readable.
// Don't add a `trigger`, `start` or `end` here. It shortens the range, and the
// large xPercent values below - which are percentages of the row's own width,
// and these rows are full-width blocks, so 100 means a whole screen - will
// slide the words straight off screen before you finish reading them.
const DriftingRows = () => {
  useGSAP(() => {
    // scrub ties the movement to the scroll position instead of playing once.
    // Directions alternate so the rows appear to shear past each other rather
    // than all travelling as one block.
    gsap.to("#row-1", {
      xPercent: 20,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#row-2", {
      xPercent: -30,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#row-3", {
      xPercent: 100,
      scrollTrigger: {
        scrub: true,
      },
    });
    gsap.to("#row-4", {
      xPercent: -100,
      scrollTrigger: {
        scrub: true,
      },
    });
  });

  return (
    <section className="mt-20 overflow-hidden font-light leading-snug text-center">
      <div id="row-1">
        <p>Architecture</p>
      </div>
      <div
        id="row-2"
        className="flex items-center justify-center gap-3 translate-x-16"
      >
        <p className="font-normal">Development</p>
        <div className="w-10 h-1 bg-gold" />
        <p>Deployment</p>
      </div>
      <div
        id="row-3"
        className="flex items-center justify-center gap-3 -translate-x-48"
      >
        <p>APIs</p>
        <div className="w-10 h-1 bg-gold" />
        <p className="italic">Frontends</p>
      </div>
      <div id="row-4" className="translate-x-48">
        <p>Databases</p>
      </div>
    </section>
  );
};

export default DriftingRows;
```

## 4. Wire it up

Two things must line up:

1. Each `gsap.to("#row-N")` selector must match exactly one element.
2. The section needs `overflow-hidden` — this is what stops the drifted content
   from creating a horizontal scrollbar on the page.

The Tailwind `translate-x-*` classes on the rows are the **resting positions**.
GSAP's `xPercent` is applied on top of them, so the words start offset and drift
from there. This is why the rows are off-centre in the markup: the animation
finishes them somewhere readable.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `scrollTrigger: { scrub: true }` | no `trigger`, no `start`, no `end` | **The whole trick.** A triggerless ScrollTrigger spans the entire page, so the movement is spread thin over many screens. Adding a trigger concentrates it and the large percentages shoot content off screen |
| `scrub: true` | not a number | `true` ties movement 1:1 to the scrollbar. A number (`0.5`) adds lag, which feels smoother but lags behind the page — wrong for something this slow |
| `xPercent` not `x` | percentage | `xPercent` is relative to the element's own width, so it stays proportional at any screen size. A pixel `x` value drifts differently on a phone and a desktop |
| `20 / -30 / 100 / -100` | alternating signs | Alternating direction makes the rows shear past each other. All-positive looks like the whole block slid |
| `100` on a full-width row | one full screen width | That is the ceiling. Anything beyond and content leaves the viewport |
| `overflow-hidden` on the section | required | Without it the drifted rows extend the document width and produce a horizontal scrollbar |
| `translate-x-*` on the rows | the resting offset | The resting position is in CSS, not in the tween. `gsap.to` adds to whatever transform is already applied |
| `useGSAP` with no dependency array | re-runs on render | Cheap here, and keeps the triggers correct if the ids ever change |

## 6. Do not

- **Never add `trigger`, `start`, or `end` to these triggers.** That is the single change that breaks this effect. A local trigger shortens the scrub range from the whole page to one screen, so `xPercent: 100` completes almost instantly and the words are gone before they can be read.
- **Do not use pixel values for the drift.** `x: 200` is meaningless across breakpoints; `xPercent: 20` is the same relative motion everywhere.
- **Do not forget `overflow-hidden`.** The most common symptom of getting this wrong is a horizontal scrollbar that appears on the page.
- **Do not put large `xPercent` values on narrow elements.** The percentage is of the element's own width. On a short pill-shaped badge, `xPercent: 100` moves it barely a badge-width, which looks broken. This effect only works on full-width blocks.
- **Do not combine `translate-x-*` from Tailwind with a GSAP `x` on the same element without thinking.** Both write to `transform`. Tailwind's `translate-x-16` is applied at build time and GSAP overwrites the transform on the first tick, so the Tailwind offset is lost. Keep the offset in CSS and the drift in `xPercent`, and it is fine — but know which one wins.
- **Do not set `ease` on these tweens.** A scrubbed tween's progress is set by the scroll position, not by time. An ease here fights the scrub.

## 7. Done when

- [ ] Rows drift sideways at visibly different speeds as you scroll
- [ ] Scrolling back up reverses the drift exactly
- [ ] The words are still fully readable when they are centred on screen
- [ ] No horizontal scrollbar appears on the page
- [ ] No `trigger`, `start`, or `end` on any of the four scrollTrigger configs
- [ ] Each `xPercent` is positive and negative in alternating rows
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
