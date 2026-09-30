# Staggered list reveal on scroll

**What you get** — a list that cascades in as a single gesture when it reaches the viewport, each row offset from the one before it.

**Use when** — "staggered list", "cascade items in", "stagger the rows", "list appears one after another", "staggered scroll reveal", "rows fade in one by one".

Extracted from the `src/sections/Contact.tsx` and `src/sections/Works.tsx` staggered reveal patterns.

---

## 1. Ask first

- What are the items? A shared class is the targeting mechanism, so they need to be siblings in the same list.
- How many items? Past about eight the last one starts over 2.5s late — worth capping or reducing the stagger.
- Should it fire once when the list appears, or every time it re-enters? (Once — see "Do not".)

## 2. Create

Create **`src/components/StaggeredList.tsx`** — new file. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

type StaggeredListProps = {
  items: { id: string | number; name: string }[];
  className?: string;
  itemClassName?: string;
};

const StaggeredList = ({
  items,
  className = "",
  itemClassName = "",
}: StaggeredListProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      // The rows fade in one after another as the list comes into view.
      // trigger: the list container, not a row - one trigger gates the whole group.
      // delay: 0.5 = an extra half second pause before the first row starts.
      // stagger: 0.3 = 0.3s between each row starting.
      gsap.from(".list-item", {
        y: 100,
        opacity: 0,
        delay: 0.5,
        duration: 1,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: listRef.current, // the whole list, not one row
        },
      });
    },
    // scope limits the ".list-item" selector to this component's DOM subtree, so
    // a second list elsewhere on the page is not swept up by the same tween.
    // Without it, two components using this class both animate from either tween.
    { scope: listRef }
  );

  return (
    <section className={className}>
      <div ref={listRef}>
        {items.map((item) => (
          <div key={item.id} className={`list-item ${itemClassName}`}>
            {item.name}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StaggeredList;
```

If you cannot use a ref, replace `trigger: listRef.current` with
`trigger: ".list-item"` and drop the `{ scope: listRef }` options — the
selector resolves the first match, which works when there is exactly one such
list on the page.

## 4. Wire it up

The shared class goes on every element that should animate, and the `trigger`
element must wrap all of them:

```tsx
<StaggeredList
  items={contactMethods}
  className="px-10 uppercase lg:text-[32px] text-[26px] leading-none"
  itemClassName="flex flex-col gap-10"
/>;
```

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `trigger` | the list container | One trigger for the whole group. This is what makes it a cascade rather than independent reveals |
| `delay: 0.5` | half a second | A beat of silence after the list appears, so the eye lands on it before anything moves. Without it the movement competes with the appearance |
| `stagger: 0.3` | 0.3s between items | With `duration: 1`, each row is still 70% through when the next starts. That overlap is what reads as a cascade rather than a queue |
| `ease: "back.out"` | slight overshoot | Each row lands with a small bounce. Pairs with `y: 100` for a lively list |
| `y: 100` | px | A visible but modest distance. Bigger offsets on a long list make the last rows look like they crawl in |
| `opacity: 0` alongside `y` | — | Fading and translating together hides the fact that the element is a hard rectangle snapping into place |
| `duration: 1` | 1s | The per-item duration, not the total. Total is roughly `delay + (n × stagger) + duration` |
| `{ scope: listRef }` | scopes the global selector | `.list-item` is a global class. Without `scope`, two lists on one page both animate from either tween |

## 6. Do not

- **Do not give each item its own trigger.** That is [scroll-reveal-per-element](scroll-reveal-per-element.md). This pattern's identity is one trigger and a stagger.
- **Do not add `toggleActions`.** The default fires once. Adding `toggleActions: "play reverse play reverse"` makes the list re-animate every time it re-enters the viewport, which is exhausting on a page the user scrolls repeatedly.
- **Do not pre-style the items in their final state in CSS.** `gsap.from` needs the CSS to hold the finished look. If the rows are already styled at their resting position, `from` has nothing to animate from.
- **Do not use a global class name that appears more than once without `scope`.** Pass `{ scope: rootRef }` so each section only animates its own rows.
- **Do not combine a large `stagger` with a large item count.** The last item's start time is `delay + (n - 1) × stagger`. Eight items at 0.3s is 2.6s of waiting.
- **Do not forget that `from` leaves the elements visible at rest.** If they are still invisible after the animation, something else is setting opacity.

## 7. Done when

- [ ] All items animate as one group when the list scrolls into view
- [ ] Each item visibly overlaps the one before it rather than following in sequence
- [ ] The animation runs once, not on every re-entry
- [ ] The list is fully visible at rest after the animation completes
- [ ] If two sections on the page use the same row class, `scope` is passed and only the right one animates
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
