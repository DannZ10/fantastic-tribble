import { useEffect, useRef, useState, type RefObject } from 'react'

/* ─────────────────────────────────────────────────────────────
   Scroll-scrubbed frame sequence.

   NOT a scrubbed <video>. fastSeek() has never shipped in Chrome or
   Edge, so scrubbing a video falls back to precise currentTime
   seeking — and a precise seek has to locate the keyframe at or
   before the target and decode every intervening delta frame forward
   to it. Cost scales with GOP length, not with how far the user
   actually moved, which makes it unpredictable in both directions.

   Independently decodable stills are O(1) per frame and direction
   does not exist as a concept. createImageBitmap decodes them off the
   main thread.
   ───────────────────────────────────────────────────────────── */

type Options = {
  /** Directory of zero-padded frames, e.g. '/frames/case01'. */
  dir: string
  count: number
  /** Skip decoding entirely and show a single still. */
  staticOnly?: boolean
}

const frameUrl = (dir: string, i: number) =>
  `${dir}/${String(i + 1).padStart(3, '0')}.webp`

export function useFrameSequence(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { dir, count, staticOnly = false }: Options,
) {
  const frames = useRef<(ImageBitmap | null)[]>([])
  const drawn = useRef(-1)
  const [ready, setReady] = useState(false)

  // ── decode ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const local: (ImageBitmap | null)[] = new Array(count).fill(null)
    frames.current = local

    const decode = async (i: number) => {
      try {
        const res = await fetch(frameUrl(dir, i))
        if (!res.ok) return
        const bmp = await createImageBitmap(await res.blob())
        if (cancelled) {
          bmp.close()
          return
        }
        local[i] = bmp
      } catch {
        /* a missing frame is survivable — the scrubber holds the last good one */
      }
    }

    ;(async () => {
      // First frame first, so something is on screen immediately.
      await decode(0)
      if (cancelled) return
      paint(0)
      setReady(true)
      if (staticOnly) return

      // Then the rest, in small batches so the network queue stays short
      // and the main thread is never starved by a burst of decodes.
      for (let i = 1; i < count && !cancelled; i += 6) {
        await Promise.all(
          Array.from({ length: Math.min(6, count - i) }, (_, k) => decode(i + k)),
        )
      }
    })()

    return () => {
      cancelled = true
      for (const b of local) b?.close()
      frames.current = []
      drawn.current = -1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, count, staticOnly])

  // ── paint ───────────────────────────────────────────────────
  function paint(index: number) {
    const canvas = canvasRef.current
    if (!canvas) return

    // Walk back to the nearest decoded frame rather than blanking the
    // canvas while a later batch is still in flight.
    let i = index
    while (i > 0 && !frames.current[i]) i--
    const bmp = frames.current[i]
    if (!bmp || drawn.current === i) return

    if (canvas.width !== bmp.width || canvas.height !== bmp.height) {
      canvas.width = bmp.width
      canvas.height = bmp.height
    }
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctx.drawImage(bmp, 0, 0)
    drawn.current = i
  }

  /** Feed this a 0→1 scroll progress. */
  const seek = (progress: number) => {
    if (staticOnly) return
    paint(Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1)))))
  }

  return { seek, ready }
}
