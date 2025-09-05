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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* 3D Stars Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars 
            radius={100} 
            depth={50} 
            count={2000} 
            factor={4} 
            saturation={0} 
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
          <ambientLight intensity={0.1} />
        </Canvas>
      </div>

      {/* Professional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
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

      {/* Header */}
      <motion.header
        className="relative z-20 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg presentation-hover">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">UTA Copilot</h1>
              <p className="text-sm text-muted-foreground">Your Campus Assistant</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center card-clean p-2 presentation-hover">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center card-clean p-2 presentation-hover">
              <div className="text-2xl font-bold text-primary">AI</div>
              <div className="text-xs text-muted-foreground">Powered</div>
            </div>
            <div className="text-center card-clean p-2 presentation-hover">
              <div className="text-2xl font-bold text-primary">Smart</div>
              <div className="text-xs text-muted-foreground">Responses</div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Unique Floating Menu */}
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      {/* Main Content */}
      <div className="relative z-10 h-screen pt-16">
        <ChatInterface />
      </div>

      {/* Professional Features Bar */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex items-center space-x-4 card-clean p-4 presentation-hover">
          <div className="flex items-center space-x-2 text-primary">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center space-x-2 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Voice</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center space-x-2 text-primary">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Smart</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
