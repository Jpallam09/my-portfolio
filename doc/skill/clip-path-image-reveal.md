# Clip-path image reveal

**What you get** — an image that starts collapsed to nothing and opens up when it scrolls into view, with no reflow and no resampling.

**Use when** — "image reveal", "photo reveal animation", "clip-path reveal", "curtain wipe on image", "un-cover the image", "wipe reveal".

Extracted from the `src/sections/About.tsx` photo-reveal pattern.

---

## 1. Ask first

- What is the image path? Confirm the file exists in `public/` and the path is root-absolute (`/images/...`).
- What is the alt text? Ask — do not default to a filename.
- Rounded corners, fixed width, or full bleed?

## 2. Create

No new component needed — a snippet added to the section's existing `useGSAP` block. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const YourSection = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useGSAP(() => {
    // The photo is hidden by collapsing it to a flat line along its bottom
    // edge, then un-collapsed when it scrolls in. Doing it with clip-path means
    // the image itself is never resized, so nothing inside it shifts.
    //
    // The polygon points go around the shape in order: top-left, top-right,
    // bottom-right, bottom-left. Setting the two BOTTOM corners to "100% 100%"
    // collapses the whole shape into a flat line on the bottom edge.
    gsap.set(imgRef.current, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
    });

    gsap.to(imgRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 2,
      ease: "power4.out",
      scrollTrigger: { trigger: imgRef.current },
    });
  });

  return (
    <img
      ref={imgRef}
      src="/images/portrait.png"
      alt="Describe the photo"
      className="w-md rounded-3xl"
    />
  );
};

export default YourSection;
```

## 4. Wire it up

- The image path must be **root-absolute** — `/images/portrait.png`, never
  `images/portrait.png`. A relative path only resolves at the site root and
  breaks on every nested route.
- The file lives in `public/images/`.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `gsap.set(...)` before the tween | collapsed polygon, no tween | Sets the start state immediately with no animation, so the image is never briefly visible at full size on first paint. The alternative — a `from` tween — flickers because it renders the end state for one frame first |
| `polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)` | all points on the bottom edge | Order matters: top-left, top-right, bottom-right, bottom-left. Wrong order makes the browser ignore the whole value |
| `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)` | full rectangle | The end state. Note the `0%` on the last point — `0` and `0%` are equivalent but keeping the unit consistent avoids surprises |
| `duration: 2` | 2 seconds | A long reveal. This is a "moment", not a transition — it should feel unhurried |
| `ease: "power4.out"` | very fast start, long settle | The edge races open then decelerates hard. That deceleration is what makes it read as a curtain rather than a wipe |
| `scrollTrigger: { trigger: imgRef.current }` | default `start` | Fires at the default start point. Add `start: "top 80%"` if it feels like it fires too late |
| `clip-path` not `height` / `scaleY` | — | `clip-path` only changes what is painted. `height` reflows the layout; `scaleY` resamples the image and distorts it mid-animation |

## 6. Do not

- **Do not replace `gsap.set` with `gsap.from`.** `from` renders the end state for one frame before jumping to the start, which shows as a flash of the full image. `gsap.set` establishes the collapsed state with no animation at all.
- **Do not reorder the polygon points.** The four points are read clockwise from the top-left. `polygon(0 100%, 100% 0%, ...)` is not a valid rectangle and the browser discards the whole declaration, leaving the image fully visible with no animation and no error.
- **Do not animate `height` instead.** It reflows the page on every frame and pushes surrounding content around.
- **Do not animate `scaleY`.** It squashes the image itself, so it visibly resamples and softens. `clip-path` keeps the pixels untouched.
- **Do not use a relative `src` path.** `images/portrait.png` works at `/` and 404s on `/about`.
- **Do not set `overflow-hidden` on a parent to achieve this.** That hides the image permanently rather than revealing it.
- **Do not add `scrub` to this.** It is a one-shot reveal on entry, not a scroll-linked movement.

## 7. Done when

- [ ] The image is invisible (collapsed to a line) before it scrolls into view
- [ ] There is no flash of the full image on first paint
- [ ] The image opens smoothly and ends fully visible
- [ ] The image is never visibly stretched, squashed, or resampled during the reveal
- [ ] The `src` path is root-absolute and the file exists in `public/`
- [ ] Meaningful `alt` text is set
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
