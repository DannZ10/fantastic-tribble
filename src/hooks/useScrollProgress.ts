import { useEffect, type RefObject } from 'react'

/* ─────────────────────────────────────────────────────────────
   One rAF loop for the entire site.

   Every scroll-driven effect subscribes here and receives a 0→1
   progress number. Nothing goes through React state: a setState at
   60fps re-renders the tree sixty times a second and there is no
   frame budget left for anything else. Subscribers write transforms
   and opacity straight to the DOM.

   The loop reads every subscriber's rect BEFORE invoking any
   callback, so all layout reads are batched ahead of all writes and
   the two never interleave into a thrash.
   ───────────────────────────────────────────────────────────── */

export type ProgressMode =
  /** 0 when the element's top enters the viewport bottom, 1 when its bottom leaves the top. */
  | 'cover'
  /** 0 when the element's top reaches the viewport top, 1 when its bottom reaches the bottom. */
  | 'pin'

type Subscriber = {
  el: HTMLElement
  mode: ProgressMode
  cb: (progress: number) => void
  last: number
}

const subscribers = new Set<Subscriber>()
let rafId = 0

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

function tick() {
  const vh = window.innerHeight

  // ── read phase ──
  const frame: Array<[Subscriber, number]> = []
  for (const sub of subscribers) {
    const r = sub.el.getBoundingClientRect()
    const p =
      sub.mode === 'pin'
        ? clamp01(-r.top / Math.max(1, r.height - vh))
        : clamp01((vh - r.top) / Math.max(1, vh + r.height))
    frame.push([sub, p])
  }

  // ── write phase ──
  for (const [sub, p] of frame) {
    if (p !== sub.last) {
      sub.last = p
      sub.cb(p)
    }
  }

  rafId = requestAnimationFrame(tick)
}

function subscribe(sub: Subscriber) {
  subscribers.add(sub)
  if (!rafId) rafId = requestAnimationFrame(tick)
  return () => {
    subscribers.delete(sub)
    if (subscribers.size === 0 && rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }
}

/**
 * Imperative form, for when the measured element is not the element being
 * written to — the sticky card stack measures the *next* card to work out how
 * covered the current one is, because a pinned card's own rect never moves.
 *
 * Returns an unsubscribe function.
 */
export function subscribeScrollProgress(
  el: HTMLElement,
  onProgress: (progress: number) => void,
  mode: ProgressMode = 'cover',
) {
  return subscribe({ el, mode, cb: onProgress, last: NaN })
}

/**
 * Calls `onProgress` with a 0→1 value whenever the element's scroll
 * position changes. The callback runs inside the shared rAF loop — write
 * to the DOM from it, never to state.
 *
 * `enabled: false` unsubscribes entirely, which is how reduced-motion is
 * honoured: the transform is never written at all rather than written and
 * then overridden by CSS.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { mode = 'cover', enabled = true }: { mode?: ProgressMode; enabled?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    // `last: NaN` guarantees the first real value differs and fires once,
    // so the element is correct on mount without waiting for a scroll.
    return subscribe({ el, mode, cb: onProgress, last: NaN })
  }, [ref, onProgress, mode, enabled])
}
