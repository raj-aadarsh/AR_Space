import { useRef, useMemo, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const SKILL_GROUPS = [
  {
    category: 'Languages',
    skills: ['Java', 'Python', 'SQL'],
  },
  {
    category: 'Frameworks',
    skills: ['Android Framework', 'Django', 'React', 'Streamlit'],
  },
  {
    category: 'Data',
    skills: ['MongoDB', 'MySQL', 'PyMongo', 'Power BI', 'REST APIs'],
  },
  {
    category: 'Artificial Intelligence',
    skills: ['LangChain', 'OpenAI', 'GenAI'],
  },
  {
    category: 'Tools & Platform',
    skills: ['BSP', 'Shell Scripts', 'Jenkins', 'Git', 'UiPath'],
  },
]

// ─── Spiral galaxy made of particles ─────────────────────────
// Two spiral arms, tilted ~25° toward viewer, slow face-on spin.
// Represents a broad, interconnected skill set radiating outward.
const COUNT = 2200

function SpiralGalaxy({ assembleProgress, mobile }) {
  const groupRef  = useRef()
  const pointsRef = useRef()
  const lastP     = useRef(-1)

  const { geo, homePos, burstPos } = useMemo(() => {
    const homePos  = new Float32Array(COUNT * 3)
    const burstPos = new Float32Array(COUNT * 3)
    const colors   = new Float32Array(COUNT * 3)

    const ARMS  = 2
    const TURNS = 2.8

    for (let i = 0; i < COUNT; i++) {
      const arm = i % ARMS
      const t   = Math.floor(i / ARMS) / (COUNT / ARMS)
      const r   = 0.10 + t * 1.3
      const θ   = (arm / ARMS) * Math.PI * 2 + t * Math.PI * 2 * TURNS + (Math.random() - 0.5) * 0.5

      homePos[i*3]     = r * Math.cos(θ) + (Math.random() - 0.5) * 0.13
      homePos[i*3 + 1] = r * Math.sin(θ) + (Math.random() - 0.5) * 0.13
      homePos[i*3 + 2] = (Math.random() - 0.5) * 0.20 * r

      const bf = 10 + Math.random() * 22
      burstPos[i*3]     = homePos[i*3]     * bf + (Math.random() - 0.5) * 8
      burstPos[i*3 + 1] = homePos[i*3 + 1] * bf + (Math.random() - 0.5) * 8
      burstPos[i*3 + 2] = homePos[i*3 + 2] * bf + (Math.random() - 0.5) * 8

      // Bright white core fading to blue → cyan at the outer arms
      const core = Math.max(0, 1 - r / 1.1)
      colors[i*3]     = 0.23 + core * 0.77
      colors[i*3 + 1] = 0.51 + core * 0.49
      colors[i*3 + 2] = 0.96 + core * 0.04

      if (Math.random() < 0.06) {
        colors[i*3] = 0.88; colors[i*3+1] = 0.94; colors[i*3+2] = 1.0
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(homePos.slice(), 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    return { geo: g, homePos, burstPos }
  }, [])

  useFrame(() => {
    if (!groupRef.current || !pointsRef.current) return
    groupRef.current.rotation.z -= 0.0022

    const p = Math.max(0, Math.min(1, assembleProgress.current))
    if (Math.abs(p - lastP.current) < 0.001) return
    lastP.current = p

    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]     = burstPos[i*3]     + p * (homePos[i*3]     - burstPos[i*3])
      pos[i*3 + 1] = burstPos[i*3 + 1] + p * (homePos[i*3 + 1] - burstPos[i*3 + 1])
      pos[i*3 + 2] = burstPos[i*3 + 2] + p * (homePos[i*3 + 2] - burstPos[i*3 + 2])
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef} rotation={[0.42, 0, 0]} position={mobile ? [0, 0, 0] : [-2.2, -0.8, 0]}>
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          size={0.027}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function Scene({ assembleProgress, mobile }) {
  return (
    <>
      <ambientLight intensity={0.04} />
      <pointLight position={[-3, 2, 3]}  intensity={2.5} color="#3B82F6" />
      <pointLight position={[1, -2, 2]}  intensity={1.2} color="#0EA5E9" />
      <SpiralGalaxy assembleProgress={assembleProgress} mobile={mobile} />
    </>
  )
}

function SkillGroup({ group, isLast }) {
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
        {group.skills.map(skill => (
          <span key={skill} style={{
            fontFamily: mono, fontSize: '0.78rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.38rem 0.9rem',
            border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
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
      id="skills"
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
              letterSpacing: '-0.02em',
              color: C.text,
              marginBottom: isMobile ? 0 : '2.5rem',
              flex: isMobile ? 1 : 'none',
              visibility: 'hidden',
            }}
          >
            Skills
          </h2>
          {isMobile && miniCanvas}
        </div>

        <div style={{ marginLeft: isMobile ? 0 : 'auto', maxWidth: isMobile ? '100%' : isTablet ? '60%' : '680px' }}>
          {SKILL_GROUPS.map((group, i) => (
            <SkillGroup key={group.category} group={group} isLast={i === SKILL_GROUPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
