import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { featured } from '../data/cases'
import { subscribeScrollProgress } from '../hooks/useScrollProgress'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/* ─────────────────────────────────────────────────────────────
   The signature effect.

   Every card is `position: sticky` with the same `top`, and they are
   plain block siblings of one container — so each one pins in turn and
   the later ones, higher in the z-order, slide up over the pinned
   stack beneath. The browser does the pinning; JS only dims what is
   being covered.

   Block layout on purpose, not flex: a flex item under the default
   `align-items: stretch` is stretched to fill the flex line, which
   leaves a sticky child no travel inside its containing block and
   makes it look like sticky "doesn't work".
   ───────────────────────────────────────────────────────────── */

export function CaseStack() {
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const cards = cardRefs.current
    const unsubs: Array<() => void> = []

    // A pinned card's own rect is motionless, so it cannot report its own
    // progress. Measure the NEXT card instead: how far it has risen toward
    // the pin line is exactly how covered this card is.
    for (let i = 0; i < cards.length - 1; i++) {
      const current = cards[i]
      const next = cards[i + 1]
      if (!current || !next) continue

      unsubs.push(
        subscribeScrollProgress(
          next,
          (p) => {
            // p runs 0→1 across the next card's whole travel; the covering
            // happens in the back half of that, so remap and ease it.
            const cover = Math.max(0, (p - 0.45) / 0.4)
            const eased = Math.min(1, cover)
            current.style.transform = `translate3d(0, ${(eased * -28).toFixed(2)}px, 0) scale(${(1 - eased * 0.05).toFixed(4)})`
            current.style.opacity = String(1 - eased * 0.45)
          },
          'cover',
        ),
      )
    }

    return () => {
      unsubs.forEach((fn) => fn())
      cards.forEach((c) => {
        if (c) c.style.cssText = c.style.cssText.replace(/transform:[^;]+;?|opacity:[^;]+;?/g, '')
      })
    }
  }, [reduced])

  return (
    <div className="case-stack" id="selected">
      <p className="u-label case-stack__label">Selected projects — {featured.length}</p>

      {featured.map((c, i) => (
        <article
          key={c.slug}
          className="case-card"
          ref={(el) => {
            cardRefs.current[i] = el
          }}
          style={{ zIndex: i + 1, ['--case-ink' as string]: c.ink }}
          aria-labelledby={`case-${c.slug}`}
        >
          <div className="case-card__body">
            <p className="u-label case-card__no">Project {c.number}</p>
            <h2 className="u-display case-card__title" id={`case-${c.slug}`}>
              {c.title}
            </h2>
            <p className="case-card__blurb u-measure">{c.blurb}</p>

            <ul className="case-card__tags">
              {c.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <dl className="case-card__meta">
              <div>
                <dt className="u-label">Role</dt>
                <dd>{c.role}</dd>
              </div>
              <div>
                <dt className="u-label">When</dt>
                <dd>{c.timeline}</dd>
              </div>
              <div>
                <dt className="u-label">Stack</dt>
                <dd>{c.stack.join(' · ')}</dd>
              </div>
            </dl>

            <Link className="case-card__cta u-label" to={`/case/${c.slug}`}>
              Deep dive
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="case-card__media">
            {/* A tilted desktop-browser mockup. Featured cards play the
                site's own screen recording; the poster holds the frame
                until it loads. */}
            <div className="mockup">
              <span className="mockup__bar" aria-hidden="true" />
              {c.video ? (
                <video
                  className="mockup__screen"
                  poster={c.preview}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={`${c.title} interface recording`}
                >
                  <source src={c.video} type="video/mp4" />
                </video>
              ) : (
                <img
                  className="mockup__screen"
                  src={c.preview}
                  alt={`${c.title} interface`}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
