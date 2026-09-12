import { useEffect } from 'react'
import { ProjectList } from '../components/ProjectList'
import { Marquee } from '../components/Marquee'
import { site } from '../data/site'

export function Work() {
  useEffect(() => {
    document.title = `Work — ${site.name}`
  }, [])

  return (
    <div className="work">
      <header className="work__head u-container">
        <p className="u-label">My works</p>
        <h1 className="u-display work__title">
          All real projects,
          <br />
          built end to end
        </h1>
      </header>
      <Marquee />
      <ProjectList />
    </div>
  )
}
