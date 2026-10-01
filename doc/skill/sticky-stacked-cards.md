# Sticky stacked cards

**What you get** — a column of cards that pile up on top of each other as you scroll, each one stopping a little lower than the last.

**Use when** — "stacked cards", "cards pile up on scroll", "sticky cards", "cards stack", "overlapping cards on scroll", "stacking list".

Extracted from the `src/sections/Skills.tsx` sticky skill-card pattern.

---

## 1. Ask first

- How many cards? The stacking offset compounds — see the maths in "Values" before choosing a number.
- Stacking step — a fixed value, or something proportional to the card height?
- What happens on mobile? Sticky stacking is a desktop effect; on a phone the cards should just flow.

## 2. Create

No new GSAP component needed — this is CSS. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe) only if you also add the per-card reveal from [scroll-reveal-per-element](scroll-reveal-per-element.md).

## 3. Paste this

```tsx
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const skills = [
  { title: "Skill One", description: "…", items: ["…", "…"] },
  { title: "Skill Two", description: "…", items: ["…", "…"] },
  { title: "Skill Three", description: "…", items: ["…", "…"] },
];

const Skills = () => {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const isDesktop = useMediaQuery({ minWidth: "48rem" });

  useGSAP(() => {
    // Optional on top of the stacking: each card slides up on its own as it
    // reaches the screen. This is the per-item reveal, NOT a stagger - each card
    // has its own trigger, so they animate separately.
    cardRefs.current.forEach((el) => {
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
    <section className="min-h-screen">
      {skills.map((skill, index) => (
        <div
          // Block body, not an expression: React's Ref callback type requires
          // `void | (() => void)`, and returning the assignment's value fails
          // to typecheck under strict mode.
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          key={index}
          // sticky is the whole effect. The card stops at its `top` offset and
          // waits there while the cards below scroll up underneath it.
          className="sticky px-10 pt-6 pb-12 bg-black border-t-2 border-white/30"
          style={
            isDesktop
              ? {
                  // 10vh clears the fixed navbar. Then each card is 5em lower
                  // than the one before, so they stack visibly.
                  top: `calc(10vh + ${index * 5}em)`,
                  // The gap BELOW each card. As the index increases there are
                  // fewer cards after it, so less gap is needed. Without this,
                  // the last card would be pushed off the bottom by gaps that
                  // were sized for cards that follow it.
                  marginBottom: `${(skills.length - index - 1) * 5}rem`,
                }
              : { top: 0 }
          }
        >
          <h2>{skill.title}</h2>
          <p>{skill.description}</p>
        </div>
      ))}
    </section>
  );
};

export default Skills;
```

## 4. Wire it up

`useMediaQuery` comes from `react-responsive`:

```bash
npm install react-responsive
```

If you would rather not add a dependency, use a `window.matchMedia` listener
and store the result in state. The only requirement is that `top` and
`marginBottom` are set to `0` on mobile, or the cards stack on a phone too,
where they will fill the screen and feel broken.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `position: sticky` | the whole effect | A sticky element scrolls with the page until it reaches its `top` offset, then holds. Cards after it in the document scroll up and pass underneath. No JavaScript, no pinning, no ScrollTrigger |
| `top: calc(10vh + index * 5em)` | 10vh base + 5em per card | The 10vh base clears the fixed navbar. The 5em step is the visible offset between stacked cards. `em` so the step scales with the card's own font size |
| `marginBottom: (n - index - 1) * 5rem` | shrinks with index | **The part that is easy to miss.** Every card needs a gap below it, but the last card needs none. Sizing the gap by the number of cards *after* it means the total scroll length stays the same whether or not the stack is applied, and the last card does not get pushed off screen by leftover space |
| `5em` vs `5rem` | different units on purpose | `em` is relative to the card's font size (a small visual step). `rem` is root-relative (predictable page length). Mixing them keeps both readable |
| `isDesktop ? ... : { top: 0 }` | mobile override | On mobile, `top: 0` makes every card stick to the top of the viewport, so the second card would cover the first permanently. Flow layout is correct there |
| `minWidth: "48rem"` | 768px | Matches Tailwind's `md:` breakpoint. Keep the two in step or the cards stack on a layout that was not designed for it |
| Per-card `gsap.from` | separate from the stacking | Stacking is scroll-position behaviour; the reveal is a one-shot entrance. They are independent — dropping the tween leaves the stack intact |
| No `ScrollTrigger` for the stack | — | Sticky is native CSS. Adding a pin here would fight the browser's own sticky implementation |

## 6. Do not

- **Do not forget the shrinking `marginBottom`.** With a constant gap on every card, the last card sits below a gap sized for cards that do not exist, and the stack ends with a large dead scroll zone. This is the single most common bug in this pattern.
- **Do not set a large `top` on mobile.** Every card sticking at `top: 0` means only the first is ever visible. Gate the whole `style` prop on the media query.
- **Do not apply `position: fixed`.** Fixed takes the card out of flow, so the cards after it collapse upward and the stack is gone. Sticky keeps it in flow; that is the entire reason it works.
- **Do not set `overflow: hidden` on any ancestor.** An ancestor with `overflow: hidden` (or `auto`/`scroll`) becomes the sticky container, and the card sticks to that container's edge instead of the viewport. This is the classic "sticky silently does nothing" cause.
- **Do not use a `z-index` on the later cards.** You want later cards to cover earlier ones as they scroll up, so the natural document order is what you want. Raising the z-index of later cards is right; raising it on earlier ones is wrong.
- **Do not put the reveal tween on the section.** Triggering the section reveals every card at once. Each card needs its own trigger.
- **Do not keep the `window.innerWidth` breakpoint and the `md:` classes in sync by hand.** They are two independent breakpoints; if you change one, change both.
- **Do not stack more than about five cards.** The 5em offset compounds — card 5 sits 20em lower than card 1, and the page length grows with every card added.

## 7. Done when

- [ ] Cards stack visibly, each held slightly lower than the one before
- [ ] The last card is reachable without a long dead scroll zone after it
- [ ] Cards flow normally on mobile — no `top` offset applied
- [ ] No ancestor of the cards has `overflow: hidden` / `auto` / `scroll`
- [ ] Later cards cover earlier ones as they scroll up
- [ ] Cards have an opaque background (a transparent one shows the cards behind and the stack is invisible)
- [ ] The reveal still fires per card if the tween is kept
- [ ] `npx tsc --noEmit` passes
- [ ] Project build passes
