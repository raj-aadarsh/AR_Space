import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function StarField({ count = 1800 }) {
  const mesh = useRef(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 180
      arr[i * 3 + 1] = (Math.random() - 0.5) * 180
      arr[i * 3 + 2] = (Math.random() - 0.5) * 180
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.015
      mesh.current.rotation.x += delta * 0.004
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8B949E"
        size={0.25}
        sizeAttenuation
        transparent
        opacity={0.55}
      />
    </points>
  )
}
