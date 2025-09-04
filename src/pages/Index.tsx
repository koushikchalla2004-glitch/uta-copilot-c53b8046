import React, { useState, useEffect, useRef } from 'react';

const Index = () => {
  const [currentView, setCurrentView] = useState('start');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentView === 'start') {
    return <StartPage onNext={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return (
      <LoginPage 
        onNext={(userData: any) => {
          setUser(userData);
          setCurrentView('main');
        }} 
        onBack={() => setCurrentView('start')} 
      />
    );
  }

  return (
    <MainPage 
      user={user}
      onLogout={() => {
        setUser(null);
        setCurrentView('login');
      }} 
    />
  );
};

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing UTA Copilot...');

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    const textTimer = setTimeout(() => {
      setLoadingText('Connecting to campus systems...');
      setTimeout(() => {
        setLoadingText('Almost ready...');
      }, 800);
    }, 600);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(textTimer);
    };
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
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              background: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      {/* Main loading content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Logo animation */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '50%',
          margin: '0 auto 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold',
          animation: 'logoSpin 3s ease-in-out infinite',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.5)',
          border: '3px solid rgba(255, 255, 255, 0.1)'
        }}>
          UC
        </div>

        <h1 style={{
          fontSize: '3rem',
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
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          margin: '40px auto 20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          }} />
        </div>

        <p style={{
          fontSize: '16px',
          opacity: 0.8,
          animation: 'fadeInOut 2s ease-in-out infinite'
        }}>
          {loadingText}
        </p>

        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '10px',
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
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
        }
        
        @keyframes textShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

const StartPage = ({ onNext }: { onNext: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const features = [
    {
      title: "Smart Campus Navigation",
      description: "Find any building, classroom, or facility with AI-powered directions",
      icon: "🗺️"
    },
    {
      title: "Voice Assistant",
      description: "Ask questions naturally and get instant, personalized responses",
      icon: "🎤"
    },
    {
      title: "Live Campus Updates",
      description: "Real-time dining hours, events, and important announcements",
      icon: "📱"
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % features.length);
    }, 4000);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(slideTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic background effect based on mouse position */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
        pointerEvents: 'none'
      }} />

      {/* Hero section */}
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
        {/* Animated logo */}
        <div style={{
          width: '140px',
          height: '140px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '50%',
          margin: '0 auto 50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          animation: 'heroFloat 6s ease-in-out infinite',
          boxShadow: '0 0 100px rgba(59, 130, 246, 0.3)',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
        >
          UC
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

        {/* Feature carousel */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          height: '120px',
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
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transform: `translateX(${(index - currentSlide) * 100}%)`,
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: index === currentSlide ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.3 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Slide indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '50px' }}>
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentSlide ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: index === currentSlide ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onNext}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '18px 40px',
            borderRadius: '50px',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
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
            animation: 'shimmer 2s ease-in-out infinite'
          }} />
        </button>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            width: '2px',
            height: '30px',
            background: 'linear-gradient(to bottom, transparent, #60a5fa)',
            margin: '0 auto 10px'
          }} />
          <div style={{
            fontSize: '12px',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Scroll
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(5deg); }
          66% { transform: translateY(-5px) rotate(-5deg); }
        }
        
        @keyframes textFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

const LoginPage = ({ onNext, onBack }: { onNext: (user: any) => void; onBack: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      const userData = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        id: Math.random().toString(36).substring(7)
      };
      onNext(userData);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
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
        background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        animation: 'backgroundPulse 4s ease-in-out infinite'
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            UC
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px'
          }}>
            Welcome {isLogin ? 'Back' : 'to UTA Copilot'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {['Login', 'Sign Up'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setIsLogin(index === 0)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: (index === 0 ? isLogin : !isLogin) 
                  ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' 
                  : 'transparent',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: (index === 0 ? isLogin : !isLogin) ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              />
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: !isLogin ? '20px' : '30px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                paddingRight: '50px',
                borderRadius: '12px',
                border: `2px solid ${errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>
                {errors.password}
              </p>
            )}
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '30px' }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${errors.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              />
              {errors.confirmPassword && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'rgba(59, 130, 246, 0.5)' 
                : 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
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
        @keyframes backgroundPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const MainPage = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'search', label: 'Campus Search', icon: '🔍' },
    { id: 'voice', label: 'Voice Assistant', icon: '🎤' },
    { id: 'dining', label: 'Dining', icon: '🍽️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'map', label: 'Campus Map', icon: '🗺️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
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
              <button style={{
                padding: '8px 15px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🔔
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ padding: '30px' }}>
          {activeSection === 'dashboard' && <DashboardContent />}
          {activeSection === 'search' && <SearchContent />}
          {activeSection === 'voice' && <VoiceContent />}
          {activeSection === 'dining' && <DiningContent />}
          {activeSection === 'events' && <EventsContent />}
          {activeSection === 'map' && <MapContent />}
          {activeSection === 'profile' && <ProfileContent user={user} />}
        </main>
      </div>
    </div>
  );
};

// Content Components
const DashboardContent = () => (
  <div style={{ display: 'grid', gap: '20px' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    }}>
      {[
        { title: 'Quick Search', desc: 'Find anything on campus instantly', icon: '🔍', color: '#3b82f6' },
        { title: 'Voice Assistant', desc: 'Ask me anything about UTA', icon: '🎤', color: '#8b5cf6' },
        { title: 'Dining Hours', desc: 'See what\'s open and what\'s cooking', icon: '🍽️', color: '#06b6d4' },
        { title: 'Upcoming Events', desc: 'Never miss campus activities', icon: '📅', color: '#10b981' }
      ].map((card, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 10px 30px ${card.color}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '50px',
            height: '50px',
            background: `${card.color}20`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '15px',
            border: `1px solid ${card.color}40`
          }}>
            {card.icon}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            {card.title}
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.4 }}>
            {card.desc}
          </p>
        </div>
      ))}
    </div>
    
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '25px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
        🎯 Today's Highlights
      </h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {[
          '📚 Library Study Rooms Available: 12 rooms',
          '🚌 Next Shuttle: Engineering Building in 3 mins',
          '☕ Starbucks Open until 11 PM',
          '🏃‍♂️ Rec Center: Low capacity, perfect time to visit'
        ].map((item, index) => (
          <div
            key={index}
            style={{
              padding: '12px 15px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SearchContent = () => (
  <div style={{
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>🔍 Campus Search</h2>
    <p style={{ opacity: 0.8, marginBottom: '40px' }}>
      Find buildings, classrooms, faculty, courses, and more across campus
    </p>
    
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <input
        type="text"
        placeholder="Search for anything on campus..."
        style={{
          width: '100%',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'white',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px'
    }}>
      {['Buildings', 'Faculty', 'Courses', 'Dining', 'Events', 'Services'].map((category) => (
        <button
          key={category}
          style={{
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

const VoiceContent = () => (
  <div style={{
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center'
  }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>🎤 Voice Assistant</h2>
    <p style={{ opacity: 0.8, marginBottom: '40px' }}>
      Ask me anything about campus life, and I'll help you out!
    </p>
    
    <div style={{
      width: '200px',
      height: '200px',
      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
      borderRadius: '50%',
      margin: '0 auto 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      animation: 'pulse 2s infinite'
    }}>
      🎤
    </div>

    <p style={{ fontSize: '18px', marginBottom: '30px' }}>
      Tap the microphone and start talking
    </p>

    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h4 style={{ marginBottom: '15px' }}>Try asking:</h4>
      <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
        {[
          '"Where is the Engineering Building?"',
          '"What time does the library close?"',
          '"Show me dining options near me"',
          '"When is the next campus event?"'
        ].map((example, index) => (
          <div key={index} style={{
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {example}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DiningContent = () => (
  <div>
    <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>🍽️ Campus Dining</h2>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px'
    }}>
      {[
        { name: 'The Connection Cafe', status: 'Open until 9 PM', menu: 'Pizza, Sandwiches, Salads' },
        { name: 'Starbucks', status: 'Open until 11 PM', menu: 'Coffee, Pastries, Light Snacks' },
        { name: 'Chick-fil-A', status: 'Closed', menu: 'Chicken, Salads, Wraps' },
        { name: 'Panda Express', status: 'Open until 8 PM', menu: 'Asian Cuisine, Rice Bowls' }
      ].map((location, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
            {location.name}
          </h3>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: location.status.includes('Closed') ? '#ef444430' : '#10b98130',
            borderRadius: '20px',
            fontSize: '12px',
            marginBottom: '15px',
            border: `1px solid ${location.status.includes('Closed') ? '#ef4444' : '#10b981'}40`
          }}>
            {location.status}
          </div>
          <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.4 }}>
            {location.menu}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const EventsContent = () => (
  <div>
    <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>📅 Campus Events</h2>
    
    <div style={{ display: 'grid', gap: '15px' }}>
      {[
        { title: 'Study Group: Computer Science', time: 'Today, 7:00 PM', location: 'Library Room 204' },
        { title: 'Career Fair', time: 'Tomorrow, 10:00 AM', location: 'Student Union Ballroom' },
        { title: 'Basketball Game: UTA vs TCU', time: 'Friday, 7:30 PM', location: 'College Park Center' },
        { title: 'International Food Festival', time: 'Saturday, 12:00 PM', location: 'Campus Green' }
      ].map((event, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '15px',
            alignItems: 'center'
          }}
        >
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📅
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
              {event.title}
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
              {event.time} • {event.location}
            </p>
          </div>
          <button style={{
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            Details
          </button>
        </div>
      ))}
    </div>
  </div>
);

const MapContent = () => (
  <div style={{
    height: '600px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div style={{ fontSize: '64px' }}>🗺️</div>
    <h3 style={{ fontSize: '24px', fontWeight: '600' }}>Interactive Campus Map</h3>
    <p style={{ opacity: 0.8, textAlign: 'center', maxWidth: '400px' }}>
      Navigate the campus with our interactive map. Find buildings, parking, dining, and more with real-time information.
    </p>
    <button style={{
      padding: '12px 24px',
      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '600'
    }}>
      Launch Map
    </button>
  </div>
);

const ProfileContent = ({ user }: { user: any }) => (
  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>👤 Profile</h2>
    
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>
            {user?.name || 'Student'}
          </h3>
          <p style={{ opacity: 0.7, marginBottom: '10px' }}>
            {user?.email || 'student@uta.edu'}
          </p>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            fontSize: '12px',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            Active Student
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
            Preferences
          </h4>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              'Email Notifications: Enabled',
              'Campus Location Services: Enabled',
              'Voice Assistant: Active',
              'Dark Mode: Enabled'
            ].map((pref, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {pref}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Index;