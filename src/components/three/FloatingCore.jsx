import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FloatingCore() {
  const meshRef  = useRef(null)
  const glowRef  = useRef(null)
  const isDragging = useRef(false)
  const prevMouse  = useRef({ x: 0, y: 0 })
  const velocity   = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (!isDragging.current) {
      meshRef.current.rotation.x += delta * 0.15
      meshRef.current.rotation.y += delta * 0.22
      velocity.current.x *= 0.92
      velocity.current.y *= 0.92
      meshRef.current.rotation.y += velocity.current.x * 0.008
      meshRef.current.rotation.x += velocity.current.y * 0.008
    }

    // Float
    const t = state.clock.elapsedTime
    meshRef.current.position.y = Math.sin(t * 0.7) * 0.18

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.04 + Math.sin(t * 1.2) * 0.02
    }
  })

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerDown={e => {
          isDragging.current = true
          prevMouse.current = { x: e.clientX, y: e.clientY }
          e.stopPropagation()
        }}
        onPointerMove={e => {
          if (!isDragging.current) return
          const dx = e.clientX - prevMouse.current.x
          const dy = e.clientY - prevMouse.current.y
          meshRef.current.rotation.y += dx * 0.008
          meshRef.current.rotation.x += dy * 0.008
          velocity.current = { x: dx, y: dy }
          prevMouse.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={() => { isDragging.current = false }}
        onPointerLeave={() => { isDragging.current = false }}
      >
        <torusKnotGeometry args={[1, 0.28, 200, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#58A6FF"
          emissive="#1a3a6e"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>

      {/* Outer glow sphere */}
      <mesh ref={glowRef} scale={[2.4, 2.4, 2.4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#58A6FF"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
