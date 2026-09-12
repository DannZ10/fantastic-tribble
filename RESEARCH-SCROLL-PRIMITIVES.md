# Research: Scroll-Driven Site Primitives

Primary-source investigation ahead of implementation. Reference site: `s0animation.com` (Vite + React + Lenis + vanilla three.js, no animation library).

**Method:** every claim below is traced to a spec, an official doc page, or library source on GitHub. Blog posts and tutorials were not used. Where a claim could not be traced to a primary source, it is marked `UNVERIFIED` rather than filled in.

**Date of research:** 2026-09-12. Version numbers are current as of that date.

---

## 1. Lenis

### Version and packaging

Current published version is **1.3.26** ([npm registry, `lenis/latest`](https://registry.npmjs.org/lenis/latest)). The package ships subpath exports for `./react`, `./vue`, `./nuxt`, `./snap`, and `./dist/*`, with `react (>=17.0.0)` declared as an **optional** peer dependency ([same source](https://registry.npmjs.org/lenis/latest)). Module entry is `./dist/lenis.mjs`.

Repo: [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis). Licence MIT.

### The options object — source of truth vs. README

The README publishes an options table, but the **constructor source disagrees with it on one field that matters**. Destructured defaults from [`packages/core/src/lenis.ts`](https://github.com/darkroomengineering/lenis/blob/main/packages/core/src/lenis.ts):

```ts
{
  wrapper = window,
  content = document.documentElement,
  eventsTarget = wrapper,
  smoothWheel = true,
  syncTouch = false,
  syncTouchLerp = 0.075,
  touchInertiaExponent = 1.7,
  duration,                       // <- NO default
  easing,                         // <- NO default
  lerp = 0.1,
  infinite = false,
  orientation = 'vertical',
  gestureOrientation = orientation === 'horizontal' ? 'both' : 'vertical',
  touchMultiplier = 1,
  wheelMultiplier = 1,
  autoResize = true,
  prevent,
  virtualScroll,
  overscroll = true,
  autoRaf = false,
  anchors = false,
  autoToggle = false,
  allowNestedScroll = false,
  __experimental__naiveDimensions = false,
  naiveDimensions = __experimental__naiveDimensions,
  stopInertiaOnNavigate = false,
  respectReducedMotion = true,
}
```

> **CONFLICT — resolve in favour of source.** The [README options table](https://github.com/darkroomengineering/lenis/blob/main/README.md) lists `duration` with a default of `1.2`. The constructor destructuring assigns **no default** to `duration`. The two modes are mutually exclusive: Lenis runs in **lerp mode** (framerate-independent exponential smoothing, `lerp = 0.1`) unless you supply `duration`/`easing`, in which case it runs in **duration mode**. Passing both is contradictory. Treat the README's `1.2` as documentation drift and pick one mode explicitly.

The default easing, per the [`LenisOptions` JSDoc in `packages/core/src/types.ts`](https://github.com/darkroomengineering/lenis/blob/main/packages/core/src/types.ts), is `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` — an exponential ease-out, applied only when duration mode is active.

Notable fields the README table omits entirely, documented in `types.ts`:

| Option | Default | JSDoc |
|---|---|---|
| `respectReducedMotion` | `true` | "Honor the user's `prefers-reduced-motion` setting" |
| `stopInertiaOnNavigate` | `false` | "Lenis will stop inertia when an internal link is clicked" |
| `allowNestedScroll` | `false` | "Allow nested scroll" |
| `autoToggle` | `false` | "Lenis will automatically start/stop based on wrapper's overflow property" |
| `overscroll` | `true` | "Enable overscroll on nested Lenis instance, similar to CSS `overscroll-behavior`" |
| `naiveDimensions` | `false` | "be careful this has performance impact" |
| `syncTouchLerp` | `0.075` | lerp intensity used when `syncTouch` is on |
| `touchInertiaExponent` | `1.7` | "Manage the strength of `syncTouch` inertia" |

`anchors` (`false`) enables Lenis's own handling of in-page anchor links; `smoothWheel` (`true`) is the mouse-wheel smoothing; `syncTouch` (`false`) mimics touch-device inertia on top of native touch scroll and is the field most likely to cause mobile grief if flipped casually.

### `respectReducedMotion` is real and on by default

This is load-bearing for section 5, so it was verified in source rather than docs. In [`packages/core/src/lenis.ts`](https://github.com/darkroomengineering/lenis/blob/main/packages/core/src/lenis.ts):

```ts
// ~line 43
private readonly reducedMotionMediaQuery = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
)

// ~line 629
get prefersReducedMotion() {
  return (
    this.options.respectReducedMotion &&
    this.reducedMotionMediaQuery.matches
  )
}

// ~line 509 — inside the scroll path
if (this.prefersReducedMotion) {
  if (programmatic) {
    // jump cut instead of animation
    immediate = true
```

So **Lenis already honours `prefers-reduced-motion: reduce` out of the box** and jump-cuts programmatic scrolls instead of animating them. This does *not* cover our own scroll-driven animations — see section 5.

### React integration

Two supported shapes, per the [`packages/react/README.md`](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md):

**A. `<ReactLenis>` with its own rAF (simplest).**

```jsx
import 'lenis/dist/lenis.css'
import { ReactLenis, useLenis } from 'lenis/react'
```

Props documented: `root` (exposes the instance globally to `useLenis` from anywhere; `root="asChild"` renders wrapper elements for a custom scroll container while keeping global access), `options` (the Lenis options object above), and `ref` (the instance is reached as **`ref.current.lenis`**, not `ref.current`).

`useLenis(callback?, deps?, priority?)` returns the instance and optionally registers a scroll callback with an execution-order priority.

**B. Manual raf loop (required if anything else owns the frame).** Per the same README: set `options={{ autoRaf: false }}` and drive it yourself with `ref.current?.lenis?.raf(time)`. The README's own examples do this for GSAP (`gsap.ticker.add(update)`) and Framer Motion (`frame.update(update, true)`).

Note the core default is `autoRaf = false`; `ReactLenis` supplies its own loop unless you opt out.

### CSS is not optional

The README instructs importing `lenis/dist/lenis.css`. The stylesheet's classes (`.lenis`, `.lenis-smooth`, `.lenis-stopped`) are referenced by the recommended-CSS section of the README. The `autoToggle` option additionally depends on the CSS `transition-behavior` property and therefore requires **Safari > 17.3, Chrome > 116, Firefox > 128** ([README](https://github.com/darkroomengineering/lenis/blob/main/README.md)).

### Interaction with `position: sticky`

The README's claim, verbatim:

> "Runs on native scroll — wraps the browser's own scroll, so position: sticky, anchor links, and accessibility keep working"

([README](https://github.com/darkroomengineering/lenis/blob/main/README.md))

This is the architectural difference from transform-based smooth-scroll libraries: Lenis drives the real scroll position, so the browser's own sticky layout algorithm (section 2) runs normally. **Sticky failures in a Lenis project are therefore almost always CSS problems, not Lenis problems.** Debug them by disabling Lenis first — if sticky is still broken, it was never Lenis.

### `data-lenis-prevent` attributes

Documented in the [README](https://github.com/darkroomengineering/lenis/blob/main/README.md):

```html
<div data-lenis-prevent>            <!-- scrolls natively, both axes, wheel + touch -->
<div data-lenis-prevent-wheel>      <!-- wheel only -->
<div data-lenis-prevent-touch>      <!-- touch only -->
<div data-lenis-prevent-vertical>   <!-- vertical only -->
<div data-lenis-prevent-horizontal> <!-- horizontal only -->
```

Programmatic equivalent: `new Lenis({ prevent: (node) => node.classList.contains('modal') })`.

These matter for any internally-scrollable region — modals, code blocks, overflow panels — which would otherwise have their wheel events swallowed by the page-level smoothing.

### Instance API

`scrollTo(target, options)` (number, CSS selector, or element), `raf(time)`, `resize()`, `start()` / `stop()`, `destroy()`. Events: `scroll` and `virtual-scroll` (`{ deltaX, deltaY, event }`). ([README](https://github.com/darkroomengineering/lenis/blob/main/README.md))

---

## 2. CSS `position: sticky`

### What the spec actually says

Per [CSS Positioned Layout Level 3, § sticky positioning](https://drafts.csswg.org/css-position-3/#sticky-pos), sticky is "same as relative, except the offsets are calculated automatically to keep the element in view as the user scrolls."

The two constraints that govern every sticky bug:

**(a) The reference rectangle comes from a scroll container, not from the viewport.**

> "the inset properties represent insets from the respective edges of the [scrollport](https://drafts.csswg.org/css-overflow-3/#scrollport) of the **nearest scroll container with a matching scrollable axis**" — this defines the **sticky view rectangle**. ([css-position-3](https://drafts.csswg.org/css-position-3/#sticky-pos))

**(b) The element can never escape its containing block.**

> "the box must be visually shifted (as for relative positioning) to be inward of that sticky view rectangle edge, **insofar as it can while its position box remains contained within its containing block**." ([css-position-3](https://drafts.csswg.org/css-position-3/#sticky-pos))

MDN states the same pair, adding the stacking-context effect:

> "The element is positioned according to the normal flow of the document, and then offset relative to its *nearest scrolling ancestor* and containing block (nearest block-level ancestor) … The offset does not affect the position of any other elements." — and sticky "always creates a new stacking context." ([MDN, `position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position))

**(c) A threshold is mandatory.**

> "At least one inset property … needs to be set to a non-`auto` value for the axis on which the element needs to be made sticky." If both inset properties on an axis are `auto`, "on that axis the `sticky` value will behave as `relative`." ([MDN, `position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position))

The spec's wording: "If both inset properties in a given axis are auto, no offsets are added in that axis; the element stays where it was laid out in that axis. Otherwise, auto insets represent zero insets." ([css-position-3](https://drafts.csswg.org/css-position-3/#sticky-pos))

### The silent failures, in order of how often they bite

**Failure 1 — an ancestor has `overflow: hidden` / `auto` / `scroll`.** This is the big one, and the spec is unambiguous about why:

> "The `scroll`, `auto`, and `hidden` values are known as the **scrollable values** of `overflow`. They cause the box to be a **scroll container** and the affected axis to be a **scrollable axis**." ([CSS Overflow Level 3](https://drafts.csswg.org/css-overflow-3/#scroll-container))

`overflow: hidden` counts. The spec is explicit that `hidden` still establishes a scroll container — the UA "must not provide any scrolling user interface … nor allow scrolling by direct intervention of the user … However, the content must still be scrollable programmatically." ([css-overflow-3](https://drafts.csswg.org/css-overflow-3/#scroll-container))

MDN states the consequence directly: a sticky element "sticks to its nearest ancestor that has a 'scrolling mechanism' (created when `overflow` is `hidden`, `scroll`, `auto`, or `overlay`), **even if that ancestor isn't the nearest actually scrolling ancestor**." ([MDN, `position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position))

So an `overflow: hidden` wrapper — the sort added reflexively to stop a horizontal scrollbar — retargets the sticky element to a box that never scrolls. The element renders in its static position and never moves. No error, no warning.

**The fix is at the spec level, not a hack:** use `overflow: clip` instead. Per [css-overflow-3](https://drafts.csswg.org/css-overflow-3/#scroll-container), `clip` is *not* a scrollable value — "`overflow: clip` forbids scrolling entirely, through any mechanism" — so it clips without establishing a scroll container, and descendant sticky elements keep binding to the real scroller. Pair it with `overflow-clip-margin` if you need bleed.

**Failure 2 — an ancestor has `contain`.** Per [MDN's `contain` page](https://developer.mozilla.org/en-US/docs/Web/CSS/contain):

> "Using `layout`, `paint`, `strict` or `content` values for this property creates: 1. A new containing block (for the descendants whose `position` property is `absolute` or `fixed`). 2. A new stacking context. 3. A new block formatting context."

`strict` = `size layout paint style`; `content` = `layout paint style` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)). `paint` additionally means "if a descendant overflows the containing element's bounds, then that descendant will be clipped to the containing element's overflow clip edge."

> `UNVERIFIED` — the normative numbered effect lists in [CSS Containment Level 2 §3.3 / §3.5](https://drafts.csswg.org/css-contain-2/#containment-paint) could not be retrieved in full (the fetched document truncated before those sections). The containing-block and clipping consequences above are stated on MDN and are consistent with the spec's prose summary ("layout containment ensures that the containment box is totally opaque for layout purposes"; "paint containment ensures that the descendants of the containment box don't display outside its bounds"), but the exact normative bullets are not quoted here. **The specific claim "`contain` breaks sticky" is not directly stated by either source** — it is an inference from the containing-block change plus the clipping. Verify empirically before relying on it.

**Failure 3 — the containing block has no slack.** Constraint (b) means a sticky element can only travel as far as its containing block's box allows. If the sticky element's parent is exactly as tall as the sticky element, there is zero travel and it appears not to stick. This is the mechanism behind the classic flex/grid confusion: sticky *does* work on flex and grid items, but a flex item under the default `align-items: stretch` is stretched to the full height of the flex line, so its own box fills the containing block and there is nowhere to move. Setting `align-self: start` restores the travel.

> `UNVERIFIED` — no primary source was found that states the flex/grid interaction in those terms. The reasoning above follows from the spec's containing-block constraint ([css-position-3](https://drafts.csswg.org/css-position-3/#sticky-pos)) plus standard flex stretch behaviour, but neither the CSS Position spec nor MDN's `position` page addresses flex/grid parents for sticky explicitly. Treat the `align-self: start` remedy as a well-founded hypothesis to test, not a cited fact.

### Practical checklist

1. A non-`auto` inset on the axis you want. (`top: 0`, not just `position: sticky`.)
2. No ancestor between the element and the real scroller with `overflow` of `hidden`/`auto`/`scroll`. Use `clip` when you need clipping.
3. No ancestor with `contain: layout | paint | strict | content`.
4. A containing block taller than the sticky element.
5. Remember it creates a stacking context — `z-index` on siblings behaves accordingly.

---

## 3. Scroll-scrubbed video vs. frame sequence

### `currentTime`, `seeking` / `seeked`, `fastSeek()`

From the [HTML Standard, § 4.8.11.9 Seeking](https://html.spec.whatwg.org/multipage/media.html#seeking) (developer edition text):

- `media.seeking` — "Returns true if the user agent is currently seeking."
- `media.seekable` — "Returns a `TimeRanges` object that represents the ranges of the media resource to which it is possible for the user agent to seek."
- `media.fastSeek(time)` — "**Seeks to near the given time as fast as possible, trading precision for speed.** (To seek to a precise time, use the `currentTime` attribute.) This does nothing if the media resource has not been loaded."

The `seeking` event fires when a seek starts (the `seeking` attribute has become `true`); `seeked` fires when it completes. Both are non-cancelable, non-bubbling generic `Event`s, and MDN reports them as **Baseline: Widely available**, supported across browsers since July 2015 ([MDN, `seeking` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeking_event)).

> `UNVERIFIED` — the full normative numbered "seek" algorithm, the `currentTime` setter steps, and the exact wording of the **approximate-for-speed** flag could not be retrieved. Both the multipage and developer-edition versions of `media.html` truncated before §4.8.11.9's algorithm body. The `fastSeek` IDL description above *was* retrieved verbatim. The approximate-for-speed flag is referenced in the spec and relates `fastSeek()` to snapping to a nearby resumable position, but the normative text is not quoted here — read [the section](https://html.spec.whatwg.org/multipage/media.html#seeking) directly before depending on its edge-case wording.

### `fastSeek()` is not usable

This kills the obvious optimisation. From [MDN browser-compat-data, `api/HTMLMediaElement.json`](https://github.com/mdn/browser-compat-data/blob/main/api/HTMLMediaElement.json):

```json
"support": {
  "chrome":     { "version_added": false, "impl_url": "https://crbug.com/41276303" },
  "chrome_android": "mirror",
  "edge":       "mirror",
  "firefox":    { "version_added": "31" },
  "safari":     { "version_added": "8" },
  "safari_ios": "mirror"
}
```

**`fastSeek()` has never shipped in Chrome or Edge.** MDN flags the page "Limited availability — This feature is not Baseline because it does not work in some of the most widely-used browsers" ([MDN, `fastSeek`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/fastSeek)). Any scrub implementation must assume precise `currentTime` seeking on the majority of traffic.

### Why seeking is expensive — the dependency mechanism

The honest primary-source account of *why* seeks cost what they cost:

**Compressed video frames are not independently decodable.** W3C WebCodecs defines a **key chunk** as "an encoded chunk that does not depend on any other frames for decoding. Also commonly referred to as a 'key frame'", with `EncodedVideoChunkType` being `"key"` or `"delta"`, delta chunks depending on previously decoded frames ([W3C WebCodecs](https://www.w3.org/TR/webcodecs/)).

**A decoder cannot start mid-GOP.** WebCodecs makes this normative: `configure()` assigns `true` to the internal `[[key chunk required]]` slot, and `decode()` throws a `DataError` if a non-`key` chunk arrives while that is set. `reset()` "resets all state including configuration" and returns the decoder to requiring a key chunk ([W3C WebCodecs](https://www.w3.org/TR/webcodecs/)).

**Container-level seeking targets keyframes.** FFmpeg — the software decode path Chromium uses — documents `av_seek_frame()` as "**Seek to the keyframe at timestamp**", with `AVSEEK_FLAG_ANY` meaning "non-keyframes are treated as keyframes (this may not be supported by all demuxers)" ([FFmpeg libavformat decoding docs](https://ffmpeg.org/doxygen/trunk/group__lavf__decoding.html)).

Composing these three: a precise seek to time *T* requires locating the keyframe at or before *T*, then decoding every intervening delta frame forward to *T*. Cost is therefore proportional to the distance from the preceding keyframe — i.e. to the GOP length — not to the distance the user scrubbed.

> `UNVERIFIED` — **the specific claim "seeking backwards is slower than seeking forwards" was not confirmed against a browser-engine source.** Searches of chromium.googlesource.com, the Chromium and WebKit issue trackers, and MDN produced no primary statement of a forward/backward asymmetry. The mechanism above (keyframe + forward decode) is fully sourced and is direction-agnostic on its face; a plausible asymmetry is that small *forward* seeks can sometimes continue from live decoder state while any *backward* seek forces a decoder reset and restart from the preceding keyframe — but no source was found that states this. Do not put this in a design doc as fact. It is also worth noting that W3C's own working group has an open question titled ["is requiring support for 100% accurate video seeking reasonable with hardware video decoders?"](https://github.com/w3c/webmediaporting/issues/7), which indicates exact seeking is a known cost centre, though the thread is discussion, not a normative statement.

### The frame-sequence-on-canvas alternative

**`createImageBitmap()`** — per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) — "creates a bitmap from a given source, optionally cropped … and returns a `Promise` which resolves to an `ImageBitmap`." It accepts `HTMLImageElement`, `SVGImageElement`, `HTMLVideoElement`, `HTMLCanvasElement`, `Blob`, `ImageData`, `ImageBitmap`, `OffscreenCanvas`, and `VideoFrame`. Options: `imageOrientation`, `premultiplyAlpha`, `colorSpaceConversion`, `resizeWidth`, `resizeHeight`, `resizeQuality`.

Two properties make it the right primitive here: it is **asynchronous** (decode does not block the main thread), and **`WorkerGlobalScope.createImageBitmap()` exists**, allowing off-main-thread bitmap decoding in a Web Worker ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)).

The trade is memory and bytes-over-the-wire: N independently-decodable stills against one inter-frame-compressed file. But every frame is O(1) to display and direction is irrelevant — which is precisely the property scrubbing needs and video seeking lacks.

**`requestVideoFrameCallback()`** — [HTMLVideoElement.requestVideoFrameCallback(), WICG](https://wicg.github.io/video-rvfc/), a Draft Community Group Report (published 2024-08-02, so **not a W3C Recommendation**). IDL:

```webidl
unsigned long requestVideoFrameCallback(VideoFrameRequestCallback callback);
undefined cancelVideoFrameCallback(unsigned long handle);
```

`VideoFrameCallbackMetadata` supplies `presentationTime` ("the time at which the user agent submitted the frame for composition"), `expectedDisplayTime`, `width`, `height`, `mediaTime` (media presentation timestamp in seconds), `presentedFrames` ("a count of the number of frames submitted for composition"), and optional `processingDuration`. Scheduling: "**The new callbacks are executed immediately before existing `window.requestAnimationFrame()` callbacks.**"

Support, per [MDN browser-compat-data, `api/HTMLVideoElement.json`](https://github.com/mdn/browser-compat-data/blob/main/api/HTMLVideoElement.json): Chrome/Edge **83**, Safari **15.4**, Firefox **132**. Broadly available now.

> `UNVERIFIED` — the spec text retrieved does not address whether `requestVideoFrameCallback` fires while the video is paused or seeking. This matters for a scrub implementation (it is the natural way to know a seek's frame has actually landed). Test it, or read the spec's frame-presentation steps directly.

---

## 4. three.js

### Current version

**r186**, published **2026-09-08** ([GitHub Releases API, `mrdoob/three.js`](https://api.github.com/repos/mrdoob/three.js/releases/latest)). The brief referenced r185; r186 is out.

`WebGLRenderer` "uses WebGL 2 to display scenes. WebGL 1 support was dropped after r163" ([WebGLRenderer docs](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)).

### `WebGLRenderer` constructor options and their real defaults

From the [WebGLRenderer documentation page](https://threejs.org/docs/#api/en/renderers/WebGLRenderer) ([source](https://github.com/mrdoob/three.js/blob/dev/docs/pages/WebGLRenderer.html.md)):

| Option | Default |
|---|---|
| `canvas` | `null` (one is created) |
| `context` | `null` |
| `precision` | `'highp'` |
| `alpha` | **`false`** |
| `premultipliedAlpha` | `true` |
| `antialias` | **`false`** |
| `stencil` | **`false`** |
| `preserveDrawingBuffer` | `false` |
| `powerPreference` | `'default'` |
| `failIfMajorPerformanceCaveat` | `false` |
| `depth` | `true` |
| `logarithmicDepthBuffer` | `false` |
| `reversedDepthBuffer` | `false` |
| `outputBufferType` | `UnsignedByteType` |

Worth flagging: `alpha` and `stencil` both default to `false`, and `antialias` defaults to `false`. If the canvas must composite over page content, `alpha: true` is required explicitly.

`powerPreference` accepts `'default' | 'low-power' | 'high-performance'`.

### `setPixelRatio` — the docs recommend *against* the common pattern

This contradicts the near-universal `renderer.setPixelRatio(window.devicePixelRatio)` idiom. The three.js manual, verbatim:

> "After that any calls to `renderer.setSize` will magically use the size you request multiplied by whatever pixel ratio you passed in. **This is strongly NOT RECOMMENDED.**"

([three.js manual, Responsive Design](https://threejs.org/manual/#en/responsive) — [source](https://github.com/mrdoob/three.js/blob/dev/manual/pages/responsive.html))

The stated reasoning: using `setPixelRatio` makes it ambiguous whether a given value is the requested size or the actual drawing-buffer size, which breaks post-processing, shaders, screenshots, and pixel reads. The manual's recommended pattern instead multiplies explicitly at resize time:

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = Math.floor(canvas.clientWidth  * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);   // false = don't touch CSS size
  }
  return needResize;
}
```

The manual additionally advises capping the internal resolution so the drawing buffer stays within safe bounds, using **3840×2160** as the example default, to avoid excessive GPU load and power draw on systems with fractional UI scaling ([three.js manual, Responsive Design](https://threejs.org/manual/#en/responsive)).

Also documented on `WebGLRenderer`: `.setAnimationLoop(callback)` — "**Applications are advised to always define the animation loop with this method**" rather than `requestAnimationFrame()` ([WebGLRenderer docs](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)). Note this conflicts operationally with driving Lenis from a single shared rAF; see Decisions.

### `TextureLoader` vs. `createImageBitmap` / `ImageBitmapLoader`

`TextureLoader` uses `ImageLoader` internally and "has dropped support for progress events in r84" ([TextureLoader docs](https://threejs.org/docs/#api/en/loaders/TextureLoader)). The docs page does not state what `colorSpace` the resulting texture carries — set it explicitly (see below).

`ImageBitmapLoader` "provides an asynchronous and resource efficient pathway to prepare textures for rendering" ([ImageBitmapLoader docs](https://threejs.org/docs/#api/en/loaders/ImageBitmapLoader) — [source](https://github.com/mrdoob/three.js/blob/dev/docs/pages/ImageBitmapLoader.html.md)). Three caveats, all documented:

1. **`Texture.flipY` and `Texture.premultiplyAlpha` are ignored with image bitmaps.** They must be set via `setOptions()` before loading. To reproduce default `Texture` behaviour: `{ imageOrientation: 'flipY', premultiplyAlpha: 'none' }`. Forgetting this yields vertically-flipped textures.
2. Caching differs from `FileLoader`: "this loader will only avoid multiple concurrent requests to the same URL if `Cache` is enabled."
3. "the cache key is based on the URL only. **Loading the same URL with different options will return the cached result of the first request.**"

`onProgress` is unsupported. `.setOptions()` takes the same parameters as the Web API's `createImageBitmap()`.

### Color management defaults

Confirmed in source — [`src/math/ColorManagement.js`](https://github.com/mrdoob/three.js/blob/dev/src/math/ColorManagement.js):

```js
enabled: true,
workingColorSpace: LinearSRGBColorSpace,
```

The manual confirms: "THREE.ColorManagement is enabled by default" ([three.js manual, Color Management](https://threejs.org/manual/#en/color-management) — [source](https://github.com/mrdoob/three.js/blob/dev/manual/pages/color-management.html)).

Texture annotation rules, verbatim from that manual page:

> "PNG or JPEG `Texture` containing color information (like `.map` or `.emissiveMap`) use the closed domain sRGB color space, and **must be annotated with `texture.colorSpace = SRGBColorSpace`**."

> "Textures that do not store color information (like `.normalMap` or `.roughnessMap`) do not have an associated color space, and generally use the (default) texture annotation of `texture.colorSpace = NoColorSpace`."

`WebGLRenderer.outputColorSpace` defaults to `SRGBColorSpace` ([WebGLRenderer docs](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)).

> `UNVERIFIED` — the release in which color management became the default is not stated on either the manual page or the `ColorManagement` docs. Not decision-relevant if we are on r186.

### Disposal

From the [How to dispose of objects guide](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects) ([source](https://github.com/mrdoob/three.js/blob/dev/manual/pages/how-to-dispose-of-objects.html)):

> "*three.js* creates for specific objects like geometries or materials WebGL related entities like buffers or shader programs which are necessary for rendering. **It's important to highlight that these objects are not released automatically.**"

On whether removing from the scene is enough:

> "No, you have to explicitly dispose the geometry and material via `dispose()`. **Keep in mind that geometries and materials can be shared among 3D objects like meshes.**"

Entities with `dispose()` per that guide: `BufferGeometry.dispose()`, `Material.dispose()`, `Texture.dispose()`, `WebGLRenderTarget.dispose()`, `Skeleton.dispose()`. Plus `WebGLRenderer.dispose()` — "Frees the GPU-related resources allocated by this instance" — and `.forceContextLoss()`, which simulates context loss (requires the `WEBGL_lose_context` extension) ([WebGLRenderer docs](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)).

The guide's suggested timing: "A good place for object disposal is when switching the level. The app could traverse through the old scene and dispose all obsolete materials, geometries and textures."

**r185 added a relevant convenience:** per the [Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide), "Object3D has now a `dispose()` method" — custom subclasses must call `super.dispose()`. This makes a `scene.traverse(o => o.dispose?.())`-shaped teardown viable where previously you had to walk geometry/material/texture by hand.

The React cleanup shape that follows from the above: in the effect's return function, cancel the animation loop, remove the resize listener, traverse and dispose geometries/materials/textures, dispose render targets, then `renderer.dispose()`. Shared resources must be disposed once, not per-mesh.

> `UNVERIFIED` — three.js docs contain no React-specific guidance; the effect-cleanup shape above is the direct consequence of the disposal rules, not a documented pattern.

### Recent breaking changes (from the [Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide))

**r186**
- The XR camera's transformation and projection matrix are derived from the first sub camera.
- `WebGLRenderer.setViewport()` and `WebGLRenderer.setScissor()` no longer scale by pixel ratio when a render target is bound.

**r185**
- `Object3D` has now a `dispose()` method (custom implementations must call `super.dispose()`).
- `BufferGeometryUtils.toTrianglesDrawMode()` does not clone the given geometry anymore.
- `Source` has been renamed to `TextureSource`.
- `LightProbeGrid` renamed to `LightProbeGridWebGL`; `PCFSoftShadowMap` with `WebGPURenderer` removed; `SimplifyModifier` reimplemented and `modify()` is now async; `GTAONode` `distanceExponent`/`distanceFallOff` deprecated.

**r184**
- **`FileLoader.load()` and `ImageBitmapLoader.load()` have no return value anymore.** (Relevant directly to texture loading.)
- Background and environment map rotation aligned to how 3D objects are rotated.
- `FBXLoader` auto-converts +Z-up models to +Y-up; `VTKLoader` deprecated; `FirstPersonControls` new interaction model.

**r183**
- `PostProcessing` renamed to `RenderPipeline`.
- **`Clock` has been deprecated. Please use `Timer` instead.**
- `MeshPostProcessingMaterial` removed; `WebGLCubeRenderTarget` can't be used with `WebGPURenderer`; Sky/SkyMesh gamma correction removed; SSRNode blending changed.

**r182**
- `PCFSoftShadowMap` with `WebGLRenderer` is now deprecated.
- `WebGPURenderer`'s `colorBufferType` renamed to `outputBufferType`.

---

## 5. `prefers-reduced-motion` and WCAG

### The media feature

[Media Queries Level 5, §12.1](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) defines `prefers-reduced-motion` with value `no-preference | reduce`:

- **`no-preference`** — the user has not expressed a preference for reduced motion.
- **`reduce`** — the user prefers that motion be minimized on the page. The spec ties this to "animations that create the illusion of movement", which can trigger motion sickness or affect those with vestibular disorders.

MDN adds the shorthand semantics: "`no-preference` … evaluates as false", and "`reduce` … evaluates as true; therefore `@media (prefers-reduced-motion)` is equivalent to `@media (prefers-reduced-motion: reduce)`" ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)). MDN's accessibility note: "Such animations can trigger discomfort for those with vestibular motion disorders. **Animations such as scaling or panning large objects can be vestibular motion triggers.**"

That last sentence describes a scroll-driven portfolio almost exactly.

MDN also maps the OS settings: macOS *Accessibility > Display > Reduce motion*; iOS *Accessibility > Motion*; Windows 11 *Accessibility > Visual Effects > Animation Effects*; Windows 10 *Ease of Access > Display > Show animations*; Android 9+ *Accessibility > Remove animations*; GNOME *Accessibility > Seeing > Reduced animation*.

### WCAG 2.2 — which criteria actually apply

**SC 2.2.2 Pause, Stop, Hide — Level A** ([WCAG 2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide)):

> For automatically starting content lasting over 5 seconds presented alongside other material: "there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential."

Plus the auto-updating clause: users must have "a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless the auto-updating is part of an activity where it is essential."

**SC 2.3.3 Animation from Interactions — Level AAA** ([WCAG 2.2](https://www.w3.org/TR/WCAG22/#animation-from-interactions)):

> "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."

Glossary definitions from the same document:
- **motion animation**: "addition of steps between conditions to create the illusion of movement or to give a sense of a smooth transition"
- **essential**: "if removed, would fundamentally change the information or functionality of the content, and information and functionality cannot be achieved in another way that would conform"

### What this means precisely for us

**2.3.3 is the one that governs scroll-scrubbed animation** — scroll is an interaction, and scrubbed motion is motion animation triggered by it. It is **Level AAA**, so it is not required for AA conformance. But it is cheap to satisfy and it is what the OS toggle is asking for.

**2.2.2 applies only to motion that starts automatically and runs > 5s without user input.** A scroll-scrubbed animation does not auto-start — it advances only as the user scrolls — so 2.2.2 does not bind it. It *does* bind any autoplaying loop: an autoplaying looping hero video, an idle ambient three.js animation that runs without scroll input, a marquee. Those need a pause/stop/hide mechanism at **Level A**.

**Precisely what must be disabled under `reduce` to conform to 2.3.3:**

1. Scroll-scrubbed transforms whose purpose is decorative — parallax layers, scale/pan of large elements, camera moves. Replace with the end state, or a cross-fade (opacity-only change is not "illusion of movement").
2. Smooth-scroll interpolation itself. Lenis handles this already via `respectReducedMotion: true` (section 1) — **do not set it to `false`**.
3. Scroll-scrubbed video / frame sequences. Show a representative still.
4. Any continuous three.js animation not driven by user input.

**What may stay:** motion that is *essential* per the glossary — i.e. where removing it would fundamentally change the information conveyed and it cannot be achieved another way. Decorative portfolio motion is essentially never essential. Opacity fades and instantaneous state changes are safe.

Two implementation notes, both sourced above: the media query must be honoured **at runtime, not just at load** — users toggle it — so use `matchMedia(...).addEventListener('change', ...)` the way Lenis does internally. And because `no-preference` evaluates false, write the guard as `@media (prefers-reduced-motion: reduce)` / `matchMedia('(prefers-reduced-motion: reduce)')` rather than testing for the absence of a preference.

---

## 6. Scroll performance in React

### Passive event listeners

[DOM Standard](https://dom.spec.whatwg.org/#dom-addeventlisteneroptions-passive) defines the `passive` member of `AddEventListenerOptions`:

> "When set to true, options's `passive` indicates that the callback will not cancel the event by invoking `preventDefault()`."

> "This is used to enable performance optimizations described in [§ 2.8 Observing event listeners]."

The rationale in the spec: touch and wheel events can block asynchronous scrolling; if all listeners are passive the browser can let scrolling proceed in parallel by making the event uncancelable.

The normative consequence — `preventDefault()` from a passive listener is silently ignored:

> "To set the canceled flag, given an event *event*, if *event*'s `cancelable` attribute value is true **and *event*'s in passive listener flag is unset**, then set *event*'s canceled flag." ([DOM Standard](https://dom.spec.whatwg.org/#dom-addeventlisteneroptions-passive))

**Default-passive algorithm** — this is the part that trips people up. Certain types are passive *by default*:

> "Return true if all of the following are true: *type* is one of `touchstart`, `touchmove`, `wheel`, or `mousewheel` … [and] *eventTarget* is a `Window` object, or is a node whose node document is *eventTarget*, or whose document element is *eventTarget*, or whose body element is *eventTarget*." ([DOM Standard](https://dom.spec.whatwg.org/#dom-addeventlisteneroptions-passive))

So a `wheel` listener on `window`, `document`, `<html>` or `<body>` is passive unless you pass `{ passive: false }` explicitly. This is exactly why Lenis must register its wheel listener non-passively — it needs `preventDefault()` to take over the scroll. Our own listeners should go the other way: `{ passive: true }` everywhere we only read.

Practically, in React: `onScroll`/`onWheel` JSX props give no control over listener options, so any listener that needs `{ passive: true }` (or needs to *not* be passive) must be attached with `addEventListener` inside an effect.

### `requestAnimationFrame` scheduling

Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), `requestAnimationFrame()` "tells the browser you want to perform an animation by requesting a callback function **before the next repaint**". Key properties:

- Callback frequency **matches the display refresh rate** (60Hz, but also 75/120/144Hz) — not a fixed 60.
- "Calls are automatically **paused in background tabs or hidden `<iframe>`s**" for performance and battery.
- One-shot: you must re-request each frame.
- The callback receives a `DOMHighResTimeStamp` "indicating the end time of the previous frame's rendering".
- MDN's explicit warning: "**Always use the timestamp argument to calculate animation progress.** Otherwise, the animation will run faster on high refresh-rate screens."

That last point is the argument for Lenis's lerp mode being framerate-aware, and the argument against any hand-rolled `position += 0.1 * delta` loop that ignores the timestamp.

The [HTML Standard's animation frames section](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames) defines `requestAnimationFrame(callback)` as storing the callback in the target's map of animation frame callbacks and returning a handle; "run the animation frame callbacks" then iterates the stored handles, removing each before invoking it with the current time.

> `UNVERIFIED` — the "update the rendering" algorithm in [§ event loop processing](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering), which specifies the *ordering* of "run the scroll steps", "run the animation frame callbacks", "update animations and send events" and intersection-observer steps within a frame, could not be retrieved (both fetches of that page truncated before the section). The ordering matters if we ever need to reason about whether a scroll event is observable before or after a given rAF callback within the same frame. Read it directly if that comes up.

### Why compositor-only properties skip layout

The pixel pipeline, per [web.dev, *Rendering performance*](https://web.dev/articles/rendering-performance) (Google first-party):

1. **JavaScript** — "typically used to handle work that will result in visual changes to the user interface"
2. **Style** — "the process of figuring out which CSS rules apply to which HTML elements based on matching selectors"
3. **Layout** — "the browser knows which rules apply to an element it can begin to calculate the geometry of the page, such as how much space elements take up"
4. **Paint** — "the process of filling in pixels. It involves drawing out text, colors, images, borders, shadows, and essentially every visual aspect"
5. **Composite** — "the parts of the page were potentially drawn onto multiple layers, they need to be applied to the screen in the correct order"

Three scenarios, per the same article: full pipeline for layout-affecting properties (width, height, position); **skip Layout** for paint-only properties (`background-image`, `color`, `box-shadow`); and for compositor-only properties, "jump straight to the compositing step" — skipping both Layout and Paint.

Budget: "the browser has 16.66 milliseconds to produce each frame", but practically "all of your work needs to be completed inside **10 milliseconds**". Missing it produces "jank".

Which properties qualify, per [web.dev, *Stick to compositor-only properties and manage layer count*](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count):

> "Today there are only two properties for which that is true — **`transform`s and `opacity`**"

— achieving "the best-performing version of the pixel pipeline [which] avoids both layout and paint, and only requires compositing changes."

So: animate `transform` and `opacity`. Animating `top`/`left`/`width`/`height` per scroll frame forces layout on every frame and will not hold 60fps.

### `will-change` — use sparingly

web.dev recommends promoting an element with `will-change: transform` or `transform: translateZ(0)` before animating it, but warns "every layer you create requires memory and management, and that's not free" and "**Do not promote elements unnecessarily**" — on memory-limited devices the cost of too many layers outweighs the benefit. Target ~4–5ms in compositing for performance-critical actions ([web.dev](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)).

The [CSS Will Change specification](https://drafts.csswg.org/css-will-change/) is blunter. `will-change: auto | <animateable-feature>#`, initial `auto`, applies to all elements; it "provides a rendering hint to the user agent, stating what kinds of changes the author expects to perform on the element." The advisory text:

> "Telling it to do so explicitly doesn't help anything, and in fact **has the capacity to do a lot of harm**; some of the stronger optimizations that are likely to be tied to `will-change` end up using a lot of a machine's resources, and when overused like this **can cause the page to slow down or even crash**."

> "Whenever you add `will-change` to an element, especially via scripting, **don't forget to remove it after the element is done changing**, so the browser can recover whatever resources the optimizations are claiming."

The spec also warns that putting `will-change` in a stylesheet "implies that the targeted elements are always a few moments away from changing", and that it should instead be toggled via script around the actual change.

---

## Decisions this supports

1. **Pin `lenis@1.3.26`. Use `<ReactLenis root>` from `lenis/react`, and import `lenis/dist/lenis.css`.** Reach the instance via `ref.current.lenis` (not `ref.current`). Go to a manual rAF loop (`options={{ autoRaf: false }}` + `ref.current.lenis.raf(t)`) only when something else needs to own the frame — which, given three.js is in the mix, it probably does.

2. **Pick lerp mode, not duration mode. Set `lerp` explicitly and leave `duration`/`easing` unset.** The source assigns no default to `duration` despite the README table claiming `1.2`; passing both modes' options is contradictory. Start at the default `lerp: 0.1`.

3. **Leave `respectReducedMotion` at `true`.** Lenis already jump-cuts programmatic scrolls under `prefers-reduced-motion: reduce` (verified in source). It does *not* cover our own animations — we still need our own guard.

4. **Ban `overflow: hidden` from any ancestor of a sticky element; use `overflow: clip` instead.** Per css-overflow-3, `hidden` is a *scrollable value* that establishes a scroll container and silently retargets sticky; `clip` is not. This should be a lint rule or at minimum a documented convention, because the failure is invisible.

5. **Every sticky element gets an explicit non-`auto` inset and a containing block with real slack.** Both are spec requirements, not conventions. Audit flex/grid parents for `align-items: stretch` removing the travel (mechanism inferred, not cited — test it).

6. **Prefer a frame sequence on canvas over a scroll-scrubbed `<video>`.** `fastSeek()` has never shipped in Chrome or Edge (BCD: `version_added: false`), so scrubbing falls back to precise `currentTime` seeking, which per WebCodecs + FFmpeg means locating the preceding keyframe and decoding every delta frame forward to the target. Frames are O(1) and direction-neutral. Decode them with `createImageBitmap` in a Worker.

7. **If we do use video, use `requestVideoFrameCallback` (Chrome 83 / Safari 15.4 / Firefox 132) to know when a seek's frame has landed** — but confirm first whether it fires while paused/seeking, which the spec text retrieved does not address.

8. **three.js r186. Construct the renderer with explicit options** — `alpha`, `antialias` and `stencil` all default to `false`, so any of those we want must be passed. Consider `powerPreference: 'high-performance'`.

9. **Do not call `renderer.setPixelRatio(window.devicePixelRatio)`.** The three.js manual says "strongly NOT RECOMMENDED". Multiply `clientWidth`/`clientHeight` by `devicePixelRatio` in a resize function and call `renderer.setSize(w, h, false)`, capping the buffer around 3840×2160.

10. **Load carousel textures with `ImageBitmapLoader`, and set `setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' })`** — `Texture.flipY` is ignored for image bitmaps, so skipping this gives upside-down planes. Be aware the cache key is URL-only, so the same URL with different options returns the first result. Annotate every colour texture with `texture.colorSpace = SRGBColorSpace`; `ColorManagement.enabled` is `true` by default (confirmed in source) and `outputColorSpace` is already `SRGBColorSpace`.

11. **Write the React effect cleanup as: cancel loop → remove listeners → traverse and dispose geometries/materials/textures → dispose render targets → `renderer.dispose()`.** Nothing is freed automatically. r185's new `Object3D.dispose()` makes a traverse-based teardown cleaner than hand-walking. Dispose shared resources once, not per-mesh.

12. **Guard every decorative animation behind `matchMedia('(prefers-reduced-motion: reduce)')`, subscribed to `change` at runtime.** WCAG 2.3.3 (Level AAA) is the criterion that governs scroll-triggered motion; satisfy it by rendering end states instead of scrubs. Separately, anything that autoplays and loops beyond 5s needs a pause/stop/hide control to meet SC 2.2.2 at **Level A** — that is not optional.

13. **Animate only `transform` and `opacity` in scroll handlers.** They are the only two compositor-only properties; everything else forces layout or paint per frame against a ~10ms budget.

14. **Attach scroll/wheel/touch listeners with `addEventListener` in effects, with explicit `passive`.** JSX `onScroll`/`onWheel` props give no control over listener options. Note `wheel`/`touchstart`/`touchmove` on `window`/`document`/`<html>`/`<body>` are already passive by default per the DOM spec.

15. **Use `will-change` sparingly and toggle it off after the animation.** Both web.dev and the CSS Will Change spec warn that blanket use can slow down or crash the page.

16. **Drive everything from one rAF loop.** Use the `DOMHighResTimeStamp` argument for all progress math — rAF matches display refresh rate, so ignoring it makes animations run faster on 120Hz+ screens. Note the tension with three.js docs advising `setAnimationLoop()` over `requestAnimationFrame()`: `setAnimationLoop` is required for WebXR, but we are not shipping XR, so a single shared rAF driving both Lenis and the renderer is the simpler choice.

---

## Open items

Carried forward rather than guessed:

- **Is backwards video seeking genuinely slower than forwards?** No browser-engine primary source found. The keyframe/GOP mechanism is fully sourced and is direction-agnostic on its face. Moot if we take decision 6.
- **Does `contain` break sticky?** Inferred from the containing-block change, not directly stated by spec or MDN. The css-contain-2 normative bullet lists could not be retrieved.
- **Flex/grid parent behaviour for sticky.** Reasoned from the containing-block constraint; no citation found.
- **The normative HTML seek algorithm and the approximate-for-speed flag wording.** Section truncated on every fetch attempt.
- **Ordering of scroll steps vs. rAF callbacks within "update the rendering".** Section truncated; matters only if we need same-frame ordering guarantees.
- **Does `requestVideoFrameCallback` fire while paused or seeking?** Not addressed in the retrieved spec text.
- **Which three.js release enabled color management by default.** Not stated in the docs; irrelevant at r186.
