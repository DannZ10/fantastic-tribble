import { useEffect, useRef } from 'react'
import { site } from '../data/site'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/-#%&'
const HOLD_MS = 5000
const SCRAMBLE_MS = 620

/**
 * The oversized role title behind the hero subject. Swaps every five
 * seconds with a character scramble, the way the reference site does.
 *
 * Text is written straight to the node rather than through state — the
 * scramble updates many times per second and each one would otherwise
 * re-render the whole hero.
 */
export function RotatingTitle() {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const roles = site.heroRoles
    let index = 0
    node.textContent = roles[0]

    if (reduced) return // no cycling at all; the first role simply stands

    let raf = 0
    let timer = 0

    const scrambleTo = (next: string) => {
      const from = roles[index]
      const len = Math.max(from.length, next.length)
      const start = performance.now()

      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / SCRAMBLE_MS)
        let out = ''
        for (let i = 0; i < len; i++) {
          // characters resolve left to right; everything ahead of the
          // wavefront is still noise
          const settled = i / len < t * 1.25
          if (settled) out += next[i] ?? ''
          else if (next[i] === ' ' || from[i] === ' ') out += ' '
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        node.textContent = out
        if (t < 1) raf = requestAnimationFrame(frame)
        else node.textContent = next
      }
      raf = requestAnimationFrame(frame)
    }

    const cycle = () => {
      const nextIndex = (index + 1) % roles.length
      scrambleTo(roles[nextIndex])
      index = nextIndex
      timer = window.setTimeout(cycle, HOLD_MS)
    }
    timer = window.setTimeout(cycle, HOLD_MS)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <h1 className="hero__role">
      {/* The accessible name stays stable while the visible text cycles,
          so a screen reader is not read a new heading every five seconds. */}
      <span className="u-visually-hidden">{site.fullName} — {site.roleLeft}</span>
      <span className="hero__role-text" ref={nodeRef} aria-hidden="true" />
    </h1>
  )
}
