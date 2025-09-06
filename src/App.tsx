import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import Index from '@/pages/Index';
import Hero from '@/pages/Hero';
import DiningPage from '@/pages/DiningPage';
import EventsPage from '@/pages/EventsPage';
import AboutPage from '@/pages/AboutPage';
import RealtimeTestPage from '@/pages/RealtimeTestPage';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    console.log('App is loading...');
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  console.log('App rendering with session:', !!session, 'user:', !!user);

  return (
    <>
      <Routes>
        <Route 
          path="/auth" 
          element={!session ? <Index /> : <Navigate to="/hero" replace />} 
        />
        <Route 
          path="/hero" 
          element={session ? <Hero /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={session ? "/hero" : "/auth"} replace />} 
        />
        <Route 
          path="/dining" 
          element={session ? <DiningPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/events" 
          element={session ? <EventsPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/about" 
          element={session ? <AboutPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/realtime-test" 
          element={session ? <RealtimeTestPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/app" 
          element={<Navigate to="/hero" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={session ? "/hero" : "/auth"} replace />} 
        />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;