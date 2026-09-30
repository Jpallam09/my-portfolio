# AGENTS.md

Single-page GSAP-driven portfolio (React 19 + TS + Vite 6 + Tailwind v4). Git repo, working branch `dev`, **no remote, no CI, no test framework, no formatter, and no working typecheck or lint** (see Verification).

## Verification — what actually runs

- `typescript` and `typescript-eslint` are in neither `package.json` nor `pnpm-lock.yaml`, yet `build` is `tsc -b && vite build` and `eslint.config.js` imports `typescript-eslint`. So **`pnpm build` fails (`tsc: not found`) and `./node_modules/.bin/eslint .` fails (`ERR_MODULE_NOT_FOUND`)**. `@types/node` is also absent even though `tsconfig.node.json` sets `types: ["node"]`.
- **The only working verification is `./node_modules/.bin/vite build`** (no typecheck, no lint — treat it as a bundling smoke test only). Current clean run: 124 modules, JS 438 kB / 147 kB gzip, CSS 23 kB, ~4s.
- **pnpm auto-install blocks every script.** pnpm runs a deps check before `pnpm <script>`; its lockfile supply-chain policy rejects `@types/node@24.19.0` (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`) even though `~/.config/pnpm/config.yaml` sets `minimumReleaseAge: 0`. Workarounds: `pnpm --config.verifyDepsBeforeRun=false <cmd>` skips the auto-install (then fails on `tsc`), or call `./node_modules/.bin/vite build` directly. An explicit `pnpm --config.minimumReleaseAge=0 install` does pass the policy check — that's how to add/remove deps.
- `README.md` is the untouched Vite scaffold and is **wrong** (claims React Compiler is enabled; `vite.config.ts` has no `compiler` option). Ignore it.
- No `strict` in either tsconfig, but `verbatimModuleSyntax: true` — type-only imports must use `import { type X }`, which is why `Works.tsx` imports `type MouseEvent as ReactMouseEvent`.

## Read this before writing animation code

- **`doc/GSAP-PATTERNS.md`** — narrative guide to every animation on the site: what each one does, which file it's in, and the reasoning (from/to/fromTo, stagger, ScrollTrigger start/end/scrub/pin/markers, timelines, paused menus, `gsap.quickTo`, clip-path wipe, line-by-line text, easings). Also the full write-up of the Lenis/ScrollTrigger bridge (section "Open question: Lenis and ScrollTrigger are not connected").
- **`doc/skill/*.md`** — 18 self-contained, copy-pasteable recipes extracted from this codebase, indexed in `doc/skill/README.md`. Plain markdown prompts, not config: point an AI at `doc/skill/<name>.md` (start with `gsap-scaffold`; everything depends on it). Read these instead of reinventing a pattern.

## Architecture

- `src/main.tsx` → `App.tsx`, which mounts every section inside `<ReactLenis root>`.
- `src/sections/` — one file per section, rendered in order: `Navbar`, `Hero`, `ServiceSummary`, `Services`, `About`, `Works`, `ContactSummary`, `Contact`.
- `Navbar`'s link list is the hardcoded array `["home","services","about","work","contact"]`; each target `id` lives on the corresponding section. Adding a section means updating both.
- `src/constants/index.ts` is the content source of truth: `servicesData`, `projects`, `socials`, plus `marqueeValues` / `marqueeRepeat()`. Image paths are root-absolute (`/assets/...`).
  - **Marquee word lists must live in `constants`, not inline in a section.** `Marquee`'s effect deps include `items`, so a fresh array literal each render restarts the loop on every unrelated re-render. `marqueeRepeat("contact me")` exists for the same reason.
- `src/components/`
  - `AnimatedHeaderSection` — shared section header (subtitle / title / body) with an optional `withScrollTrigger` flag; false only for `Hero` so it plays on load.
  - `AnimatedTextLines` — splits its `text` prop on `\n` into staggered lines. **This is why section copy is written as multi-line template literals**; keep that convention or the animation collapses to one block.
  - `Marquee` — GSAP `horizontalLoop` + `Observer` scroll-velocity marquee. Takes `items`, `icon`, `iconClassName`, `reverse`, `className`. Its cleanup kills both the `Observer` and the timeline — keep it that way.

## GSAP conventions

- **Always import GSAP from `src/lib/gsap.ts`**, never from `"gsap"` directly. That module is the single GSAP instance and the only place `gsap.registerPlugin(ScrollTrigger, Observer)` happens, so no file depends on another having been imported first.
- Use `useGSAP` from `@gsap/react` for component animations (context-scoped, auto-reverts). Raw `useEffect` only in `Navbar` (window scroll listener) and `Marquee` (timeline + Observer that needs its own `kill()`).
- Targets are mostly global string selectors (`"#about"`, `".social-link"`, `".project-row"`, `"#title-service-1"`), not refs. Selector-based `gsap.from(".project-row")` inside `useGSAP` is document-wide, so duplicate the class across elements only when one trigger should animate them as a group.
- Reveals are `gsap.from(...)`, so don't pre-style a subject in its final state in CSS or the intro has nothing to animate from. Use `fromTo` (plus `killTweensOf`) for anything that can retrigger mid-animation — see `Works.tsx` hover.
- **`ServiceSummary` rows are deliberately trigger-less** (`scrollTrigger: { scrub: true }` and nothing else) so the big `xPercent` drift is spread over the whole page. Adding `trigger`/`start`/`end` shortens the range and pushes the words off screen.
- **`Services` cards are CSS `position: sticky`** with computed `top: calc(10vh + index*5em)` offsets, not GSAP. Don't also pin or scrub those elements.
- **Lenis is mounted but not bridged to ScrollTrigger** — no `lenis.on("scroll", ScrollTrigger.update)` / `gsap.ticker` wiring anywhere. It is probably inert (with `root` it scrolls its own wrapper, which has nothing to scroll), so the pin in `ContactSummary.tsx` (`pin: true`, `end: "+=800 center"`, the only pin on the site) currently works off native scroll. Read the GSAP-PATTERNS section before "fixing" this — the naive bridge can leave the page unscrollable.
- `Navbar` also uses `react-scroll`'s `<Link smooth duration={2000}>` — a second smooth-scroll system that bypasses Lenis entirely.

## Tailwind v4 & fonts

- No `tailwind.config.js`; the theme is `@theme` in `src/index.css`: colors `primary`, `DarkLava`, `SageGray`, `gold`; fonts `amiamie`, `amiamie-round`. Extend there.
- Reuse the `@utility` helpers in `index.css` (`clip-path`, `banner-text-responsive`, `value-text-responsive`, `marquee-text-responsive`, `contact-text-responsive`) instead of hand-rolling responsive type. `--animate-marquee` and `--font-amiamie-round` are **defined but unused** (the marquee is GSAP-driven; only `--font-amiamie` is applied, on `body`).
- 9 `@font-face` blocks cover `Amiamie` (6) and `Amiamie-Round` (3). Files live in **`public/fonts/amiamie/{otf,ttf}/`** — note the `amiamie/` segment; `/fonts/otf/…` 404s. Each block lists an `.otf` and a `.ttf` source. `Amiamie-ItalicRound.{otf,ttf}` is on disk but declared by no `@font-face`.
- `public/favicon.svg` is hand-written SVG in theme colors (dark `#393632` tile, gold `#cfa355` "JP") — keep in sync by hand if the palette changes.

## Assets & dependencies

- `public/` is ~8 MB and is copied verbatim into `dist/` — never bundled, hashed or optimized. Heaviest: `public/images/jp.png` (~2 MB), then `public/assets/backgrounds/*.jpg` (~600 kB each). The three.js hero and its `Planet.glb` were removed; `three`, `@react-three/fiber`, `@react-three/drei`, `maath` are no longer dependencies.
- `@iconify/react` sits in `devDependencies` but is imported at runtime from the deep path `"@iconify/react/dist/iconify.js"`. That deep import is deliberate (it skips the Iconify entry that fetches icons over the network), but the package must move to `dependencies` for a correct deploy. Icons are Iconify names (`lucide:`, `mdi:`, `material-symbols-light:`).

## Known pre-existing issues (leave alone unless asked)

- Contact details are hardcoded literals duplicated across `Navbar.tsx` and `Contact.tsx` (email + phone), **not** in `src/constants` — changing one means changing both. Every `projects[].href` is `""`.
- `Works.tsx` hover/preview effects are hard-guarded by `window.innerWidth < 768` checks, independent of Tailwind's `md:` breakpoint, and are invisible on touch devices by design.
- `ServiceSummary.tsx` spells "Architucture" and `Contact.tsx` spells "discus" — copy bugs, not code bugs.