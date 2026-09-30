# Burger to cross

**What you get** — a two-line hamburger that rotates into an X while the middle bar scales away.

**Use when** — "hamburger to cross", "burger animation", "menu icon animation", "morph hamburger into X", "animated menu button".

Extracted from the `src/sections/Navbar.tsx` icon pattern.

---

## 1. Ask first

- Is the icon the only way to open the menu, or is there a visible label too?
- Colour and size?

## 2. Create

No new component needed — a snippet added to the navbar's existing `useGSAP` block. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const Navbar = () => {
  const menuIconTl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // Two bars, rotated to form the X, and a middle bar that scales to nothing.
    // The first two lines get `position: absolute` from the className so they
    // stack on top of each other; the middle line stays in flow. Rotating the
    // container makes both bars rotate together, which is what turns the stack
    // into a cross.
    menuIconTl.current = gsap
      .timeline()
      .to(".menu-icon-line-2", {
        scaleX: 0, // the middle bar just disappears
        duration: 0.3,
      })
      .to(
        [".menu-icon-line-1", ".menu-icon-line-3"],
        {
          rotate: 45, // both bars to 45deg
          duration: 0.3,
        },
        "<" // "<" = start at the SAME time as the previous tween, not after it
      )
      .to(".menu-icon-line-3", {
        rotate: 135, // the bottom bar goes further, to 135deg
        duration: 0.3,
      });
  }, []);

  // play() and reverse() are the whole interface. The timeline is all `to`
  // tweens, so it is perfectly re-playable - reverse() always works, no
  // invalidate() needed. The `?.` guards keep a click in the window before the
  // first useGSAP run from throwing on a null ref.
  const toggleMenu = () => menuIconTl.current?.play();
  const closeMenu = () => menuIconTl.current?.reverse();
  const isOpen = () => menuIconTl.current?.isActive();

  return (
    <button onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isOpen()}>
      <div className="relative flex flex-col gap-2 w-8">
        <span className="menu-icon-line-1 absolute top-0 left-0 w-full h-0.5 bg-current" />
        <span className="menu-icon-line-2 w-full h-0.5 bg-current" />
        <span className="menu-icon-line-3 w-full h-0.5 bg-current" />
      </div>
    </button>
  );
};

export default Navbar;
```

## 4. Wire it up

- The icon must be a **button** with an accessible name, not a bare `div`.
- If the menu is also closable by clicking a link, that handler calls
  `closeMenu()` from the [menu-open-close-timeline](menu-open-close-timeline.md)
  recipe as well, so the icon and the overlay always agree.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| Three bars, middle one scales out | not two bars rotating | Two bars both at 45° make a `+`, not an X. The third bar at 135° crosses the first. Removing the middle bar is what makes it read as a cross rather than a plus |
| `rotate: 45` then `rotate: 135` | 45° apart | 90° apart is a perpendicular X. The 45/135 pairing is the standard construction |
| `"<"` position | simultaneous with the scale-out | Positions in a GSAP timeline are absolute times. `"<"` means "at the same moment as the previous tween starts"; `"<0.2"` would be 0.2s later |
| `duration: 0.3` per bar | 0.3s | Three short stages of 0.3s each. Any slower and the button feels laggy; it is a control, not a display |
| `absolute` on lines 1 and 3 | stack them | They need to occupy the same row to cross. The middle line stays in normal flow so the container has height |
| `h-0.5` | thin bars | 2px. `scaleX: 0` on a 2px bar is a clean collapse |
| `scaleX: 0` not `width: 0` | scale | `scaleX` is a transform, so it costs nothing to composite. Animating `width` would reflow the button on every frame |
| `bg-current` | inherits colour | The icon follows the text colour automatically. No second colour to keep in sync |
| `play()` / `reverse()` | no `invalidate()` | Every tween is a `to`, so there is no cached start state to re-arm. This is the whole reason this timeline is built from `to` and not `from` |
| `w-8` container | fixed width | The bars need a known width for the rotation to look right; an auto-width container with absolutely positioned children collapses to nothing |

## 6. Do not

- **Do not build this from `from` tweens.** `from` caches its start values; the second `reverse()` then does nothing and the icon is stuck as an X. All `to` here is deliberate — the timeline is re-playable with no invalidation.
- **Do not use two bars.** They form a plus sign. You need three, with the middle one scaled out.
- **Do not put both bars at 45°.** It is a `+`. The second one goes to 135°.
- **Do not animate `width` on the middle bar.** It reflows the button's box every frame and the neighbouring elements jitter.
- **Do not forget `position: absolute` on the two crossing bars.** Without it all three stack in flow, the container is three rows tall, and the rotation pivots around the wrong centre.
- **Do not call `invalidate()` here.** There is no `from` tween, so there is nothing to re-arm. Adding it is harmless but signals a misunderstanding of the pattern.
- **Do not leave `aria-expanded` off the button.** It is the only thing telling a screen reader whether the menu is open.
- **Do not use `top-1/2 -translate-y-1/2` on the container** to centre the bars. The rotation already centres itself; an extra transform offset fights it.

## 7. Done when

- [ ] Three bars are visible when closed
- [ ] Opening: middle bar disappears, outer bars cross into a recognisable X
- [ ] **Opening and closing three times in a row works every time** — the test for the `from`-cache bug this pattern avoids
- [ ] `aria-expanded` reflects the open state
- [ ] No layout shift on the surrounding navbar as the bars transform
- [ ] Icon colour follows the surrounding text
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
