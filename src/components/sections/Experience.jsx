import { useRef, useMemo, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const JOBS = [
  {
    role:    'Software Engineer I',
    company: 'Zebra Technologies',
    period:  'Jun 2024 – Present',
    para: 'Deep in the Android OS stack — AOSP builds, BSP layers, HAL implementations, and AIDL platform services on enterprise mobile hardware. Authoring Java platform services that run on millions of devices across warehouses and healthcare, where stability is the only metric that matters.',
  },
  {
    role:    'Associate Software Engineer',
    company: 'Tech Mahindra → Zebra Technologies',
    period:  'Aug 2023 – May 2024',
    para: 'Shipped a Gen-AI log analyzer (LangChain + OpenAI) from scratch within months of going full-time. Led full-stack development of a Django + React + MongoDB application, scaling an intern prototype into a production tool used daily by the engineering org.',
  },
  {
    role:    'Software Engineering Intern',
    company: 'Zebra Technologies',
    period:  'Jan 2023 – Jun 2023',
    para: 'Developed backend Django services and internal tooling that shipped into the broader product. Built a Jenkins CI/CD dashboard to visualize pipeline health across Zebra\'s build infrastructure — still in daily use by the team.',
  },
]

const STRAND   = 900
const RUNGS    = 28
const RUNG_PTS = 10
const TOTAL    = STRAND * 2 + RUNGS * RUNG_PTS
const HEIGHT   = 5.5
const RADIUS   = 0.7
const TURNS    = 3.5

function DNAHelix({ assembleProgress, mobile }) {
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(TOTAL * 3)
    const burstPos = new Float32Array(TOTAL * 3)
    const colors   = new Float32Array(TOTAL * 3)

    let idx = 0

    // Strand 1 — blue
    for (let i = 0; i < STRAND; i++) {
      const t = (i / STRAND) * Math.PI * 2 * TURNS
      const y = (i / STRAND) * HEIGHT - HEIGHT / 2
      const x = RADIUS * Math.cos(t)
      const z = RADIUS * Math.sin(t)

      homePos[idx*3]     = x + (Math.random() - 0.5) * 0.04
      homePos[idx*3 + 1] = y + (Math.random() - 0.5) * 0.04
      homePos[idx*3 + 2] = z + (Math.random() - 0.5) * 0.04

      const bf = 10 + Math.random() * 22
      burstPos[idx*3]     = homePos[idx*3]     * bf + (Math.random() - 0.5) * 8
      burstPos[idx*3 + 1] = homePos[idx*3 + 1] * bf + (Math.random() - 0.5) * 8
      burstPos[idx*3 + 2] = homePos[idx*3 + 2] * bf + (Math.random() - 0.5) * 8

      colors[idx*3] = 0.23; colors[idx*3+1] = 0.51; colors[idx*3+2] = 0.96
      if (Math.random() < 0.06) {
        colors[idx*3] = 0.58; colors[idx*3+1] = 0.77; colors[idx*3+2] = 0.99
      }
      idx++
    }

    // Strand 2 — cyan, phase-shifted by π
    for (let i = 0; i < STRAND; i++) {
      const t = (i / STRAND) * Math.PI * 2 * TURNS + Math.PI
      const y = (i / STRAND) * HEIGHT - HEIGHT / 2
      const x = RADIUS * Math.cos(t)
      const z = RADIUS * Math.sin(t)

      homePos[idx*3]     = x + (Math.random() - 0.5) * 0.04
      homePos[idx*3 + 1] = y + (Math.random() - 0.5) * 0.04
      homePos[idx*3 + 2] = z + (Math.random() - 0.5) * 0.04

      const bf = 10 + Math.random() * 22
      burstPos[idx*3]     = homePos[idx*3]     * bf + (Math.random() - 0.5) * 8
      burstPos[idx*3 + 1] = homePos[idx*3 + 1] * bf + (Math.random() - 0.5) * 8
      burstPos[idx*3 + 2] = homePos[idx*3 + 2] * bf + (Math.random() - 0.5) * 8

      colors[idx*3] = 0.13; colors[idx*3+1] = 0.83; colors[idx*3+2] = 0.93
      if (Math.random() < 0.06) {
        colors[idx*3] = 0.58; colors[idx*3+1] = 0.95; colors[idx*3+2] = 1.0
      }
      idx++
    }

    // Rungs — white/bright connecting the two strands
    for (let r = 0; r < RUNGS; r++) {
      const frac = r / (RUNGS - 1)
      const t    = frac * Math.PI * 2 * TURNS
      const y    = frac * HEIGHT - HEIGHT / 2

      const x1 = RADIUS * Math.cos(t)
      const z1 = RADIUS * Math.sin(t)
      const x2 = RADIUS * Math.cos(t + Math.PI)
      const z2 = RADIUS * Math.sin(t + Math.PI)

      for (let k = 0; k < RUNG_PTS; k++) {
        const s = k / (RUNG_PTS - 1)
        homePos[idx*3]     = x1 + s * (x2 - x1) + (Math.random() - 0.5) * 0.025
        homePos[idx*3 + 1] = y  + (Math.random() - 0.5) * 0.02
        homePos[idx*3 + 2] = z1 + s * (z2 - z1) + (Math.random() - 0.5) * 0.025

        const bf = 10 + Math.random() * 22
        burstPos[idx*3]     = homePos[idx*3]     * bf + (Math.random() - 0.5) * 8
        burstPos[idx*3 + 1] = homePos[idx*3 + 1] * bf + (Math.random() - 0.5) * 8
        burstPos[idx*3 + 2] = homePos[idx*3 + 2] * bf + (Math.random() - 0.5) * 8

        const bright = 0.75 + Math.random() * 0.25
        colors[idx*3] = bright; colors[idx*3+1] = bright; colors[idx*3+2] = 1.0
        idx++
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(homePos.slice(), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    return { geo: g, homePos, burstPos }
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return

    pointsRef.current.rotation.y += 0.004

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
    <points ref={pointsRef} geometry={geo} position={mobile ? [0, 0.2, 0] : [-2.2, -1.2, 0]}>
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
  )
}

function Scene({ assembleProgress, mobile }) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[-2, 2, 3]}  intensity={2.8} color="#3B82F6" />
      <pointLight position={[1, -2, 2]}  intensity={1.4} color="#0EA5E9" />
      <DNAHelix assembleProgress={assembleProgress} mobile={mobile} />
    </>
  )
}

function JobCard({ job, isLast }) {
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
        paddingBottom: isLast ? 0 : '2.75rem',
        marginBottom:  isLast ? 0 : '2.75rem',
        borderBottom:  isLast ? 'none' : `1px solid ${C.border}`,
        visibility: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem',
        marginBottom: '0.4rem',
      }}>
        <span style={{ fontFamily: mono, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue }}>
          {job.company}
        </span>
        <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
          {job.period}
        </span>
      </div>

      <h3 style={{
        fontFamily: sans, fontWeight: 700, fontSize: '1.15rem',
        letterSpacing: '-0.01em', color: C.text, marginBottom: '0.9rem',
      }}>
        {job.role}
      </h3>

      <p style={{
        fontFamily: sans, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.8,
      }}>
        {job.para}
      </p>
    </div>
  )
}

export default function Experience() {
  const sectionRef      = useRef(null)
  const headingRef      = useRef(null)
  const assembleProgress = useRef(0)
  const vp       = useViewport()
  const isMobile = vp === 'mobile'
  const isTablet = vp === 'tablet'

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
      <Canvas camera={{ position: [0, 0, 3.8], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
        <Scene assembleProgress={assembleProgress} mobile />
      </Canvas>
    </div>
  )

  return (
    <section id="experience" ref={sectionRef} style={{
      position: 'relative', background: C.bg,
      borderTop: `1px solid ${C.border}`,
      padding: isMobile ? '3rem 0' : '9rem 0',
      overflow: 'hidden',
    }}>
      {!isMobile && (
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          <Scene assembleProgress={assembleProgress} />
        </Canvas>
      )}
      {!isMobile && (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%', pointerEvents: 'none', zIndex: 1,
          background: `linear-gradient(to left, ${C.bg} 55%, transparent 100%)` }} />
      )}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '0 5%' : '0 4%' }}>
        <div style={isMobile ? { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' } : {}}>
          <h2 ref={headingRef} style={{
            fontFamily: sans, fontWeight: 700,
            fontSize: isMobile ? 'clamp(1.4rem, 6.5vw, 2rem)' : 'clamp(2.25rem, 5vw, 4rem)',
            letterSpacing: '-0.02em', color: C.text,
            marginBottom: isMobile ? 0 : '4rem',
            flex: isMobile ? 1 : 'none',
            visibility: 'hidden',
          }}>
            The <span style={{ color: C.blue }}>Work</span>
          </h2>
          {isMobile && miniCanvas}
        </div>
        <div style={{ marginLeft: isMobile ? 0 : 'auto', maxWidth: isMobile ? '100%' : isTablet ? '60%' : '680px' }}>
          {JOBS.map((job, i) => (
            <JobCard key={job.role} job={job} isLast={i === JOBS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
