# Cursor follower with `quickTo`

**What you get** — a fixed preview image that trails your mouse with a bit of weight, and swaps to whichever item you are hovering.

**Use when** — "cursor follower", "mouse follower image", "image follows cursor", "custom cursor preview", "trailing preview on hover", "floating image on hover".

Extracted from the `src/sections/Projects.tsx` project-preview pattern.

---

## 1. Ask first

- What image should follow the cursor, and does it change per hovered item? Ask for the list of images.
- Size of the preview?
- Desktop only, or mobile too? A cursor follower is meaningless on touch — ask, then gate it.
- Should the cursor itself be hidden, or just accompanied?

## 2. Create

No new component needed — a snippet for the existing list component. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const Projects = () => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const moveX = useRef<((value: number) => void) | null>(null);
  const moveY = useRef<((value: number) => void) | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useGSAP(() => {
    // mousemove fires roughly 60 times a second. Calling gsap.to() on every
    // event builds a brand new tween each time and the page janks. gsap.quickTo()
    // returns a reusable function: call it as often as you like, it retargets a
    // single existing tween instead of creating another.
    //
    // x catches up in 1.5s, y takes 2s. The mismatch is deliberate - the image
    // trails the mouse more on one axis, which reads as "it has weight". The
    // same duration on both axes looks robotic.
    moveX.current = gsap.quickTo(previewRef.current, "x", {
      duration: 1.5,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(previewRef.current, "y", {
      duration: 2,
      ease: "power3.out",
    });
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    // React hands you a SyntheticEvent here, not a plain DOM MouseEvent. Both
    // have clientX/clientY, which is all this needs - so the handler is typed
    // with React's MouseEvent, not the global one.
    mouse.current.x = e.clientX + 24;
    mouse.current.y = e.clientY + 24;
    moveX.current(mouse.current.x);
    moveY.current(mouse.current.y);
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative">
      {projects.map((project, index) => (
        <div key={project.id} onMouseEnter={() => setCurrentIndex(index)}>
          {project.name}
        </div>
      ))}

      {/* fixed = positioned to the viewport, so it can travel anywhere on the
      page. pointer-events-none = it never intercepts the hover it is chasing.
      -top-2/6 parks it above the cursor so the image is not under the pointer. */}
      <div
        ref={previewRef}
        className="fixed -top-2/6 left-0 z-50 overflow-hidden border-8 border-black pointer-events-none w-240 hidden opacity-0"
      >
        {currentIndex !== null && (
          <img src={projects[currentIndex].image} alt="preview" />
        )}
      </div>
    </div>
  );
};
```

## 4. Wire it up

- The `onMouseMove` handler must be on a container that spans the hoverable
  list. Putting it on each row means the position resets as you move between
  rows.
- `pointer-events-none` on the preview is required. Without it, the image sits
  under the cursor, receives the pointer, and the row underneath stops firing
  `mouseenter`.
- Gate the whole thing on a desktop breakpoint. There is no cursor to follow on
  touch.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `gsap.quickTo()` | not `gsap.to()` per event | **The entire point.** `gsap.to` allocates a new tween on every mousemove — roughly 60 per second. `quickTo` reuses one tween and retargets it. The page stays smooth |
| `x: 1.5s`, `y: 2s` | deliberately different | The image lags more on the vertical axis, which reads as depth or weight. Identical durations read as a rigid, lifeless copy |
| `ease: "power3.out"` | fast start, long settle | A follower that eases out reads as momentum. A linear follower reads as a drag |
| `duration: 1.5` / `2` | 1.5s is a lot | Long enough to be visibly behind the cursor. Under 0.3s it is just a cursor and the effect is invisible |
| `+ 24` on both axes | cursor offset | Nudges the image off the pointer so it is not hidden under it. Increase if the image is large |
| `ReactMouseEvent<HTMLDivElement>` | React's type | A React `onMouseMove` receives a SyntheticEvent, not a DOM `MouseEvent`. Typing the handler as the global `MouseEvent` is wrong even though both have `clientX` |
| `pointer-events-none` | required | Otherwise the follower eats the pointer and the row's `mouseenter` never re-fires |
| `position: fixed` | viewport-relative | The follower must not scroll with the content. `absolute` would put it in the document flow and it would travel away on scroll |
| `hidden` + `md:block` | desktop only | A cursor follower is meaningless without a cursor |
| `useState` for `currentIndex` | — | The image *content* genuinely changes per row, so a re-render is correct here. Only the *position* is handled outside React |

## 6. Do not

- **Do not call `gsap.to()` inside `mousemove`.** You will create ~60 tweens per second and the page will visibly stutter. That is the exact problem `quickTo` exists to solve.
- **Do not use the same duration on both axes.** The mismatch is what gives the follower weight. Equal durations look mechanical.
- **Do not type the handler as the global `MouseEvent`.** React passes a SyntheticEvent. Import the type from `react` — `type MouseEvent as ReactMouseEvent` — or `tsc` will complain the handler signature does not match what `onMouseMove` expects.
- **Do not forget `pointer-events-none`.** The follower will sit under the cursor, block it, and the hover state collapses.
- **Do not put `onMouseMove` on each row.** The follower resets its position crossing every row boundary, and the trailing effect is lost.
- **Do not use `position: absolute`.** The follower scrolls away with the content.
- **Do not drive the image content with GSAP.** You cannot tween an `<img src>`. Change the source in React state; use GSAP only for position and opacity.
- **Do not forget to null the refs if you add a cleanup path.** `moveX.current` is assigned inside `useGSAP`, so it is `null` until the first run — guard calls made before mount.
- **Do not ship this on touch devices.** A follower that tracks a tap position flickers and hides content. Gate it behind a `(hover: hover)` media query.

## 7. Done when

- [ ] The preview follows the cursor with a visible, smooth lag
- [ ] Lag differs between the x and y axes
- [ ] Moving the cursor across the page creates no stutter or dropped frames
- [ ] Hovering a row swaps the image to that row's
- [ ] Leaving the list fades the preview out
- [ ] The preview never intercepts the pointer
- [ ] The preview does not scroll away with the page
- [ ] The effect is disabled on touch devices
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
