import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      toast({
        title: "Login failed",
        description: error.message || 'An error occurred during login',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
            display_name: formData.displayName,
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      setIsLogin(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
      toast({
        title: "Signup failed",
        description: error.message || 'An error occurred during signup',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to UTA Copilot
          </h1>
        </div>

        <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="login" className="text-sm text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Log in</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Sign up</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-all duration-300 hover-scale animate-fade-in disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Continue'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="displayName"
                  type="text"
                  placeholder="Display name"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-all duration-300 hover-scale animate-fade-in disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Continue'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Index;