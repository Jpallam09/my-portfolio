# GSAP scaffold for React + Vite

**What you get** — one shared GSAP module, and a strict rule for how animation code is written in every component that follows.

**Use when** — "set up GSAP", "install GSAP", "start GSAP in React", "scroll animation does nothing", "registerPlugin", "two GSAP instances".

Extracted from the `src/lib/gsap.ts` pattern in a working React + Vite + Tailwind v4 portfolio.

---

## 1. Ask first

- Is this a brand new project, or adding animation to an existing one?
- Does the project use `useGSAP` from `@gsap/react` yet?
- Do they want scroll-linked animation (ScrollTrigger) or only enter/hover tweens?

## 2. Create

Install:

```bash
npm install gsap @gsap/react
```

Create **`src/lib/gsap.ts`** — new file. If it already exists, keep it and only add missing plugins.

## 3. Paste this

`src/lib/gsap.ts`:

```ts
// Every animated file in this project imports gsap from here instead of from
// "gsap" directly, for two reasons:
//
// 1. One import = one copy of GSAP. If two files pull GSAP in separately you
//    can end up with two instances that don't know about each other, and
//    animations from one silently fail to control elements animated by another.
//
// 2. Plugins are registered ONCE here, at the top level, before anything runs.
//    ScrollTrigger and Observer are plugins: extra tools that GSAP needs to
//    know about before you can use them. Forgetting to register one is the
//    reason a scroll animation sometimes just does nothing, with no error.
//    Registering in one place means no file depends on some other file having
//    been imported first.
import gsap from "gsap";
import { Observer, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, Observer);

export { gsap, ScrollTrigger, Observer };
```

The rule that goes with it — **every animated file** uses `useGSAP`, never a raw `useEffect`:

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const Example = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    // `ref.current` is valid in here. useGSAP runs after mount.
    gsap.from(ref.current, { y: 100, opacity: 0, duration: 1 });
  }, []);

  return <div ref={ref}>content</div>;
};

export default Example;
```

## 4. Wire it up

Nothing to import in `App.tsx` — this is a foundation. Every other animation
recipe in this set depends on it and starts from the same import line:

```tsx
import { gsap } from "../lib/gsap";
```

If a project is not using Vite, `src/lib/gsap.ts` still works as-is.

## 5. Values

| Setting | Value | Why |
|---|---|---|
| Plugin source | `"gsap/all"` | One import for every plugin, so adding a plugin later is a one-line change |
| Registration site | module scope, top level | Runs before any component mounts; no file-order dependency |
| Animation hook | `useGSAP` from `@gsap/react` | Creates a `gsap.context()`, so every tween and ScrollTrigger created inside is reverted automatically on unmount |
| Dependency array | `[]` on mount, or omitted to re-run on every render | Pick deliberately; omitting it re-runs the effect each render, which is correct for animations that read live layout (media queries, measured heights) |
| GSAP import in components | always `from "../lib/gsap"` | Never `from "gsap"` — two copies of GSAP do not coordinate |

## 6. Do not

- **Never import `gsap` directly from `"gsap"` in a component.** That is the duplicate-instance bug this file exists to prevent.
- **Never call `gsap.registerPlugin` inside a component or a `useGSAP` block.** Register at module scope, once.
- **Never use a raw `useEffect` for animations.** It gives you no automatic cleanup; every tween and ScrollTrigger survives unmount and keeps writing to detached DOM. `useGSAP` reverts the whole context for you.
- **Do not skip the dependency array on animations that read layout.** If the tween depends on a media query or a measured height, omit the array so it re-runs when that changes.
- **Do not assume a missing animation is a selector problem.** If nothing moves and there is no error in the console, the likeliest cause is an unregistered plugin or a stale ScrollTrigger — add `markers: true` to confirm the trigger exists.

## 7. Done when

- [ ] `src/lib/gsap.ts` exists and registers `ScrollTrigger` (and `Observer` if a marquee or pointer-tracked animation is planned)
- [ ] Every animated component imports `gsap` from `../lib/gsap`, none from `"gsap"`
- [ ] No `gsap.registerPlugin` call appears outside `src/lib/gsap.ts`
- [ ] No animation runs inside a bare `useEffect`
- [ ] A test element with `gsap.from(el, { y: 100 })` visibly animates on load
- [ ] `npx tsc --noEmit` passes — these recipes are written to compile under `strict: true`, which is what a fresh Vite `react-ts` template ships with
- [ ] Project build passes
