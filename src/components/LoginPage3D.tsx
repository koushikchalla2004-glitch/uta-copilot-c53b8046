import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Text3D } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// 3D Background Components
const FloatingOrb = ({ 
  position, 
  color, 
  scale = 1 
}: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesCount = 100;
  
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.03} 
        color="#60a5fa" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

const LoginScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#a855f7" />
      <spotLight 
        position={[0, 15, 5]} 
        intensity={0.6} 
        angle={0.4} 
        penumbra={0.5}
        color="#06b6d4"
      />
      
      <ParticleField />
      
      <FloatingOrb position={[-6, 3, -3]} color="#3b82f6" scale={0.8} />
      <FloatingOrb position={[6, -2, -4]} color="#a855f7" scale={0.6} />
      <FloatingOrb position={[0, 4, -6]} color="#06b6d4" scale={0.5} />
      <FloatingOrb position={[-3, -3, -2]} color="#10b981" scale={0.4} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.3}
        enableRotate={false}
      />
    </>
  );
};

interface LoginPage3DProps {
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

export const LoginPage3D = ({ onLoginSuccess, onBack }: LoginPage3DProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: ''
  });

  const validateForm = () => {
    const data = isLogin ? loginData : signupData;
    const newErrors: any = {};
    
    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!signupData.fullName) {
        newErrors.name = 'Name is required';
      }
      if (signupData.password !== signupData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setError(Object.values(newErrors)[0] as string);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        name: isLogin 
          ? loginData.email.split('@')[0] 
          : signupData.fullName,
        email: isLogin ? loginData.email : signupData.email,
        id: Math.random().toString(36).substring(7),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          isLogin ? loginData.email.split('@')[0] : signupData.fullName
        )}&background=3b82f6&color=fff`
      };
      onLoginSuccess(userData);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    if (isLogin) {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [field]: value }));
    }
    if (error) setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 3D Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.4
      }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <LoginScene3D />
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))',
        backdropFilter: 'blur(1px)'
      }} />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '50px',
            width: '100%',
            maxWidth: '480px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
            color: 'white'
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <motion.div
              style={{
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
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}
              whileHover={{ 
                scale: 1.05, 
                rotate: 5,
                boxShadow: '0 15px 40px rgba(59, 130, 246, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              UC
            </motion.div>
            
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
          </motion.div>

          {/* Tab Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '8px',
              marginBottom: '40px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {['Login', 'Sign Up'].map((tab, index) => (
              <motion.button
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
                  fontSize: '16px'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {tab}
              </motion.button>
            ))}
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '20px',
                  color: '#fca5a5',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: '30px' }}
          >
            {!isLogin && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                value={isLogin ? loginData.email : signupData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                value={isLogin ? loginData.password : signupData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
              <motion.button
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
                  fontSize: '20px'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </motion.button>
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '35px' }}>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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

            <motion.button
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
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={!isLoading ? { 
                scale: 1.02, 
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' 
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px' 
                }}>
                  <motion.div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </motion.form>

          {/* Back Button */}
          <motion.button
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
              fontWeight: '500'
            }}
            whileHover={{ 
              borderColor: 'rgba(255, 255, 255, 0.4)', 
              color: 'white' 
            }}
            whileTap={{ scale: 0.98 }}
          >
            ← Back to Start
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};