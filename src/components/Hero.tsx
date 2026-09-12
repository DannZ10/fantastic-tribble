import { useEffect, useRef } from 'react'
import { site } from '../data/site'
import { PhoneArc } from './PhoneArc'
import { RotatingTitle } from './RotatingTitle'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * Layer order is the composition:
 *   1 — the phone arc, travelling behind everything
 *   2 — the rotating role title, which the subject's head overlaps
 *   3 — the subject, centred, full body, outlined in white
 *   4 — the two role captions, flanking the subject at the base
 *
 * Pointer parallax is published as two custom properties on the stage,
 * `--mx` and `--my`, each running -0.5 → 0.5. Every layer multiplies them
 * by its own depth in CSS, so the whole effect is one variable write per
 * frame instead of a transform write per layer.
 */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced) return

    // Targets are written by pointermove; the rAF loop eases toward them so
    // the parallax glides instead of snapping, and so we never write styles
    // from inside the event handler itself.
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0
    let prev = performance.now()

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - prev) / 1000)
      prev = now
      const k = 1 - Math.pow(0.0015, dt) // frame-rate independent easing
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      stage.style.setProperty('--mx', cx.toFixed(4))
      stage.style.setProperty('--my', cy.toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__stage" ref={stageRef}>
        <PhoneArc />
        <RotatingTitle />

        <div className="hero__subject">
          <img
            src="/characters/hero.webp"
            alt={`${site.fullName}, ${site.roleLeft}`}
            width="715"
            height="1598"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <p className="hero__role-caption hero__role-caption--left">{site.roleLeft}</p>
        <p className="hero__role-caption hero__role-caption--right">{site.roleRight}</p>
      </div>

      <a className="hero__explore" href="#selected" aria-label="Scroll to selected projects">
        <span>Explore</span>
        <span className="hero__explore-arrow" aria-hidden="true" />
      </a>
    </section>
  )
}
