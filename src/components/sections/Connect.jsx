import { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const CONTACT_LINKS = [
  {
    label:   'Email',
    display: 'aadarshraj125@outlook.com',
    href:    'mailto:aadarshraj125@outlook.com',
  },
  {
    label:   'LinkedIn',
    display: 'linkedin.com/in/aadarsh-raj',
    href:    'https://linkedin.com/in/aadarsh-raj',
  },
  {
    label:   'GitHub',
    display: 'github.com/raj-aadarsh',
    href:    'https://github.com/raj-aadarsh',
  },
]

// ─── Particle handshake ───────────────────────────────────────
// Two arms meeting at centre — represents connection and collaboration.

const ARM_PTS   = 450
const HAND_PTS  = 500
const CLASP_PTS = 300
const SPARK_PTS = 300
const TOTAL     = ARM_PTS * 2 + HAND_PTS * 2 + CLASP_PTS + SPARK_PTS

function fillCylinder(homePos, idx, from, to, radius, count) {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2]
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz)
  const ux = dx/len, uy = dy/len, uz = dz/len

  // orthonormal basis around direction
  let rx, ry, rz
  if (Math.abs(uy) < 0.9) { rx = -uz; ry = 0;  rz = ux  }
  else                     { rx = 0;   ry = uz;  rz = -uy }
  const rm = Math.sqrt(rx*rx + ry*ry + rz*rz)
  rx /= rm; ry /= rm; rz /= rm
  const sx = uy*rz - uz*ry, sy = uz*rx - ux*rz, sz = ux*ry - uy*rx

  for (let i = 0; i < count; i++) {
    const t = Math.random() * len
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * radius
    homePos[idx*3]     = from[0] + ux*t + rx*r*Math.cos(a) + sx*r*Math.sin(a) + (Math.random()-0.5)*0.025
    homePos[idx*3 + 1] = from[1] + uy*t + ry*r*Math.cos(a) + sy*r*Math.sin(a) + (Math.random()-0.5)*0.025
    homePos[idx*3 + 2] = from[2] + uz*t + rz*r*Math.cos(a) + sz*r*Math.sin(a) + (Math.random()-0.5)*0.025
    idx++
  }
  return idx
}

function fillBox(homePos, idx, cx, cy, cz, wx, wy, wz, rotY, count) {
  const cosR = Math.cos(rotY), sinR = Math.sin(rotY)
  for (let i = 0; i < count; i++) {
    const lx = (Math.random()-0.5)*wx, ly = (Math.random()-0.5)*wy, lz = (Math.random()-0.5)*wz
    homePos[idx*3]     = cx + lx*cosR - lz*sinR + (Math.random()-0.5)*0.02
    homePos[idx*3 + 1] = cy + ly                 + (Math.random()-0.5)*0.02
    homePos[idx*3 + 2] = cz + lx*sinR + lz*cosR + (Math.random()-0.5)*0.02
    idx++
  }
  return idx
}

function HandshakeOrb({ assembleProgress }) {
  const groupRef  = useRef()
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(TOTAL * 3)
    const burstPos = new Float32Array(TOTAL * 3)
    const colors   = new Float32Array(TOTAL * 3)

    let idx = 0

    // Left arm — blue
    const la0 = idx
    idx = fillCylinder(homePos, idx, [-2.0, 0.60, 0.20], [-0.40, 0.14, 0.05], 0.13, ARM_PTS)
    for (let i = la0; i < idx; i++) {
      colors[i*3] = 0.23; colors[i*3+1] = 0.51; colors[i*3+2] = 0.96
      if (Math.random() < 0.06) { colors[i*3] = 0.58; colors[i*3+1] = 0.77; colors[i*3+2] = 0.99 }
    }

    // Right arm — cyan
    const ra0 = idx
    idx = fillCylinder(homePos, idx, [2.0, -0.60, -0.20], [0.40, -0.14, -0.05], 0.13, ARM_PTS)
    for (let i = ra0; i < idx; i++) {
      colors[i*3] = 0.13; colors[i*3+1] = 0.83; colors[i*3+2] = 0.93
      if (Math.random() < 0.06) { colors[i*3] = 0.58; colors[i*3+1] = 0.95; colors[i*3+2] = 1.0 }
    }

    // Left hand — blue box
    const lh0 = idx
    idx = fillBox(homePos, idx, -0.16, 0.09, 0.06, 0.44, 0.27, 0.22, 0.28, HAND_PTS)
    for (let i = lh0; i < idx; i++) {
      colors[i*3] = 0.23; colors[i*3+1] = 0.51; colors[i*3+2] = 0.96
    }

    // Right hand — cyan box
    const rh0 = idx
    idx = fillBox(homePos, idx, 0.16, -0.09, -0.06, 0.44, 0.27, 0.22, 0.28, HAND_PTS)
    for (let i = rh0; i < idx; i++) {
      colors[i*3] = 0.13; colors[i*3+1] = 0.83; colors[i*3+2] = 0.93
    }

    // Clasp — bright sphere at the grip point
    const cl0 = idx
    for (let i = 0; i < CLASP_PTS; i++) {
      const r   = Math.random() * 0.20
      const phi = Math.acos(2 * Math.random() - 1)
      const th  = Math.random() * Math.PI * 2
      homePos[idx*3]     = r * Math.sin(phi) * Math.cos(th)
      homePos[idx*3 + 1] = r * Math.cos(phi)
      homePos[idx*3 + 2] = r * Math.sin(phi) * Math.sin(th)
      idx++
    }
    for (let i = cl0; i < idx; i++) {
      const b = 0.78 + Math.random() * 0.22
      colors[i*3] = b; colors[i*3+1] = b; colors[i*3+2] = 1.0
    }

    // Soft halo sparkles
    const sp0 = idx
    for (let i = 0; i < SPARK_PTS; i++) {
      homePos[idx*3]     = (Math.random()-0.5) * 3.6
      homePos[idx*3 + 1] = (Math.random()-0.5) * 1.8
      homePos[idx*3 + 2] = (Math.random()-0.5) * 1.2
      idx++
    }
    for (let i = sp0; i < idx; i++) {
      colors[i*3] = 0.35; colors[i*3+1] = 0.65; colors[i*3+2] = 0.98
    }

    // Burst positions — all particles scatter from origin
    for (let i = 0; i < TOTAL; i++) {
      const bf = 10 + Math.random() * 22
      burstPos[i*3]     = homePos[i*3]     * bf + (Math.random()-0.5) * 8
      burstPos[i*3 + 1] = homePos[i*3 + 1] * bf + (Math.random()-0.5) * 8
      burstPos[i*3 + 2] = homePos[i*3 + 2] * bf + (Math.random()-0.5) * 8
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(homePos.slice(), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    return { geo: g, homePos, burstPos }
  }, [])

  useFrame(() => {
    if (!groupRef.current || !pointsRef.current) return
    groupRef.current.rotation.y += 0.004

    const p = Math.max(0, Math.min(1, assembleProgress.current))
    if (Math.abs(p - lastP.current) < 0.001) return
    lastP.current = p

    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < TOTAL; i++) {
      pos[i*3]     = burstPos[i*3]     + p * (homePos[i*3]     - burstPos[i*3])
      pos[i*3 + 1] = burstPos[i*3 + 1] + p * (homePos[i*3 + 1] - burstPos[i*3 + 1])
      pos[i*3 + 2] = burstPos[i*3 + 2] + p * (homePos[i*3 + 2] - burstPos[i*3 + 2])
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef} rotation={[0.30, 0, 0]} position={[2.6, -0.3, 0]}>
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          size={0.030}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.90}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function Scene({ assembleProgress }) {
  return (
    <>
      <ambientLight intensity={0.04} />
      <pointLight position={[3, 2, 3]}   intensity={2.6} color="#3B82F6" />
      <pointLight position={[-1, -2, 2]} intensity={1.2} color="#0EA5E9" />
      <HandshakeOrb assembleProgress={assembleProgress} />
    </>
  )
}

function ContactLink({ item }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={item.href}
      target={item.href.startsWith('mailto') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.25rem',
        border: `1px solid ${hovered ? C.blue + '55' : C.border}`,
        background: hovered ? 'rgba(59,130,246,0.04)' : 'transparent',
        textDecoration: 'none',
        transition: 'border-color 0.22s, background 0.22s',
        cursor: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue }}>
          {item.label}
        </span>
        <span style={{ fontFamily: sans, fontSize: '0.9rem', color: hovered ? C.text : C.muted, transition: 'color 0.22s' }}>
          {item.display}
        </span>
      </div>
      <span style={{ fontFamily: mono, fontSize: '0.9rem', color: hovered ? C.blue : C.muted, transition: 'color 0.22s', marginLeft: '1rem' }}>
        →
      </span>
    </a>
  )
}

export default function Connect() {
  const sectionRef      = useRef(null)
  const headingRef      = useRef(null)
  const contentRef      = useRef(null)
  const assembleProgress = useRef(0)

  useEffect(() => {
    if (!sectionRef.current) return
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   1.8,
      },
    })
    tl.to(assembleProgress, { current: 1, duration: 0.35, ease: 'none' })
    tl.to(assembleProgress, { current: 1, duration: 0.30, ease: 'none' })
    tl.to(assembleProgress, { current: 0, duration: 0.35, ease: 'none' })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    if (!headingRef.current) return
    gsap.set(headingRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(headingRef.current, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
    })
  }, [])

  useEffect(() => {
    if (!contentRef.current) return
    gsap.set(contentRef.current, { autoAlpha: 0, y: 24 })
    gsap.to(contentRef.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: contentRef.current, start: 'top 83%' },
    })
  }, [])

  return (
    <section
      id="connect"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
        padding: '9rem 0',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
      >
        <Scene assembleProgress={assembleProgress} />
      </Canvas>

      {/* Left-side gradient — keeps data readable */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '62%', pointerEvents: 'none', zIndex: 1,
        background: `linear-gradient(to right, ${C.bg} 55%, transparent 100%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: '0 4%' }}>

        <h2
          ref={headingRef}
          style={{
            fontFamily: sans, fontWeight: 700,
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            letterSpacing: '-0.02em', color: C.text,
            marginBottom: '3rem',
            visibility: 'hidden',
          }}
        >
          Connect With <span style={{ color: C.blue }}>Me</span>
        </h2>

        <div ref={contentRef} style={{ maxWidth: '560px', visibility: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CONTACT_LINKS.map(item => <ContactLink key={item.label} item={item} />)}
          </div>
        </div>

      </div>
    </section>
  )
}
