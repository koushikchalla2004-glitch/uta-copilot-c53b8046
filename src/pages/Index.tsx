import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    return <StartPageSimple onComplete={handleStartComplete} />;
  }

  if (appState === 'login') {
    return <LoginPageSimple onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainAppSimple onLogout={handleLogout} />;
};

// Simplified components without complex 3D dependencies
const StartPageSimple = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            UTA Copilot
          </h1>
          <p className="text-xl text-blue-200">Your intelligent campus companion</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Initializing your experience...</span>
          </div>
          
          <button 
            onClick={onComplete}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPageSimple = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
          }
        }
      });

      if (error) throw error;
      setActiveTab('login');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">UTA Copilot</h1>
          <p className="text-blue-200">Your intelligent campus companion</p>
        </div>

        <div className="space-y-4">
          {/* Tab Selection */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'login' ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'signup' ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.fullName}
                onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300"
                required
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const MainAppSimple = ({ onLogout }: { onLogout: () => void }) => {
  const [isDark, setIsDark] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      {/* Simple Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg"></div>
            <span className="font-bold text-xl">UTA Copilot</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to UTA Copilot
            </h1>
            <p className="text-xl text-blue-200">
              Your intelligent campus companion is ready to help!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Search Campus</h3>
              <p className="text-blue-200">Find buildings, courses, and resources across campus</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Voice Assistant</h3>
              <p className="text-blue-200">Ask questions using natural language</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Campus Life</h3>
              <p className="text-blue-200">Explore dining, events, and activities</p>
            </div>
          </div>

          <div className="mt-12">
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
              Start Exploring
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;