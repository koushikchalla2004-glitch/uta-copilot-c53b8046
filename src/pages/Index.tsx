import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import * as THREE from 'three';

// Simple unified color scene
const TestScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.2} />
      </mesh>
      
      <OrbitControls />
    </>
  );
};

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.email || !formData.password || !formData.displayName) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: formData.displayName
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
          <TestScene />
        </Canvas>
      </div>

      {/* Semi-transparent overlay to show 3D background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-900/20 to-black/60" />
      
      {/* Dynamic grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 128, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md transform hover:scale-105 transition-all duration-500">
          <Card className="bg-black/40 backdrop-blur-xl border-2 border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:border-pink-500/50">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg hover:shadow-cyan-500/50 transition-all duration-500 relative overflow-hidden border-2 border-cyan-400/40">
                {/* Glowing rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-pink-500/50 animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-1 rounded-full border-2 border-cyan-500/30 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
                
                {/* Glowing graduation cap logo */}
                <div className="relative z-10 flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                UTA Copilot
              </CardTitle>
              <CardDescription className="text-cyan-200 text-base">
                Your intelligent campus companion
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => {
                setIsLogin(value === "login");
                setError(null);
                setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/50 backdrop-blur-sm border-2 border-cyan-500/30">
                  <TabsTrigger 
                    value="login" 
                    className="text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 hover:text-white"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 hover:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-6 bg-red-900/50 border-red-700/50 backdrop-blur-sm">
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                     <Input
                       type="email"
                       name="email"
                       placeholder="Email"
                       value={formData.email}
                       onChange={handleInputChange}
                       className="bg-black/30 border-2 border-cyan-500/30 text-white placeholder-cyan-300/60 focus:border-cyan-400 focus:ring-cyan-400/30 transition-all duration-300 hover:bg-black/40 hover:border-cyan-400/50"
                       required
                     />
                     <div className="relative">
                       <Input
                         type={showPassword ? "text" : "password"}
                         name="password"
                         placeholder="Password"
                         value={formData.password}
                         onChange={handleInputChange}
                         className="bg-black/30 border-2 border-cyan-500/30 text-white placeholder-cyan-300/60 pr-12 focus:border-cyan-400 focus:ring-cyan-400/30 transition-all duration-300 hover:bg-black/40 hover:border-cyan-400/50"
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white transition-colors duration-200"
                       >
                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:transform-none"
                      >
                       {isLoading ? (
                         <div className="flex items-center justify-center">
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                           Logging in...
                         </div>
                       ) : (
                         'Login'
                       )}
                     </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                      type="text"
                      name="displayName"
                      placeholder="Display Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="bg-black/30 border-2 border-pink-500/30 text-white placeholder-pink-300/60 focus:border-pink-400 focus:ring-pink-400/30 transition-all duration-300 hover:bg-black/40 hover:border-pink-400/50"
                      required
                    />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-black/30 border-2 border-pink-500/30 text-white placeholder-pink-300/60 focus:border-pink-400 focus:ring-pink-400/30 transition-all duration-300 hover:bg-black/40 hover:border-pink-400/50"
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-black/30 border-2 border-pink-500/30 text-white placeholder-pink-300/60 pr-12 focus:border-pink-400 focus:ring-pink-400/30 transition-all duration-300 hover:bg-black/40 hover:border-pink-400/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-black/30 border-2 border-pink-500/30 text-white placeholder-pink-300/60 focus:border-pink-400 focus:ring-pink-400/30 transition-all duration-300 hover:bg-black/40 hover:border-pink-400/50"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default Index;