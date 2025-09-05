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
      <nav className="w-full h-16 bg-white flex items-center justify-center border-b border-gray-200 relative z-50">
        <div className="flex items-center space-x-8">
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">Home</button>
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">About</button>
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">Map</button>
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">Events</button>
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">Dining</button>
          <button className="text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono">Profile</button>
        </div>
      </nav>
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


      
      {/* Main Content */}
      <div className="relative z-10 flex-1">
        <ChatInterface />
      </div>
    </div>
    </>
  );
};

export default Hero;
