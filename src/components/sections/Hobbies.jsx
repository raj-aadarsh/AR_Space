import { useRef, useMemo, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const GROUPS = [
  {
    category: 'Sports & Gaming',
    items:    ['Skating', 'Console Games', 'Pickleball'],
  },
  {
    category: 'Creativity',
    items:    ['Canva', 'Drawing', 'Blender'],
  },
  {
    category: 'Organisation',
    items:    ['Event Management'],
  },
]

// ─── Particle icosahedron ─────────────────────────────────────
// 12 vertices, 30 edges — a multifaceted geometric solid.
// Represents the many dimensions of a person beyond their work.

const PHI = (1 + Math.sqrt(5)) / 2

const VERTS_RAW = [
  [0,   1,   PHI], [0,  -1,   PHI], [0,   1,  -PHI], [0,  -1,  -PHI],
  [1,   PHI, 0  ], [-1,  PHI, 0  ], [1,  -PHI, 0  ], [-1, -PHI, 0  ],
  [PHI, 0,   1  ], [-PHI, 0,   1  ], [PHI,  0,  -1 ], [-PHI,  0,  -1],
]

const S = 0.80
const VERTS = VERTS_RAW.map(([x, y, z]) => [x * S, y * S, z * S])

const EDGES = []
const ELEN = 2.0 * S * 1.05
for (let i = 0; i < 12; i++) {
  for (let j = i + 1; j < 12; j++) {
    const dx = VERTS[i][0] - VERTS[j][0]
    const dy = VERTS[i][1] - VERTS[j][1]
    const dz = VERTS[i][2] - VERTS[j][2]
    if (Math.sqrt(dx*dx + dy*dy + dz*dz) < ELEN) EDGES.push([i, j])
  }
}

const EDGE_PTS  = 30
const VERT_PTS  = 14
const GLOW_PTS  = 220
const SPARK_PTS = 220
const TOTAL = EDGES.length * EDGE_PTS + 12 * VERT_PTS + GLOW_PTS + SPARK_PTS

function IcoOrb({ assembleProgress, mobile, orbPos, orbScale = 1 }) {
  const groupRef  = useRef()
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(TOTAL * 3)
    const burstPos = new Float32Array(TOTAL * 3)
    const colors   = new Float32Array(TOTAL * 3)

    let idx = 0

    // Edge particles — blue
    const e0 = idx
    EDGES.forEach(([a, b]) => {
      const [ax, ay, az] = VERTS[a]
      const [bx, by, bz] = VERTS[b]
      for (let k = 0; k < EDGE_PTS; k++) {
        const t = Math.random()
        homePos[idx*3]     = ax + t*(bx-ax) + (Math.random()-0.5)*0.022
        homePos[idx*3 + 1] = ay + t*(by-ay) + (Math.random()-0.5)*0.022
        homePos[idx*3 + 2] = az + t*(bz-az) + (Math.random()-0.5)*0.022
        idx++
      }
    })
    for (let i = e0; i < idx; i++) {
      colors[i*3] = 0.23; colors[i*3+1] = 0.51; colors[i*3+2] = 0.96
      if (Math.random() < 0.08) { colors[i*3] = 0.58; colors[i*3+1] = 0.77; colors[i*3+2] = 0.99 }
    }

    // Vertex clusters — cyan
    const v0 = idx
    VERTS.forEach(([vx, vy, vz]) => {
      for (let k = 0; k < VERT_PTS; k++) {
        homePos[idx*3]     = vx + (Math.random()-0.5)*0.09
        homePos[idx*3 + 1] = vy + (Math.random()-0.5)*0.09
        homePos[idx*3 + 2] = vz + (Math.random()-0.5)*0.09
        idx++
      }
    })
    for (let i = v0; i < idx; i++) {
      colors[i*3] = 0.13; colors[i*3+1] = 0.83; colors[i*3+2] = 0.93
    }

    // Glow core
    const g0 = idx
    for (let i = 0; i < GLOW_PTS; i++) {
      const r   = Math.random() * 0.20
      const phi = Math.acos(2 * Math.random() - 1)
      const th  = Math.random() * Math.PI * 2
      homePos[idx*3]     = r * Math.sin(phi) * Math.cos(th)
      homePos[idx*3 + 1] = r * Math.cos(phi)
      homePos[idx*3 + 2] = r * Math.sin(phi) * Math.sin(th)
      idx++
    }
    for (let i = g0; i < idx; i++) {
      const b = 0.80 + Math.random() * 0.20
      colors[i*3] = b; colors[i*3+1] = b; colors[i*3+2] = 1.0
    }

    // Sparkles
    const s0 = idx
    for (let i = 0; i < SPARK_PTS; i++) {
      homePos[idx*3]     = (Math.random()-0.5) * 2.8
      homePos[idx*3 + 1] = (Math.random()-0.5) * 2.8
      homePos[idx*3 + 2] = (Math.random()-0.5) * 2.0
      idx++
    }
    for (let i = s0; i < idx; i++) {
      colors[i*3] = 0.35; colors[i*3+1] = 0.65; colors[i*3+2] = 0.98
    }

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
    groupRef.current.rotation.x += 0.001

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
    <group ref={groupRef} rotation={[0.3, 0.4, 0]} position={mobile ? [0, 0, 0] : orbPos} scale={mobile ? 1 : orbScale}>
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          size={0.032}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function Scene({ assembleProgress, mobile, orbPos, orbScale }) {
  return (
    <>
      <ambientLight intensity={0.04} />
      <pointLight position={[-3, 2, 3]}  intensity={2.6} color="#3B82F6" />
      <pointLight position={[1, -2, 2]}  intensity={1.2} color="#0EA5E9" />
      <IcoOrb assembleProgress={assembleProgress} mobile={mobile} orbPos={orbPos} orbScale={orbScale} />
    </>
  )
}

function HobbyGroup({ group, isLast }) {
  const ref = useRef()

  useEffect(() => {
    gsap.set(ref.current, { autoAlpha: 0, y: 24 })
    gsap.to(ref.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 83%' },
    })
  }, [])

  return (
    <div
      ref={ref}
      style={{
        paddingBottom: isLast ? 0 : '1.25rem',
        marginBottom:  isLast ? 0 : '1.25rem',
        borderBottom:  isLast ? 'none' : `1px solid ${C.border}`,
        visibility: 'hidden',
      }}
    >
      <span style={{
        display: 'block',
        fontFamily: mono, fontSize: '0.65rem',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: C.blue, marginBottom: '0.875rem',
      }}>
        {group.category}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {group.items.map(item => (
          <span key={item} style={{
            fontFamily: mono, fontSize: '0.78rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.38rem 0.9rem',
            border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hobbies() {
  const vp       = useViewport()
  const isMobile   = vp === 'mobile'
  const isNarrowVp = vp === 'tablet-portrait' || vp === 'phone-landscape'
  const orbPos = vp === 'phone-landscape'  ? [-2.2, -0.5, 0]
               : vp === 'tablet-portrait'  ? [-2.5, -0.5, 0]
               : vp === 'tablet-landscape' ? [-2.6, -0.7, 0]
               : [-2.0, -0.5, 0]
  const orbScale = vp === 'tablet-portrait' ? 0.82 : 1
  const sectionRef      = useRef(null)
  const headingRef      = useRef(null)
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

  const miniCanvas = (
    <div style={{ width: 'clamp(110px, 32vw, 135px)', height: 'clamp(110px, 32vw, 135px)', flexShrink: 0 }}>
      <Canvas camera={{ position: [0, 0, 3.0], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
        <Scene assembleProgress={assembleProgress} mobile />
      </Canvas>
    </div>
  )

  return (
    <section
      id="hobbies"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
        padding: isMobile ? '3rem 0' : '9rem 0',
        overflow: 'hidden',
      }}
    >
      {!isMobile && (
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          <Scene assembleProgress={assembleProgress} orbPos={orbPos} orbScale={orbScale} />
        </Canvas>
      )}
      {!isMobile && (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%', pointerEvents: 'none', zIndex: 1,
          background: `linear-gradient(to left, ${C.bg} 55%, transparent 100%)` }} />
      )}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '0 5%' : '0 4%' }}>
        <div style={isMobile ? { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' } : {}}>
          <h2
            ref={headingRef}
            style={{
              fontFamily: sans, fontWeight: 700,
              fontSize: isMobile ? 'clamp(1.4rem, 6.5vw, 2rem)' : 'clamp(2.25rem, 5vw, 4rem)',
              letterSpacing: '-0.02em', color: C.text,
              marginBottom: isMobile ? 0 : '3rem',
              flex: isMobile ? 1 : 'none',
              visibility: 'hidden',
            }}
          >
            Hobbies &amp; <span style={{ color: C.blue }}>Interests</span>
          </h2>
          {isMobile && miniCanvas}
        </div>

        <div style={{ marginLeft: isMobile ? 0 : 'auto', maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '620px' }}>
          {GROUPS.map((group, i) => (
            <HobbyGroup key={group.category} group={group} isLast={i === GROUPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
