import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  Text3D, 
  MeshDistortMaterial,
  Sphere,
  Stars
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Mic, Search } from 'lucide-react';
import * as THREE from 'three';

// Animated Logo Component
const AnimatedLogo = ({ position, rotation = [0, 0, 0] as [number, number, number], isUTA = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {isUTA ? (
          // UTA Logo - Abstract "U" shape
          <group>
            <mesh position={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
              <meshStandardMaterial 
                color="#1E90FF" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#0066CC"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
              <meshStandardMaterial 
                color="#FF7F00" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#CC5500"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <torusGeometry args={[0.4, 0.1, 8, 16, Math.PI]} />
              <meshStandardMaterial 
                color="#3BFFB3" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#00CC88"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        ) : (
          // App Symbol - Hexagonal crystal
          <mesh>
            <octahedronGeometry args={[0.8]} />
            <MeshDistortMaterial
              color="#1E90FF"
              metalness={0.9}
              roughness={0.1}
              distort={0.2}
              speed={2}
              factor={0.5}
              emissive="#3BFFB3"
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </mesh>
    </Float>
  );
};

// Particle System
const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3BFFB3"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

// Main 3D Scene
const Scene3D = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const { camera } = useThree();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Cinematic intro sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 2000);
    const timer3 = setTimeout(() => {
      setAnimationPhase(3);
      onAnimationComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onAnimationComplete]);

  useFrame((state) => {
    if (animationPhase === 1) {
      // Dolly-in camera movement
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4, 0.02);
    }
  });

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#3BFFB3" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ParticleField />
      
      {/* Logos with animation */}
      <AnimatedLogo 
        position={animationPhase >= 2 ? [-2, 0, 0] : [0, 0, 0]} 
        isUTA={true}
      />
      <AnimatedLogo 
        position={animationPhase >= 2 ? [2, 0, 0] : [0, 0, 0]} 
        isUTA={false}
      />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={animationPhase >= 3}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

export const Hero3D = () => {
  const [showContent, setShowContent] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden grain">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <Scene3D onAnimationComplete={() => setShowContent(true)} />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="font-inter-tight font-bold text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
              Navigate UTA.{' '}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Smarter.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Search everything. Ask by voice. Get instant answers for campus life, academics, and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                className="btn-hero group"
                onClick={() => scrollToSection('#search')}
              >
                <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Searching
              </Button>
              
              <Button 
                className="btn-ghost-hero group"
                onClick={() => scrollToSection('#voice')}
              >
                <Mic className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Voice
              </Button>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
                <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};