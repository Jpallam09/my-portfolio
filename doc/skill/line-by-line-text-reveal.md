# Line-by-line text reveal

**What you get** — an `<AnimatedTextLines />` component. Newlines in the copy you pass become separate animated lines that cascade in.

**Use when** — "text line by line", "staggered paragraph", "copy cascades in", "animated body text", "reveal each line of text", "text reveal animation".

Extracted from the `src/components/AnimatedTextLines.tsx` pattern.

---

## 1. Ask first

- What is the paragraph? **Ask them to write it with a line break wherever they want the animation to break**, or ask whether you should choose the breaks.
- Light or dark text?
- How many lines? Over about six the stagger starts to drag — worth warning them.

## 2. Create

Create **`src/components/AnimatedTextLines.tsx`** — new file. Requires `src/lib/gsap.ts` (see the [gsap-scaffold](gsap-scaffold.md) recipe).

## 3. Paste this

```tsx
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import { useRef } from "react";

type AnimatedTextLinesProps = {
  text: string;
  className?: string;
};

export const AnimatedTextLines = ({
  text,
  className = "",
}: AnimatedTextLinesProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);

  // Every line break in the text prop becomes its own <span> below, and each one
  // is animated separately. That's why the copy passed in from the sections is
  // written as a multi-line template literal:
  //   const text = `First line
  //     second line`;
  // If you write it as one long line, the whole paragraph animates as a single
  // block and you lose the staggered line-by-line effect.
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  useGSAP(() => {
    if (lineRefs.current.length > 0) {
      // from = "animate FROM these values TO where it already is in the CSS".
      // Because of that, do not pre-set the final look in your CSS, otherwise
      // there is nothing left to animate from.
      // stagger = delay between each line starting, so they cascade in order.
      gsap.from(lineRefs.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: containerRef.current,
        },
      });
    }
  });

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <span
          key={index}
          // Block body, not an expression: React's Ref callback type requires
          // `void | (() => void)`, and `(el) => (refs.current[i] = el)` returns
          // the element, which fails to typecheck under strict mode.
          ref={(el) => {
            lineRefs.current[index] = el;
          }}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line}
        </span>
      ))}
    </div>
  );
};
```

## 4. Wire it up

```tsx
// Callers MUST use a multi-line template literal, not a single string.
const text = `Passionate about clean architecture
    I build scalable, high-performance solutions
    from prototype to production`;

<AnimatedTextLines text={text} className="w-full" />;
```

For a bulleted or emoji list, the same component works — put each bullet on
its own line:

```tsx
const aboutText = `Obsessed with building fast, intuitive apps.
  When I'm not shipping:
- Open-sourcing my latest experiment
- Teaching devs on Twitch
- Rock climbing
- Strumming chords while CI passes`;

<AnimatedTextLines text={aboutText} />;
```

## 5. Values

| Setting | Value | Why |
|---|---|---|
| `className="block"` on each span | `block`, not `inline` | A `<span>` defaults to inline, where `y: 100` on children has no effect because there are no boxes to move |
| `y: 100` | px | Fixed, not `vh`. The text block is a known height, so a fixed offset is predictable |
| `ease: "back.out"` | slight overshoot | Each line lands with a small bounce. This is what makes a cascade read as playful rather than mechanical |
| `stagger: 0.3` | 0.3s between lines | With a 1s duration, 0.3 means roughly a third of each line is still moving when the next starts, so they overlap instead of queueing |
| `.filter((line) => line.trim() !== "")` | drops blank lines | Indentation in a template literal leaves whitespace-only lines. Without this filter you get invisible empty spans that still consume a stagger slot |
| `trigger: containerRef.current` | the whole block | One trigger for all lines, so they cascade as a unit rather than each firing on its own |
| No `useGSAP` dependency array | re-runs every render | The line count comes from a prop. If the copy changes, the tween must rebuild |
| Ref callback as a block body | `ref={(el) => { ... }}` | A concise-body arrow returns the assignment's value, which React's `Ref` type rejects under `strict: true` |

## 6. Do not

- **Do not pass a single-line string.** The entire effect disappears and the paragraph fades in as one block. The newlines *are* the line splitting; there is no measurement or wrapping logic here.
- **Do not pre-style the lines in their final state in CSS** (`opacity-0`, `translate-y-10` on a wrapper). `gsap.from` needs the CSS to already hold the finished look.
- **Do not use `display: inline` on the spans.** Transform animations do nothing to inline boxes.
- **Do not write the ref callback as a concise-body arrow.** `(el) => (refs.current[i] = el)` returns the element and fails `tsc` under strict mode. Use a block body.
- **Do not copy indentation into the rendered text.** The `.filter()` drops whitespace-only lines, but leading spaces on real lines still render. Keep template literals flush-left if that bothers you.
- **Do not exceed about six lines.** At 0.3s stagger, seven lines take 2.1s before the last one even starts. Reduce the stagger instead of adding lines.
- **Do not add a `delay` as well as a `stagger`** unless both are deliberate. They compound.

## 7. Done when

- [ ] Each newline in the source copy produces a separately animated line
- [ ] Lines cascade in order, not simultaneously
- [ ] No whitespace-only lines create gaps in the cascade
- [ ] The text is fully visible at rest (not left at `opacity: 0`)
- [ ] The block stays hidden until it scrolls into view
- [ ] `npx tsc --noEmit` passes with no ref-callback type error
- [ ] Project build passes
