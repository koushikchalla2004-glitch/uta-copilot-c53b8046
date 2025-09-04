import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero3D } from '@/components/Hero3D';
import { SearchEngine } from '@/components/SearchEngine';
import { VoiceOrb3D } from '@/components/VoiceOrb3D';
import { ExploreSection } from '@/components/ExploreSection';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';

const Index = () => {
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
      <Navigation onThemeToggle={handleThemeToggle} isDark={isDark} />
      <Hero3D />
      <SearchEngine />
      <VoiceOrb3D />
      <ExploreSection />
      <AboutSection />
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
};

export default Index;
