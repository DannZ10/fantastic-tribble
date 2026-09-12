# s0animation.com — Teardown & Rebuild Blueprint

## 1. What it actually is (measured, not guessed)

| Thing | Evidence |
|---|---|
| Build tool | Single hashed bundle `/assets/index-CSOIrs4g.js` + `index-aDxWU64m.css` → **Vite** |
| UI framework | `#root`, React internals in bundle → **React SPA** (client-rendered, no SSR) |
| Smooth scroll | 30 `lenis` matches, `data-lenis-prevent` attributes → **Lenis** |
| 3D | `<canvas data-engine="three.js r185">`, `window.__THREE__ === "185"` → **vanilla three.js** (no R3F, no drei, no GLTF loader) |
| Animation lib | **none** — 0 hits for gsap / ScrollTrigger / framer-motion / lottie / rive |
| Fonts | Anton (display) + Montserrat (body) |
| Hosting | static files, `?v=7` cache-busting on videos → plain static host / CDN |
| Bundle size | ~880 KB JS (unminified-measured), mostly three.js + React |

Key finding: **there is no animation library.** Every motion effect is CSS
`position: sticky` + transforms + scroll-progress math in React, plus one WebGL
canvas for the gallery carousel. That is the whole trick.

## 2. Page anatomy

```
main.page.page--design
├── .case-exit-veil        (fixed)  page-transition wipe
├── .intro-loader          (fixed)  preloader, states: --enter --fade --done
├── .site-header           (fixed)  BARCELONA / DESIGN / ABOUT / email
├── .case-back             (fixed)  back button inside a case
├── section.work-hero      (sticky) hero-character.webp + title
├── .hero-marquee                   infinite horizontal ticker
├── .case-stack (2148px)            3 × section.case-section (sticky, top:52px)
│     each: --case-ink CSS var, case number, phone <video> + reversed twin,
│            funder logos as CSS mask-image on SVG, DEEP DIVE link
├── .case-divider-pin      (sticky)
└── .footer-reveal                  footer revealed under the stack
```

Assets: `hero-character.webp`, `work/1..13.webp` (carousel textures),
`{aspect,aida,recall}-phone.mp4` **and** a `-reversed.mp4` twin of each.

## 3. The five effects, and how each is done

### 3.1 Sticky card stack (the main scroll effect)
Each case is `position: sticky; top: 52px` inside a tall `.case-stack`. Cards
pin, the next one slides over the previous one. `z-index` is set inline per
card. No JS needed for the pinning — JS only reads scroll progress to fade /
scale the pinned card.

Cost: ~40 lines CSS. This is 70% of the site's perceived "wow".

### 3.2 Scroll-scrubbed phone video
Two `<video>` per case: normal + pre-reversed export. On scroll they set
`video.currentTime = progress * duration` instead of playing. Scrolling up
swaps to the reversed file, because browsers cannot seek backwards smoothly.
That reversed-twin trick is the only non-obvious thing on the site — it is why
there are 6 mp4s for 3 phones.

Cheaper alternative: a WebP/JPEG frame sequence (60–90 frames) drawn to a 2D
canvas. No codec seeking issues, no reversed twin, works identically both
directions. Recommend this over the mp4 approach.

### 3.3 WebGL gallery carousel
One `<canvas class="carousel-canvas">` in `.carousel-stage`, three.js r185,
13 `work/*.webp` textures on planes arranged in a ring, rotated by scroll /
drag. Written directly against three.js — a `PerspectiveCamera`, a ring of
`PlaneGeometry` meshes, one `requestAnimationFrame` loop. ~150 lines.

Honest note: three.js costs ~600 KB gzipped-ish of the bundle for one carousel.
A CSS `transform: rotateY()` ring of `<img>` gets ~85% of the look for 0 KB.
Only reach for WebGL if you want distortion/curvature on the images.

### 3.4 Intro loader + page transitions
`.intro-loader` with `--enter / --fade / --done` class states, and
`.case-exit-veil` for case navigation. Pure CSS transitions driven by React
state. No barba.js, no view-transitions API.

### 3.5 Lenis smooth scroll
Lenis replaces native scroll inertia so the sticky/scrub math never jitters.
This is the one dependency worth copying verbatim — 3 KB, and the sticky stack
feels wrong without it.

## 4. Recommended stack for your rebuild

```
Vite + React + TypeScript
lenis                     smooth scroll               (~3 KB)
react-router              /, /about, /case/:id        (~10 KB)
CSS modules or plain CSS  no Tailwind needed, this is bespoke layout
```

Skip unless you hit a wall:
- **GSAP/ScrollTrigger** — the reference ships without it; sticky + a scroll
  listener covers everything here. Add it only if you start hand-rolling
  timelines.
- **three.js** — only for the gallery, and only if CSS 3D is not enough.
- **Framer Motion** — overlaps with what CSS transitions already do here.
- **Next.js** — no SSR benefit for a 4-page portfolio; the reference is a plain
  SPA. Use it only if you want MDX case studies + SEO on case pages.

## 5. Build order (each step ships something you can look at)

1. **Static shell** — Vite + React, fixed header, hero section, footer, fonts
   (Anton + Montserrat), color tokens. No motion yet.
2. **Lenis** — wrap the app, one `useEffect` with `raf` loop.
3. **Sticky case stack** — 3 dummy cards, `position: sticky`, z-index ladder.
   This is the milestone that makes it "feel like the reference".
4. **One `useScrollProgress(ref)` hook** — returns 0→1 for an element's travel
   through the viewport. Every later effect consumes this one hook.
5. **Scroll-scrubbed media** — frame-sequence canvas (recommended) or the
   dual-video seek trick.
6. **Marquee** — CSS `@keyframes translateX(-50%)` on a duplicated track.
7. **Gallery** — start CSS 3D ring; upgrade to three.js only if unsatisfied.
8. **Intro loader + route transitions** — class-state machine, last.
9. **Case detail pages** — content-driven from a `cases.ts` array.

## 6. Things that will bite you

- **Mobile**: sticky + scroll-scrub + autoplay video is fragile on iOS. The
  reference sets `playsinline` and `preload="auto"`. Plan a reduced variant:
  static poster + fade, no scrubbing, under ~768px.
- **`prefers-reduced-motion`**: kill Lenis and all scrub effects behind this
  media query. Non-negotiable for accessibility.
- **Asset weight**: 13 carousel WebPs + 6 mp4s. Serve WebP/AVIF, lazy-load the
  gallery, and put the case media behind an IntersectionObserver.
- **Scroll math in React**: read scroll in one rAF loop and write transforms
  directly to DOM refs. Do NOT put scroll progress in `useState` — that
  re-renders 60×/sec and will tank the frame budget.
- **Content first**: the reference has 3 cases, each with a real story. The
  animation is a frame around content. Write the case studies before polishing
  easing curves.
