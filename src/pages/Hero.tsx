import React, { useState, useEffect } from 'react';
import { Hero3DStars } from '@/components/Hero3DStars';
import { ChatInterface } from '@/components/ChatInterface';
import { UniqueMenu } from '@/components/UniqueMenu';

const Hero = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* 3D Stars Background */}
      <Hero3DStars />
      
      {/* Unique Floating Menu */}
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      {/* Main Content - ChatGPT Style Conversation */}
      <div className="relative z-10 h-screen">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Hero;