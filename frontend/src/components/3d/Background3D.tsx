import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, Stars } from '@react-three/drei';
// @ts-ignore
import * as THREE from 'three';

function RotatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2563eb"
          emissive="#1e40af"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 30;
    positions[i*3+1] = (Math.random() - 0.5) * 20;
    positions[i*3+2] = (Math.random() - 0.5) * 20 - 10;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particleCount} 
          array={positions} 
          itemSize={3} 
          // @ts-ignore
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 2, 4]} intensity={0.8} color="#818cf8" />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        <ParticleField />
        <RotatingSphere />
        <Trail width={0.2} length={4} color="#2563eb" attenuation={(t) => t}>
          <mesh position={[2, 1.5, -1]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.8} />
          </mesh>
        </Trail>
      </Canvas>
    </div>
  );
}
