import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import { UniqueMenu } from '@/components/UniqueMenu';
import { Sparkles, MessageSquare, Zap, Users } from 'lucide-react';

const Hero = () => {
  const [isDark, setIsDark] = useState(false); // Always light theme

  useEffect(() => {
    // Force light theme
    document.documentElement.classList.remove('dark');
  }, []);

  const handleThemeToggle = () => {
    // Keep light theme for now, but maintain the function for menu compatibility
    setIsDark(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geometric" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geometric)" className="text-sky-600"/>
          </svg>
        </div>

        {/* Floating Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-sky-200/30 to-blue-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-r from-blue-200/30 to-sky-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/2 w-56 h-56 bg-gradient-to-r from-sky-300/30 to-blue-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Professional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-sky-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
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
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">UTA Copilot</h1>
              <p className="text-sm text-slate-600">Your Campus Assistant</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-600">24/7</div>
              <div className="text-xs text-slate-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">AI</div>
              <div className="text-xs text-slate-500">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-600">Smart</div>
              <div className="text-xs text-slate-500">Responses</div>
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
        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-sky-200/50">
          <div className="flex items-center space-x-2 text-sky-700">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </div>
          <div className="w-px h-4 bg-sky-300"></div>
          <div className="flex items-center space-x-2 text-blue-700">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Voice</span>
          </div>
          <div className="w-px h-4 bg-sky-300"></div>
          <div className="flex items-center space-x-2 text-sky-700">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Smart</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
