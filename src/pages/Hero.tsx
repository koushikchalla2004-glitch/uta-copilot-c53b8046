import React, { useState, useEffect } from 'react';
import { Hero3D } from '@/components/Hero3D';
import { SearchEngine } from '@/components/SearchEngine';
import { VoiceOrb3D } from '@/components/VoiceOrb3D';
import { ExploreSection } from '@/components/ExploreSection';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Unique Floating Menu */}
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      {/* Hero Section with 3D Scene */}
      <Hero3D />
      
      {/* Search Engine */}
      <SearchEngine />
      
      {/* Voice Orb */}
      <section id="voice" className="relative py-20">
        <VoiceOrb3D />
      </section>
      
      {/* Explore Section */}
      <ExploreSection />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Footer */}
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
};

export default Hero;