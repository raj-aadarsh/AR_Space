import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useViewport } from '../../utils/viewport.js'

gsap.registerPlugin(ScrollTrigger)

const BG   = '#080B11'
const BLUE  = '#3B82F6'
const MUTED = '#7D8590'
const TEXT  = '#F0F6FC'
const sans  = "'Space Grotesk', sans-serif"
const mono  = "'Space Mono', monospace"

// One label per node — covers the full stack visible in the resume
const TECH_LABELS = [
  'Java', 'Python', 'AOSP', 'Android', 'AI',
  'Django', 'React', 'MongoDB', 'Docker', 'Jenkins',
  'Kotlin', 'Blockchain', 'GenAI', 'Linux', 'Git',
  'REST', 'Gradle', 'AIDL', 'HAL', 'ML',
  'LLM', 'FastAPI', 'C++', 'SQL',
]
const N_NODES = TECH_LABELS.length // 24

// ─── Neural network ───────────────────────────────────────
function NeuralNet({ scrollProgress, mouseRef }) {
  const groupRef      = useRef()
  const linesRef      = useRef()
  const lineMatRef    = useRef()
  const nodeGroupRefs = useRef([])
  const lastP         = useRef(-1)
  const tempPos       = useRef(new Float32Array(N_NODES * 3))

  // Shared geometry + material for all node spheres
  const nodeGeo = useMemo(() => new THREE.SphereGeometry(0.09, 10, 10), [])
  const nodeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             '#93C5FD',
    emissive:          '#2563EB',
    emissiveIntensity: 0.9,
    metalness:         0.2,
    roughness:         0.45,
  }), [])

  const { homePos, burstPos, phases, edges, edgeGeo, ambientGeo, ambHome, ambBurst } = useMemo(() => {
    const homePos  = new Float32Array(N_NODES * 3)
    const burstPos = new Float32Array(N_NODES * 3)
    const phases   = new Float32Array(N_NODES)

    for (let i = 0; i < N_NODES; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / N_NODES)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const r     = 1.1 + Math.random() * 1.0

      homePos[i*3]     = r * Math.sin(phi) * Math.cos(theta)
      homePos[i*3 + 1] = r * Math.cos(phi)
      homePos[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const bf = 5 + Math.random() * 10
      burstPos[i*3]     = homePos[i*3]     * bf + (Math.random() - 0.5) * 5
      burstPos[i*3 + 1] = homePos[i*3 + 1] * bf + (Math.random() - 0.5) * 5
      burstPos[i*3 + 2] = homePos[i*3 + 2] * bf + (Math.random() - 0.5) * 5

      phases[i] = Math.random() * Math.PI * 2
    }

    // Connect each node to its 2–3 nearest neighbours
    const edges = []
    for (let i = 0; i < N_NODES; i++) {
      const dists = []
      for (let j = i + 1; j < N_NODES; j++) {
        const dx = homePos[i*3] - homePos[j*3]
        const dy = homePos[i*3+1] - homePos[j*3+1]
        const dz = homePos[i*3+2] - homePos[j*3+2]
        dists.push({ j, d: Math.sqrt(dx*dx + dy*dy + dz*dz) })
      }
      dists.sort((a, b) => a.d - b.d)
      const maxConn = Math.random() > 0.55 ? 3 : 2
      for (let k = 0; k < Math.min(maxConn, dists.length); k++) {
        if (dists[k].d < 2.4) edges.push([i, dists[k].j])
      }
    }

    const edgePos = new Float32Array(edges.length * 2 * 3)
    const edgeGeo = new THREE.BufferGeometry()
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3))

    // Ambient particle cloud
    const AMB = 700
    const ambHome  = new Float32Array(AMB * 3)
    const ambBurst = new Float32Array(AMB * 3)
    const ambColor = new Float32Array(AMB * 3)

    for (let i = 0; i < AMB; i++) {
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r     = 0.4 + Math.random() * 2.8
      ambHome[i*3]     = r * Math.sin(phi) * Math.cos(theta)
      ambHome[i*3 + 1] = r * Math.cos(phi)
      ambHome[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const bf = 5 + Math.random() * 12
      ambBurst[i*3]     = ambHome[i*3]     * bf
      ambBurst[i*3 + 1] = ambHome[i*3 + 1] * bf
      ambBurst[i*3 + 2] = ambHome[i*3 + 2] * bf

      if (Math.random() < 0.55) {
        ambColor[i*3] = 0.23; ambColor[i*3+1] = 0.51; ambColor[i*3+2] = 0.96
      } else {
        ambColor[i*3] = 0.13; ambColor[i*3+1] = 0.82; ambColor[i*3+2] = 1.0
      }
    }

    const ambientGeo = new THREE.BufferGeometry()
    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambHome.slice(), 3))
    ambientGeo.setAttribute('color',    new THREE.BufferAttribute(ambColor, 3))

    return { homePos, burstPos, phases, edges, edgeGeo, ambientGeo, ambHome, ambBurst }
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current || !linesRef.current) return

    const p = Math.max(0, Math.min(1, scrollProgress.current))
    const t = clock.elapsedTime

    // Slow rotation + mouse tilt
    groupRef.current.rotation.y += 0.004 * (1 - p * 0.85)
    if (mouseRef?.current) {
      groupRef.current.rotation.x +=
        (-mouseRef.current.y * 0.1 - groupRef.current.rotation.x) * 0.03
    }

    // Line connections fade out as network bursts
    if (lineMatRef.current) {
      lineMatRef.current.opacity = Math.max(0, 0.32 * (1 - p * 2.2))
    }

    // Update every node group position + pulse scale (24 nodes — trivial)
    for (let i = 0; i < N_NODES; i++) {
      tempPos.current[i*3]     = homePos[i*3]     + p * (burstPos[i*3]     - homePos[i*3])
      tempPos.current[i*3 + 1] = homePos[i*3 + 1] + p * (burstPos[i*3 + 1] - homePos[i*3 + 1])
      tempPos.current[i*3 + 2] = homePos[i*3 + 2] + p * (burstPos[i*3 + 2] - homePos[i*3 + 2])

      const grp = nodeGroupRefs.current[i]
      if (!grp) continue
      grp.position.set(tempPos.current[i*3], tempPos.current[i*3+1], tempPos.current[i*3+2])
      const s = Math.max(0.001, (1 - p * 0.95) * (0.82 + 0.22 * Math.sin(t * 2.2 + phases[i])))
      grp.scale.setScalar(s)
    }

    // Update edges + ambient particles only when scroll progress changes
    if (Math.abs(p - lastP.current) < 0.001) return
    lastP.current = p

    const edgePos = linesRef.current.geometry.attributes.position.array
    for (let e = 0; e < edges.length; e++) {
      const [i, j] = edges[e]
      edgePos[e*6]   = tempPos.current[i*3];   edgePos[e*6+1] = tempPos.current[i*3+1]; edgePos[e*6+2] = tempPos.current[i*3+2]
      edgePos[e*6+3] = tempPos.current[j*3];   edgePos[e*6+4] = tempPos.current[j*3+1]; edgePos[e*6+5] = tempPos.current[j*3+2]
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true

    const ambPos = ambientGeo.attributes.position.array
    for (let i = 0; i < ambHome.length / 3; i++) {
      ambPos[i*3]     = ambHome[i*3]     + p * (ambBurst[i*3]     - ambHome[i*3])
      ambPos[i*3 + 1] = ambHome[i*3 + 1] + p * (ambBurst[i*3 + 1] - ambHome[i*3 + 1])
      ambPos[i*3 + 2] = ambHome[i*3 + 2] + p * (ambBurst[i*3 + 2] - ambHome[i*3 + 2])
    }
    ambientGeo.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={[1.4, 0, 0]}>
      {/* Ambient blue particle cloud */}
      <points geometry={ambientGeo}>
        <pointsMaterial
          size={0.022} vertexColors sizeAttenuation
          transparent opacity={0.65} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Synapse connections */}
      <lineSegments ref={linesRef} geometry={edgeGeo}>
        <lineBasicMaterial ref={lineMatRef} color="#60A5FA" transparent opacity={0.32} />
      </lineSegments>

      {/* Neuron nodes — each with its own tech label */}
      {TECH_LABELS.map((label, i) => (
        <group
          key={label}
          ref={(el) => { nodeGroupRefs.current[i] = el }}
          position={[homePos[i*3], homePos[i*3+1], homePos[i*3+2]]}
        >
          {/* Glowing node sphere */}
          <mesh geometry={nodeGeo} material={nodeMat} />
          {/* Tech label — Billboard keeps it facing the camera at all times */}
          <Billboard position={[0, 0.18, 0]}>
            <Text
              fontSize={0.1}
              color="#93C5FD"
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.04}
              renderOrder={2}
            >
              {label}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  )
}

function Scene({ scrollProgress, mouseRef }) {
  return (
    <>
      <color attach="background" args={['#080B11']} />
      <ambientLight intensity={0.12} />
      <pointLight position={[2, 3, 4]}  intensity={3}   color="#3B82F6" />
      <pointLight position={[-3, -2, 2]} intensity={1.5} color="#1E3A8A" />
      <NeuralNet scrollProgress={scrollProgress} mouseRef={mouseRef} />
    </>
  )
}

export default function Hero() {
  const sectionRef     = useRef(null)
  const tagRef         = useRef(null)
  const nameRef        = useRef(null)
  const roleRef        = useRef(null)
  const scrollProgress = useRef(0)
  const mouseRef       = useRef({ x: 0, y: 0 })
  const vp       = useViewport()
  const isMobile = vp === 'mobile'

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return
    const tween = gsap.to(scrollProgress, {
      current: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end:   'bottom top',
        scrub: 1.5,
      },
    })
    return () => tween.scrollTrigger?.kill()
  }, [])

  useEffect(() => {
    const els = [tagRef.current, nameRef.current, roleRef.current]
    gsap.set(els, { autoAlpha: 0, y: 28 })
    gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.13, delay: 0.4 })
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100%', height: '100vh',
      minHeight: '600px', overflow: 'hidden', background: BG,
    }}>

      <Canvas
        camera={{ position: [0, 0, 8], fov: 48 }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <Scene scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(105deg,
          ${BG} 0%,
          ${BG}F2 30%,
          ${BG}A8 50%,
          ${BG}33 65%,
          transparent 100%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
        zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to top, ${BG}, transparent)`,
      }} />

      {/* Text — left column */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 7%',
      }}>

        <p ref={tagRef} style={{
          fontFamily: mono, fontSize: '0.72rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: BLUE, marginBottom: '1.25rem',
          visibility: 'hidden',
        }}>
          Software Engineer
        </p>

        {/* Name — "Aadarsh" sets the reference width for the tagline below */}
        <h1 ref={nameRef} style={{
          fontFamily: sans, fontWeight: 800,
          fontSize: 'clamp(3.8rem, 10vw, 8rem)',
          lineHeight: 0.93, letterSpacing: '-0.03em',
          color: TEXT, marginBottom: '1.5rem',
          visibility: 'hidden',
          width: 'fit-content',
        }}>
          Aadarsh<br /><span style={{ color: BLUE }}>Raj</span>
        </h1>

        {/*
          Tagline: same width as "Aadarsh" above.
          font-size scales with viewport at the same ratio so both rows
          track together as the viewport changes.
        */}
        <p ref={roleRef} style={{
          fontFamily: mono,
          fontSize: isMobile ? 'clamp(0.6rem, 2.8vw, 0.75rem)' : 'clamp(0.55rem, 1.05vw, 0.72rem)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: MUTED,
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          lineHeight: isMobile ? 1.8 : 'normal',
          visibility: 'hidden',
        }}>
          Android Framework&nbsp;&nbsp;·&nbsp;&nbsp;Python Automation&nbsp;&nbsp;·&nbsp;&nbsp;Artificial Intelligence
        </p>

      </div>

      {/* Scroll cue */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          width: '1px', height: '44px',
          background: `linear-gradient(to bottom, transparent, ${BLUE}, transparent)`,
          animation: 'pulse 2.2s ease-in-out infinite',
        }} />
      </div>

    </section>
  )
}
