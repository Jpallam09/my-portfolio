# Hide on scroll down

**What you get** — a fixed navbar that slides out of view when you scroll down and returns the moment you scroll up.

**Use when** — "hide navbar on scroll", "navbar hides when scrolling down", "auto-hide header", "nav appears on scroll up", "hide on scroll down show on scroll up".

Extracted from the `src/sections/Navbar.tsx` window-scroll-listener pattern.

---

## 1. Ask first

- Which element hides — the whole navbar, or just its links, keeping a logo visible?
- How far down does it travel? A full `translateY(-100%)` hides it completely; anything less leaves a sliver.
- Should it hide over the hero only, or everywhere on the page?
- What happens at the very top of the page — always visible, or follow the same rule?

## 2. Create

No new component needed — a snippet for the existing navbar component.

## 3. Paste this

```tsx
import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

const Navbar = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // This listener is a no-op while the difference is small. Without this
      // threshold, a mouse wheel tick that moves the page by 1-2px would fire
      // the tween on every single event, and a touchpad produces a stream of
      // them - the navbar strobes.
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;

      if (currentScrollY > lastScrollY.current) {
        // Scrolling DOWN. yPercent is a percentage of the element's own height,
        // so -100 moves it exactly one full navbar height up - off screen - for
        // any navbar height, with no magic number.
        gsap.to(navRef.current, { yPercent: -100, duration: 0.3 });
      } else {
        // Scrolling UP, or back at the top: bring it back.
        gsap.to(navRef.current, { yPercent: 0, duration: 0.3 });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Remove the listener on unmount. Without this, every remount stacks
    // another one on the window and the tween fires N times per scroll event.
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 p-6 bg-black"
    >
      {/* links */}
    </nav>
  );
};

export default Navbar;
```

## 4. Wire it up

- The navbar needs `position: fixed` (or `sticky`) to have a fixed viewport
  position to slide away from, and the body needs top padding equal to the
  navbar height so fixed content does not overlap the first section.
- `passive: true` tells the browser this listener will not call
  `preventDefault`, so it does not have to wait to dispatch the event. Scroll
  listeners should always be passive.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `yPercent: -100` | not `y: -100` | Percentage of the element's own height. A pixel value only works for one navbar height; this works for any |
| `duration: 0.3` | 0.3s | Short. The navbar is chrome, not content — it should get out of the way fast and come back fast |
| `Math.abs(...) < 5` | 5px threshold | **Not optional.** Touchpads emit a stream of tiny scroll deltas. Without a threshold the tween is called dozens of times per gesture and the navbar flickers |
| `lastScrollY` in a `useRef` | not `useState` | A ref write does not trigger a re-render. Using state here re-renders the whole navbar on every scroll event for no reason |
| `{ passive: true }` | required for scroll | Lets the browser dispatch immediately instead of waiting to see whether you block it |
| `removeEventListener` in cleanup | required | Window-scoped listeners outlive the component. Leaked handlers mean duplicate tweens |
| `duration` with no `ease` | GSAP default | Fine here. On a 0.3s translate the default ease is invisible; specifying one is noise |

## 6. Do not

- **Do not omit the 5px threshold.** It is the difference between a smooth navbar and a strobing one on a trackpad. If you want fewer false triggers, raise the threshold rather than deleting it.
- **Do not store `lastScrollY` in `useState`.** Every scroll tick becomes a React render of the whole navbar.
- **Do not forget the `removeEventListener`.** The listener is on `window`, not on the element, so React will not clean it up for you.
- **Do not hide the navbar on the way *up*.** The rule is: down hides, up shows. If the user scrolls up to read something, taking the navbar away is hostile.
- **Do not use `y: -100` with a variable-height navbar.** A fixed pixel value leaves a sliver visible on tall headers. `yPercent` is self-sizing.
- **Do not put a `scrollTrigger` on this tween.** This is a raw `window` scroll listener, not ScrollTrigger — the element is `position: fixed`, so it has no scroll position of its own to trigger on. Mixing the two is a common source of confusion here.
- **Do not forget `z-50` (or similar).** A hidden-then-shown fixed navbar behind the page content reappears behind the content.
- **Do not forget the body's top padding.** A fixed navbar overlays the hero.

## 7. Done when

- [ ] Scrolling down slides the navbar fully out of view
- [ ] Scrolling up brings it back
- [ ] A rapid trackpad flick does not make the navbar flicker
- [ ] The navbar is fully hidden, not clipped, at any viewport height
- [ ] `removeEventListener` is present in the effect cleanup
- [ ] Remounting the component does not cause multiple tweens per scroll
- [ ] The first section is not hidden underneath the fixed navbar
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
