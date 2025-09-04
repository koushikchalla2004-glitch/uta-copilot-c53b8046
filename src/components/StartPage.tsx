import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import * as THREE from 'three';
import utaCopilotLogo from '@/assets/uta-copilot-logo.png';
import utaLogo from '@/assets/uta-logo-placeholder.png';

interface CoinProps {
  onAnimationComplete: () => void;
}

const SpinningCoin = ({ onAnimationComplete }: CoinProps) => {
  const coinRef = useRef<THREE.Group>(null);
  const [rotationY, setRotationY] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  
  const utaCopilotTexture = useTexture(utaCopilotLogo);
  const utaTexture = useTexture(utaLogo);

  useFrame((state, delta) => {
    if (coinRef.current && isSpinning) {
      coinRef.current.rotation.y += delta * 3;
      setRotationY(coinRef.current.rotation.y);
      
      // Stop spinning after 3 seconds and complete animation
      if (state.clock.elapsedTime > 3) {
        setIsSpinning(false);
        setTimeout(() => onAnimationComplete(), 1000);
      }
    }
  });

  // Create coin geometry
  const coinGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 32);

  return (
    <group ref={coinRef} position={[0, 0, 0]}>
      {/* Front face with UTA Copilot logo */}
      <mesh position={[0, 0, 0.11]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.01, 32]} />
        <meshStandardMaterial 
          map={utaCopilotTexture} 
          transparent 
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Back face with UTA logo */}
      <mesh position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.01, 32]} />
        <meshStandardMaterial 
          map={utaTexture} 
          transparent 
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Coin edge */}
      <mesh>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial 
          color="#FFB81C" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Glowing ring effect */}
      <mesh>
        <torusGeometry args={[2.2, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color="#007CBE" 
          emissive="#007CBE" 
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

const Scene3D = ({ onAnimationComplete }: CoinProps) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <SpinningCoin onAnimationComplete={onAnimationComplete} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
};

interface StartPageProps {
  onComplete: () => void;
}

export const StartPage = ({ onComplete }: StartPageProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    setTimeout(() => onComplete(), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_hsl(var(--background))_70%)] opacity-50" />
      
      {/* 3D Coin Scene */}
      <div className="w-96 h-96 mb-8">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <Scene3D onAnimationComplete={handleAnimationComplete} />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center space-y-6 max-w-md px-6"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h1 className="text-4xl font-inter-tight font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            UTA Copilot
          </h1>
          <p className="text-muted-foreground text-lg">
            Your intelligent campus companion
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Initializing your experience...</span>
          </div>
          
          <Button 
            onClick={onComplete}
            className="btn-hero w-full"
            size="lg"
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};