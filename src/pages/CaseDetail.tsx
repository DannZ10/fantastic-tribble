import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { getCase, caseNeighbours } from '../data/cases'
import { site } from '../data/site'

export function CaseDetail() {
  const { slug } = useParams()
  const study = getCase(slug)

  useEffect(() => {
    if (!study) return
    document.title = `${study.title} — ${site.name}`
    const meta = document.querySelector('meta[name="description"]')
    meta?.setAttribute('content', study.blurb)
  }, [study])

  if (!study) {
    return (
      <div className="u-container notfound">
        <h1 className="u-display">No such project</h1>
        <p className="u-measure">
          That link does not match any project. It may have been renamed.
        </p>
        <Link className="u-label notfound__back" to="/">
          ← Back to the work
        </Link>
      </div>
    )
  }

  const { prev, next } = caseNeighbours(study.slug)
  const sections = [
    { label: 'The problem', body: study.problem },
    { label: 'What I built', body: study.built },
    { label: 'The hard part', body: study.hardPart },
    { label: 'Outcome', body: study.outcome },
  ]

  return (
    <article className="case-detail" style={{ ['--case-ink' as string]: study.ink }}>
      <Link className="case-back u-label" to="/work">
        <span aria-hidden="true">←</span> Work
      </Link>

      <header className="case-detail__hero">
        <div className="u-container">
          <p className="u-label case-detail__no">Project {study.number}</p>
          <h1 className="u-display case-detail__title">{study.title}</h1>
          <p className="case-detail__blurb u-measure">{study.blurb}</p>

          <dl className="case-detail__meta">
            <div>
              <dt className="u-label">Role</dt>
              <dd>{study.role}</dd>
            </div>
            <div>
              <dt className="u-label">Timeline</dt>
              <dd>{study.timeline}</dd>
            </div>
            <div>
              <dt className="u-label">Stack</dt>
              <dd>{study.stack.join(' · ')}</dd>
            </div>
            <div>
              <dt className="u-label">Links</dt>
              <dd>
                {study.liveUrl || study.repoUrl ? (
                  <>
                    {study.liveUrl && (
                      <a href={study.liveUrl} target="_blank" rel="noreferrer noopener">
                        Live
                      </a>
                    )}
                    {study.liveUrl && study.repoUrl && ' · '}
                    {study.repoUrl && (
                      <a href={study.repoUrl} target="_blank" rel="noreferrer noopener">
                        Repo
                      </a>
                    )}
                  </>
                ) : (
                  <span className="case-detail__nolink">Not public</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="u-container case-detail__body">
        {sections.map((s) => (
          <section className="case-detail__section" key={s.label}>
            <h2 className="u-label case-detail__section-label">{s.label}</h2>
            <p className="u-measure">{s.body}</p>
          </section>
        ))}
      </div>

      <ul className="u-container case-detail__shots">
        {study.shots.map((src) => (
          <li key={src}>
            <img src={src} alt="" loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>

      <nav className="u-container case-detail__nav" aria-label="Other projects">
        {prev && (
          <Link to={`/case/${prev.slug}`} className="case-detail__nav-link">
            <span className="u-label">Previous</span>
            <span className="u-display">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link to={`/case/${next.slug}`} className="case-detail__nav-link case-detail__nav-link--next">
            <span className="u-label">Next</span>
            <span className="u-display">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
