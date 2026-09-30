# Tailwind v4 theme and responsive type scale

**What you get** — theme tokens and a responsive type scale defined entirely in CSS. No `tailwind.config.js`, no PostCSS config.

**Use when** — "Tailwind v4 theme", "@theme", "@utility", "custom colors", "responsive type scale", "font sizes", "replace tailwind.config.js", "design tokens".

Extracted from `src/index.css` of a working React + Vite + Tailwind v4 portfolio.

---

## 1. Ask first

- Which colours does the design need? Ask for hex values, or a reference image.
- What is the display font and the body font? Do they have the font files, or should a Google Font / system stack be used?
- How many type sizes are needed for the scale? A typical animated portfolio needs four: a banner headline, a section sub-value, a marquee band, and a giant contact statement.

## 2. Create

Nothing to install — this is CSS. Tailwind v4 must already be wired up
as a Vite plugin in `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

There is **no** `tailwind.config.js` and **no** `postcss.config.js` in a v4
project. That is the point of v4.

## 3. Paste this

`src/index.css` — replace the whole file. Swap the hex values and font names for the ones gathered in step 1.

```css
@import "tailwindcss";

/* ---- Fonts ---------------------------------------------------------- */
/* One @font-face per weight AND per style. List both .otf and .ttf sources
   so the browser picks whichever it handles better. If the fonts live in a
   subfolder like /fonts/amiamie/, keep that path segment - dropping it 404s. */

@font-face {
  font-family: "Display";
  src:
    url("/fonts/otf/Display-Light.otf") format("opentype"),
    url("/fonts/ttf/Display-Light.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Display";
  src:
    url("/fonts/otf/Display-Regular.otf") format("opentype"),
    url("/fonts/ttf/Display-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Display";
  src:
    url("/fonts/otf/Display-Black.otf") format("opentype"),
    url("/fonts/ttf/Display-Black.ttf") format("truetype");
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Display";
  src:
    url("/fonts/otf/Display-BlackItalic.otf") format("opentype"),
    url("/fonts/ttf/Display-BlackItalic.ttf") format("truetype");
  font-weight: 900;
  font-style: italic;
  font-display: swap;
}

/* ---- Theme tokens --------------------------------------------------- */
/* This block replaces tailwind.config.js entirely. Anything defined here
   becomes a real utility: --color-gold gives you `bg-gold`, `text-gold`,
   `border-gold`. --font-display gives you `font-display`. */

@theme {
  --color-primary: #e5e5e0;
  --color-ink: #393632;
  --color-muted: #8b8b73;
  --color-gold: #cfa355;

  --font-display: "Display", sans-serif;
}

/* ---- Base ----------------------------------------------------------- */
body {
  background: var(--color-primary);
  color: black;
  overflow-x: hidden;
  font-family: var(--font-display);
}

/* ---- Responsive type utilities -------------------------------------- */
/* @utility is the v4 replacement for a custom plugin. Anything inside
   @apply becomes a normal Tailwind utility you can use anywhere, including
   with responsive variants. */

@utility banner-text-responsive {
  @apply text-[68px] sm:text-[118px] md:text-[70px] lg:text-[96px] leading-9 sm:leading-16 md:leading-[0.511] lg:leading-[0.519];
}

@utility value-text-responsive {
  @apply text-2xl md:text-[26px] lg:text-[32px];
}

@utility marquee-text-responsive {
  @apply text-[28px] sm:text-[36px] lg:text-[42px];
}

@utility contact-text-responsive {
  @apply text-[42px] sm:text-[52px] md:text-[62px] lg:text-[100px];
}

/* A collapsed clip-path, so a GSAP reveal has a defined start shape. */
@utility clip-path {
  clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}
```

## 4. Wire it up

`src/main.tsx` already imports the stylesheet in a Vite project — confirm it:

```tsx
import "./index.css";
```

Usage in a component:

```tsx
<h1 className="uppercase banner-text-responsive">Your Name</h1>
<p className="value-text-responsive">Supporting copy</p>
```

## 5. Values

| Token / utility | Value | Why |
|---|---|---|
| `--color-primary` | `#e5e5e0` | Page background. Set it in `@theme`, then reference it in `body` as `var(--color-primary)` rather than repeating the hex |
| `--color-ink` | `#393632` | Dark section background, and the standard dark-surface colour |
| `--color-gold` | `#cfa355` | Single accent. Used for dividers, one highlighted word per section — restraint is what makes an accent read as an accent |
| `font-display: swap` | on every `@font-face` | Text renders in the fallback immediately instead of being invisible while the font loads |
| `banner-text-responsive` | 68 → 118 → 70 → 96 px | Non-monotonic on purpose: the `sm` peak then a drop at `md` is what creates the dramatic oversized-tablet look. Copying these values without understanding that makes the curve look like a bug |
| `leading-[0.511]` | sub-1 line height | Only safe at very large display sizes, where the default line height leaves a hole. Never use this at body sizes |
| `clip-path` utility | bottom-collapsed polygon | Gives GSAP a defined "hidden" shape to start a reveal from, so the animation does not have to hardcode the polygon |

## 6. Do not

- **Do not create `tailwind.config.js`.** In v4 the theme lives in CSS. A config file is ignored.
- **Do not create `postcss.config.js`.** Tailwind v4 runs as a Vite plugin. The Vite React template only needs `@tailwindcss/vite` in `plugins`.
- **Do not hardcode a hex in `body` that also exists in `@theme`.** Write `background: var(--color-primary)` so there is one source of truth.
- **Do not write `@font-face` paths that omit the subfolder** if the fonts live in a named subdirectory. Font 404s are silent — the page just renders in the fallback.
- **Do not use a sub-1 line height at small sizes.** It clips descenders. It is only correct on the giant display sizes.
- **Do not forget `font-display: swap`.** Without it, text is invisible until the font arrives.
- **Do not define a token in `@theme` and then also hand-write a class for it.** `--color-gold` already gives you `bg-gold`, `text-gold`, `border-gold`, `ring-gold`.

## 7. Done when

- [ ] `vite.config.ts` includes `tailwindcss()` from `@tailwindcss/vite`
- [ ] No `tailwind.config.js` and no `postcss.config.js` exist
- [ ] `src/index.css` starts with `@import "tailwindcss";`
- [ ] Every colour used in components resolves from an `@theme` token (`bg-gold` works, not `bg-[#cfa355]`)
- [ ] Each type scale utility is applied and changes size across `sm` / `md` / `lg` in devtools
- [ ] All `@font-face` paths return 200 in the network tab
- [ ] Project build passes
