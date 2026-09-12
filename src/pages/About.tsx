import { useEffect } from 'react'
import { site } from '../data/site'

/**
 * Mark on the left, prose on the right, nothing else — no heading, no
 * subtitle. The mark is not drawn in brand colour: it is a CSS mask over the
 * photograph, so the portrait reads through the letterforms.
 *
 * The two columns are grid items in the same row, so the mark's height is the
 * prose's height without either being measured in JS.
 */
export function About() {
  useEffect(() => {
    document.title = `About — ${site.name}`
  }, [])

  return (
    <section className="about" aria-label={`About ${site.fullName}`}>
      <div className="about__inner">
        <div className="about__mark" role="img" aria-label={`Portrait of ${site.fullName}`} />
        <p className="about__prose">{site.bio}</p>
      </div>
    </section>
  )
}
