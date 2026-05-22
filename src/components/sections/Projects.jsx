import { useRef, useMemo, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    title:  'AgriTrace',
    badge:  'Published · TIJER Jul 2023',
    para:   'A blockchain-based supply chain platform built for the agriculture sector, enabling end-to-end traceability from farm to consumer. Integrates ML-based price prediction to give farmers real-time market intelligence. The research was peer-reviewed and published in TIJER.',
    stack:  ['Solidity', 'Truffle', 'Ganache', 'React', 'Web3.js', 'Django', 'Python', 'Node.js'],
    link:   { label: 'Read the paper →', href: 'https://tijer.org/tijer/viewpaperforall.php?paper=TIJERA001016' },
  },
  {
    title:  'Android Build Analyzer',
    para:   'A full-stack platform built to bring visibility into Android build infrastructure. Started as an intern prototype and productised into a tool used daily by the engineering org — featuring real-time build streaming, pipeline health dashboards, security vulnerability detection, and an automated security scoring system to track and improve the security posture of every release build.',
    stack:  ['Python', 'Django', 'React', 'MongoDB Atlas', 'Jenkins', 'Web-Realm'],
  },
  {
    title:  'Stability AI',
    para:   'A Streamlit-based tool for analyzing Android framework crash logs across all crash types. The core analysis logic — pattern recognition, root cause inference, and diagnostic output — is custom-written. Paired with a clean, purpose-built UI covering log input, interactive controls, and structured output, making crash analysis fast and accessible.',
    stack:  ['Python', 'Streamlit', 'GenAI', 'LLM', 'LangChain'],
  },
]

// ─── Möbius strip made of particles ──────────────────────────
// A single-surface twisted ring — one continuous loop with a 180° twist.
// Parametric: x=(R + v·cos(u/2))·cos(u), y=(R + v·cos(u/2))·sin(u), z=v·sin(u/2)
const TOTAL = 2200
const MOB_R = 1.15  // major radius
const MOB_W = 0.46  // half-width of strip

function MobiusStrip({ assembleProgress, mobile }) {
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(TOTAL * 3)
    const burstPos = new Float32Array(TOTAL * 3)
    const colors   = new Float32Array(TOTAL * 3)

    for (let i = 0; i < TOTAL; i++) {
      const u = Math.random() * Math.PI * 2
      const v = (Math.random() * 2 - 1) * MOB_W

      const cu = Math.cos(u), su = Math.sin(u)
      const chu = Math.cos(u / 2), shu = Math.sin(u / 2)

      homePos[i*3]     = (MOB_R + v * chu) * cu + (Math.random() - 0.5) * 0.035
      homePos[i*3 + 1] = (MOB_R + v * chu) * su + (Math.random() - 0.5) * 0.035
      homePos[i*3 + 2] = v * shu                 + (Math.random() - 0.5) * 0.035

      const bf = 10 + Math.random() * 22
      burstPos[i*3]     = homePos[i*3]     * bf + (Math.random() - 0.5) * 8
      burstPos[i*3 + 1] = homePos[i*3 + 1] * bf + (Math.random() - 0.5) * 8
      burstPos[i*3 + 2] = homePos[i*3 + 2] * bf + (Math.random() - 0.5) * 8

      // Blue → cyan gradient flowing around the strip
      const t = u / (Math.PI * 2)
      colors[i*3]     = 0.23 + t * (-0.10)
      colors[i*3 + 1] = 0.51 + t *  0.32
      colors[i*3 + 2] = 0.96 - t *  0.03

      // Bright edge highlights
      if (Math.abs(v) > MOB_W * 0.82 && Math.random() < 0.55) {
        colors[i*3] = 0.75; colors[i*3+1] = 0.90; colors[i*3+2] = 1.0
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
    pointsRef.current.rotation.z += 0.001

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
    <points ref={pointsRef} geometry={geo} position={mobile ? [0, 0, 0] : [1.7, -0.25, 0]}>
      <pointsMaterial
        size={0.026}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Scene({ assembleProgress, mobile }) {
  return (
    <>
      <ambientLight intensity={0.04} />
      <pointLight position={[3, 2, 3]}   intensity={2.6} color="#3B82F6" />
      <pointLight position={[-1, -2, 2]} intensity={1.2} color="#0EA5E9" />
      <MobiusStrip assembleProgress={assembleProgress} mobile={mobile} />
    </>
  )
}

function ProjectCard({ project, isLast }) {
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
        <h3 style={{
          fontFamily: sans, fontWeight: 700, fontSize: '1.15rem',
          letterSpacing: '-0.01em', color: C.text,
        }}>
          {project.title}
        </h3>
        {project.badge && (
          <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
            {project.badge}
          </span>
        )}
      </div>

      <p style={{
        fontFamily: sans, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.8, marginBottom: '1rem',
      }}>
        {project.para}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: project.link ? '0.875rem' : 0 }}>
        {project.stack.map(tag => (
          <span key={tag} style={{
            fontFamily: mono, fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.22rem 0.6rem',
            border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {project.link && (
        <a
          href={project.link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: mono, fontSize: '0.7rem',
            color: C.blue, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {project.link.label}
        </a>
      )}
    </div>
  )
}

export default function Projects() {
  const vp       = useViewport()
  const isMobile = vp === 'mobile'
  const isTablet = vp === 'tablet'
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
      <Canvas camera={{ position: [0, 0, 4.0], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
        <Scene assembleProgress={assembleProgress} mobile />
      </Canvas>
    </div>
  )

  return (
    <section
      id="projects"
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
          <Scene assembleProgress={assembleProgress} />
        </Canvas>
      )}
      {!isMobile && (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '62%', pointerEvents: 'none', zIndex: 1,
          background: `linear-gradient(to right, ${C.bg} 55%, transparent 100%)` }} />
      )}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '0 5%' : '0 4%' }}>
        <div style={isMobile ? { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' } : {}}>
          <h2
            ref={headingRef}
            style={{
              fontFamily: sans, fontWeight: 700,
              fontSize: isMobile ? 'clamp(1.4rem, 6.5vw, 2rem)' : 'clamp(2.25rem, 5vw, 4rem)',
              letterSpacing: '-0.02em',
              color: C.text,
              marginBottom: isMobile ? 0 : '4rem',
              flex: isMobile ? 1 : 'none',
              visibility: 'hidden',
            }}
          >
            Projects
          </h2>
          {isMobile && miniCanvas}
        </div>

        <div style={{ maxWidth: isMobile ? '100%' : isTablet ? '60%' : '660px' }}>
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} isLast={i === PROJECTS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
