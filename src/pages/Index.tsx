import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StartPage } from '@/components/StartPage';
import { LoginPage } from '@/components/LoginPage';
import MainApp from './MainApp';

type AppState = 'start' | 'login' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setAppState('main');
        } else if (appState === 'main') {
          setAppState('login');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setAppState('main');
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleStartComplete = () => {
    setAppState('login');
  };

  const handleLoginSuccess = () => {
    setAppState('main');
  };

  const handleLogout = () => {
    setAppState('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === 'start') {
    return <StartPage onComplete={handleStartComplete} />;
  }

  if (appState === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainApp onLogout={handleLogout} />;
};

export default Index;
