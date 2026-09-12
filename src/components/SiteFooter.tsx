import { site } from '../data/site'
import { SocialIcon } from './SocialIcon'

/**
 * A full-viewport black panel, shown only on the home page. Email, the three
 * social icons, the mark, the year — nothing else. The mark is a CSS mask over
 * a gradient, so hovering it can swap the gradient to gold without loading a
 * second image.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer" id="after-hero">
      <div className="site-footer__inner">
        <a className="site-footer__email" href={`mailto:${site.email}`}>
          {site.email}
        </a>

        <ul className="site-footer__socials">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label}>
                <SocialIcon name={s.short} />
              </a>
            </li>
          ))}
        </ul>

        <span className="site-footer__mark" aria-hidden="true" />

        <p className="site-footer__year">{new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
