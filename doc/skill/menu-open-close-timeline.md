# Menu open / close timeline

**What you get** — a full-screen overlay menu where a clip-path curtain wipes down to open, the items stagger in, and everything reverses cleanly on close.

**Use when** — "full screen menu", "overlay menu animation", "menu opens with curtain", "hamburger menu overlay", "menu with staggered links", "animated navigation menu".

Extracted from the `src/sections/Navbar.tsx` overlay-menu pattern.

---

## 1. Ask first

- What are the menu items? A list of labels plus their target `id`s on the page.
- Where does the menu open from — top, bottom, left, right?
- Background colour and text colour, and does the page scroll lock while it is open?

## 2. Create

No new component needed — a snippet for the existing navbar component. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe) and the `clip-path` utility from [tailwind-v4-responsive-text](tailwind-v4-responsive-text.md).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const menuLinks = [
  { label: "Home", href: "#home", id: "home" },
  { label: "Services", href: "#services", id: "services" },
  { label: "About", href: "#about", id: "about" },
  { label: "Work", href: "#work", id: "work" },
  { label: "Contact", href: "#contact", id: "contact" },
];

const Navbar = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuIconTl = useRef<gsap.core.Timeline | null>(null);
  const menuText = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // TWO timelines, on purpose:
    //   menuIconTl  = the curtain. Immutable state, so it never needs
    //                 invalidating. Just play/reverse it.
    //   menuText   = the item stagger, and it HAS to be invalidated each time.
    //                 If you call reverse() on a `from` timeline twice, the
    //                 second reverse does nothing - the values it captured on
    //                 the first run are already at their start state, so there
    //                 is nothing left to travel back. invalidate() clears
    //                 those cached values so the next reverse() works.
    menuIconTl.current = gsap
      .timeline()
      .set(menuRef.current, { display: "flex" }) // hidden menu must be taken out
      .to(                        // of the layout flow, or it still takes up
        containerRef.current, {  // space and you can see through it
        height: "auto",          // <-- the curtain: expands from 0 to full
        duration: 0.8,
        ease: "power4.inOut",
      })
      .to(
        menuRef.current,
        { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        0.3 // <-- start 0.3s into the previous tween, so they overlap
      );

    menuText.current = gsap
      .timeline()
      .from(".menu-item", {
        y: 200,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
  }, []);

  const toggleMenu = () => {
    // A timeline built from `from` tweens must be invalidated before every
    // reverse, or the second close does nothing. The `?.` guards keep this safe
    // if the ref is still null (menu toggled before mount, StrictMode double
    // render) instead of throwing.
    menuText.current?.invalidate();
    menuText.current?.reverse();
    menuIconTl.current?.play();
  };

  const closeMenu = () => {
    menuIconTl.current?.reverse();
    menuText.current?.invalidate();
    menuText.current?.reverse();
  };

  return (
    <nav>
      <button onClick={toggleMenu}>Menu</button>
      <div
        ref={menuRef}
        className="menu fixed inset-0 z-50 hidden flex-col gap-10 p-10"
      >
        {menuLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={closeMenu}
            className="menu-item uppercase text-4xl"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
```

## 4. Wire it up

- The menu is `display: none` in CSS, so it is out of the document flow and
  invisible on load. The `set(menuRef, { display: "flex" })` at position 0 of
  the curtain timeline is what reveals it.
- Add a `onReverseComplete` to set `display: "none"` again on close, otherwise
  the closed menu still swallows clicks across the whole viewport:

```tsx
menuIconTl.current = gsap
  .timeline({
    onReverseComplete: () => {
      gsap.set(menuRef.current, { display: "none" });
    },
  });
```

- Close the menu in the same click handler as the link navigation.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| Two separate timelines | curtain vs. items | The curtain only ever goes 0 → full and back. The items are a `from` timeline that must be re-armed. Keeping them apart means fixing the invalidation bug on one does not disturb the other |
| `menuText.invalidate()` before `reverse()` | required | **The single most important line here.** A `from` timeline caches its start values on first render. `reverse()` walks back to them; a second `reverse()` finds them already in place and does nothing. `invalidate()` discards the cache so the next reverse re-reads the current DOM values |
| `height: "auto"` | not a fixed `vh` | The menu grows to fit whatever you put in it. A fixed height clips long menus |
| `duration: 0.8` on the curtain | 0.8s | Long enough to feel deliberate. Shorter than 0.5 feels like a glitch |
| `ease: "power4.inOut"` | symmetric ease | Matches the clip-path curve used elsewhere in the project so the site feels like one system |
| `backgroundColor` at position `0.3` | mid-tween start | The dim scrim appears as the curtain is opening, not after it. Positions are absolute times on the timeline, so `0.3` means 0.3s in — not "0.3s after the last tween" |
| `stagger: 0.1` | 0.1s per item | Fast. On a short menu, anything over 0.15 makes the last link feel broken |
| `y: 200` | px | Off the bottom of the overlay by a comfortable margin |
| `power2.out` on items | decisive | The curtain is slow and eased; the items should feel snappy once it is open |
| `play()` / `reverse()` with `?.` | optional chaining | The refs are `null` before the first `useGSAP` run. A click landing in that window would throw |

## 6. Do not

- **Never call `reverse()` on a `from` timeline without `invalidate()` first.** The first close works. The second close does nothing and the menu is stuck open. This is the bug this recipe exists to prevent.
- **Do not build the menu as a single timeline containing both the curtain and the items.** Then the `from` cache problem applies to the curtain too, and the curtain — which is pure `to`, so it is perfectly re-playable — inherits a bug it did not need.
- **Do not leave the menu at `display: flex` after closing.** An invisible-but-present full-screen overlay blocks every click on the page. Add the `onReverseComplete` above.
- **Do not use `toggleMenu` as the close handler.** It always `play()`s the curtain. Closing needs `reverse()`.
- **Do not use `height: "100vh"`** if the menu content could ever exceed the viewport height. It clips with no scroll.
- **Do not forget to lock body scroll while the menu is open**, or the page scrolls behind the overlay and the closing animation happens off-screen.
- **Do not skip `invalidate()` on the curtain timeline.** You do not need to. It is the point of splitting them.

## 7. Done when

- [ ] Menu opens with the curtain, items cascade in behind it
- [ ] Menu closes on the link click
- [ ] **The menu opens and closes three times in a row** and every close is complete — this is the test for the invalidate bug
- [ ] The closed menu does not block clicks anywhere on the page
- [ ] Page scroll is locked while open and restored on close
- [ ] Menu is `display: none` when closed
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
