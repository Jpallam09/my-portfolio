# Scroll-velocity marquee

**What you get** — a seamless infinite ticker whose speed and direction react to how you scroll. Scroll with it and it races ahead; scroll against it and it reverses.

**Use when** — "infinite marquee", "scrolling text ticker", "marquee that reacts to scroll", "velocity marquee", "infinite logo strip", "infinite loop text".

Extracted from the `src/components/Marquee.tsx` pattern.

---

## 1. Ask first

- What are the items? Ask for the words, or the logos.
- Should it loop one way or two? A paired band (one forward, one reversed) is the common look.
- Speed — `1` is a gentle drift, `2` is twice as fast. Start at `1` and raise it only if it reads as too slow.
- What separators between items? The pattern uses an icon.

## 2. Create

Create **`src/components/Marquee.tsx`** — new file. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe), which must register **both** `ScrollTrigger` and `Observer`.

If `Observer` is not registered in `src/lib/gsap.ts`, add it:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, Observer);

export { gsap };
```

## 3. Paste this

```tsx
import { Observer } from "gsap/all";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";

// Reads a value GSAP hands back and turns it into a finite number. GSAP returns
// values in mixed forms - sometimes a number, sometimes "123.4px", sometimes
// NaN. This one helper is what keeps the file type-safe: every value that
// arrives from GSAP goes through num() instead of being used as a raw string.
const num = (value: unknown) => {
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

type MarqueeProps = {
  items: string[];
  className?: string;
  itemClassName?: string;
  renderItem?: (item: string, index: number) => ReactNode;
  reverse?: boolean;
};

const Marquee = ({
  items,
  className = "text-white bg-black",
  itemClassName = "flex items-center px-16 gap-x-32",
  renderItem,
  reverse = false,
}: MarqueeProps) => {
  const itemsRef = useRef<Array<HTMLElement | null>>([]);

  // This function is adapted from the official GSAP horizontal-loop example.
  // It builds one long timeline that slides the items left forever, and the
  // instant an item leaves on the left it is repositioned to the right end. The
  // reposition happens while it is off screen, so you never see it. That is the
  // whole trick.
  //
  // You do not need to understand the maths to use it. Call it with your items
  // and these two options:
  //   speed: 1        = normal speed, 2 = twice as fast
  //   paddingRight    = the gap in pixels between the end and the start
  //   reversed: true  = start travelling the other way
  const horizontalLoop = (
    elements: HTMLElement[],
    config: {
      speed?: number;
      paddingRight?: number;
      reversed?: boolean;
      repeat?: number;
      paused?: boolean;
      snap?: number | false;
    } = {}
  ) => {
    const els = gsap.utils.toArray<HTMLElement>(elements);
    const {
      speed = 1,
      paddingRight = 0,
      reversed = false,
      repeat = 0,
      paused = false,
      snap: snapConfig = 1,
    } = config;

    if (els.length === 0) return null;

    // Some browsers shift elements by a pixel to accommodate flex layouts, so
    // adjacent equal-width items can alternate 242px / 243px. Snapping to whole
    // percentage points hides that.
    const snap =
      snapConfig === false
        ? (v: number) => v
        : gsap.utils.snap(snapConfig);

    const pixelsPerSecond = speed * 100;
    const length = els.length;
    const startX = els[0].offsetLeft;
    const widths: number[] = [];
    const xPercents: number[] = [];
    const times: number[] = [];
    let totalWidth = 0;
    let curIndex = 0;

    const tl = gsap.timeline({
      repeat,
      paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    });

    // Convert "x" to "xPercent" so the loop is resolution-independent, and
    // cache the widths and xPercents so the loop maths below is a lookup
    // instead of a DOM read.
    gsap.set(els, {
      xPercent: (i: number, el: HTMLElement) => {
        const w = (widths[i] = num(gsap.getProperty(el, "width")));
        xPercents[i] = snap(
          (num(gsap.getProperty(el, "x")) / w) * 100 +
            num(gsap.getProperty(el, "xPercent"))
        );
        return xPercents[i];
      },
    });
    gsap.set(els, { x: 0 });

    totalWidth =
      els[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      els[length - 1].offsetWidth * num(gsap.getProperty(els[length - 1], "scaleX")) +
      num(paddingRight);

    for (let i = 0; i < length; i++) {
      const item = els[i];
      const curX = (xPercents[i] / 100) * widths[i];
      const distanceToStart = item.offsetLeft + curX - startX;
      const distanceToLoop = distanceToStart + widths[i] * num(gsap.getProperty(item, "scaleX"));

      // Tween 1: slide the item left, far enough to carry it past the right
      // edge of the sequence.
      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0 // absolute position 0 = start of the timeline
      )
        // Tween 2: hold it there, then fromTo it back to its original spot.
        // immediateRender: false is REQUIRED - without it this tween's start
        // values are applied on creation, which teleports every item to the
        // left before the timeline ever plays.
        .fromTo(
          item,
          {
            xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
          },
          {
            xPercent: xPercents[i],
            duration: totalWidth / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond
        )
        .add(`label${i}`, distanceToStart / pixelsPerSecond);

      times[i] = distanceToStart / pixelsPerSecond;
    }

    // Always travel the shortest way round, wrapping the playhead when the
    // target index is on the other side of the loop.
    const toIndex = (index: number) => {
      const count = gsap.utils.wrap(0, length, index);
      let time = times[count]; // let, not const: it is reassigned below
      if (time > tl.time() !== count > curIndex) {
        tl.vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
        time += tl.duration() * (count > curIndex ? 1 : -1);
      }
      curIndex = count;
      return tl.tweenTo(time, { overwrite: true });
    };

    tl.next = () => toIndex(curIndex + 1);
    tl.previous = () => toIndex(curIndex - 1);
    tl.current = () => curIndex;
    tl.toIndex = (index: number) => toIndex(index);
    tl.times = times;

    // Pre-render at both ends so the first frames are not a jank spike.
    tl.progress(1, true).progress(0, true);

    if (reversed) {
      // tl.vars holds the config object this timeline was built with, so
      // onReverseComplete is typed as unknown-ish. The cast is what makes the
      // call type-safe, and the ?. guards against a caller that omitted it.
      (tl.vars.onReverseComplete as (() => void) | undefined)?.();
      tl.reverse();
    }

    return tl;
  };

  useEffect(() => {
    // repeat: -1 = loop forever. The filtered array drops holes so a null ref
    // cannot reach the loop maths.
    const tl = horizontalLoop(
      itemsRef.current.filter((el): el is HTMLElement => el !== null),
      {
        repeat: -1,
        paddingRight: 30,
        reversed: reverse,
      }
    );

    if (!tl) return;

    // This is what makes the marquee react to HOW FAST you scroll, not just
    // where you are. Observer watches scroll and reports the delta, then we
    // speed the loop up or slow it down.
    //
    // Two steps on purpose: spike the timeScale, then 0.3s later ease back to a
    // gentle drift. One step in a single tween feels jerky.
    const obs = Observer.create({
      onChangeY(self) {
        let factor = 2.5;
        // A reversed marquee travels the other way, so "with the flow" is
        // deltaY > 0 instead of < 0.
        if ((!reverse && self.deltaY < 0) || (reverse && self.deltaY > 0)) {
          factor *= -1;
        }
        gsap
          .timeline({ defaults: { ease: "none" } })
          .to(tl, { timeScale: factor * 2.5, duration: 0.2, overwrite: true })
          .to(tl, { timeScale: factor / 2.5, duration: 1 }, "+=0.3");
      },
    });

    return () => {
      // GSAP does NOT clean up Observer instances on unmount. Without this kill,
      // every remount leaves another one running and the speed reaction fires
      // multiple times per scroll event.
      obs.kill();
      tl.kill();
    };
  }, [items, reverse]);

  return (
    <div
      className={`overflow-hidden w-full h-20 md:h-[100px] flex items-center marquee-text-responsive font-light uppercase whitespace-nowrap ${className}`}
    >
      <div className="flex">
        {items.map((text, index) => (
          <span
            // Block body, not an expression: React's Ref callback type requires
            // `void | (() => void)`, and returning the assignment's value fails
            // to typecheck under strict mode.
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            key={index}
            className={itemClassName}
          >
            {renderItem ? renderItem(text, index) : text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
```

## 4. Wire it up

```tsx
<Marquee items={["design", "build", "ship", "repeat"]} />

<Marquee
  items={["contact me"]}
  reverse={true}
  className="text-black bg-transparent border-y-2"
/>
```

A logo strip reuses the same component with `renderItem` and a tighter
`itemClassName`. The sizes go on a **wrapper**, not on the icon — see the trap in
section 6:

```tsx
<Marquee
  items={techNames}
  itemClassName="flex items-center px-10"
  className="text-black bg-transparent border-y-2"
  renderItem={(name) => (
    <span className="flex size-7 items-center justify-center md:size-9">
      <Icon icon={iconsByName[name]} className="size-full" />
    </span>
  )}
/>
```

- `overflow-hidden` on the container is required — the items travel beyond its
  edges and would otherwise stretch the page.
- `whitespace-nowrap` on the container is required — the items must stay on one
  line for the loop maths to be correct.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `repeat: -1` | loop forever | `-1` is GSAP's "infinite". `repeat: 0` plays once and the strip stops dead |
| `pixelsPerSecond = speed * 100` | the speed unit | Distance-based, not duration-based, so items of different widths all travel at the same velocity. A fixed `duration` per item makes wide items race and narrow ones crawl |
| `paddingRight: 30` | the seam gap | The gap between the end of the sequence and its repeat. Without it the last item butts up against the first and the loop is visible |
| `snap` to 1 | hides sub-pixel drift | Flex layouts round adjacent equal-width items to 242px / 243px. Unsnapped, the loop creeps a pixel every cycle and eventually tears |
| `immediateRender: false` | required on the `fromTo` | Without it GSAP applies the tween's start values at creation, teleporting every item out of place before the timeline plays. This is the single most common reason a hand-rolled marquee looks broken on load |
| `.add(\`label${i}\`, …)` | named positions | Time markers per item, so `toIndex` can jump to an item. Without them there is no way to address a position in the loop |
| `tl.progress(1, true).progress(0, true)` | pre-render | Renders the timeline at both ends before it plays, so the first frames are already composited. Skipping it causes a jank spike on the first cycle |
| `factor = 2.5`, then `factor * 2.5` and `factor / 2.5` | spike then settle | The timeScale jumps to `factor * 2.5` (6.25×) for 0.2s, then eases to `factor / 2.5` (1×) over 1s. Two steps because a single change feels jerky |
| `reverse` flips the sign check | — | A reversed marquee already travels the other way, so "with the flow" is `deltaY > 0` rather than `< 0`. Getting this backwards makes the strip fight the scroll instead of following it |
| `obs.kill()` in cleanup | required | `Observer` is a plugin instance, not part of a `useGSAP` context. GSAP does not clean it up. Every remount leaks one |
| `tl.kill()` in cleanup | required | The timeline is a bare `gsap.timeline()`, not created inside `useGSAP`, so nothing kills it for you |
| `raw `useEffect`, not `useGSAP` | deliberate | This holds a timeline and a plugin instance rather than making declarative tweens. `useGSAP` is for the latter |
| `itemClassName` default `px-16 gap-x-32` | word strips | Sized for display type. A logo strip needs ~`px-10` and no separator gap |
| sized wrapper around async content | required | The loop measures every item once, on mount. Content that arrives later (icon fonts, Iconify, `<img>` without dimensions) changes the width after the measurement and the strip tears. Reserve the box up front |

## 6. Do not

- **Never omit `immediateRender: false`** on the inner `fromTo`. Every item teleports to the wrong position on mount and the marquee looks scrambled.
- **Never skip `obs.kill()`.** It is the reason remounting the marquee makes it react faster and faster to scrolling — each instance is still listening.
- **Do not use a per-item `duration` instead of `pixelsPerSecond`.** Items of different widths then move at different speeds and the strip tears.
- **Do not forget `paddingRight`.** A zero gap puts the last item directly against the first and the loop is visible.
- **Do not forget `overflow-hidden` on the container.** The items travel past its edges; without clipping, the page gains a horizontal scrollbar.
- **Do not forget `whitespace-nowrap`.** If the items wrap, `offsetLeft` and `offsetWidth` no longer describe a single row and the loop maths is wrong.
- **Do not try to `tsc` the raw GSAP example as-is.** The published version uses untyped params and `any` returns. The `num()` helper and explicit types here are what make it pass `strict: true`.
- **Do not call `tl.vars.onReverseComplete()` without the cast.** `tl.vars` is typed as a loose config object; the call fails typecheck until you cast it to `(() => void) | undefined`, and the `?.` guards a caller that never set it.
- **Do not use `let time` and then reassign it via `const`.** In `toIndex`, `time` is adjusted after being read from `times[]`, so it must be `let`. `const` fails to compile.
- **Do not pass unfiltered refs.** `itemsRef.current` can hold `null` holes while React mounts. The `.filter()` type guard keeps `null` out of the loop maths.
- **Do not run this on low-power mobile without checking the frame rate.** An always-animating strip plus a scroll Observer is a genuine battery cost. Consider pausing it when off screen.
- **Do not put the icon size on the icon itself when the content loads async.** `@iconify/react` renders an empty `<span>` — with **no** `className` — until the icon data arrives, so a bare `<Icon className="size-9">` measures 0 wide on mount, the loop is built on those wrong widths, and it tears the moment the icons paint. Put a fixed size on a wrapper element and let the icon fill it (`size-full`). The same applies to any `<img>` without `width`/`height`.
- **Do not inline `items`.** `items` is a dependency of the effect, so `items={["a", "b"]}` is a new array every render and rebuilds the loop on every unrelated re-render. Keep the list at module scope. `renderItem` as an inline arrow is fine — it is not a dependency.
- **Do not use the default `px-16 gap-x-32` item spacing for a logo strip.** 64px of padding and a 32rem separator gap are sized for display type. Pass `itemClassName`.
- **Do not let the items be shorter than the widest viewport.** The loop has one copy of the sequence; if it is narrower than the screen you get bare background at the right edge. Budget it: item count × (logo + padding) must beat 2560px.

## 7. Done when

- [ ] The strip loops seamlessly with no visible seam, gap, or tear
- [ ] It has run for at least two full cycles with no drift
- [ ] Scrolling accelerates it; scrolling the other way reverses it
- [ ] The speed settles back to a gentle drift after you stop scrolling
- [ ] Toggling/remounting the component does not make it progressively more sensitive to scroll (the `obs.kill()` check)
- [ ] No horizontal scrollbar appears
- [ ] Items do not wrap to a second line
- [ ] On a cold load (empty cache, network throttled) the strip does not tear once the async content lands — this is the check for the reserved-box trap above
- [ ] `npx tsc --noEmit` passes under `strict: true`
- [ ] Project build passes
