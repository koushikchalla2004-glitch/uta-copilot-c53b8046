import React from 'react';
import { Navigation } from '@/components/Navigation';
import { CampusMap } from '@/components/CampusMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MapPage = () => {
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background">
      <Navigation 
        onThemeToggle={() => {
          document.documentElement.classList.toggle('dark');
        }}
        isDark={document.documentElement.classList.contains('dark')}
        onLogout={handleLogout}
        isAuthenticated={true}
      />
      <CampusMap />
    </div>
  );
};

export default MapPage;