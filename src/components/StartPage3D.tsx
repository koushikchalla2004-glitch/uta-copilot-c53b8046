import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, useTexture, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import utaCopilotLogo from '@/assets/uta-copilot-logo.png';
import utaLogoPlaceholder from '@/assets/uta-logo-placeholder.png';

interface SpinningCoinProps {
  onAnimationComplete: () => void;
}

const SpinningCoin = ({ onAnimationComplete }: SpinningCoinProps) => {
  const coinRef = useRef<THREE.Group>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('spinning'); // spinning, slowing, stopped
  
  // Load textures
  const utaCopilotTexture = useTexture(utaCopilotLogo);
  const utaTexture = useTexture(utaLogoPlaceholder);

  useFrame((state, delta) => {
    if (coinRef.current && isSpinning) {
      // Fast initial spin, then slow down
      const elapsed = state.clock.elapsedTime;
      let speed = 4;
      
      if (elapsed > 2) {
        speed = Math.max(0.1, 4 - (elapsed - 2) * 2);
        setAnimationPhase('slowing');
      }
      
      if (elapsed > 4) {
        setIsSpinning(false);
        setAnimationPhase('stopped');
        setTimeout(() => onAnimationComplete(), 1000);
      }
      
      coinRef.current.rotation.y += delta * speed;
      
      // Add floating motion
      coinRef.current.position.y = Math.sin(elapsed * 2) * 0.2;
    }
  });

  return (
    <group ref={coinRef} position={[0, 0, 0]}>
      {/* Coin base */}
      <mesh>
        <cylinderGeometry args={[2.2, 2.2, 0.3, 32]} />
        <meshStandardMaterial 
          color="#FFB81C" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Front face - UTA Copilot logo */}
      <mesh position={[0, 0, 0.16]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.02, 32]} />
        <meshStandardMaterial 
          map={utaCopilotTexture} 
          transparent 
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Back face - UTA logo */}
      <mesh position={[0, 0, -0.16]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[2, 2, 0.02, 32]} />
        <meshStandardMaterial 
          map={utaTexture} 
          transparent 
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Glowing ring effect */}
      <mesh>
        <torusGeometry args={[2.4, 0.08, 8, 32]} />
        <meshStandardMaterial 
          color="#007CBE" 
          emissive="#007CBE" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Particle effects around coin */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 3.5;
        return (
          <Float key={i} speed={2 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 0.5) * 0.5,
              Math.sin(angle) * radius
            ]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                color="#60a5fa" 
                emissive="#60a5fa" 
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
};

const CoinScene = ({ onAnimationComplete }: SpinningCoinProps) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFB81C" />
      <spotLight 
        position={[0, 20, 0]} 
        intensity={0.8} 
        angle={0.3} 
        penumbra={0.5}
        color="#a855f7"
      />
      
      <SpinningCoin onAnimationComplete={onAnimationComplete} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

interface StartPage3DProps {
  onComplete: () => void;
}

export const StartPage3D = ({ onComplete }: StartPage3DProps) => {
  const [showContent, setShowContent] = useState(false);
  const [coinAnimationDone, setCoinAnimationDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCoinAnimation = () => {
    setCoinAnimationDone(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientFlow 10s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              background: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        {/* 3D Coin Scene */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            width: '400px',
            height: '400px',
            marginBottom: '40px'
          }}
        >
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <CoinScene onAnimationComplete={handleCoinAnimation} />
          </Canvas>
        </motion.div>

        {/* Text Content */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ color: 'white', maxWidth: '600px' }}
            >
              <motion.h1
                style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  background: 'linear-gradient(45deg, #60a5fa, #a855f7, #06b6d4)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                UTA Copilot
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '40px',
                  opacity: 0.9
                }}
              >
                Your intelligent campus companion
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ marginBottom: '40px' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <motion.div
                    style={{
                      width: '10px',
                      height: '10px',
                      background: '#10b981',
                      borderRadius: '50%'
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span style={{ fontSize: '16px', opacity: 0.8 }}>
                    {coinAnimationDone ? 'Ready to begin your journey!' : 'Initializing your experience...'}
                  </span>
                </div>
              </motion.div>

              <motion.button
                onClick={onComplete}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 }}
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  padding: '18px 40px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 45px rgba(59, 130, 246, 0.6)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Enter UTA Copilot
                </span>
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                  }}
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ↑ Watch the coin spin to reveal both sides ↑
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};