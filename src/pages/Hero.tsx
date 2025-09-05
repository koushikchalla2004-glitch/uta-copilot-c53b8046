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
            className="absolute w-2 h-2 bg-foreground/20 rounded-full"
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
        className="relative z-20 p-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Logo and Title Section */}
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-16 h-16 professional-gradient rounded-2xl flex items-center justify-center shadow-lg presentation-hover">
                <Sparkles className="w-8 h-8 text-foreground animate-pulse" />
                <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse-professional" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">UTA Copilot</h1>
                <p className="text-lg text-muted-foreground font-medium">Your Intelligent Campus Assistant</p>
              </div>
            </motion.div>
            
            {/* Professional Stats Cards */}
            <motion.div 
              className="hidden lg:flex items-center space-x-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                { value: "24/7", label: "Available", icon: "⚡" },
                { value: "AI", label: "Powered", icon: "🧠" },
                { value: "Smart", label: "Responses", icon: "💡" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center glass-card p-4 min-w-[80px] presentation-hover"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Professional Subtitle */}
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl text-muted-foreground font-light mb-4">
              Elevating Your Campus Experience with <span className="font-semibold text-foreground">Artificial Intelligence</span>
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
          </motion.div>
        </div>
      </motion.header>

      {/* Unique Floating Menu */}
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      {/* Main Content */}
      <div className="relative z-10 h-screen pt-16">
        <ChatInterface />
      </div>

      {/* Professional Features Showcase */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="glass-card p-6 presentation-hover">
          <div className="flex items-center space-x-8">
            {[
              { icon: MessageSquare, label: "Intelligent Chat", color: "text-blue-600" },
              { icon: Zap, label: "Voice Commands", color: "text-amber-600" },
              { icon: Users, label: "Multi-Agent AI", color: "text-green-600" }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                className="flex items-center space-x-3 group cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`p-2 rounded-lg bg-background/50 ${feature.color} group-hover:bg-background transition-all`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
