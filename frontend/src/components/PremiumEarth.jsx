import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function PremiumEarthBackground() {
  const earthRef = useRef()
  const glowRef = useRef()
  const outerGlowRef = useRef()

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.08
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.material.opacity = 0.05 + Math.sin(clock.getElapsedTime() * 0.3) * 0.015
    }
  })

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#020607']} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#4dd9b8" castShadow />
        <pointLight position={[-5, -2, -3]} intensity={0.8} color="#E8941A" />

        <Sphere ref={earthRef} args={[2.2, 64, 64]}>
          <MeshDistortMaterial
            color="#064e3b"
            emissive="#064e3b"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.4}
            distort={0.4}
            speed={1.5}
          />
        </Sphere>

        <Sphere ref={glowRef} args={[2.6, 64, 64]}>
          <meshBasicMaterial
            color="#4dd9b8"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        <Sphere ref={outerGlowRef} args={[3.0, 64, 64]}>
          <meshBasicMaterial
            color="#E8941A"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={0.3} />

        <pointLight position={[0, 0, 0]} intensity={0.5} color="#E8941A" decay={2} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={6}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

export function PremiumStars() {
  return (
    <div className="fixed inset-0 -z-30 pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.2
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at bottom, rgba(232,148,26,0.12) 0%, transparent 50%)'
      }} />
    </div>
  )
}

export function AnimatedGlows() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-blob"
           style={{ background: 'radial-gradient(circle, #4dd9b8, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-15 animate-blob animation-delay-2000"
           style={{ background: 'radial-gradient(circle, #E8941A, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-10 animate-blob animation-delay-4000"
           style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
    </div>
  )
}
