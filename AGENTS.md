# AGENTS.md

Single-page GSAP portfolio (React 19 + TS + Vite 6 + Tailwind v4). Branch `dev`; no remote, no CI, no tests, no formatter.

## Verify

**The only working check is `./node_modules/.bin/vite build`** (~4s, clean). Treat it as a bundling smoke test only — nothing typechecks or lints:

- `pnpm build` → `tsc: not found` (`typescript` is not a dependency, though `build` is `tsc -b && vite build`).
- `pnpm lint` → `ERR_MODULE_NOT_FOUND: typescript-eslint` (imported by `eslint.config.js`, also not a dependency). `@types/node` is likewise absent despite `tsconfig.node.json` setting `types: ["node"]`.
- `pnpm <script>` can trigger a blocking dep re-install before it runs; call the binary directly instead.
- `tsconfig.app.json` still constrains edits: `verbatimModuleSyntax` (use `import { type X }`), `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`.
- `README.md` is the stock Vite scaffold and is wrong (claims React Compiler; `vite.config.ts` has no `compiler` option). Ignore it.

## Docs for animation work

- **`doc/GSAP-PATTERNS.md`** — every animation on the site with its reasoning, plus the Lenis/ScrollTrigger write-up.
- **`doc/skill/*.md`** — copy-pasteable recipes indexed in `doc/skill/README.md`. Start with `gsap-scaffold`.

## Rules that break the page if ignored

- **Import GSAP and its plugins from `src/lib/gsap.ts`** — the only `registerPlugin(ScrollTrigger, Observer)` call, so nothing depends on import order. (`Services.tsx`/`Marquee.tsx` import plugins directly, and `Marquee.tsx` uses the `gsap/all` barrel — prefer the lib.)
- **Use `useGSAP` (`@gsap/react`) for component animations.** Raw `useEffect` only in `Navbar` (scroll listener), `Marquee` (needs its own `kill()`), `Services` (height sync).
- **Lenis is mounted but not bridged** — no `lenis.on("scroll", ScrollTrigger.update)` / `gsap.ticker` anywhere. The `pin: true` in `ContactSummary.tsx` (the site's only pin) works off native scroll. Read the GSAP-PATTERNS section before "fixing" this; the naive bridge can leave the page unscrollable.
- **`ServiceSummary` rows are deliberately trigger-less** (`scrollTrigger: { scrub: true }`, nothing else) so the page-wide `xPercent` drift stays in range. Adding `trigger`/`start`/`end` pushes the words off screen.
- **`Services` cards are CSS `position: sticky`** with computed `top`/`marginBottom`, not GSAP. Don't also pin or scrub them.
- **`Marquee`'s effect deps are `[items, reverse]`**, so a fresh array identity per render tears down and restarts the loop. Keep word lists in `src/constants` (`marqueeValues`, `marqueeRepeat`) — never inline a literal in JSX.
- **Reveals are `gsap.from(...)`**: don't pre-style a subject in its final state in CSS. Use `fromTo` + `killTweensOf` for anything that can retrigger (`Works.tsx` hover).
- **`AnimatedTextLines` splits `text` on `\n`** — section copy is multi-line template literals for that reason; single-line strings collapse the animation to one block.

## Conventions

- Content lives in `src/constants/index.ts` (`servicesData`, `projects`, `socials`); asset paths are root-absolute (`/assets/...`). `Services.tsx` consumes it through a local `Service` cast with no typecheck, so a field rename only fails at runtime.
- No `tailwind.config.js` — the theme, the `@utility` responsive-type helpers (`banner-`, `value-`, `marquee-`, `contact-text-responsive`) and the collapsed `clip-path` all live in `src/index.css`. Extend there instead of hand-rolling type scales.
- Font files are under `public/fonts/amiamie/{otf,ttf}/` — the `amiamie/` segment is required; `/fonts/otf/…` 404s.
- `Navbar`'s link array is a hardcoded literal and each target `id` lives on the matching section in `src/sections/`; adding a section means updating both.
- `@iconify/react` is in `devDependencies` but imported at runtime from `"@iconify/react/dist/iconify.js"` (deliberate — skips the network-fetching entry). Move it to `dependencies` for a correct deploy.

## Known pre-existing issues (leave alone unless asked)

- `Works.tsx` renders no `<a>`, so `projects[].href` is dead data; its hover/preview effects are hard-guarded by `window.innerWidth < 768` and are invisible on touch.
- The email is a literal duplicated in `Navbar.tsx` and `Contact.tsx` (not in `src/constants`); the phone is only in `Contact.tsx`.
- Two typo'd Tailwind classes compile to nothing: `transtion-all` (`Works.tsx`), `tracking-wides` (`Contact.tsx`).
- `marqueeRepeat()` is called inline in JSX in `ContactSummary.tsx` and `Contact.tsx`, violating the Marquee rule above — latent unless either section gains state.
- `react-responsive` is an unused dependency and `public/assets/backgrounds/table.jpg` is unreferenced; `public/` (~6.6 MB) is copied verbatim into `dist/`.
- `Contact.tsx` spells "discus".
