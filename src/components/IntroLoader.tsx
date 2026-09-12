import { useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   Loading screen, matching the reference's sequence:

     ink    black mark on the page background
     fill   the mark floods with the brand gradient
     shrink the mark collapses toward a coloured dot
     burst  the dot expands past the viewport
     out    the whole overlay fades and the page is there

   On first load the `shrink` step waits for the fonts and the hero
   image, so the page is never revealed mid-reflow. On an internal
   navigation there is nothing to wait for, so the same sequence
   runs at roughly half the duration.
   ───────────────────────────────────────────────────────────── */

type Phase = 'ink' | 'fill' | 'shrink' | 'burst' | 'out' | 'done'

export function IntroLoader({ first = false }: { first?: boolean }) {
  const [phase, setPhase] = useState<Phase>('ink')

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms))
    }
    const k = first ? 1 : 0.55 // internal navigations run the same beats, faster

    at(220 * k, () => setPhase('fill'))

    // Hold the fill until the page is genuinely ready, but never longer than
    // the timeout — a stalled font request must not trap anyone here.
    const gate = first
      ? Promise.race([
          Promise.all([
            document.fonts.ready,
            new Promise<void>((res) => {
              const img = new Image()
              img.onload = img.onerror = () => res()
              img.src = '/characters/hero.webp'
            }),
          ]),
          new Promise<void>((res) => setTimeout(res, 1800)),
        ])
      : new Promise<void>((res) => setTimeout(res, 380 * k))

    gate.then(() => {
      if (cancelled) return
      setPhase('shrink')
      at(340 * k, () => setPhase('burst'))
      at(680 * k, () => setPhase('out'))
      at(1120 * k, () => setPhase('done'))
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [first])

  useEffect(() => {
    // Nothing should scroll underneath while the overlay is up.
    document.body.style.overflow = phase === 'done' ? '' : 'clip'
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`loader loader--${phase}`} aria-hidden="true">
      <span className="loader__mark" />
      <span className="loader__dot" />
    </div>
  )
}
