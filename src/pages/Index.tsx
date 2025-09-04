import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, GraduationCap, Brain, Zap } from 'lucide-react';

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
      {/* Animated CSS Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-orange-900 to-amber-900">
        {/* Floating geometric shapes using CSS */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-500 rounded-lg rotate-45 animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-500 transform rotate-12 animate-pulse opacity-40"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-60 left-1/2 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rotate-45 animate-spin opacity-50" style={{ animationDuration: '3s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/80 via-orange-900/60 to-amber-900/80" />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 107, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 107, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md transform hover:scale-105 transition-all duration-500">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-orange-500/25 transition-all duration-500">
            <CardHeader className="text-center pb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-rose-400 via-orange-500 to-amber-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg hover:shadow-orange-500/50 transition-all duration-500 animate-pulse relative overflow-hidden">
                {/* Animated background rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-300/20 to-amber-300/20 animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-l from-orange-400/30 to-rose-400/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                
                {/* Main icon composition */}
                <div className="relative z-10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white absolute -top-1 -left-1" />
                  <Brain className="w-10 h-10 text-white/90" />
                  <Zap className="w-6 h-6 text-yellow-200 absolute -bottom-1 -right-1" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent animate-pulse">
                UTA Copilot
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg mt-2">
                Your intelligent campus companion
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => {
                setIsLogin(value === "login");
                setError(null);
                setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <TabsTrigger 
                    value="login" 
                    className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-6 bg-red-500/20 border-red-500/50 backdrop-blur-sm animate-pulse">
                    <AlertDescription className="text-red-200">
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
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 pr-12 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-rose-500 via-orange-600 to-amber-500 hover:from-rose-600 hover:via-orange-700 hover:to-amber-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:transform-none"
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
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 pr-12 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
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
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-rose-500 via-orange-600 to-amber-500 hover:from-rose-600 hover:via-orange-700 hover:to-amber-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:transform-none"
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