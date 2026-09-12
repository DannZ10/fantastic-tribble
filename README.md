# dannzone.site

Scroll-driven portfolio. Vite + React 19 + TypeScript, Lenis for smooth scroll.
No animation library and no WebGL — the hero arc, the sticky stack and the
loader are all CSS plus one shared `requestAnimationFrame` loop.

```bash
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npm run typecheck
```

---

## Pages

| Route | Contents | Footer? |
|---|---|---|
| `/` | Hero, the three selected projects, then the full-page black footer | yes |
| `/work` | Ticker + every project as a zig-zag list, 4 per page | no |
| `/about` | Mark filled with your photo, prose beside it | no |
| `/case/:slug` | Project detail, prev/next navigation | no |

Nav is Home / Work / About. A project detail page keeps Work lit, since it
belongs to that section.

The home page shows `featured` — the first three entries of `cases.ts`. The Work
page shows all of them, paginated four at a time; add a tenth project and a
third page appears on its own.

On the Work page each project is a full-width row: its mark, its title, and a
small tech line. **Click** a row to unfold the detail — one at a time — and the
tech line fades out, since the detail lists the stack properly. Click it again,
or click another row, and it fades back. Hovering a row floats a desktop
preview that trails the cursor while the other rows dim.

The head is a real `<button>` with `aria-expanded` / `aria-controls`, so the
disclosure works by keyboard and is announced correctly. The floating preview is
decorative only — it is hidden on touch and under reduced motion, and everything
it shows is also in the detail below.

---

## Where to change things

| You want to change | Edit |
|---|---|
| Name, location, email, socials, hero roles, bio | `src/data/site.ts` |
| Case studies — all of them | `src/data/cases.ts` |
| Colours, gradients, fonts, type scale | `src/styles/tokens.css` |
| Component styling | `src/styles/components.css` |

The big title behind the hero subject cycles through `site.heroRoles` every
five seconds. The two captions flanking the subject are `site.roleLeft` and
`site.roleRight`.

---

## Swapping placeholders for real assets

All placeholder media sits at the exact paths the real files will occupy, so
replacing them is a file copy and touches no code.

### Hero arc phones → `public/arc/1..10.webp`

Ten screens at **9:19.5** (540×1170 works). They are greyscale until hovered,
so send screenshots that still read when desaturated. Drawn at the bezel's own
aspect ratio on purpose — 4:5 images get destroyed by `object-fit: cover` here.

### Phone scrub sequences → `public/frames/caseNN/`

Record real mobile UI at 1170×2532 or 1080×2340, 6–10 seconds, one slow
deliberate scroll. Then:

```bash
ffmpeg -i raw/case1.mp4 -vf "fps=30,scale=540:-1" -q:v 80 public/frames/case01/%03d.webp
```

Set the resulting frame count in `cases.ts` → `frames.count`. Currently 48.

### Project marks → `public/projects/logo-NN.webp`

Square, transparent, ~256px. Shown in place of a "Project NN" label.

### Desktop previews → `public/projects/preview-NN.webp`

The screenshot that follows the cursor on hover. 1200×780 (roughly 3:2) — the
CSS uses that exact `aspect-ratio`, so matching it avoids letterboxing.

### Case detail screenshots → `public/work/1..13.webp`

### Your photo → `public/characters/me.webp`

Square, face near the centre — the logo mask keeps only the middle band, so a
portrait framed wide loses the face. `scripts/prep_assets.py` and the crop step
in this repo's history show the framing that works.

---

## The mark is never an image with a baked colour

`public/brand/logo.svg` is used as a **CSS mask** over a background, which is
why one file serves four jobs:

| Where | Background behind the mask |
|---|---|
| Header | `--grad-brand` — navy to olive |
| About | your photograph |
| Footer | white, and `--grad-gold` on hover |
| Loader | `--ink`, then `--grad-brand` as it fills |

To recolour the mark anywhere, change the background, never the SVG.

---

## Things that will break if you change them carelessly

**Never use `overflow: hidden` on an ancestor of a sticky element.** Per
css-overflow-3 it is a *scrollable value*: it establishes a scroll container, so
the sticky element binds to a box that never scrolls and silently stops
sticking. No error is thrown. Use `overflow: clip`.

**Never put scroll progress in React state.** `useScrollProgress` hands you a
number inside a shared rAF loop — write it straight to the DOM through a ref.

**Only animate `transform` and `opacity` in scroll handlers.** They are the only
two compositor-only properties; anything else forces layout or paint every frame.

**Don't collect animated elements through a refs array.** `PhoneArc` queries the
DOM inside its effect instead: StrictMode detaches refs between its two effect
passes, so a snapshot taken at effect time is empty on the second run and the
arc silently never lays out.

**Never clear a UI-blocking flag inside `requestAnimationFrame`.** rAF is
suspended while the tab is in the background. `ProjectList` guards page changes
behind a `paging` flag; clearing it in rAF meant that clicking Next and then
switching tabs left the flag stuck true and jammed pagination permanently. It is
cleared on a timer instead.

**Animation timelines pause in a hidden browser pane.** If you are inspecting
this site through an automated pane that is not on screen, every CSS transition
freezes at its start value and `getComputedStyle` reports that frozen value
forever. Measuring a transitioned property under those conditions produces
confident nonsense — disable transitions first (`* { transition: none }`) and
measure pure layout.

**Put fixed heights on the image, not the wrapper.** `.hero__subject img` sets
its own height. As a grid item with `align-self: end` the row is content-sized,
so a percentage height resolves circularly and falls back to the intrinsic
1598px — which is exactly the bug that made the subject overflow.

---

## Accessibility commitments in the code

- Reduced motion is honoured at runtime: the arc freezes into a static
  composition, the role title stops cycling, frame scrubbing shows one still,
  and card dimming unsubscribes rather than animating then being overridden.
  Lenis handles its own smoothing via `respectReducedMotion`, left at `true`.
- The ticker on `/work` autoplays and loops beyond five seconds, which puts it
  under WCAG SC 2.2.2 at **Level A** — it has a visible pause control. Not
  optional. (Scroll-driven motion is SC 2.3.3, Level AAA.)
- The cycling hero title carries a stable accessible name, so a screen reader
  is not read a new heading every five seconds.
- Skip link, focus-visible styling, real `<button>` / `<a>` elements throughout.

---

## Deploy

Vercel. `vercel.json` already has the SPA rewrite (so `/work`, `/about` and
`/case/:slug` deep links do not 404) and long cache headers on hashed assets.

```bash
npx vercel --prod
```

---

## Build output

```
index.html                 1.56 kB │ gzip:  0.69 kB
assets/index-*.css        16.68 kB │ gzip:  4.76 kB
assets/index-*.js        304.25 kB │ gzip: 97.16 kB
```

One chunk — React, react-router and Lenis. three.js was removed along with the
gallery section; nothing in the site needs WebGL any more.

---

## Reference material

- `REFERENCE-ANALYSIS.md` — teardown of s0animation.com
- `RESEARCH-SCROLL-PRIMITIVES.md` — primary-source research behind the locked
  technical decisions, with citations
- `BUILD-PLAN.md` — the original phased plan
