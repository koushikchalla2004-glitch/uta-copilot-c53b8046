import React, { useState, useEffect } from 'react';
import { StartPage3D } from '@/components/StartPage3D';
import { LoginPage3D } from '@/components/LoginPage3D';

type AppState = 'start' | 'login' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartComplete = () => {
    setAppState('login');
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setAppState('main');
  };

  const handleLogout = () => {
    setUser(null);
    setAppState('login');
  };

  const handleBackToStart = () => {
    setAppState('start');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(59, 130, 246, 0.3)',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px', opacity: 0.8 }}>Loading UTA Copilot...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (appState === 'start') {
    return <StartPage3D onComplete={handleStartComplete} />;
  }

  if (appState === 'login') {
    return (
      <LoginPage3D 
        onLoginSuccess={handleLoginSuccess} 
        onBack={handleBackToStart}
      />
    );
  }

  // Main App (simplified for now)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Simple header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            UC
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              UTA Copilot
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
              Welcome back, {user?.name || 'Student'}!
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 15px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%'
            }} />
            Online
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { title: 'Campus Search', desc: 'Find buildings, courses, and resources', icon: '🔍', color: '#3b82f6' },
            { title: 'Voice Assistant', desc: 'Ask questions using natural language', icon: '🎤', color: '#8b5cf6' },
            { title: 'Dining Info', desc: 'See what\'s open and menu updates', icon: '🍽️', color: '#06b6d4' },
            { title: 'Campus Events', desc: 'Discover activities and programs', icon: '📅', color: '#10b981' }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 15px 35px ${feature.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: `${feature.color}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px',
                border: `1px solid ${feature.color}40`
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.5 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Welcome message */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
            🎓 Welcome to UTA Copilot
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Your intelligent campus companion is ready to help you navigate university life, 
            find resources, and make the most of your UTA experience.
          </p>
          <button style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
          }}>
            Start Exploring Campus
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;