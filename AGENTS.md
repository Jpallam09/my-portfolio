# AGENTS.md

Single-page GSAP-driven portfolio site (React 19 + TS + Vite 6 + Tailwind v4). Not a git repo, no CI, **no test framework, no formatter, and currently no working typecheck or lint** (see Verification).

## Verification / broken scripts

- `typescript` and `typescript-eslint` are missing from `package.json` **and** from `pnpm-lock.yaml`, but `build` (`tsc -b && vite build`) and `eslint.config.js` both need them. So `pnpm build` and `pnpm lint` cannot run. `@types/node` is also absent even though `tsconfig.node.json` sets `types: ["node"]`. **Verify changes with `./node_modules/.bin/vite build` alone** (it succeeds cleanly; 123 modules, JS bundle ~440 kB / 148 kB gzip, `dist/` ~7 MB, ~4s).
- **pnpm environment gotcha:** a global `minimumReleaseAge: 7200` in `~/.config/pnpm/config.yaml` rejects the `@rollup/rollup-*` entries in `pnpm-lock.yaml`, and pnpm auto-runs `pnpm install` before *every* script, so any `pnpm <script>` dies with a confusing policy error. `pnpm --config.verifyDepsBeforeRun=false <cmd>` skips that auto-install. An **explicit** `pnpm --config.minimumReleaseAge=0 install` does work and is the way to add/remove dependencies — the override just doesn't propagate to pnpm's own nested install. Otherwise call `./node_modules/.bin/eslint .` / `./node_modules/.bin/vite build` directly.
- `README.md` is the untouched Vite scaffold and is **wrong** (it claims React Compiler is enabled; `vite.config.ts` has no compiler option). Ignore it.

## Architecture

- `src/main.tsx` → `App.tsx`, which mounts every section inside `<ReactLenis root>`.
- `src/sections/` — one file per page section, rendered in order: `Navbar`, `Hero`, `ServiceSummary`, `Services`, `About`, `Works`, `ContactSummary`, `Contact`.
- `Navbar`'s link list is the hardcoded array `["home","services","about","work","contact"]`; each target `id` lives on the corresponding section. Adding a section means updating both.
- `src/constants/index.ts` is the single source of content truth (`servicesData`, `projects`, `socials`). Image paths there are root-absolute (`/assets/...`).
- `src/components/`
  - `AnimatedHeaderSection` — shared section header (subtitle / title / body) with an optional `withScrollTrigger` flag.
  - `AnimatedTextLines` — splits its `text` prop on `\n` into staggered lines. **This is why section copy is written as multi-line template literals**; keep that convention or the animation collapses to one line.
  - `Marquee` — GSAP `horizontalLoop` + `Observer` scroll-velocity marquee. Its cleanup kills the timeline but never the `Observer`, so each remount leaks one.

## GSAP conventions

- Use `useGSAP` from `@gsap/react` for component animations (context-scoped, auto-reverts). Raw `useEffect` is used only in `Navbar` (window scroll listener) and `Marquee` (timeline + Observer).
- Plugins are imported from `gsap/all` and registered **per file at module scope** (`gsap.registerPlugin(ScrollTrigger)` in `AnimatedTextLines.tsx`, `ServiceSummary.tsx`; `Observer` in `Marquee.tsx`). Several files — `Works`, `Services`, `About`, `Contact`, `ContactSummary` — pass `scrollTrigger:` to tweens **without registering the plugin**; they only work because another module already did. Any new file using `scrollTrigger` must import and register it itself.
- Targets are global string selectors (`"#about"`, `".social-link"`, `"#title-service-1"`, `"#project"`), not refs. `id="project"` is duplicated on all 6 project rows in `Works.tsx` (invalid HTML) and ScrollTrigger's `trigger: "#project"` resolves to the first match only.
- Reveals are `gsap.from(...)`, so don't pre-style a subject in its final state in CSS or the intro has nothing to animate from.
- Lenis is mounted but **not bridged to ScrollTrigger** — there is no `lenis.on("scroll", ScrollTrigger.update)` / `gsap.ticker` wiring anywhere. Scrubbed and pinned animations can drift from Lenis's smoothed scroll. `ContactSummary.tsx` is the only pin (`pin: true`, `end: "+=800 center"`). Adding that bridge is the fix if scroll-linked animation ever feels out of sync.
- `Navbar` also uses `react-scroll`'s `<Link smooth duration={2000}>` — a second smooth-scroll system that bypasses Lenis entirely.

## Tailwind v4

- No `tailwind.config.js`; the theme is `@theme` in `src/index.css`: colors `primary`, `DarkLava`, `SageGray`, `gold`; fonts `amiamie`, `amiamie-round`. Extend there.
- Reuse the `@utility` helpers in `index.css` (`clip-path`, `banner-text-responsive`, `value-text-responsive`, `marquee-text-responsive`, `contact-text-responsive`) rather than hand-rolling responsive text sizes. The `--animate-marquee` theme token is **unused** — the marquee is GSAP-driven.

## Fonts

- 9 `@font-face` blocks in `src/index.css` cover the `Amiamie` and `Amiamie-Round` families. The files live in **`public/fonts/amiamie/{otf,ttf}/`** — note the `amiamie/` path segment; `/fonts/otf/…` 404s. Each block lists both an `.otf` and a `.ttf` source.
- `Amiamie-ItalicRound.{otf,ttf}` is on disk but declared by no `@font-face`, and `--font-amiamie-round` is defined in `@theme` yet used by no component (only `--font-amiamie` is, on `body`). Add a block and use the `font-amiamie-round` utility if you need them.
- `public/favicon.svg` (dark `#393632` tile, gold `#cfa355` "AS") is hand-written SVG using theme colors — keep it in sync by hand if the palette changes.

## Assets

- `public/` is ~7 MB and is copied verbatim into `dist/` (never bundled or optimized). Heaviest items: `public/assets/backgrounds/*.jpg` and `public/images/man.jpg` (~600 kB each). The three.js hero and its 18 MB `Planet.glb` were removed — `three`, `@react-three/fiber`, `@react-three/drei` and `maath` are no longer dependencies.

## Dependency placement

- `@iconify/react` sits in `devDependencies` but is imported at runtime from the deep path `"@iconify/react/dist/iconify.js"` — that deep import is deliberate (it skips the Iconify entry that fetches icons over the network), but the package must move to `dependencies` for a correct deploy. Icons are Iconify names (`lucide:`, `mdi:`, `material-symbols-light:`).

## Known pre-existing issues (leave alone unless asked)

- `About.tsx` uses `src="images/man.jpg"` (relative) instead of `/images/man.jpg`; works only at the site root.
- Placeholder contact data is still live in `Navbar` and `Contact` (`allamjohnpaul0901@gmail.com`, `+33 7 12 12 32 12`), and every `projects[].href` is `""`.
- `Works.tsx` hover effects are hard-guarded by `window.innerWidth < 768` checks, independent of Tailwind's `md:` breakpoint; its `handleMouseMove` is typed `(e: MouseEvent)` but is bound to a React `onMouseMove` and receives a SyntheticEvent.
