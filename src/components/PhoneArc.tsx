import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/* ─────────────────────────────────────────────────────────────
   The curved phone marquee behind the hero subject.

   Ten phones travel left to right on a loop. Position along the
   track drives scale, vertical offset, rotation and stacking, so
   the strip reads as an arc receding through the middle of the
   screen: smallest and faintest at centre, largest at the edges.

   Everything is written straight to the DOM inside one rAF loop —
   sixty state updates a second would leave no frame budget for the
   rest of the hero.
   ───────────────────────────────────────────────────────────── */

// Drawn at the bezel's own 9:19.5, so nothing is cropped away.
// Swap these files for real app screenshots — same paths, no code change.
const PHONES = Array.from({ length: 10 }, (_, i) => `/arc/${i + 1}.webp`)

const BASE_SPEED = 74 // px per second
const HOVER_SPEED = 0.18 // multiplier while a phone is hovered

export function PhoneArc() {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Queried from the DOM rather than collected through a refs array:
    // StrictMode detaches refs between its two effect passes, so a snapshot
    // taken here is empty on the second run and the arc never lays out.
    const items = Array.from(track.querySelectorAll<HTMLDivElement>('.arc__phone'))
    if (!items.length) return

    let width = track.clientWidth
    let span = width * 1.32

    const ro = new ResizeObserver(() => {
      width = track.clientWidth
      span = width * 1.32
    })
    ro.observe(track)

    let offset = 0
    let speedMul = 1
    let targetMul = 1

    const layout = () => {
      const stepNow = span / items.length
      items.forEach((el, i) => {
        // wrap into [0, span) so phones re-enter from the left forever
        const raw = (i * stepNow + offset) % span
        const pos = raw < 0 ? raw + span : raw
        const x = pos - span * 0.16

        const n = x / Math.max(1, width) // 0 at left edge, 1 at right edge
        const d = Math.min(1, Math.abs(n - 0.5) * 2) // 0 centre, 1 edges

        const scale = 0.52 + d * 0.62
        const lift = (1 - d) * -34 // centre rides higher, so the row curves
        const rot = (n - 0.5) * 13

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${lift.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
        el.style.opacity = (0.42 + d * 0.58).toFixed(3)
        el.style.zIndex = String(Math.round(d * 10))
      })
    }

    if (reduced) {
      // Static arc: the composition still reads, nothing moves.
      layout()
      return () => ro.disconnect()
    }

    let raf = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - prev) / 1000)
      prev = now
      // ease the speed change so hovering slows the strip rather than jolting it
      speedMul += (targetMul - speedMul) * (1 - Math.pow(0.002, dt))
      offset += dt * BASE_SPEED * speedMul
      layout()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const slow = () => {
      targetMul = HOVER_SPEED
    }
    const resume = () => {
      targetMul = 1
    }
    track.addEventListener('pointerenter', slow)
    track.addEventListener('pointerleave', resume)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      track.removeEventListener('pointerenter', slow)
      track.removeEventListener('pointerleave', resume)
    }
  }, [reduced])

  return (
    <div className="arc" ref={trackRef} aria-hidden="true">
      {PHONES.map((src) => (
        <div className="arc__phone" key={src}>
          <div className="arc__bezel">
            <img src={src} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      ))}
    </div>
  )
}
