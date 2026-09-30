# Hover clip-path wipe

**What you get** — a coloured panel that wipes up over a row on hover, with no layout shift and no reflow.

**Use when** — "hover wipe animation", "clip-path hover", "row hover reveal", "curtain hover effect", "wipe overlay on hover", "inverted hover".

Extracted from the `src/sections/Works.tsx` project-row hover pattern.

---

## 1. Ask first

- What is the row — a link, a project, a list item? Does it navigate on click?
- What colour is the wipe, and what should the text become on hover? Ask, and confirm the contrast is still legible over the new background.
- Desktop only, or does it need a touch equivalent?

## 2. Create

No new component needed — a snippet for the existing list component. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe) and the `clip-path` utility from [tailwind-v4-responsive-text](tailwind-v4-responsive-text.md).

## 3. Paste this

```tsx
import { useRef } from "react";
import { gsap } from "../lib/gsap";

const Works = () => {
  const overlayRefs = useRef<Array<HTMLElement | null>>([]);

  const handleMouseEnter = (index: number) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(index);

    const el = overlayRefs.current[index];
    if (!el) return;

    // Pointer events fire far faster than a 0.15s tween takes to finish. Moving
    // in and out quickly leaves two animations fighting over the same property
    // and the overlay ends up stuck half open. killTweensOf() clears whatever is
    // still running before a new one starts.
    gsap.killTweensOf(el);

    // fromTo, not from: the overlay may already be partway open from a previous
    // hover, and `from` would snap it shut first - a visible flicker.
    // fromTo always starts from exactly these values.
    //
    // Polygon points go around the shape: top-left, top-right, bottom-right,
    // bottom-left. Both bottom corners at "100% 100%" collapses the shape to a
    // flat line on the bottom edge, so raising them to "0%" looks like a curtain
    // being pulled up over the row. Animating clip-path instead of height means
    // the row's contents never move or reflow.
    gsap.fromTo(
      el,
      {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
      },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        duration: 0.15,
        ease: "power2.out",
      }
    );
  };

  const handleMouseLeave = (index: number) => {
    if (window.innerWidth < 768) return;
    setCurrentIndex(null);

    const el = overlayRefs.current[index];
    if (!el) return;

    gsap.killTweensOf(el);
    gsap.to(el, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: 0.2,
      ease: "power2.in",
    });
  };

  return (
    <div>
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="project-row relative flex flex-col py-5 cursor-pointer group md:gap-0"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={() => handleMouseLeave(index)}
        >
          {/* The overlay is absolutely positioned to fill the row and sits
          BEHIND the content (-z-10), so the text is painted on top of the
          wipe. That is why the row's text colour has to invert on hover. */}
          <div
            ref={(el) => {
              overlayRefs.current[index] = el;
            }}
            className="absolute inset-0 hidden md:block duration-200 bg-black -z-10 clip-path"
          />

          <div className="flex justify-between px-10 text-black transition-all duration-500 md:group-hover:px-12 md:group-hover:text-white">
            <h2>{project.name}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 4. Wire it up

Three things must agree or the effect breaks:

1. The overlay is `absolute inset-0` — it fills the row. The row must be
   `relative`.
2. The overlay is `-z-10` — the content is painted on top of the wipe. The row
   needs a stacking context for this to be predictable; the `relative` on the
   row provides it.
3. The row's content **inverts its colour on hover** (`md:group-hover:text-white`),
   because the black wipe is going to pass under it.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `killTweensOf(el)` before each tween | required | Hover in/out fires far faster than the 0.15s tween. Two tweens on the same property leave the overlay stuck half-open |
| `fromTo` on enter | not `from` | The overlay may be partway open from a previous hover. `from` snaps to the start value first — a visible flicker. `fromTo` always begins at exactly the stated values |
| `to` on leave | — | Leave is a simple return to a known collapsed value, so there is no start state to specify |
| `duration: 0.15` | 0.15s | A hover affordance, not a transition. It must feel immediate or the row feels unresponsive |
| `duration: 0.2` on leave | slightly longer | Collapsing a little slower than it expanded reads as heavier and more deliberate |
| `power2.out` in, `power2.in` out | mirrored eases | Accelerating out / decelerating in on the way back. Using `out` on the collapse makes it feel like it is being sucked away |
| `polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)` | flat line on the bottom edge | All four points collapsed onto the bottom border. The order is fixed: top-left, top-right, bottom-right, bottom-left |
| `-z-10` on the overlay | behind the content | The content stays readable throughout the wipe. Put the overlay above and the row's text is hidden for the whole animation |
| `group` + `md:group-hover:` | the class hook | The overlay is driven by JS events; the text colour is driven by CSS. Both must fire, and `group` keeps the CSS side tied to the same row |
| `hidden md:block` on the overlay | desktop only | There is no hover on touch, so a permanently-collapsed overlay on mobile is dead markup. The row needs a separate touch treatment |

## 6. Do not

- **Do not forget `killTweensOf`.** Rapid hovering is the normal case, not an edge case. Without it the overlay sticks half-open and stays there.
- **Do not use `from` on enter.** The flicker is subtle and only shows on the second hover — which is exactly when you will ship it if you do not look.
- **Do not reorder the polygon points.** They are read clockwise from the top-left. A wrong order is invalid and the browser discards the declaration, leaving the overlay fully visible with no animation and no error.
- **Do not animate `height` instead.** It reflows the row and pushes its content on every frame. `clip-path` only changes what is painted.
- **Do not put the overlay above the content.** The whole point is the content staying visible over the wipe.
- **Do not forget to invert the text colour on hover.** A black wipe under black text makes the row unreadable for the duration of the animation.
- **Do not use a `window.innerWidth` check as your only responsive gate.** It is a JS pixel number with no relationship to Tailwind's `md:`. Keep both, and change them together.
- **Do not attach this to a clickable element without checking the pointer-events.** If the overlay is not `pointer-events-none` and not behind the content, it eats the click.
- **Do not combine this with the `quickTo` follower on the same row** without checking z-index. The follower is `fixed` at `z-50`; a negative z-index overlay will pass under it, which is usually what you want — but verify rather than assume.

## 7. Done when

- [ ] Hovering wipes the panel up over the row; leaving wipes it back down
- [ ] Rapid hovering in and out leaves no stuck half-open overlay
- [ ] The second hover has no flicker (the `fromTo` check)
- [ ] Row text stays readable throughout and inverts colour on hover
- [ ] Nothing in the row reflows or shifts position during the wipe
- [ ] The row is `relative` and the overlay is `absolute inset-0 -z-10`
- [ ] On mobile the overlay is not rendered and the row has a working touch state
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
