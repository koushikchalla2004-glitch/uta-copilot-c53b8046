import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero3D } from '@/components/Hero3D';
import { SearchEngine } from '@/components/SearchEngine';
import { VoiceOrb3D } from '@/components/VoiceOrb3D';
import { ExploreSection } from '@/components/ExploreSection';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MainAppProps {
  onLogout: () => void;
}

const MainApp = ({ onLogout }: MainAppProps) => {
  const [isDark, setIsDark] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      onLogout();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation 
        onThemeToggle={handleThemeToggle} 
        isDark={isDark} 
        onLogout={handleLogout}
        isAuthenticated={true}
      />
      <Hero3D />
      <SearchEngine />
      <VoiceOrb3D />
      <ExploreSection />
      <AboutSection />
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
};

export default MainApp;