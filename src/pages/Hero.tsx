import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { ChatInterface } from '@/components/ChatInterface';
import { UniqueMenu } from '@/components/UniqueMenu';
import { Sparkles, MessageSquare, Zap, Users } from 'lucide-react';

const Hero = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleThemeToggle = () => {
    setIsDark(false);
  };

  return (
    <>
      <div className="w-full h-16 bg-white"></div>
      <div className="relative min-h-screen bg-gradient-hero overflow-hidden flex flex-col pt-16">
      {/* 3D Stars Background - Made visible on white */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars 
            radius={100} 
            depth={50} 
            count={2000} 
            factor={4} 
            saturation={0.2}
            fade 
            speed={1}
          />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#000000" />
        </Canvas>
      </div>

      {/* Professional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Professional Header */}
      <motion.header
        className="relative z-20 p-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Logo and Title Section */}
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-16 h-16 professional-gradient rounded-2xl flex items-center justify-center shadow-lg presentation-hover">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse-professional" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">UTA Copilot</h1>
                <p className="text-lg text-white/80 font-medium">Your Intelligent Campus Assistant</p>
              </div>
            </motion.div>
          </div>

          {/* Professional Subtitle */}
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-xl text-white/70 font-light mb-4">
              Elevating Your Campus Experience with <span className="font-semibold text-white">Artificial Intelligence</span>
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
          </motion.div>
        </div>
      </motion.header>

      {/* Unique Floating Menu */}
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      {/* Main Content */}
      <div className="relative z-10 flex-1">
        <ChatInterface />
      </div>
    </div>
    </>
  );
};

export default Hero;
