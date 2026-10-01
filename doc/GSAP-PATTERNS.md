# GSAP patterns in this project

A plain-English guide to every animation on this site: what it does, which file
it lives in, and how to copy it into another project.

You do not need to read this top to bottom. Find the effect you want in the
table, jump to that section, copy the snippet.

---

## 1. The one thing to understand first

GSAP has three levels, and they build on each other.

| Level | What it is | Real example here |
|---|---|---|
| **Tween** | One element, one change, over a duration | the About photo un-hiding |
| **Timeline** | Tweens in a sequence, with control over when each starts | the header sliding up, then the title fading in |
| **Context** | A scope that collects everything it created so it can be undone | `useGSAP` from `@gsap/react` gives you this for free |

A **plugin** is extra functionality GSAP doesn't include by default:

- `ScrollTrigger` — the most used one. Turns "when this element scrolls into
  view" into an animation.
- `Observer` — reacts to scroll *velocity* instead of position. Only the
  marquee uses it.

Plugins have to be registered before you use them. In this project that happens
once in `src/lib/gsap.ts`, and every file imports GSAP from there:

```ts
// src/lib/gsap.ts
import gsap from "gsap";
import { Observer, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, Observer);

export { gsap, ScrollTrigger, Observer };
```

Why one file? Two reasons. One import means one copy of GSAP — if two files load
it separately you can get two instances that don't know about each other, and
animations silently fail. And registering in one place means no file depends on
some *other* file happening to be imported first. This project used to do that:
`Projects`, `Services`, `About`, `Contact` and `ContactSummary` all used
`scrollTrigger:` without importing it, and only worked because
`AnimatedTextLines.tsx` happened to register it as a side effect of being
imported. Reorder the imports and every scroll animation on the page dies with
no error message.

---

## 2. `from` vs `to` vs `fromTo` — the decision that causes most bugs

```ts
gsap.to(el, { x: 100 })     // from where it is now, to x: 100
gsap.from(el, { x: 100 })   // from x: 100, back to where the CSS says it should be
gsap.fromTo(el, { x: 0 }, { x: 100 })  // always exactly these two points
```

**The rule that catches everyone:** `from` animates *back to your CSS*. So if
you also set the final look in your stylesheet, there is nothing left to animate
from and the element just appears.

```css
/* wrong: CSS already says opacity 1, so from() has no work to do */
.card { opacity: 1; }
```

```css
/* right: let CSS describe the resting state, and let GSAP do the entrance */
.card { /* no opacity here */ }
```

**Use `fromTo` when the element might already be mid-animation** — on a second
hover, for example. `from` would first snap it back to the start value, which
you see as a flicker. `fromTo` is predictable every single time.

---

## 3. `stagger` — one after another instead of all at once

You have six rows and want them to arrive in sequence, not as a block.

```ts
gsap.from(".project-row", {
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.3,   // 0.3s between each one starting
  ease: "back.out",
});
```

`stagger: 0.3` means row 1 starts at 0s, row 2 at 0.3s, row 3 at 0.6s, and so
on. It works on any list, no extra code.

Used in: `Projects.tsx` (project rows), `AnimatedTextLines.tsx` (body copy),
`Contact.tsx` (contact blocks), `Navbar.tsx` (menu links).

---

## 4. ScrollTrigger — animating on scroll

Attach it to any tween. The `scrollTrigger` block says *when*.

```ts
gsap.from(el, {
  y: 100,
  opacity: 0,
  scrollTrigger: {
    trigger: el,        // the element to watch. NOT "target".
    start: "top 80%",   // when to begin
  },
});
```

### Reading `start` and `end`

Both are written as `"<element's part> <screen's part>"`.

```
"top 80%"     = when the element's top edge is 80% down the screen
"bottom 20%"  = when the element's bottom edge is 20% down the screen
"center center" = when the element's middle lines up with the screen's middle
"+=800"       = 800px further than the start point
```

### `scrub` — tie the movement to the scrollbar

Without `scrub`, the animation plays once and finishes. With `scrub`, the
animation is locked to your scroll position: scroll down and it advances, scroll
up and it goes back. This is what makes parallax work.

```ts
scrub: true   // 1:1, rigid
scrub: 0.5    // eases into place over half a second, feels smoother
scrub: 1      // takes 1s to catch up, very floaty
```

**A `scrub` tween holds its last value forever once it reaches the end.** If
something slides off screen as you scroll and you want it to stay put and
readable, give it an `end` early — it then finishes moving by that point and
sits still for the rest of its pass:

```ts
start: "top 90%",   // begin as the element appears at the bottom
end: "top 20%",     // stop by the time it's near the top, then hold
```

Without an `end` the default is `"bottom top"`, so the element keeps sliding
until it's completely out of view.

### `pin` — freeze a section while you scroll past it

```ts
gsap.to(sectionRef.current, {
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "center center",
    end: "+=800 center",
    scrub: 0.5,
    pin: true,         // freeze the section in place
    pinSpacing: true,  // leave a gap so the page doesn't jolt when it unfreezes
  },
});
```

Note there is no animation in that tween at all, and that's intentional. You can
attach a scroll trigger to a tween that changes nothing — it's a placeholder so
the scroll settings have somewhere to live. **This is the only way to pin**,
because pinning is a ScrollTrigger feature, not a `gsap.to()` feature.

Used in: `ContactSummary.tsx` (the frozen "Let's build something together"
section), `About.tsx` (subtle scale-down), `ServiceSummary.tsx` (rows drifting
sideways), `Services.tsx` (each card rising on its own).

### `markers` — turn this on while you build

```ts
markers: true   // draws red lines showing exactly where start and end land
```

There is no better way to understand why an animation fires too early or too
late. Turn it on, look, turn it off.

---

## 5. Timelines — several animations in order

A timeline plays its tweens one after another. The text at the end of each
`.from()` / `.to()` says *when* to start it.

```ts
const tl = gsap.timeline();

tl.from(block, { y: "50vh", duration: 1 });     // starts at 0s
tl.from(text,  { opacity: 0, duration: 1 }, "<+0.2");  // 0.2s after the previous one STARTS
```

The position codes you need:

| Code | Meaning |
|---|---|
| `"<"` | same time as the previous one started |
| `"<+0.2"` | 0.2s after the previous one started |
| `"<0.5"` | 0.5s after the previous one **finished** |
| `"-=0.3"` | 0.3s before the previous one ends |
| `"+=1"` | 1s after the timeline's current end |
| `2` | at 2s from the start of the timeline |
| `"label1"` | a named point you can jump to later |

You can also put `scrollTrigger` on the timeline itself, which makes the whole
sequence wait for scroll. `AnimatedHeaderSection.tsx` does this, and switches it
on and off with a prop — the Hero plays on page load, every other section waits
for scroll.

---

## 6. Paused timelines for open/close menus

`Navbar.tsx`. Build the animation once, park it, then play or rewind it.

```ts
const tl = useRef(null);

useGSAP(() => {
  tl.current = gsap
    .timeline({ paused: true })   // sits still until told otherwise
    .to(menu, { xPercent: 0, duration: 1, ease: "power3.out" })
    .to(links, { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, "<");
});

// on click:
if (isOpen) tl.current.reverse();  // run it backwards
else tl.current.play();            // run it forwards
```

Why bother: the timeline remembers exactly where it is, so you never have to
track "is it open, half open, or closing?" in state. `reverse()` always does the
right thing.

### Two settings worth knowing

```ts
gsap.set(menu, { xPercent: 100 });   // start state: 100% of its own width to the right
gsap.set(links, { autoAlpha: 0 });   // autoAlpha = opacity AND visibility together
```

`gsap.set()` applies a value instantly with no animation. Use it to set the
starting position, otherwise you get a flash of the un-animated element before
the animation starts. `autoAlpha` rather than `opacity` also sets `visibility`,
so hidden menu links can't be focused with the Tab key.

### The burger-to-cross trick

Two bars in a column, each rotated 45° in opposite directions:

```ts
gsap.timeline({ paused: true })
  .to(topBar,    { rotate: 45,  y: 3.3, duration: 0.3 })
  .to(bottomBar, { rotate: -45, y: -3.3, duration: 0.3 }, "<");
```

`origin-center` in the CSS is what makes them spin around their own middle
instead of a corner, so they stay in place while turning.

---

## 7. Following the mouse — `gsap.quickTo`

`Projects.tsx`. The floating preview image that trails your cursor.

```ts
const moveX = useRef(null);

useGSAP(() => {
  moveX.current = gsap.quickTo(previewRef.current, "x", {
    duration: 1.5,
    ease: "power3.out",
  });
});

const onMouseMove = (e) => {
  moveX.current(e.clientX + 24);
};
```

**Why not just `gsap.to()` on every mouse move?** The mouse fires about 60 times
a second. `gsap.to()` creates a *brand new* animation each time, and 60 new
animations per second will make the page stutter. `quickTo()` builds the
animation once and hands you a function that reuses it.

**Why x takes 1.5s and y takes 2s:** on purpose. The image catches up faster
horizontally than vertically, so it drags behind the cursor on one axis. That
reads as "it has weight". The same duration on both axes looks robotic.

Use this for: cursor followers, magnetic buttons, drag previews, mouse parallax.

---

## 8. Hover effects that survive fast movement

`Projects.tsx`. Move your mouse across the rows quickly and the black overlay can
get stuck half-open.

```ts
gsap.killTweensOf(el);   // cancel whatever is still running

gsap.fromTo(el,
  { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
  { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.15 }
);
```

Pointer events arrive far faster than a 0.15s animation can finish. Two
competing animations on the same property = a half-open mess. `killTweensOf()`
clears the deck first.

### The clip-path wipe

A `polygon()` takes four corner points, in order: top-left, top-right,
bottom-right, bottom-left.

```
polygon(0 100%, 100% 100%, 100% 100%, 0 100%)
            └─ both bottom corners at 100% ─┘   = a flat line, invisible

polygon(0 0, 100% 0, 100% 100%, 0% 100%)
└─top─┘  └─top─┘  └──bottom──┘         = fully visible
```

Moving the two bottom corners from `100%` up to `0%` looks like a curtain being
pulled up over the row. It's used for the project rows and the About photo.

**Prefer clip-path over animating `height` or `opacity`** for reveals like this:
the element's real size never changes, so nothing inside it shifts and the
browser doesn't have to redo layout. The same trick works on text — split it
into lines and wipe each one.

---

## 9. Scroll velocity — the marquee

`Marquee.tsx`. This one is the most advanced thing on the site, so here's the
honest version: **you can use it without understanding it.**

The `horizontalLoop` function is copied from an official GSAP example. It builds
one timeline that slides the items left forever, and when an item leaves on the
left it instantly jumps back to the right end. The jump happens while it's off
screen, so you never see it — that's what makes the loop seamless. You don't
need to read the maths.

```ts
const tl = horizontalLoop(itemsRef.current, {
  repeat: -1,          // loop forever
  paddingRight: 30,    // gap between the end and the start, in pixels
  reversed: reverse,   // start travelling the other way
});
```

Then scroll speed changes how fast it runs:

```ts
const observer = Observer.create({
  onChangeY(self) {
    let factor = 2.5;
    if (scrollingAgainstItsDirection) factor *= -1;   // flip it around
    gsap.timeline({ defaults: { ease: "none" } })
      .to(tl, { timeScale: factor * 2.5, duration: 0.2, overwrite: true })
      .to(tl, { timeScale: factor / 2.5, duration: 1 }, "+=0.3");
  },
});
```

`Observer` watches scroll and reports the *speed* (`self.deltaY`), not the
position. Two steps on purpose: speed up quickly, then 0.3s later ease back to a
gentle drift. One step feels jerky. `timeScale` is the playback speed of a
timeline — `2` is double speed, `0.5` is half.

`overwrite: true` means a new scroll event cancels the previous speed change
instead of fighting it.

**One gotcha worth remembering:** `Observer` is not a tween, so GSAP's automatic
cleanup does not touch it. You have to kill it yourself:

```ts
return () => {
  observer.kill();   // otherwise every remount leaves one behind
  tl.kill();
};
```

---

## 10. Animating text line by line

`AnimatedTextLines.tsx`. The reason body copy on this site is written as a
multi-line template literal:

```ts
const text = `Creating responsive, reliable
  web applications while constantly
  learning, building and solving
  real world problems through code.`;
```

The component splits it on line breaks, makes each line its own element, and
animates them in sequence:

```ts
const lines = text.split("\n").filter((line) => line.trim() !== "");

gsap.from(lineRefs.current, {
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.3,
  ease: "back.out",
});
```

Each line needs to be its own element for this to work. If you write the copy as
one long line, the whole paragraph animates as a single block and you lose the
effect. This is the pattern to copy for any "text rises line by line" reveal.

---

## 11. easings — the whole list you need

`ease` controls the speed of a single animation.

| Ease | Feels like | Use for |
|---|---|---|
| `"power1.out"` | gentle | subtle fades |
| `"power2.out"` | confident | most UI, hovers |
| `"power3.out"` | fast then long settle | things that follow the mouse |
| `"power4.out"` | very fast then long glide | big reveals |
| `"circ.out"` | smooth, no overshoot | text and headings rising |
| `"back.out(2)"` | overshoots then comes back | playful pops, rows arriving |
| `"none"` | constant speed | anything scrubbed, or the marquee |
| `"elastic.out"` | bouncy | use sparingly |

`"none"` (linear) is required for anything tied to scrolling — a curved ease
would make a scrubbed animation lurch at the start and end.

---

## Checklist for a new project

1. `npm i gsap @gsap/react lenis`
2. Make one `lib/gsap.ts` that registers your plugins and re-exports `gsap`.
3. Every component imports `{ gsap }` from that file. Never from `"gsap"`.
4. Animate with `useGSAP` from `@gsap/react`, not `useEffect`. It cleans up
   after itself when the component unmounts.
5. Give animated elements a `ref` where you can, and a class where you can't.
   Avoid `id` unless it's genuinely unique — an `id` repeated on several
   elements is invalid HTML, and ScrollTrigger will only ever use the first one
   it finds.
6. Set the start state with `gsap.set()` so nothing flashes before the
   animation runs.
7. Use `from` only when the resting state lives in your CSS, not in the tween.
8. `stagger` for any list. `clip-path` for reveals instead of `height`.
9. `gsap.quickTo` for anything driven by mouse movement.
10. `markers: true` while building. Then turn it off.
11. If you use Lenis *and* ScrollTrigger, connect them (see below).

---

## Open question: Lenis and ScrollTrigger are not connected

`App.tsx` wraps the whole page in `<ReactLenis root>`. Lenis is supposed to
smooth the scrolling, but nothing tells ScrollTrigger when Lenis moves, so
scrubbed and pinned animations *can* drift away from the real scroll position.

As it turns out this project probably doesn't have that problem, because Lenis
isn't doing anything: with the `root` prop it scrolls its own wrapper `<div>`,
and that div grows to fit its content, so it has nothing to scroll. The page
falls back to normal browser scrolling, which ScrollTrigger already handles.

**Check it yourself.** In the browser console, scroll down and watch:

```js
window.scrollY
```

If the numbers jump in big steps as Lenis eases toward each one, Lenis is
driving the scroll and you need the connection below. If they track your wheel
exactly, Lenis is inert here and the page is fine.

**If you ever do need it** — for example if you switch to `wrapper={window}` —
these three lines are the whole fix:

```tsx
// App.tsx
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "./lib/gsap";

const Bridge = () => {
  const lenis = useLenis();

  useGSAP(() => {
    if (!lenis) return;

    // 1. tell ScrollTrigger the new position every time Lenis scrolls
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // 2. drive Lenis from GSAP's animation loop, so they share one clock
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    // 3. stop GSAP from skipping frames when the tab is slow
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(1000, 33); // back to the default
    };
  }, [lenis]);

  return null;
};
```

And turn Lenis's own animation loop off, so it isn't running twice:

```tsx
<ReactLenis root options={{ autoRaf: false }}>
```

Don't add this blind. If Lenis is inert (as it looks here) and you take over its
loop while it has nothing to scroll, you can end up with a page that doesn't
scroll at all.

---

## Other things worth knowing

**`xPercent` is relative to the element, and that may not be what you expect.**
`x: 200` means 200 pixels. `xPercent: 20` means 20% of the element's own width,
so it scales with the screen and never needs hardcoded values. Prefer it for
anything that slides.

The trap: if you animate a **full-width block** (a plain `<div>`, a `<section>`,
anything that fills the row), its width is the whole screen — so `xPercent: 20`
is a fifth of the viewport, not a fifth of the text. The ServiceSummary rows are
full-width blocks, so their `xPercent: 100` and `xPercent: -100` really do mean
a whole screen-width in each direction.

That only works because those values are combined with a **whole-page `scrub`
range** (see the next section) which spreads the movement so thinly that the
rows have barely moved when you reach them. Change the range to a per-row one
and the same numbers become fast enough to push the words off screen — which is
exactly what happened here once. So: a big `xPercent` is only safe if you know
how far it has to travel.

If you want the percentage measured against the text instead, make the text its
own element:

```html
<!-- xPercent now measures this span, not the screen -->
<div class="text-center"><span class="inline-block">Databases</span></div>
```

Rule of thumb: check what the element actually is before trusting a percentage.

**A `scrollTrigger` with no `trigger` spans the whole page.** This is a real,
supported pattern, not a mistake — and it's what `ServiceSummary.tsx` relies on
for its effect. When there's no trigger, ScrollTrigger falls back to
`start: 0` and `end: <the scroller's maximum scroll>`, so the tween is scrubbed
across every screen of the page rather than across the element's own pass.

Useful when you want movement that is barely perceptible on any one screen but
adds up over a long scroll. Not useful when you want something to happen *while*
an element is in view — for that, set `trigger` deliberately.

Worth knowing: this is also why the old code in `ServiceSummary` looked wrong.
It passed `target:` instead of `trigger:`, which ScrollTrigger doesn't
recognise, so it got the whole-page range *by accident* and the drift was so
slow the author may not have known it was tied to the trigger at all. The
current code produces the identical result with the omission made on purpose.

**Tailwind v4 translations don't clash with GSAP.** Tailwind v4's
`translate-x-*` writes the standalone CSS `translate` property, while GSAP
writes `transform`. They're separate, so they compose. (In Tailwind v3 both used
`transform` and they *did* overwrite each other.)

**Keep animation lists out of components.** The marquee word lists live in
`src/constants/index.ts` rather than inside the sections. A list written inline
(`const items = ["a", "b"]`) is a brand new array on every render, and the
Marquee component rebuilds its animation whenever `items` changes — so it would
restart on every unrelated re-render.

**`useGSAP` scoping.** By default `useGSAP` looks up string selectors against the
whole document, so two sections using `.social-link` would animate each other's
elements. Pass a scope to keep it local:

```ts
const root = useRef(null);
useGSAP(() => {
  gsap.from(".card", { /* ... */ });
}, { scope: root });   // only finds .card inside this component
```
