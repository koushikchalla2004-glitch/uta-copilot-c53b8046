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

      {/* Dock Style Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-background/90 backdrop-blur-md border border-border hover:bg-background shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Central App Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary via-primary-glow to-primary rounded-full flex items-center justify-center shadow-2xl border-4 border-background/50 backdrop-blur-md mb-6">
                <Sparkles className="w-16 h-16 text-white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">UTA Copilot</h2>
              <p className="text-muted-foreground">Your Campus Assistant</p>
            </motion.div>

            {/* Horizontal Dock Menu */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-6 bg-background/90 backdrop-blur-xl rounded-2xl px-8 py-6 border border-border shadow-2xl">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    transition={{ 
                      delay: 0.4 + index * 0.1,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    onClick={() => handleNavigation(item.path)}
                    className="group cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} p-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Logout Button */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="lg"
                className="rounded-full px-6 py-3 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-md"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};