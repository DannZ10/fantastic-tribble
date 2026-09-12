import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrameSequence } from '../hooks/useFrameSequence'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Props = {
  dir: string
  count: number
  label: string
}

/**
 * A phone mockup whose screen is scrubbed by scroll position.
 *
 * The bezel is drawn in CSS — no mockup image asset is needed or wanted,
 * since a PNG bezel cannot match the page's own radius and shadow language.
 */
export function PhoneScrub({ dir, count, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  // Nothing decodes until the phone is near the viewport. Three sequences
  // preloading on page load would be tens of megabytes of pointless traffic.
  const [active, setActive] = useState(false)
  useEffect(() => {
    const el = wrapRef.current
    if (!el || active) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [active])

  const { seek, ready } = useFrameSequence(canvasRef, {
    dir,
    count,
    staticOnly: reduced || !active,
  })

  const onProgress = useCallback((p: number) => seek(p), [seek])
  useScrollProgress(wrapRef, onProgress, { mode: 'cover', enabled: active && !reduced })

  return (
    <div className={`phone${ready ? ' is-ready' : ''}`} ref={wrapRef}>
      <div className="phone__bezel">
        <div className="phone__notch" aria-hidden="true" />
        <canvas className="phone__screen" ref={canvasRef} aria-label={label} role="img" />
      </div>
    </div>
  )
}
