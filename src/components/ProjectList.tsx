import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { cases } from '../data/cases'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const PER_PAGE = 4
const PAGE_FADE = 240

/**
 * Every project as a full-width row.
 *
 * A row shows its mark, its title and a small tech line. Clicking it opens the
 * detail — one at a time, accordion-style — and the tech line fades out, since
 * the detail lists the stack properly. Hovering a row floats a desktop preview
 * that trails the cursor.
 *
 * Open height is measured rather than capped: the revealer's inline max-height
 * is set from the content's own scrollHeight, so the easing matches the real
 * distance and nothing can be clipped by a guessed ceiling.
 */
export function ProjectList() {
  const [page, setPage] = useState(0)
  const [paging, setPaging] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const reduced = usePrefersReducedMotion()
  const revealers = useRef(new Map<string, HTMLDivElement | null>())
  const previewRef = useRef<HTMLDivElement>(null)

  const pages = Math.ceil(cases.length / PER_PAGE)
  const start = page * PER_PAGE
  const slice = cases.slice(start, start + PER_PAGE)

  // ── open/close: drive max-height from the measured content height ──
  useEffect(() => {
    revealers.current.forEach((el, slug) => {
      if (!el) return
      const inner = el.firstElementChild as HTMLElement | null
      el.style.maxHeight = open === slug && inner ? `${inner.scrollHeight}px` : '0px'
    })
  }, [open, page])

  // ── the cursor-trailing preview ──
  useEffect(() => {
    const el = previewRef.current
    if (!el || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let seeded = false
    let raf = 0
    let prev = performance.now()

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!seeded) {
        // Jump to the pointer on the first sample, or the panel visibly flies
        // in from the top-left corner of the screen.
        cx = tx
        cy = ty
        seeded = true
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - prev) / 1000)
      prev = now
      const k = 1 - Math.pow(0.0000001, dt) // trails the cursor, never snaps
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  const goToPage = useCallback(
    (next: number) => {
      if (next === page || paging) return
      setOpen(null)
      setHovered(null)
      setPaging(true)
      window.setTimeout(() => {
        setPage(next)
        document.getElementById('project-list')?.scrollIntoView({ block: 'start' })
        // Cleared on a timer, NOT requestAnimationFrame. rAF is suspended
        // while the tab is in the background, so clearing the flag there
        // would leave `paging` stuck true and jam every later page change.
        window.setTimeout(() => setPaging(false), 20)
      }, PAGE_FADE)
    },
    [page, paging],
  )

  const hoveredCase = hovered ? cases.find((c) => c.slug === hovered) : undefined
  const showPreview = !!hoveredCase && hovered !== open && !reduced

  return (
    <div className={`plist${hovered ? ' is-hovering' : ''}`} id="project-list">
      <ol className={`plist__rows${paging ? ' is-paging' : ''}`}>
        {slice.map((c) => {
          const isOpen = open === c.slug
          return (
            <li
              key={c.slug}
              className={`plist__row${isOpen ? ' is-open' : ''}${hovered === c.slug ? ' is-hovered' : ''}`}
              style={{ ['--case-ink' as string]: c.ink }}
              onPointerEnter={() => setHovered(c.slug)}
              onPointerLeave={() => setHovered((h) => (h === c.slug ? null : h))}
            >
              <button
                type="button"
                className="plist__head"
                aria-expanded={isOpen}
                aria-controls={`detail-${c.slug}`}
                onClick={() => setOpen((o) => (o === c.slug ? null : c.slug))}
              >
                <img className="plist__logo" src={c.logo} alt="" width="40" height="40" />

                <span className="plist__headings">
                  <span className="u-display plist__title">{c.title}</span>
                  {/* Hidden while the detail is open — the stack is listed in
                      full down there, so repeating it here is noise. */}
                  <span className="plist__tech">{c.stack.join(' · ')}</span>
                </span>

                <span className="plist__chev" aria-hidden="true" />
              </button>

              <div
                className="plist__revealer"
                id={`detail-${c.slug}`}
                ref={(el) => {
                  revealers.current.set(c.slug, el)
                }}
              >
                <div className="plist__detail">
                  <p className="plist__blurb">{c.blurb}</p>

                  <ul className="plist__tags">
                    {c.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>

                  <dl className="plist__meta">
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

                  <Link className="plist__cta u-label" to={`/case/${c.slug}`}>
                    Deep dive
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {pages > 1 && (
        <nav className="plist__pager" aria-label="Project pages">
          <button
            type="button"
            className="u-label plist__pagebtn"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
          >
            <span aria-hidden="true">←</span> Previous
          </button>

          <p className="u-label plist__count" aria-live="polite">
            {start + 1}–{Math.min(start + PER_PAGE, cases.length)} of {cases.length}
          </p>

          <button
            type="button"
            className="u-label plist__pagebtn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pages - 1}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
      )}

      {/* One floating panel reused by every row — cheaper than one per row,
          and it means the image can cross-fade as the cursor moves between
          rows instead of popping. */}
      <div
        className={`plist__preview${showPreview ? ' is-visible' : ''}`}
        ref={previewRef}
        aria-hidden="true"
      >
        {hoveredCase && <img src={hoveredCase.preview} alt="" />}
      </div>
    </div>
  )
}
