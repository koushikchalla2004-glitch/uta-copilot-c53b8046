import React, { useState, useEffect } from 'react';

type AppState = 'start' | 'login' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
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
    return <LoadingScreen />;
  }

  if (appState === 'start') {
    return <StartPageSimple onComplete={handleStartComplete} />;
  }

  if (appState === 'login') {
    return (
      <LoginPageSimple 
        onLoginSuccess={handleLoginSuccess} 
        onBack={handleBackToStart}
      />
    );
  }

  return <MainAppSimple user={user} onLogout={handleLogout} />;
};

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 3;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
              opacity: 0.4 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Animated Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '50%',
          margin: '0 auto 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          animation: 'logoSpin 4s ease-in-out infinite',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.4)',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          UC
          {/* Spinning ring */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            border: '2px solid transparent',
            borderTop: '2px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }} />
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7, #06b6d4)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'textShimmer 3s ease-in-out infinite'
        }}>
          UTA Copilot
        </h1>

        {/* Progress bar */}
        <div style={{
          width: '300px',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          margin: '40px auto 20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
          }} />
        </div>

        <p style={{
          fontSize: '18px',
          opacity: 0.8,
          animation: 'fadeInOut 2s ease-in-out infinite'
        }}>
          {progress < 30 ? 'Initializing UTA Copilot...' :
           progress < 60 ? 'Loading campus data...' :
           progress < 90 ? 'Preparing your experience...' :
           'Almost ready!'}
        </p>

        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginTop: '15px',
          color: '#60a5fa'
        }}>
          {progress}%
        </div>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes logoSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.05); }
        }
        
        @keyframes textShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const StartPageSimple = ({ onComplete }: { onComplete: () => void }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: '🗺️', title: 'Smart Navigation', desc: 'Find any building instantly' },
    { icon: '🎤', title: 'Voice Assistant', desc: 'Ask questions naturally' },
    { icon: '📱', title: 'Live Updates', desc: 'Real-time campus info' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        animation: 'backgroundPulse 6s ease-in-out infinite'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        {/* Animated coin representation */}
        <div style={{
          width: '160px',
          height: '160px',
          background: 'linear-gradient(45deg, #FFB81C, #007CBE)',
          borderRadius: '50%',
          margin: '0 auto 50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          fontWeight: 'bold',
          animation: 'coinFlip 4s ease-in-out infinite',
          boxShadow: '0 0 80px rgba(59, 130, 246, 0.4)',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={onComplete}
        >
          <span style={{
            animation: 'textRotate 4s ease-in-out infinite'
          }}>
            UC
          </span>
          {/* Orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: '#60a5fa',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                transform: `rotate(${i * 45}deg) translateX(100px)`,
                animation: `orbit 3s linear infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 'bold',
          marginBottom: '30px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7, #06b6d4)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'textFlow 4s ease-in-out infinite'
        }}>
          UTA Copilot
        </h1>

        <p style={{
          fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
          marginBottom: '50px',
          opacity: 0.9,
          maxWidth: '600px',
          lineHeight: 1.4
        }}>
          Your intelligent campus companion powered by AI
        </p>

        {/* Feature showcase */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          height: '140px',
          marginBottom: '50px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '100%',
                padding: '30px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                transform: `translateX(${(index - currentFeature) * 100}%)`,
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: index === currentFeature ? 1 : 0.6
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: 1.3 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Feature indicators */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '50px' }}>
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeature(index)}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentFeature ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: index === currentFeature ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onComplete}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '20px 50px',
            borderRadius: '50px',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 45px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            Begin Your Journey
          </span>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }} />
        </button>
      </div>

      <style>{`
        @keyframes backgroundPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes coinFlip {
          0%, 100% { transform: rotateY(0deg) scale(1); }
          25% { transform: rotateY(90deg) scale(1.1); }
          50% { transform: rotateY(180deg) scale(1); }
          75% { transform: rotateY(270deg) scale(1.1); }
        }
        
        @keyframes textRotate {
          0%, 100% { transform: rotateY(0deg); }
          25% { transform: rotateY(90deg); }
          50% { transform: rotateY(180deg); }
          75% { transform: rotateY(270deg); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        
        @keyframes textFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const LoginPageSimple = ({ onLoginSuccess, onBack }: { 
  onLoginSuccess: (user: any) => void; 
  onBack: () => void; 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        name: isLogin ? formData.email.split('@')[0] : formData.name,
        email: formData.email,
        id: Math.random().toString(36).substring(7)
      };
      onLoginSuccess(userData);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        animation: 'backgroundFloat 8s ease-in-out infinite'
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '50px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        zIndex: 1,
        color: 'white'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '20px',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            animation: 'logoHover 3s ease-in-out infinite'
          }}>
            UC
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {isLogin ? 'Welcome Back' : 'Join UTA Copilot'}
          </h1>
          
          <p style={{ opacity: 0.8, fontSize: '16px' }}>
            {isLogin 
              ? 'Sign in to continue your campus journey' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '8px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {['Login', 'Sign Up'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setIsLogin(index === 0)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: (index === 0 ? isLogin : !isLogin) 
                  ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' 
                  : 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                transform: (index === 0 ? isLogin : !isLogin) ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          {!isLogin && (
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />
          </div>

          <div style={{ marginBottom: !isLogin ? '24px' : '35px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '18px',
                paddingRight: '60px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '35px' }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading 
                ? 'rgba(59, 130, 246, 0.5)' 
                : 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              padding: '18px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isLoading ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px' 
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            background: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.8)',
            padding: '14px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          ← Back to Start
        </button>
      </div>

      <style>{`
        @keyframes backgroundFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes logoHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const MainAppSimple = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'search', label: 'Campus Search', icon: '🔍' },
    { id: 'voice', label: 'Voice Assistant', icon: '🎤' },
    { id: 'dining', label: 'Dining', icon: '🍽️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'map', label: 'Campus Map', icon: '🗺️' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      color: 'white',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            UC
          </div>
          {sidebarOpen && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>UTA Copilot</h3>
              <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Campus Assistant</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav style={{ padding: '20px 0' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                border: 'none',
                background: activeSection === item.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: activeSection === item.id ? '3px solid #3b82f6' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'User'}
                </p>
                <button
                  onClick={onLogout}
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <header style={{
          padding: '20px 30px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '5px' }}>
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
                Welcome back, {user?.name || 'Student'}! Ready to explore campus?
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                padding: '8px 15px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '20px',
                fontSize: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                🟢 Online
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '30px' }}>
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
            <p style={{ 
              fontSize: '1.2rem', 
              opacity: 0.9, 
              marginBottom: '30px', 
              maxWidth: '600px', 
              margin: '0 auto 30px',
              lineHeight: 1.6 
            }}>
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
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
            }}
            >
              Start Exploring Campus
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;