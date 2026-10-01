# AGENTS.md

Single-page GSAP portfolio (React 19 + TS + Vite 6 + Tailwind v4). Branch `dev`; no remote, no CI, no tests, no formatter.

## Verify

`pnpm build` and `pnpm lint` both work and are the checks to run:

- `pnpm build` → `tsc -b && vite build` (~5s, clean). `pnpm typecheck` is the typecheck alone (~3s).
- `pnpm lint` → `eslint .`, clean at 0 errors (`typescript-eslint.configs.recommended` + `reactHooks.configs['recommended-latest']` + `reactRefresh.configs.vite`).
- `pnpm <script>` can trigger a blocking dep re-install before it runs; call the binary directly (`./node_modules/.bin/tsc -b`, `./node_modules/.bin/eslint .`) if it hangs.
- `strict` is **on** in both `tsconfig.app.json` and `tsconfig.node.json`, alongside `verbatimModuleSyntax` (use `import { type X }`), `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`. `noUncheckedIndexedAccess` is deliberately *off* — the GSAP code is full of `items[0]`/`refs.current[index]`.
- `typescript` is pinned to `~5.9.3`, not the `latest` 7.x, because `typescript-eslint` declares a peer range of `>=4.8.4 <6.1.0`. Don't bump it without rechecking that range.
- `react-scroll` ships no types of its own; `@types/react-scroll` is the devDependency that types it.

## Docs for animation work

- **`doc/GSAP-PATTERNS.md`** — every animation on the site with its reasoning, plus the Lenis/ScrollTrigger write-up.
- **`doc/skill/*.md`** — copy-pasteable recipes indexed in `doc/skill/README.md`. Start with `gsap-scaffold`.

## Rules that break the page if ignored

- **Import GSAP and its plugins from `src/lib/gsap.ts`** — the only `registerPlugin(ScrollTrigger, Observer)` call, so nothing depends on import order. Nothing imports `gsap/all` or a plugin's own path any more.
- **Use `useGSAP` (`@gsap/react`) for component animations.** Raw `useEffect` only in `Navbar` (scroll listener), `Marquee` (needs its own `kill()`), `Services` (height sync).
- **Lenis is mounted but not bridged** — no `lenis.on("scroll", ScrollTrigger.update)` / `gsap.ticker` anywhere. The `pin: true` in `ContactSummary.tsx` (the site's only pin) works off native scroll. Read the GSAP-PATTERNS section before "fixing" this; the naive bridge can leave the page unscrollable.
- **`ServiceSummary` rows are deliberately trigger-less** (`scrollTrigger: { scrub: true }`, nothing else) so the page-wide `xPercent` drift stays in range. Adding `trigger`/`start`/`end` pushes the words off screen.
- **`Services` cards are CSS `position: sticky`** with computed `top`/`marginBottom`, not GSAP. Don't also pin or scrub them.
- **`Marquee`'s effect deps are `[items, reverse]`**, so a fresh array identity per render tears down and restarts the loop. Keep word lists in `src/constants` (`marqueeValues`, `marqueeRepeat`) — never inline a literal in JSX.
- **Reveals are `gsap.from(...)`**: don't pre-style a subject in its final state in CSS. Use `fromTo` + `killTweensOf` for anything that can retrigger (`Projects.tsx` hover).
- **`AnimatedTextLines` splits `text` on `\n`** — section copy is multi-line template literals for that reason; single-line strings collapse the animation to one block.

## Conventions

- Content lives in `src/constants/index.ts` (`servicesData`, `projects`, `socials`), typed by the exported `Service`/`ServiceItem`/`Project`/`Framework`/`Social` types in the same file; asset paths are root-absolute (`/assets/...`). The arrays are annotated, so the sections import the data directly and a field rename fails `tsc -b` rather than at runtime. Add a new data shape as a type in that file, not as a local interface in the section.
- **React 19 ref callbacks must return `void`** (`strict` enforces it). Write `ref={(el) => { x.current[i] = el; }}`, never `ref={(el) => (x.current[i] = el)}` — the concise body returns the assigned value and is a type error.
- No `tailwind.config.js` — the theme, the `@utility` responsive-type helpers (`banner-`, `value-`, `marquee-`, `contact-text-responsive`) and the collapsed `clip-path` all live in `src/index.css`. Extend there instead of hand-rolling type scales.
- Font files are under `public/fonts/amiamie/{otf,ttf}/` — the `amiamie/` segment is required; `/fonts/otf/…` 404s.
- `Navbar`'s link array is a hardcoded literal and each target `id` lives on the matching section in `src/sections/`; adding a section means updating both.
- `@iconify/react` is in `devDependencies` but imported at runtime from `"@iconify/react/dist/iconify.js"` (deliberate — skips the network-fetching entry). Move it to `dependencies` for a correct deploy.

## Known pre-existing issues (leave alone unless asked)

- `Projects.tsx` renders no `<a>`, so `projects[].href` is dead data; its hover/preview effects are hard-guarded by `window.innerWidth < 768` and are invisible on touch.
- The email is a literal duplicated in `Navbar.tsx` and `Contact.tsx` (not in `src/constants`); the phone is only in `Contact.tsx`.
- Two typo'd Tailwind classes compile to nothing: `transtion-all` (`Projects.tsx`), `tracking-wides` (`Contact.tsx`).
- `marqueeRepeat()` is called inline in JSX in `ContactSummary.tsx` and `Contact.tsx`, violating the Marquee rule above — latent unless either section gains state.
- `react-responsive` is an unused dependency; `public/` (~3.6 MB, half of it `public/images/jp.png`) is copied verbatim into `dist/`.
- `Contact.tsx` spells "discus".
