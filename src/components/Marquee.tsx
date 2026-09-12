import { site } from '../data/site'

/**
 * Pure CSS ticker — the track is duplicated and translated by exactly -50%,
 * so the loop point is seamless with no JS involved at all.
 *
 * It autoplays and runs longer than five seconds, which puts it under WCAG
 * SC 2.2.2 (Level A, not optional): there has to be a mechanism to stop it.
 * The button is that mechanism. Reduced-motion pauses it from the start.
 */
export function Marquee() {
  const items = [...site.marquee, ...site.marquee]

  return (
    <div className="marquee">
      <div className="marquee__track" aria-hidden="true">
        {items.map((item, i) => (
          <span className="marquee__item" key={`${item}-${i}`}>
            {item}
            <i className="marquee__dot" />
          </span>
        ))}
      </div>

      {/* The real content, for anyone not watching it scroll past. */}
      <p className="u-visually-hidden">Working with: {site.marquee.join(', ')}.</p>

      <button
        type="button"
        className="marquee__toggle u-label"
        aria-pressed="false"
        onClick={(e) => {
          const root = e.currentTarget.closest('.marquee')
          const paused = root?.classList.toggle('is-paused')
          e.currentTarget.setAttribute('aria-pressed', String(!!paused))
          e.currentTarget.textContent = paused ? 'Play' : 'Pause'
        }}
      >
        Pause
      </button>
    </div>
  )
}
