import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 3D Stars Background Component
const StarField = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  // Create star positions
  const starCount = 800;
  const positions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
  }

  useFrame((state) => {
    if (starsRef.current) {
      // Slow rotation for a subtle movement
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      
      // Gentle twinkling effect
      const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.01;
      }
      starsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={1.5} 
        color="#ffffff" 
        transparent 
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

// 3D Scene
const StarsScene = () => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <StarField />
    </>
  );
};

export const Hero3DStars = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 100], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <StarsScene />
      </Canvas>
    </div>
  );
};