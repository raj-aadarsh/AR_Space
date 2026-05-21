import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── 3D mesh ───────────────────────────────────────
function OrbMesh({ hovered }) {
  const meshRef = useRef(null)
  const distort  = useRef(0.06)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.22
    meshRef.current.rotation.y += delta * 0.35
    const target = hovered ? 0.58 : 0.06
    distort.current += (target - distort.current) * 0.055
    if (meshRef.current.material) meshRef.current.material.distort = distort.current
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 3]} />
      <MeshDistortMaterial
        color="#0A1628"
        emissive="#1E3A5F"
        emissiveIntensity={hovered ? 0.8 : 0.25}
        metalness={0.95}
        roughness={0.05}
        distort={0.06}
        speed={hovered ? 4 : 1.2}
      />
    </mesh>
  )
}

// ─── Main component ────────────────────────────────
export default function ScrollOrb() {
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  // Smooth scroll-follow via GSAP scrub
  useEffect(() => {
    if (!containerRef.current) return
    const tween = gsap.to(containerRef.current, {
      y: '55vh',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'max',
        scrub: 2.5,
      },
    })
    return () => tween.scrollTrigger?.kill()
  }, [])

  // Subtle mouse-parallax tilt
  useEffect(() => {
    const onMove = (e) => {
      if (!containerRef.current) return
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx  // -1 to 1
      const dy = (e.clientY - cy) / cy
      gsap.to(containerRef.current, {
        rotateX: -dy * 8,
        rotateY:  dx * 8,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="scroll-orb"
      style={{
        position: 'fixed',
        right: '2.5rem',
        top: '12vh',
        width: '110px',
        height: '110px',
        zIndex: 5,
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Water ripple rings — CSS animated, appear on hover */}
      {hovered && [0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="orb-ripple"
          style={{ animationDelay: `${i * 0.32}s` }}
        />
      ))}

      {/* Glow behind the orb */}
      <div style={{
        position: 'absolute', inset: '-20px',
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(59,130,246,${hovered ? 0.18 : 0.07}) 0%, transparent 70%)`,
        transition: 'background 0.5s',
        pointerEvents: 'none',
      }} />

      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={3} color="#3B82F6" />
        <pointLight position={[-2, -2, 1]} intensity={0.8} color="#1D4ED8" />
        <OrbMesh hovered={hovered} />
      </Canvas>
    </div>
  )
}
