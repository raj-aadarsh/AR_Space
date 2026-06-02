import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useViewport } from '../../utils/viewport.js'
import { softCircleTexture, pointer, smootherstep } from '../../utils/particles.js'

// ─── One living object for the whole journey ──────────────────
// A single particle entity fixed behind the page. As you scroll it
// morphs through six forms — one per section — and glides to the side
// opposite that section's text, so it reads as one continuous being
// following you down the page rather than six separate widgets.

const N = 6000
const rand = Math.random

// Six target forms. Each fills the SAME N points so morphing is a
// smooth cross-dissolve from one to the next.
function fillHelix(a) {
  const R = 0.62, H = 3.5, TURNS = 3.0
  for (let i = 0; i < N; i++) {
    const f = i / N
    const t = f * Math.PI * 2 * TURNS + (i % 2) * Math.PI
    a[i*3]   = R * Math.cos(t)       + (rand()-0.5)*0.03
    a[i*3+1] = (f - 0.5) * H         + (rand()-0.5)*0.03
    a[i*3+2] = R * Math.sin(t)       + (rand()-0.5)*0.03
  }
}
function fillKnot(a) {
  const S = 1.3
  for (let i = 0; i < N; i++) {
    const u = (i / N) * Math.PI * 2
    const r = 0.95 + 0.42 * Math.cos(3 * u)
    a[i*3]   = (r * Math.cos(2*u)) * S + (rand()-0.5)*0.14
    a[i*3+1] = (r * Math.sin(2*u)) * S + (rand()-0.5)*0.14
    a[i*3+2] = (0.55 * Math.sin(3*u)) * S + (rand()-0.5)*0.14
  }
}
function fillGalaxy(a) {
  const ARMS = 3, TURNS = 2.4
  const c = Math.cos(0.5), s = Math.sin(0.5)
  for (let i = 0; i < N; i++) {
    const t = Math.pow(rand(), 0.6)
    const rad = 0.12 + t * 1.75
    const ang = (i % ARMS) * (Math.PI*2/ARMS) + t * Math.PI*2*TURNS + (rand()-0.5)*0.5
    const x = rad * Math.cos(ang)
    const y = (rand()-0.5) * 0.10 * (0.3 + rad)
    const z = rad * Math.sin(ang)
    a[i*3]   = x
    a[i*3+1] = y * c - z * s          // tilt the disc toward viewer
    a[i*3+2] = y * s + z * c
  }
}
function fillAtom(a) {
  // three crossed orbital rings + a dense nucleus
  const tilt = 0.5, RR = 1.55
  for (let i = 0; i < N; i++) {
    if (i % 5 < 3) {
      const o = i % 3
      const ang = rand() * Math.PI * 2
      let x = RR * Math.cos(ang), y = RR * Math.sin(ang), z = 0
      // tilt around X
      let y1 = y * Math.cos(tilt) - z * Math.sin(tilt)
      let z1 = y * Math.sin(tilt) + z * Math.cos(tilt)
      // spin each ring around Y by 0 / 120 / 240°
      const sp = o * (Math.PI * 2 / 3)
      a[i*3]   = x * Math.cos(sp) - z1 * Math.sin(sp) + (rand()-0.5)*0.03
      a[i*3+1] = y1 + (rand()-0.5)*0.03
      a[i*3+2] = x * Math.sin(sp) + z1 * Math.cos(sp) + (rand()-0.5)*0.03
    } else {
      const r = Math.pow(rand(), 0.5) * 0.34
      const phi = Math.acos(2*rand()-1), th = rand()*Math.PI*2
      a[i*3]   = r * Math.sin(phi) * Math.cos(th)
      a[i*3+1] = r * Math.cos(phi)
      a[i*3+2] = r * Math.sin(phi) * Math.sin(th)
    }
  }
}
function fillIco(a) {
  const P = (1 + Math.sqrt(5)) / 2, S = 0.95
  const V = [
    [0,1,P],[0,-1,P],[0,1,-P],[0,-1,-P],
    [1,P,0],[-1,P,0],[1,-P,0],[-1,-P,0],
    [P,0,1],[-P,0,1],[P,0,-1],[-P,0,-1],
  ].map(([x,y,z]) => [x*S, y*S, z*S])
  const E = []
  const lim = 2.0 * S * 1.05
  for (let i = 0; i < 12; i++) for (let j = i+1; j < 12; j++) {
    const dx=V[i][0]-V[j][0], dy=V[i][1]-V[j][1], dz=V[i][2]-V[j][2]
    if (Math.sqrt(dx*dx+dy*dy+dz*dz) < lim) E.push([i,j])
  }
  for (let i = 0; i < N; i++) {
    const e = E[(rand()*E.length)|0]
    const t = rand()
    const A = V[e[0]], B = V[e[1]]
    a[i*3]   = A[0] + (B[0]-A[0])*t + (rand()-0.5)*0.02
    a[i*3+1] = A[1] + (B[1]-A[1])*t + (rand()-0.5)*0.02
    a[i*3+2] = A[2] + (B[2]-A[2])*t + (rand()-0.5)*0.02
  }
}
function fillTorus(a) {
  const R = 1.25, r = 0.34
  const c = Math.cos(0.5), s = Math.sin(0.5)
  for (let i = 0; i < N; i++) {
    const U = rand()*Math.PI*2, W = rand()*Math.PI*2
    const x = (R + r*Math.cos(W)) * Math.cos(U)
    const y = (R + r*Math.cos(W)) * Math.sin(U)
    const z = r * Math.sin(W)
    a[i*3]   = x
    a[i*3+1] = y * c - z * s
    a[i*3+2] = y * s + z * c
  }
}

const SHAPE_FILLS = [fillHelix, fillKnot, fillGalaxy, fillAtom, fillIco, fillTorus]
// Each form belongs to a section; object glides opposite that section's
// text (zigzag down the page). Index order matches SECTION_IDS.
const SECTION_IDS = ['experience', 'projects', 'skills', 'education', 'hobbies', 'connect']
// The Work (index 0) sits centred; the rest zigzag opposite their text.
const OFFSETS = [0, 2.0, -2.2, 2.2, -2.2, 2.6]

function lerp(a, b, t) { return a + (b - a) * t }

function Field({ opacity, scaleMul, offsetMul }) {
  const groupRef = useRef()
  const ptsRef   = useRef()
  const sf       = useRef(-1)     // smoothed shape-float (−1 = dispersed cloud)
  const els      = useRef([])     // cached section elements
  const tex = useMemo(() => softCircleTexture(), [])

  const { geo, shapes, cloud, baseCol, phase, freq, wave } = useMemo(() => {
    const shapes = SHAPE_FILLS.map((fn) => { const a = new Float32Array(N*3); fn(a); return a })
    const baseCol = new Float32Array(N*3)
    const liveCol = new Float32Array(N*3)
    const phase = new Float32Array(N)
    const freq  = new Float32Array(N)
    const wave  = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const k = rand()
      let r, g, b
      if (k < 0.06)      { r = 0.85; g = 0.95; b = 1.0 }   // white sparkle
      else if (k < 0.55) { r = 0.23; g = 0.51; b = 0.96 }  // blue
      else               { r = 0.13; g = 0.83; b = 0.93 }  // cyan
      baseCol[i*3] = r; baseCol[i*3+1] = g; baseCol[i*3+2] = b
      phase[i] = rand() * Math.PI * 2
      freq[i]  = 0.5 + rand() * 0.9
      wave[i]  = i / N
    }
    // Dispersed cloud the first form assembles FROM as the page is entered.
    const cloud = new Float32Array(N*3)
    for (let i = 0; i < N; i++) {
      const r = 2.4 + rand() * 1.8
      const phi = Math.acos(2*rand()-1), th = rand()*Math.PI*2
      cloud[i*3]   = r * Math.sin(phi) * Math.cos(th)
      cloud[i*3+1] = r * Math.cos(phi)
      cloud[i*3+2] = r * Math.sin(phi) * Math.sin(th)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(cloud.slice(), 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(liveCol, 3))
    return { geo, shapes, cloud, baseCol, phase, freq, wave }
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current || !ptsRef.current) return
    const t = clock.elapsedTime

    // Drive the morph off section CENTERS so the form is fully shaped
    // exactly when a section is centred in view, and only morphs in the
    // gaps between sections — keeping object and scroll perfectly in sync.
    const vc = window.innerHeight * 0.5
    const centers = []
    let h0 = 0
    let ok = true
    for (let n = 0; n < SECTION_IDS.length; n++) {
      let el = els.current[n]
      if (!el) { el = document.getElementById(SECTION_IDS[n]); els.current[n] = el }
      if (!el) { ok = false; break }
      const r = el.getBoundingClientRect()
      centers.push(r.top + r.height * 0.5)
      if (n === 0) h0 = r.height
    }
    let target = sf.current
    if (ok) {
      const last = centers.length - 1
      if (vc <= centers[0]) {
        // Entrance — assemble from the cloud as The Work scrolls in.
        // Runs −1 (dispersed, section just entering) → 0 (formed & centred).
        const startC = window.innerHeight + h0 * 0.5
        let ep = (startC - centers[0]) / (startC - vc)
        ep = Math.max(0, Math.min(1, ep))
        target = ep - 1
      }
      else if (vc >= centers[last]) target = last
      else {
        for (let n = 0; n < last; n++) {
          if (vc >= centers[n] && vc <= centers[n + 1]) {
            target = n + (vc - centers[n]) / (centers[n + 1] - centers[n])
            break
          }
        }
      }
    }
    sf.current += (target - sf.current) * 0.12

    // Pick the two forms to blend. Below 0 we blend the dispersed cloud
    // into the first form — the entrance assembly for The Work.
    const sfv = sf.current
    let A, B, f, ox
    if (sfv < 0) {
      f = smootherstep(sfv + 1)
      A = cloud; B = shapes[0]
      ox = OFFSETS[0] * offsetMul
    } else {
      const SEG = shapes.length - 1
      const i = Math.max(0, Math.min(SEG - 1, Math.floor(sfv)))
      f = smootherstep(sfv - i)
      A = shapes[i]; B = shapes[i + 1]
      ox = lerp(OFFSETS[i], OFFSETS[i + 1], f) * offsetMul
    }

    // Glide to the side opposite the upcoming text + slow spin + tilt + breathe
    groupRef.current.position.x += (ox - groupRef.current.position.x) * 0.1
    groupRef.current.rotation.y += 0.0016
    groupRef.current.rotation.x += (pointer.y * 0.08 - groupRef.current.rotation.x) * 0.02
    groupRef.current.scale.setScalar(scaleMul * (1 + Math.sin(t * 0.7) * 0.01))

    const pos = ptsRef.current.geometry.attributes.position.array
    const col = ptsRef.current.geometry.attributes.color.array
    for (let k = 0; k < N; k++) {
      const x = lerp(A[k*3],   B[k*3],   f)
      const y = lerp(A[k*3+1], B[k*3+1], f)
      const z = lerp(A[k*3+2], B[k*3+2], f)
      const ph = phase[k], fr = freq[k], dr = 0.025
      pos[k*3]   = x + Math.sin(t*fr + ph) * dr
      pos[k*3+1] = y + Math.cos(t*fr*0.9 + ph*1.3) * dr
      pos[k*3+2] = z + Math.sin(t*fr*1.1 + ph*0.7) * dr

      const m = 0.70 + 0.50 * Math.sin(t * 1.1 - wave[k] * Math.PI * 8)
      col[k*3]   = baseCol[k*3]   * m
      col[k*3+1] = baseCol[k*3+1] * m
      col[k*3+2] = baseCol[k*3+2] * m
    }
    ptsRef.current.geometry.attributes.position.needsUpdate = true
    ptsRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <points ref={ptsRef} geometry={geo}>
        <pointsMaterial
          map={tex}
          size={0.075}
          vertexColors
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default function MorphField() {
  const vp = useViewport()
  const cfg = {
    'desktop':          { op: 0.95, sc: 1.00, off: 1.00 },
    'tablet-landscape': { op: 0.92, sc: 0.95, off: 0.90 },
    'tablet-portrait':  { op: 0.80, sc: 0.82, off: 0.50 },
    'phone-landscape':  { op: 0.85, sc: 0.80, off: 0.70 },
    'mobile':           { op: 0.55, sc: 0.70, off: 0.22 },
  }[vp] || { op: 0.95, sc: 1.0, off: 1.0 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 6.5], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.05} />
        <Field opacity={cfg.op} scaleMul={cfg.sc} offsetMul={cfg.off} />
      </Canvas>
    </div>
  )
}
