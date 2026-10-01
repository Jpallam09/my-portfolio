# Per-element scroll reveal

**What you get** — a list where each item reveals as it reaches the viewport, rather than the whole list appearing at once.

**Use when** — "each item animates separately", "per-item reveal", "list items fade in on scroll", "cards reveal individually", "staggered card entrance".

Extracted from the `src/sections/Skills.tsx` per-card reveal pattern.

---

## 1. Ask first

- What are the items? Ask for a list — each needs a title and some body content.
- How many? Past about six the page gets long enough that per-item triggers stop firing before the user reaches them.
- Light or dark section?

## 2. Create

Create **`src/components/RevealList.tsx`** — new file. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

type RevealListProps = {
  items: { title: string; body: string }[];
  className?: string;
  itemClassName?: string;
};

const RevealList = ({
  items,
  className = "",
  itemClassName = "",
}: RevealListProps) => {
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useGSAP(() => {
    // Every item slides up on its own as it reaches the screen. Because each one
    // has its own trigger, they animate separately instead of the whole list
    // appearing at once.
    // start: "top 80%" = begin when the item's top edge is 80% down the screen,
    // so it's already slightly visible before it starts moving.
    itemRefs.current.forEach((el) => {
      if (!el) return;

      gsap.from(el, {
        y: 200,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        duration: 1,
        ease: "circ.out",
      });
    });
  }, []);

  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className={itemClassName}
        >
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
};

export default RevealList;
```

## 4. Wire it up

```tsx
import RevealList from "../components/RevealList";

<RevealList
  items={skillsData}
  className="gap-16"
  itemClassName="px-10 py-12 text-white border-t-2 border-white/30"
/>;
```

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `trigger: el` | the item itself, not the list | This is the whole point. Triggering the list means one animation for everything; triggering each item means N |
| `start: "top 80%"` | 80% down the viewport | Fires when the item is already partly on screen, so the reveal is seen rather than happening off-screen. `"top top"` fires when the item is only just entering and feels late |
| `y: 200` | px | The item is fully below its resting position, so the first visible frame is already a clear upward move |
| `ease: "circ.out"` | fast start, long settle | A heavy, deliberate arrival. Pairs well with big display type |
| `duration: 1` | 1s | Long enough to read as motion rather than a jump |
| No `stagger` | — | Staggering is meaningless here: the items are not on screen at the same time, so there is nothing to cascade between |
| `forEach` over a ref array | one tween per element | The ref array is the only way to hand N individual DOM nodes to GSAP from a `.map()` |
| Ref callback as a block body | `ref={(el) => { ... }}` | A concise-body arrow returns the assignment value, which React's `Ref` type rejects under `strict: true` |

## 6. Do not

- **Do not trigger the list container instead of each item.** That collapses the effect to a single reveal of everything, which is [staggered-list-reveal](staggered-list-reveal.md) instead.
- **Do not add a `stagger` to this pattern.** The items animate at different times by definition, because each has its own trigger. A stagger only matters when they animate together.
- **Do not set `start: "top top"`.** The animation begins when the item is at the very top edge of the screen and the user has barely seen it. `"top 80%"` gives it presence before it moves.
- **Do not pre-style the items in their final state in CSS.** `gsap.from` animates from the given values to wherever the CSS says they should be. If the CSS already matches the end state, nothing moves.
- **Do not forget the `if (!el) return` guard.** React refs are `null` until the element mounts, and the array can hold holes.
- **Do not combine this with `scrub`.** A scrubbed tween is tied to scroll position; a per-item reveal is a one-shot that fires on entry. They are different mechanics.
- **Do not write the ref callback as a concise-body arrow.** It fails `tsc` under strict mode.

## 7. Done when

- [ ] Each item animates on its own as it reaches the viewport, not all at once
- [ ] Scrolling back up does not replay the animation (one-shot, not scrubbed)
- [ ] Items below the fold start hidden, not already visible
- [ ] All items end up fully visible at rest
- [ ] Adding a fifth item to the array works with no code change
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
