import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot  = useRef(null)
  const ring = useRef(null)
  const pos  = useRef({ x: 0, y: 0 })
  const lag  = useRef({ x: 0, y: 0 })
  const raf  = useRef(null)

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dot.current) dot.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`
    }

    const loop = () => {
      lag.current.x += (pos.current.x - lag.current.x) * 0.1
      lag.current.y += (pos.current.y - lag.current.y) * 0.1
      if (ring.current) ring.current.style.transform = `translate(${lag.current.x}px,${lag.current.y}px)`
      raf.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <>
      <div ref={dot} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#3B82F6', pointerEvents: 'none',
        transform: 'translate(-100px,-100px)',
        translate: '-50% -50%',
      }} />
      <div ref={ring} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        width: '30px', height: '30px', borderRadius: '50%',
        border: '1px solid rgba(59,130,246,0.4)', pointerEvents: 'none',
        transform: 'translate(-100px,-100px)',
        translate: '-50% -50%',
        transition: 'width 0.15s, height 0.15s',
      }} />
    </>
  )
}
