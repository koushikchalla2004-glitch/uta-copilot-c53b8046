import React, { useState, useEffect } from 'react';

const Index = () => {
  const [currentView, setCurrentView] = useState('start');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple delay to show loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #7c2d92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #60a5fa',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading UTA Copilot...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'start') {
    return <StartPage onNext={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return <LoginPage onNext={() => setCurrentView('main')} onBack={() => setCurrentView('start')} />;
  }

  return <MainPage onLogout={() => setCurrentView('login')} />;
};

const StartPage = ({ onNext }: { onNext: () => void }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c2d92)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '60px' }}>
        {/* Simple animated logo */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
          borderRadius: '50%',
          margin: '0 auto 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          animation: 'float 3s ease-in-out infinite'
        }}>
          UC
        </div>
        
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          UTA Copilot
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '40px',
          opacity: 0.9
        }}>
          Your intelligent campus companion
        </p>
        
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#60a5fa',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '14px', opacity: 0.8 }}>
              Initializing your experience...
            </span>
          </div>
        </div>
        
        <button
          onClick={onNext}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '16px',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Get Started
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const LoginPage = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate auth process
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c2d92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            UTA Copilot
          </h1>
          <p style={{ opacity: 0.8 }}>Your intelligent campus companion</p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isLogin ? '#3b82f6' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: !isLogin ? '#3b82f6' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to Start
        </button>
      </div>
    </div>
  );
};

const MainPage = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c2d92)',
      color: 'white'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              UC
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>UTA Copilot</span>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to UTA Copilot
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
            Your intelligent campus companion is ready to help!
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {[
            { title: 'Search Campus', desc: 'Find buildings, courses, and resources across campus' },
            { title: 'Voice Assistant', desc: 'Ask questions using natural language' },
            { title: 'Campus Life', desc: 'Explore dining, events, and activities' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>
                {item.title}
              </h3>
              <p style={{ opacity: 0.8 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '16px',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}>
            Start Exploring
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;