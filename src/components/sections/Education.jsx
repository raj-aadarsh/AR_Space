import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

// ─── Particle atom ────────────────────────────────────────────
// Three electron orbitals, each rotated 60° around Y from the last.
// Dense glowing nucleus at centre.
// Represents academia, scientific thinking, structured knowledge.
const ORB_N    = 380
const NUC_N    = 160
const TOTAL    = ORB_N * 3 + NUC_N
const ORB_R    = 1.6

function AtomOrb({ assembleProgress }) {
  const groupRef  = useRef()
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(TOTAL * 3)
    const burstPos = new Float32Array(TOTAL * 3)
    const colors   = new Float32Array(TOTAL * 3)

    let idx = 0

    // Three orbitals: each XY-plane circle rotated around Y by 0°, 60°, -60°
    const orbitalAngles = [0, Math.PI / 3, -Math.PI / 3]
    const orbColors = [
      [0.23, 0.51, 0.96],  // blue
      [0.13, 0.83, 0.93],  // cyan
      [0.58, 0.77, 0.99],  // lighter blue
    ]

    for (let o = 0; o < 3; o++) {
      const rotY = orbitalAngles[o]
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const [cr, cg, cb] = orbColors[o]

      for (let i = 0; i < ORB_N; i++) {
        const θ = (i / ORB_N) * Math.PI * 2
        const cosT = Math.cos(θ), sinT = Math.sin(θ)

        // Circle in XY plane, then rotated around Y axis
        const x0 = ORB_R * cosT
        const y0 = ORB_R * sinT
        const x  = x0 * cosY
        const y  = y0
        const z  = -x0 * sinY

        homePos[idx*3]     = x + (Math.random() - 0.5) * 0.045
        homePos[idx*3 + 1] = y + (Math.random() - 0.5) * 0.045
        homePos[idx*3 + 2] = z + (Math.random() - 0.5) * 0.045

        const bf = 10 + Math.random() * 22
        burstPos[idx*3]     = homePos[idx*3]     * bf + (Math.random() - 0.5) * 8
        burstPos[idx*3 + 1] = homePos[idx*3 + 1] * bf + (Math.random() - 0.5) * 8
        burstPos[idx*3 + 2] = homePos[idx*3 + 2] * bf + (Math.random() - 0.5) * 8

        colors[idx*3] = cr; colors[idx*3+1] = cg; colors[idx*3+2] = cb
        if (Math.random() < 0.07) {
          colors[idx*3] = 0.85; colors[idx*3+1] = 0.94; colors[idx*3+2] = 1.0
        }
        idx++
      }
    }

    // Nucleus — dense bright cluster
    for (let i = 0; i < NUC_N; i++) {
      const r   = Math.random() * 0.28
      const phi = Math.acos(2 * Math.random() - 1)
      const th  = Math.random() * Math.PI * 2

      homePos[idx*3]     = r * Math.sin(phi) * Math.cos(th)
      homePos[idx*3 + 1] = r * Math.cos(phi)
      homePos[idx*3 + 2] = r * Math.sin(phi) * Math.sin(th)

      const bf = 8 + Math.random() * 18
      burstPos[idx*3]     = homePos[idx*3]     * bf + (Math.random() - 0.5) * 6
      burstPos[idx*3 + 1] = homePos[idx*3 + 1] * bf + (Math.random() - 0.5) * 6
      burstPos[idx*3 + 2] = homePos[idx*3 + 2] * bf + (Math.random() - 0.5) * 6

      const bright = 0.80 + Math.random() * 0.20
      colors[idx*3] = bright; colors[idx*3+1] = bright; colors[idx*3+2] = 1.0
      idx++
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(homePos.slice(), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    return { geo: g, homePos, burstPos }
  }, [])

  useFrame(() => {
    if (!groupRef.current || !pointsRef.current) return
    groupRef.current.rotation.y += 0.003
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
    <group ref={groupRef} position={[2.2, -0.4, 0]}>
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
      <AtomOrb assembleProgress={assembleProgress} />
    </>
  )
}

export default function Education() {
  const sectionRef      = useRef(null)
  const headingRef      = useRef(null)
  const cardRef         = useRef(null)
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
    if (!cardRef.current) return
    gsap.set(cardRef.current, { autoAlpha: 0, y: 24 })
    gsap.to(cardRef.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 83%' },
    })
  }, [])

  return (
    <section
      id="education"
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

      {/* Left-side gradient — data is on the left */}
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
            letterSpacing: '-0.02em',
            color: C.text,
            marginBottom: '3rem',
            visibility: 'hidden',
          }}
        >
          Education
        </h2>

        <div ref={cardRef} style={{ maxWidth: '620px', visibility: 'hidden' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue }}>
              RV Institute of Technology and Management, Bengaluru
            </span>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
              Aug 2019 – Jun 2023
            </span>
          </div>

          <h3 style={{ fontFamily: sans, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em', color: C.text, marginBottom: '0.5rem' }}>
            Bachelor of Engineering — Information Science
          </h3>

          <p style={{ fontFamily: mono, fontSize: '0.72rem', color: C.muted, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
            CGPA 8.23 / 10
          </p>

          <p style={{ fontFamily: sans, fontSize: '0.875rem', color: C.muted, lineHeight: 1.8, marginBottom: '1.25rem' }}>
            Four-year undergraduate programme covering software engineering, data structures, algorithms, computer networks, and systems design. Final year research on blockchain-based agricultural supply chain traceability was peer-reviewed and published in TIJER, July 2023.
          </p>


        </div>
      </div>
    </section>
  )
}
