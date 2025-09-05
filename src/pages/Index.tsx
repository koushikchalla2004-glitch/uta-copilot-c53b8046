import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, GraduationCap, Sparkles, BookOpen, MapPin, Clock } from 'lucide-react';
import { ProfessionalBackground } from '@/components/ProfessionalBackground';

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

  const features = [
    {
      icon: BookOpen,
      title: "Academic Support",
      description: "Course info, schedules, and academic guidance"
    },
    {
      icon: MapPin,
      title: "Campus Navigation",
      description: "Find buildings, dining, and services easily"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Always here when you need assistance"
    }
  ];

  return (
    <ProfessionalBackground variant="primary">
      {/* Header */}
      <motion.header
        className="relative z-20 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900">UTA Copilot</h1>
              <p className="text-slate-600">Your Intelligent Campus Companion</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login/Signup Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="professional-card bg-white/90 backdrop-blur-lg border border-sky-200/50 shadow-xl">
              <CardHeader className="text-center pb-6">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-md border border-sky-200/50"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="relative">
                    <Sparkles className="w-10 h-10 text-sky-600" />
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-full h-full border-2 border-sky-300/30 rounded-full border-dashed"></div>
                    </motion.div>
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Welcome to UTA
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Sign in to access your campus assistant
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => {
                  setIsLogin(value === "login");
                  setError(null);
                  setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-sky-50 border border-sky-200">
                    <TabsTrigger 
                      value="login" 
                      className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <TabsContent value="login">
                    <motion.form
                      onSubmit={handleLogin}
                      className="space-y-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500/20 transition-all duration-300"
                        required
                      />
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 pr-12 focus:border-sky-500 focus:ring-sky-500/20 transition-all duration-300"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-professional bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-md"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Signing in...
                          </div>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <motion.form
                      onSubmit={handleSignup}
                      className="space-y-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Input
                        type="text"
                        name="displayName"
                        placeholder="Full Name"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                        required
                      />
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                        required
                      />
                      <Input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                        required
                      />
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-professional bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-md"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Creating account...
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="mt-8 grid grid-cols-1 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-sky-200/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default Index;