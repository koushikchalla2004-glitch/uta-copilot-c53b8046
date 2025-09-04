import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Ring } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import * as THREE from 'three';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Spectrum Visualizer Component
const SpectrumBars = ({ isActive }: { isActive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const barsCount = 12;

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.children.forEach((bar, i) => {
        const time = state.clock.elapsedTime;
        const offset = i * 0.5;
        const scale = 1 + Math.sin(time * 4 + offset) * 0.5;
        bar.scale.y = scale;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: barsCount }).map((_, i) => {
        const angle = (i / barsCount) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial
              color="#3BFFB3"
              emissive="#3BFFB3"
              emissiveIntensity={isActive ? 0.5 : 0.1}
              transparent
              opacity={isActive ? 0.8 : 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Particle Ring Component
const ParticleRing = ({ isActive }: { isActive: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 50;
  
  const positions = new Float32Array(particleCount * 3);
  const radius = 3;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  useFrame((state) => {
    if (pointsRef.current && isActive) {
      pointsRef.current.rotation.y += 0.02;
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
        size={0.1}
        color="#1E90FF"
        transparent
        opacity={isActive ? 0.8 : 0.3}
        sizeAttenuation={true}
      />
    </points>
  );
};

// Ripple Wave Component
const RippleWaves = ({ isActive }: { isActive: boolean }) => {
  const ringsRef = useRef<THREE.Group>(null);
  const waveCount = 3;

  useFrame((state) => {
    if (ringsRef.current && isActive) {
      ringsRef.current.children.forEach((ring, i) => {
        const time = state.clock.elapsedTime;
        const offset = i * 0.5;
        const scale = 1 + Math.sin(time * 2 + offset) * 0.3;
        ring.scale.setScalar(scale);
        
        // Fade out effect
        const material = (ring as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.opacity = 0.5 - (scale - 1) * 0.5;
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {Array.from({ length: waveCount }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshStandardMaterial
            color="#3BFFB3"
            transparent
            opacity={isActive ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main Orb Component
const VoiceOrb = ({ state }: { state: OrbState }) => {
  const orbRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((frameState) => {
    if (orbRef.current) {
      const time = frameState.clock.elapsedTime;
      
      switch (state) {
        case 'idle':
          orbRef.current.rotation.y += 0.005;
          if (materialRef.current) {
            materialRef.current.distort = 0.1 + Math.sin(time * 0.5) * 0.05;
          }
          break;
        case 'listening':
          orbRef.current.rotation.y += 0.01;
          if (materialRef.current) {
            materialRef.current.distort = 0.3 + Math.sin(time * 3) * 0.1;
          }
          break;
        case 'thinking':
          orbRef.current.rotation.x += 0.02;
          orbRef.current.rotation.y += 0.02;
          if (materialRef.current) {
            materialRef.current.distort = 0.5;
          }
          break;
        case 'speaking':
          orbRef.current.rotation.y += 0.03;
          if (materialRef.current) {
            materialRef.current.distort = 0.2 + Math.sin(time * 8) * 0.2;
          }
          break;
      }
    }
  });

  const getOrbColor = () => {
    switch (state) {
      case 'idle': return '#1E90FF';
      case 'listening': return '#3BFFB3';
      case 'thinking': return '#9333EA';
      case 'speaking': return '#F59E0B';
      default: return '#1E90FF';
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={orbRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color={getOrbColor()}
          metalness={0.8}
          roughness={0.2}
          distort={0.2}
          speed={2}
          factor={state === 'listening' ? 0.8 : 0.3}
          emissive={getOrbColor()}
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* State-specific effects */}
      {state === 'listening' && <SpectrumBars isActive={true} />}
      {state === 'listening' && <ParticleRing isActive={true} />}
      {state === 'speaking' && <RippleWaves isActive={true} />}
    </Float>
  );
};

// 3D Scene Component
const OrbScene = ({ state }: { state: OrbState }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#1E90FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3BFFB3" />
      
      <VoiceOrb state={state} />
    </>
  );
};

export const VoiceOrb3D = () => {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);

  const quickCommands = [
    'What are my classes today?',
    'Where is the nearest dining hall?',
    'When is registration open?',
    'Show me campus events',
  ];

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setOrbState('listening');
      setIsTranscriptVisible(true);
      
      // Simulate voice recognition
      setTimeout(() => {
        setOrbState('thinking');
        setTranscript('Finding information about campus dining options...');
      }, 2000);
      
      setTimeout(() => {
        setOrbState('speaking');
        setTranscript('I found 5 dining halls currently open on campus. The nearest one is Connection Cafe, which is open until 9 PM today.');
      }, 4000);
      
      setTimeout(() => {
        setOrbState('idle');
        setIsListening(false);
      }, 8000);
    } else {
      setIsListening(false);
      setOrbState('idle');
      setIsTranscriptVisible(false);
      setTranscript('');
    }
  };

  const handleQuickCommand = (command: string) => {
    setTranscript(`"${command}"`);
    setIsTranscriptVisible(true);
    setOrbState('thinking');
    
    setTimeout(() => {
      setOrbState('speaking');
      setTranscript('Processing your request...');
    }, 1000);
    
    setTimeout(() => {
      setOrbState('idle');
      setTranscript('');
      setIsTranscriptVisible(false);
    }, 3000);
  };

  const getStateDescription = () => {
    switch (orbState) {
      case 'idle': return 'Ready to help';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Processing...';
      case 'speaking': return 'Responding...';
      default: return 'Ready to help';
    }
  };

  return (
    <section id="voice" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-inter-tight font-bold text-4xl md:text-5xl mb-6">
            Voice{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Assistant
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask questions naturally and get instant, personalized answers about campus life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 3D Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative h-96 glass-card rounded-2xl overflow-hidden"
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <OrbScene state={orbState} />
            </Canvas>
            
            {/* Orb Status */}
            <div className="absolute top-4 left-4 glass-card px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  orbState === 'idle' ? 'bg-blue-500' :
                  orbState === 'listening' ? 'bg-green-500 animate-pulse' :
                  orbState === 'thinking' ? 'bg-purple-500 animate-pulse' :
                  'bg-orange-500 animate-pulse'
                }`} />
                <span className="text-sm font-medium">{getStateDescription()}</span>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Main Control */}
            <div className="text-center">
              <Button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 orb-listening' 
                    : 'btn-hero orb-glow'
                } transition-all duration-300`}
                disabled={orbState === 'thinking' || orbState === 'speaking'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                {isListening ? 'Click to stop' : 'Click to start speaking'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Or press <kbd className="px-2 py-1 bg-muted rounded text-xs">M</kbd> key
              </p>
            </div>

            {/* Transcript Panel */}
            <AnimatePresence>
              {isTranscriptVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-4 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <Volume2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Transcript</p>
                      <p className="text-muted-foreground">{transcript}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Commands */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quick Commands</h3>
              <div className="space-y-2">
                {quickCommands.map((command, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickCommand(command)}
                    className="w-full text-left glass-card p-3 rounded-lg hover:border-primary/30 transition-all duration-200"
                    disabled={orbState !== 'idle'}
                  >
                    <span className="text-sm text-muted-foreground">"</span>
                    <span className="text-sm">{command}</span>
                    <span className="text-sm text-muted-foreground">"</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-medium mb-3">Accessibility</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Live captions</span>
                  <span className="text-green-500 font-medium">ON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audio feedback</span>
                  <span className="text-green-500 font-medium">ON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Keyboard shortcuts</span>
                  <span className="text-green-500 font-medium">M</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};