import { useState, useEffect } from 'react'

function classify() {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth, h = window.innerHeight
  if (w < 768 && w < h) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
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
  return vp  // 'mobile' | 'tablet' | 'desktop'
}
