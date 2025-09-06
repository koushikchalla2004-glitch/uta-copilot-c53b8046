import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero3D } from '@/components/Hero3D';
import { SearchEngine } from '@/components/SearchEngine';
import { VoiceOrb3D } from '@/components/VoiceOrb3D';
import { ExploreSection } from '@/components/ExploreSection';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import RealtimeVoiceChat from '@/components/RealtimeVoiceChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface MainAppProps {
  user: any;
}

const MainApp = ({ user }: MainAppProps) => {
  const [isDark, setIsDark] = useState(true);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
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
      
      {/* Voice Chat Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowVoiceChat(!showVoiceChat)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg"
          size="lg"
        >
          <Mic className="h-5 w-5 mr-2" />
          {showVoiceChat ? 'Hide Voice Chat' : 'Voice Chat'}
        </Button>
      </div>

      {/* Voice Chat Modal/Panel */}
      {showVoiceChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">OpenAI Realtime Voice Chat</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowVoiceChat(false)}
                  className="text-muted-foreground"
                >
                  ✕
                </Button>
              </div>
              <RealtimeVoiceChat />
            </div>
          </div>
        </div>
      )}

      <SearchEngine />
      <ExploreSection />
      <AboutSection />
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
};

export default MainApp;