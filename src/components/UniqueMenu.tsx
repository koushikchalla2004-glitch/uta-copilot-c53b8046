import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  MessageSquare, 
  Map, 
  Info, 
  User, 
  Menu,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface UniqueMenuProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export const UniqueMenu = ({ onThemeToggle, isDark }: UniqueMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { icon: MessageSquare, label: 'New Chat', path: '/chat', color: 'from-green-500 to-teal-600' },
    { icon: User, label: 'Profile', path: '/profile', color: 'from-indigo-500 to-blue-600' },
    { icon: Map, label: 'Maps', path: '/map', color: 'from-orange-500 to-red-600' },
    { icon: Info, label: 'About', path: '/about', color: 'from-purple-500 to-pink-600' }
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Menu Button */}
      <motion.div
        className="fixed top-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-glow opacity-75 animate-ping group-hover:animate-none" />
        </Button>
      </motion.div>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors duration-200 z-50"
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>

            {/* Menu Content Container */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6">
              
              {/* App Logo in Center */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-16"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center shadow-2xl mb-6 mx-auto">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">UTA Copilot</h1>
                <p className="text-lg text-muted-foreground">Your Campus Assistant</p>
              </motion.div>

              {/* Menu Options Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-8 mb-12"
                onClick={(e) => e.stopPropagation()}
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleNavigation(item.path)}
                    className="group cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-card hover:bg-card/80 border border-border hover:border-primary/50 transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} p-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {item.label}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.6 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="lg"
                  className="rounded-full px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};