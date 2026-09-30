# doc/skill

18 self-contained recipes for the GSAP / Lenis / Tailwind animations in this
project, extracted as reusable pieces.

**These are prompts, not documentation.** Each file tells an AI how to build one
animation: what to ask you first, what files to create, complete copy-paste
code, the exact tween values and why they are those values, the traps that
break it, and a "done when" checklist it verifies against.

## How to use them

These are plain markdown files. Copy any `doc/skill/<name>.md` into another
project and point an AI at it — Claude Code, Cursor, opencode, or any tool that
reads files. There is no registration step, no config, and nothing to restart.

They are written to be pasted as-is, so each one is self-contained. Some
recipes depend on others:

- everything depends on **`gsap-scaffold`**
- `header-entrance-timeline` depends on `line-by-line-text-reveal`
- `scroll-velocity-marquee` also needs `Observer` registered in
  `src/lib/gsap.ts` (it shows the line)
- the type-scale recipes need `tailwind-v4-responsive-text`

## Index

### Foundation — start here

| Recipe | What it builds |
|---|---|
| [gsap-scaffold](gsap-scaffold.md) | `src/lib/gsap.ts` — one GSAP instance, plugins registered once. Every other recipe depends on this |
| [lenis-scroll-bridge](lenis-scroll-bridge.md) | Connect Lenis to ScrollTrigger so scrub and pin stop drifting |
| [tailwind-v4-responsive-text](tailwind-v4-responsive-text.md) | `@theme` tokens and `@utility` helpers for a responsive display-type scale |

### Text and headers

| Recipe | What it builds |
|---|---|
| [header-entrance-timeline](header-entrance-timeline.md) | Section header: wrapper slides up from 50vh, title fades in behind it |
| [line-by-line-text-reveal](line-by-line-text-reveal.md) | Paragraph reveals one line at a time, split on newlines |
| [page-wide-horizontal-drift](page-wide-horizontal-drift.md) | Full-width rows drifting sideways, scrubbed across the whole page |

### Scroll reveals

| Recipe | What it builds |
|---|---|
| [scroll-reveal-per-element](scroll-reveal-per-element.md) | Each list item gets its own trigger and reveals independently |
| [staggered-list-reveal](staggered-list-reveal.md) | A list cascades in as one group on scroll, with stagger |
| [scrubbed-scale-reveal](scrubbed-scale-reveal.md) | A whole section shrinks as it passes, reversing on scroll-up |
| [clip-path-image-reveal](clip-path-image-reveal.md) | Image un-collapses from a flat line, no reflow, no resampling |
| [sticky-stacked-cards](sticky-stacked-cards.md) | Cards that stick and pile into a fanned deck |
| [pinned-section](pinned-section.md) | A section that freezes while you scroll past it |

### Pointer and hover

| Recipe | What it builds |
|---|---|
| [mouse-follower-quickto](mouse-follower-quickto.md) | Element trails the cursor with weighted, asymmetric lag |
| [hover-clip-path-wipe](hover-clip-path-wipe.md) | Curtain overlay on hover that survives fast mouse movement |
| [burger-to-cross](burger-to-cross.md) | Three bars collapse into a cross |

### Chrome and looping

| Recipe | What it builds |
|---|---|
| [menu-open-close-timeline](menu-open-close-timeline.md) | Full-screen overlay: curtain down, items staggered, reverse cleanly on close |
| [hide-on-scroll-down](hide-on-scroll-down.md) | Floating chrome hides on scroll-down, returns on scroll-up |
| [scroll-velocity-marquee](scroll-velocity-marquee.md) | Infinite marquee that speeds up and reverses with scroll velocity |

## Which ones collide, and which to pick instead

These are the pairs that get confused most often:

- **`scroll-reveal-per-element` vs `staggered-list-reveal`** — same visual
  result, different trigger. The first gives every item its own trigger so they
  animate as they arrive. The second uses one trigger on the list with a
  stagger. If the items are on screen at the same time, you want the second.
- **`pinned-section` vs `sticky-stacked-cards`** — both hold content on screen.
  `pinned-section` freezes one whole section using GSAP. `sticky-stacked-cards`
  is pure CSS `position: sticky` on several cards. Never use both on one
  element.
- **`page-wide-horizontal-drift` vs `scrubbed-scale-reveal`** — both scrubbed
  and both scroll-linked. One moves blocks horizontally with no trigger at all;
  the other scales a section with an explicit range.
- **`clip-path-image-reveal` vs `hover-clip-path-wipe`** — the same polygon
  technique. The first runs once on scroll entry; the second runs on pointer
  enter and leave, and needs `killTweensOf`.

## Conventions every recipe enforces

1. **Ask before building.** Each recipe opens by asking for your content,
   colours and images, rather than inventing them.
2. **Complete code, never fragments.** Every snippet is a whole file, or a whole
   `useGSAP` block to paste into an existing one.
3. **`useGSAP` from `@gsap/react` by default.** The exceptions are called out
   explicitly and explained — a raw `useEffect` for a window scroll listener, or
   for a timeline plus plugin instance that needs its own `kill()`.
4. **Strict TypeScript is a requirement.** Ref callbacks use block bodies,
   optional chaining guards the animation refs, and every value coming back out
   of GSAP goes through a numeric helper.
5. **Verify, then report.** Every recipe ends with a "done when" checklist
   including `npx tsc --noEmit` and a project build.
6. **Traps are lifted from real bugs,** not invented. Each one is a specific
   failure mode with the reason it happens.

## Reference

[`../GSAP-PATTERNS.md`](../GSAP-PATTERNS.md) is the longer narrative version of
the same material — the patterns, the reasoning, and the site-specific context
behind these extractions.
