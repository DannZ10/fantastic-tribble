import { useEffect } from 'react'
import { Hero } from '../components/Hero'
import { CaseStack } from '../components/CaseStack'
import { SiteFooter } from '../components/SiteFooter'
import { site } from '../data/site'

/** Hero, the three selected projects, then the full-page footer. */
export function Home() {
  useEffect(() => {
    document.title = `${site.name} — ${site.roleLeft}`
  }, [])

  return (
    <>
      <Hero />
      <CaseStack />
      <SiteFooter />
    </>
  )
}
