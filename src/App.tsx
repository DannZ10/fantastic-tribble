import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

import { SiteHeader } from './components/SiteHeader'
import { IntroLoader } from './components/IntroLoader'
import { Home } from './pages/Home'
import { Work } from './pages/Work'
import { About } from './pages/About'
import { CaseDetail } from './pages/CaseDetail'

export default function App() {
  const { pathname } = useLocation()
  const firstLoad = useRef(true)
  const [loaderKey, setLoaderKey] = useState(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoaderKey(pathname)
    firstLoad.current = false
  }, [pathname])

  return (
    <ReactLenis
      root
      // Lerp mode. `lerp` and `duration` are mutually exclusive in the Lenis
      // source, so only one is set. `respectReducedMotion` stays at its
      // default `true` — Lenis already jump-cuts when the OS asks it to.
      options={{ lerp: 0.1, smoothWheel: true, anchors: true }}
    >
      {/* Keyed on the route so the sequence replays on every navigation,
          and on a refresh, exactly as asked. */}
      <IntroLoader key={loaderKey} first={firstLoad.current} />

      <a className="u-skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/case/:slug" element={<CaseDetail />} />
          <Route path="*" element={<CaseDetail />} />
        </Routes>
      </main>
    </ReactLenis>
  )
}
