# Lenis ↔ ScrollTrigger bridge

**What you get** — smooth scrolling driven by GSAP's own ticker, with ScrollTrigger reading the same clock. Scrubbed tweens and pins stop drifting.

**Use when** — "Lenis", "smooth scroll", "scrub jitters", "pin drifts", "ScrollTrigger out of sync", "scroll animation lags behind the page", "parallax behind the content".

Extracted from the `src/App.tsx` Lenis mount and the documented bridge in `doc/GSAP-PATTERNS.md` of a working portfolio.

---

## 1. Ask first

- Is Lenis already installed and mounted? Find the `ReactLenis` usage before changing anything.
- Is the problem a specific animation drifting, or the whole page feeling out of sync?
- Do they have `prefers-reduced-motion` handling anywhere yet?

## 2. Create

```bash
npm install lenis
```

Create **`src/components/ScrollBridge.tsx`** — new file. Requires `src/lib/gsap.ts` to exist (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

`src/components/ScrollBridge.tsx`:

```tsx
import { useLenis } from "lenis/react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../lib/gsap";

/**
 * Three lines that make smooth scrolling and ScrollTrigger agree on where the
 * page is.
 *
 * 1. lenis.on("scroll", ScrollTrigger.update) - Lenis moves the page, then
 *    tells ScrollTrigger to re-measure. Without this, ScrollTrigger only
 *    recalculates on native scroll events, so any tween with `scrub` or `pin`
 *    is reading a stale position.
 *
 * 2. gsap.ticker.add(...) - Lenis usually runs its own requestAnimationFrame
 *    loop. GSAP already has a ticker running every frame. Driving Lenis from
 *    GSAP's ticker means one clock for the whole page, so nothing can be a
 *    frame behind anything else.
 *
 * 3. gsap.ticker.lagSmoothing(0) - by default GSAP clamps its delta time when
 *    a frame takes too long (a heavy image decode, a tab regaining focus).
 *    That clamp desynchronises Lenis from ScrollTrigger after any hitch. Turn
 *    it off so both keep measuring real elapsed time.
 */
export const ScrollBridge = () => {
  const lenis = useLenis();

  useGSAP(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
};
```

## 4. Wire it up

`App.tsx` — two required changes. `autoRaf: false` is what stops Lenis from
also running its own loop on top of GSAP's:

```tsx
import ReactLenis from "lenis/react";
import { ScrollBridge } from "./components/ScrollBridge";

const App = () => {
  return (
    <ReactLenis
      root
      options={{ autoRaf: false }}
      className="relative w-screen min-h-screen"
    >
      <ScrollBridge />
      {/* sections */}
    </ReactLenis>
  );
};

export default App;
```

If the project is plain JavaScript with no TypeScript, drop the type
annotations — the logic is identical.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `lenis.on("scroll", ...)` | `ScrollTrigger.update` | Makes every trigger re-measure after Lenis moves the page |
| `lenis.raf(time * 1000)` | GSAP ticker time, × 1000 | GSAP's ticker reports seconds, Lenis wants milliseconds |
| `gsap.ticker.lagSmoothing(0)` | disabled | Stops GSAP clamping its delta after a slow frame, which is a classic source of one-way desync |
| `options.autoRaf` | `false` | Lenis must not run a second rAF loop when GSAP is driving it |
| `root` prop | on `ReactLenis` | Scrolls the wrapper div instead of `window` — see the trap below |
| Cleanup | `lenis.off` + `gsap.ticker.remove` | Without it, every remount leaves a listener and a ticker callback running |

## 6. Do not

- **Do not skip `options={{ autoRaf: false }}`.** Lenis will run its own animation frame loop *and* be driven by GSAP's, so the page scrolls at roughly double speed.
- **Watch the `root` prop.** With `root`, Lenis scrolls its own wrapper div. If that wrapper grows to fit its content it has nothing to scroll, and Lenis silently does nothing — the page falls back to native scrolling, which ScrollTrigger handles on its own, so everything appears to work until the day you actually need smoothing. Confirm the wrapper has `overflow` set and is height-constrained, or drop `root` and let Lenis drive the window.
- **Do not assume installing the bridge fixes everything.** If Lenis was never actually scrolling (see above), the bridge adds two listeners that do nothing. Verify with the console test in "Done when" before assuming the bridge worked.
- **Do not forget the `return` in the `useGSAP` body.** `useGSAP` accepts a cleanup function, and that is where the listeners come off. Leaving it out leaks a ticker callback on every remount.
- **Do not stack a second smooth-scroll system.** A library like `react-scroll`'s `<Link smooth>` is a completely independent scroller. Mixing it with Lenis means two things fighting over one scroll position.

## 7. Done when

- [ ] `ScrollBridge` is rendered inside the `ReactLenis` wrapper
- [ ] `ReactLenis` has `options={{ autoRaf: false }}`
- [ ] `lenis.on("scroll", ScrollTrigger.update)` is present, and matched by `lenis.off` in cleanup
- [ ] `gsap.ticker.lagSmoothing(0)` is called
- [ ] Console test: `window.scrollTo(0, 500)` then `window.scrollY` reports a value around 500, not 0 — if it reports 0, Lenis is not scrolling and the bridge is a no-op
- [ ] A `scrub: true` tween and a `pin: true` trigger both move smoothly with no visible step or drift
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
