import { useState, useEffect } from 'react'

function classify() {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth, h = window.innerHeight
  if (w < 768 && w < h) return 'mobile'          // phone portrait
  if (h < 500 && w > h) return 'phone-landscape' // any phone in landscape
  if (w < 1024) return 'tablet-portrait'          // tablet portrait
  if (w < 1200) return 'tablet-landscape'         // iPad landscape (1024–1199px)
  return 'desktop'                                // ≥ 1200px — PC untouched
}

export function useViewport() {
  const [vp, setVp] = useState(classify)
  useEffect(() => {
    const handler = () => setVp(classify())
    window.addEventListener('resize', handler, { passive: true })
    window.addEventListener('orientationchange', handler)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])
  return vp  // 'mobile' | 'phone-landscape' | 'tablet-portrait' | 'tablet-landscape' | 'desktop'
}
