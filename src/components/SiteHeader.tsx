import { Link, useLocation } from 'react-router'
import { site } from '../data/site'
import { SocialIcon } from './SocialIcon'

export function SiteHeader() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  // A project detail page belongs to Work, so Work stays lit while reading one.
  const onWork = pathname.startsWith('/work') || pathname.startsWith('/case/')

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={`${site.name} — home`}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="u-label site-header__loc">
            <span className="site-header__pin" aria-hidden="true" />
            {site.location}
          </span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <Link to="/" className={`u-label nav-pill${onHome ? ' is-current' : ''}`}>
            Home
          </Link>
          <Link to="/work" className={`u-label nav-pill${onWork ? ' is-current' : ''}`}>
            Work
          </Link>
          <Link
            to="/about"
            className={`u-label nav-pill${pathname === '/about' ? ' is-current' : ''}`}
          >
            About
          </Link>
        </nav>

        <div className="site-header__aside">
          <a className="u-label site-header__email" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <ul className="site-header__socials">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label}>
                  <SocialIcon name={s.short} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
