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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Plain White Background - removed all animations and gradients */}

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
