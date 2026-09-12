# dannzone.site — Build Plan

**Owner:** frontend / full-stack dev · **Domain:** dannzone.site (Vercel)
**Reference:** s0animation.com (teardown → `REFERENCE-ANALYSIS.md`)
**Primary-source research:** `RESEARCH-SCROLL-PRIMITIVES.md`
**Scope:** full clone-quality — home + about + 3 case detail pages, all effects.

---

## Context

You want a scroll-driven portfolio with the same class of motion as
s0animation.com, but as your own brand, showing shipped full-stack work. You
are a comfortable React dev, so this plan assumes React idiom and does not
explain hooks. Each phase below is a self-contained prompt you can paste into
a fresh agent session.

Three decisions were changed by primary-source research and are **locked**:

| Decision | Why (source: `RESEARCH-SCROLL-PRIMITIVES.md`) |
|---|---|
| **Frame sequence, not video scrubbing** | `fastSeek()` never shipped in Chrome/Edge. Every seek decodes from the preceding keyframe forward. A WebP frame sequence drawn to canvas is deterministic in both scroll directions. |
| **`overflow: clip`, never `overflow: hidden`** on any ancestor of a sticky element | Per css-overflow-3, `hidden` is a *scrollable* value — it creates a scroll container, so sticky binds to a box that never scrolls and silently does nothing. `clip` forbids scrolling and does not. |
| **three.js r186, manual pixel-ratio math** | The three.js manual explicitly says `setPixelRatio(devicePixelRatio)` is "strongly NOT RECOMMENDED". Compute `clientWidth × dpr`, call `setSize(w, h, false)`, cap at 3840×2160. Renderer `alpha`/`antialias`/`stencil` all default to **false**. |

---

## 🔴 What I need from you (I cannot generate these)

Everything below is a hard blocker for the phase it is attached to. Everything
*not* on this list, I can build or generate.

### A1 — Logo `[blocks Phase 0]`
- `logo.svg` (vector, preferred) — or `logo.png` at ≥1000px, transparent
- If you have a dark-background variant, send both.
- Drop into `public/` and tell me the filenames.

### A2 — Hero character image `[blocks Phase 3]`
You generate this with an AI image tool. Exact spec:

- **Format:** PNG or WebP, transparent background, no baked shadow
- **Size:** ≥2000px tall, full body, nothing cropped (no cut-off hands/feet)
- **Pose:** standing, ¾ turn, one arm free — leave room for a floating element
- **Lighting:** single soft key light, flat — no dramatic rim light (it fights
  the page background)
- **Style:** flat vector illustration, 2–3 colour palette + one accent

Starter prompt for the image tool:

```
flat vector illustration of a young male developer standing three-quarter
turn, holding an open laptop in one hand, other hand gesturing, wearing a
white oversized tee and dark shorts, clean white sneakers, minimal facial
detail, flat 2-tone shading, single accent colour, full body head to feet,
isolated on pure white background, no shadow, high detail, 2:3 aspect
```

Then background-remove it. **Send me the transparent file.** I will handle
the parallax, the mask reveal, and the responsive crops.

*Fallback if this stalls:* say so and I ship a CSS/SVG typographic hero
instead — zero assets needed from you, and it is honestly a stronger fit for
a full-stack dev than a stock-looking illustration.

### A3 — Phone screen recordings, 1 per case `[blocks Phase 5]`
Record the real mobile UI of each shipped app.

- **Resolution:** 1170×2532 (iPhone) or 1080×2340 (Android) — native, not scaled
- **Duration:** 6–10 seconds
- **Frame rate:** 60fps if possible, 30fps acceptable
- **Motion:** one slow deliberate scroll or one clean flow. No fast flicks —
  the user controls playback speed by scrolling, so record *steadily*.
- **Clean it:** no notifications, no cursor, battery full, clock set
- **Format:** `.mp4` or `.mov`, drop into `public/raw/`

I convert these to frame sequences myself with:

```bash
ffmpeg -i raw/case1.mp4 -vf "fps=30,scale=540:-1" -q:v 80 public/frames/case1/%03d.webp
```

*Fallback:* if a case has no recordable mobile UI, send 4–6 static screenshots
and I will build a cross-fade sequence instead.

### A4 — Gallery images, 10–14 total `[blocks Phase 6]`
Shots for the 3D carousel ring.
- Consistent aspect ratio across all of them (4:5 portrait recommended)
- ≥1200px on the short edge, `.webp` or `.png`
- Mixed content is fine: UI shots, code, dashboards, mobile screens

### A5 — Case study content, ×3 `[blocks Phase 7]`
For each shipped project, send me this filled in. Prose quality matters more
than length — I can tighten your writing, I cannot invent your outcomes.

```
Project name:
One-line description:
Tags (2-3):              e.g. #FULLSTACK #SAAS
Your role:
Timeline:                e.g. 3 months, 2025
Stack:                   e.g. Next.js, Postgres, tRPC, Stripe
Live URL / repo:         (or "NDA" / "offline")
THE PROBLEM:             2-4 sentences
WHAT I BUILT:            3-5 sentences
THE HARD PART:           the one technical problem you're proud of solving
OUTCOME:                 numbers if you have them — users, load time, revenue
```

### A6 — About page `[blocks Phase 8]`
- Bio, 60–80 words, first person
- Photo of you (or say "skip, use the character")
- City, email, and the social links you want (GitHub, LinkedIn, X, Telegram…)

### A7 — Deploy access `[blocks Phase 9]`
- Where `dannzone.site` is registered (Namecheap? Cloudflare? other?)
- You will do the Vercel DNS step yourself — I will give you the exact records.

### What I do NOT need from you
Fonts, colours, icons, loading animation, page transitions, the OG/social
share image, favicon, 404 page, all layout, all motion code, the ffmpeg
conversions, placeholder content so you can see it working before A2–A6 land.

---

## Locked stack

```
Vite 6 + React 19 + TypeScript
lenis ^1.3.26          smooth scroll
react-router ^7        /, /about, /case/:slug
three ^0.186           gallery carousel only
plain CSS + CSS vars   no Tailwind — this is bespoke layout, utilities fight it
```

Not used, deliberately: GSAP (the reference ships without it; sticky + one rAF
loop covers everything), Framer Motion (duplicates CSS transitions here),
Next.js (no SSR benefit for 4 pages; revisit only if you add a blog).

---

## Repo structure

```
src/
  main.tsx
  App.tsx                    routes + <ReactLenis root>
  data/cases.ts              ← single source of truth for all case content
  hooks/
    useScrollProgress.ts     one hook, every effect consumes it
    useFrameSequence.ts      canvas frame-scrubber
    usePrefersReducedMotion.ts
  components/
    SiteHeader.tsx
    IntroLoader.tsx
    Hero.tsx
    Marquee.tsx
    CaseStack.tsx / CaseCard.tsx
    Gallery.tsx              three.js carousel
    SiteFooter.tsx
  pages/
    Home.tsx  About.tsx  CaseDetail.tsx
  styles/
    tokens.css  base.css  + per-component css
public/
  logo.svg  characters/  frames/case1..3/  work/1..13.webp
```

---

# Phases

Each phase is a copy-paste prompt. Run them in order. Every phase ends with
something you can look at in the browser.

---

## Phase 0 — Brand direction `[needs A1]`

> I'm building my portfolio at `D:\Projects\Portfolio`. My logo is at
> `public/logo.svg`. Read `REFERENCE-ANALYSIS.md` for the target feel.
>
> Derive 3 distinct visual directions from my logo — each with a full colour
> token set (bg, surface, ink, ink-muted, accent, accent-2), a type pairing
> from Google Fonts or Fontshare (one condensed/display + one body), and a
> one-line rationale. Do NOT copy the reference's white + Anton + red.
>
> Build them as a single static HTML page I can open — three full-width
> panels, each showing a headline, body text, a button, and a mock case card
> in that direction. Publish it as an artifact so I can compare side by side.
> Don't start the real build until I pick one.

**Output:** you pick a direction → becomes `src/styles/tokens.css`.

---

## Phase 1 — Scaffold + shell

> Scaffold a Vite + React 19 + TypeScript project in `D:\Projects\Portfolio`
> (the folder has markdown files in it already — do not delete them, scaffold
> in place).
>
> Install: `lenis react-router three` + `@types/three`.
>
> Set up:
> - `src/styles/tokens.css` with the colour + type tokens from the direction I
>   picked, as CSS custom properties on `:root`
> - `src/styles/base.css`: reset, `body` background from tokens, font loading
>   with `font-display: swap`, and a `.u-container` max-width wrapper
> - `App.tsx` with react-router: `/`, `/about`, `/case/:slug`
> - `SiteHeader` — position: fixed, my location + DESIGN/ABOUT links + email
> - `SiteFooter` — email, socials, year
> - `Home.tsx` with three empty full-height sections so I can scroll
>
> No animation yet. Run `npm run dev` and screenshot it so I can see the
> typography and spacing are right before we add motion.

---

## Phase 2 — Lenis + the one scroll hook

> Add smooth scroll and the scroll-progress primitive everything else uses.
>
> 1. Wrap the app in `<ReactLenis root>` from `lenis/react`. Use **lerp mode**
>    (`lerp: 0.1`) — per the Lenis source, `lerp` and `duration` are mutually
>    exclusive modes, so set one and leave the other alone. Note that Lenis
>    already respects `prefers-reduced-motion` by default
>    (`respectReducedMotion: true`) — do not disable it.
>
> 2. Write `src/hooks/useScrollProgress.ts`:
>    - takes a ref + optional offset config
>    - returns a **ref object**, not state — `{ current: number }` 0→1
>    - updates inside a single shared `requestAnimationFrame` loop
>    - **Never call setState from the scroll loop.** Consumers write directly
>      to DOM via refs. This is the single most important perf rule in this
>      codebase: state updates at 60fps will destroy the frame budget.
>    - uses `ResizeObserver` to recompute element bounds, not a resize listener
>    - any manual listener uses `addEventListener` with `{ passive: true }`
>
> 3. Write `src/hooks/usePrefersReducedMotion.ts` — matchMedia +
>    `addEventListener('change')`, returns boolean.
>
> 4. Demo it: one box that changes opacity with scroll progress. Verify in
>    DevTools Performance that we stay at 60fps with no layout thrash.

---

## Phase 3 — Hero `[needs A2]`

> Build the hero section using `public/characters/hero.webp`.
>
> - Full-viewport, `position: sticky; top: 0`, the content below scrolls over it
> - Character centred, with a subtle scroll-driven parallax (translateY only —
>   compositor-only property, no layout)
> - Large display type, split into lines, each line rising on mount with a
>   staggered CSS transition
> - Serve the character as `<picture>` with an AVIF source and a WebP fallback,
>   `fetchpriority="high"` — it's the LCP element
>
> **Critical:** audit every ancestor of the sticky hero for `overflow: hidden`.
> Per css-overflow-3, `hidden` is a scrollable value and creates a scroll
> container, which makes sticky silently fail. Use `overflow: clip` anywhere
> clipping is needed.
>
> Under `prefers-reduced-motion`, drop the parallax and render the character
> static.

---

## Phase 4 — Sticky case stack ⭐

> This is the signature effect — the highest impact per line in the whole build.
>
> Create `src/data/cases.ts` with a typed `Case[]` — for now, 3 entries of
> placeholder content matching the shape in BUILD-PLAN.md section A5.
>
> Build `CaseStack` + `CaseCard`:
> - `.case-stack` is a tall container; each `.case-card` is
>   `position: sticky; top: 64px`, with an ascending inline `z-index`
> - Each card carries its own accent as an inline CSS var (`--case-ink`), like
>   the reference does
> - Cards pin, then the next slides over the previous
> - Use `useScrollProgress` per card to scale + dim the outgoing card as the
>   next covers it — write `transform` and `opacity` directly to the ref, never
>   through state
>
> Again: no `overflow: hidden` on any ancestor. Use `overflow: clip`.
>
> Screenshot mid-scroll so I can confirm the stacking reads correctly.

---

## Phase 5 — Frame-sequence phone mockup `[needs A3]`

> Build the scroll-scrubbed phone. **We are using a frame sequence, not video
> scrubbing** — `fastSeek()` never shipped in Chrome or Edge, and every
> `currentTime` seek decodes from the preceding keyframe forward, which makes
> video scrubbing unpredictable.
>
> 1. Convert my recordings in `public/raw/`:
>    `ffmpeg -i raw/caseN.mp4 -vf "fps=30,scale=540:-1" -q:v 80 public/frames/caseN/%03d.webp`
>
> 2. Write `src/hooks/useFrameSequence.ts`:
>    - preloads frames with `createImageBitmap` (decodes off the main thread)
>    - draws the frame matching scroll progress to a `<canvas>`
>    - only redraws when the frame index actually changes
>    - shows frame 001 until preload completes
>
> 3. Wrap it in a CSS phone bezel (I'll build the bezel — no asset needed).
>
> 4. Lazy-load each sequence behind an `IntersectionObserver` with a generous
>    rootMargin. Do not preload all three on page load.
>
> Under `prefers-reduced-motion`, render a single static frame.

---

## Phase 6 — three.js gallery carousel `[needs A4]`

> Build the 3D carousel with three.js r186.
>
> - Ring of `PlaneGeometry` meshes textured from `public/work/*.webp`
> - Rotation driven by scroll progress, plus pointer drag with inertia
> - `PerspectiveCamera`, slight depth fade toward the back of the ring
>
> Three r186-specific requirements, from the official docs:
> - `WebGLRenderer` defaults `alpha`, `antialias`, and `stencil` to **false** —
>   set them explicitly if you want them
> - Do **not** call `setPixelRatio(devicePixelRatio)`; the manual says this is
>   strongly not recommended. Compute `clientWidth * devicePixelRatio`, call
>   `setSize(w, h, false)`, and cap the buffer at 3840×2160
> - If you use `ImageBitmapLoader`, it ignores `Texture.flipY` — pass
>   `setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' })` or the
>   planes render upside down
>
> Full `dispose()` cleanup in the effect return: geometries, materials,
> textures, renderer, and cancel the rAF.
>
> Under `prefers-reduced-motion` **or** on viewports under 768px, skip three.js
> entirely and render a plain CSS grid of the images — don't ship 600KB to a
> phone for decoration.

---

## Phase 7 — Case detail pages `[needs A5]`

> Fill `src/data/cases.ts` with my real content (I'll paste it) and build
> `CaseDetail.tsx` at `/case/:slug`:
>
> - Hero with the case accent colour, title, tags, role, timeline, stack
> - Sections: The Problem / What I Built / The Hard Part / Outcome
> - Screenshot gallery
> - Live link + repo link, with sane handling when a case has neither
> - Prev/next case navigation at the bottom
> - Fixed back button, like the reference's `.case-back`
> - Per-route `<title>` and `<meta name="description">`

---

## Phase 8 — Loader, transitions, about, polish `[needs A6]`

> 1. `IntroLoader` — fixed overlay with explicit states (`enter → fade → done`)
>    as CSS classes driven by React state. Gate on `document.fonts.ready` plus
>    the hero image decode, with a 2s hard timeout so it can never hang.
>
> 2. Route transitions — a fixed veil element that wipes in on navigate and out
>    on arrival, matching the reference's `.case-exit-veil`.
>
> 3. `About.tsx` from the content I send.
>
> 4. Marquee — CSS `@keyframes` translating a duplicated track by -50%. Pure
>    CSS, no JS.
>
> 5. Accessibility pass:
>    - Everything clickable is a real `<button>` or `<a>`, focus-visible styled
>    - Full `prefers-reduced-motion` audit across every component
>    - **If any hero animation autoplays and loops longer than 5 seconds, it
>      needs a visible pause control** — WCAG 2.2.2 is Level A and this one is
>      not optional. (Scroll-driven motion is 2.3.3, Level AAA — nice to have.)
>    - Colour contrast ≥4.5:1 on body text
>
> 6. Generate a favicon set and an OG share image from my logo.
>
> 7. Mobile pass — under 768px: no carousel WebGL, no frame scrubbing (static
>    frame), sticky stack simplified to sequential cards if it feels janky on
>    iOS Safari.

---

## Phase 9 — Deploy `[needs A7]`

> Build and deploy to Vercel on `dannzone.site`.
>
> - `vercel.json` with an SPA rewrite so deep links to `/case/:slug` don't 404
> - Long-cache headers on `/assets/*` and `/frames/*` (hashed filenames)
> - `npm run build` and report the bundle size, split by chunk. Flag anything
>   over 200KB gzipped. three.js should be in its own lazy chunk, not the main
>   bundle — verify it is.
> - `robots.txt` + `sitemap.xml`
> - Tell me the exact DNS records to add at my registrar.

---

## Verification

Run after Phase 8, before deploy:

```bash
npm run build && npx vite preview
```

- [ ] Lighthouse on the preview build: Performance ≥90 mobile, Accessibility 100
- [ ] three.js is a lazy chunk, absent from the initial bundle
- [ ] DevTools → Rendering → "Paint flashing": scrolling repaints nothing
      outside the canvas
- [ ] DevTools → Performance while scrolling the full page: no long tasks >50ms
- [ ] OS reduced-motion on → no parallax, no scrub, no carousel spin
- [ ] Real iOS Safari + real Android Chrome, not just DevTools emulation
- [ ] Keyboard-only: tab through every interactive element, focus always visible
- [ ] Deep-link `dannzone.site/case/<slug>` directly — must not 404

---

## Start here

1. Send me **A1 (logo)** → I run Phase 0 and show you 3 directions.
2. While you look at those, start generating **A2 (hero character)** and
   recording **A3 (phone captures)** — those are the long-lead items.
3. Pick a direction → Phases 1, 2, 4 run back to back and give you the
   signature sticky-stack effect with placeholder content, no assets required.
