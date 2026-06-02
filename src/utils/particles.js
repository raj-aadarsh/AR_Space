import * as THREE from 'three'

// ─── Soft circular glow sprite ────────────────────────────────
// Square GL points look cheap. A radial-gradient sprite turns every
// particle into a soft round glow — the single biggest perceived-quality
// upgrade for additive point clouds. Generated once, shared everywhere.
let _softTex = null
export function softCircleTexture() {
  if (_softTex) return _softTex
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,255,255,0.92)')
  g.addColorStop(0.42, 'rgba(255,255,255,0.32)')
  g.addColorStop(0.75, 'rgba(255,255,255,0.06)')
  g.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  _softTex = new THREE.CanvasTexture(c)
  _softTex.colorSpace = THREE.SRGBColorSpace
  return _softTex
}

// ─── Global pointer (-1..1) ───────────────────────────────────
// One listener shared by every scene for subtle parallax tilt.
export const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2
    },
    { passive: true }
  )
}

// Smoothstep easing — gentle ease-in-out used for formation.
export function smootherstep(t) {
  t = Math.max(0, Math.min(1, t))
  return t * t * t * (t * (t * 6 - 15) + 10)
}
