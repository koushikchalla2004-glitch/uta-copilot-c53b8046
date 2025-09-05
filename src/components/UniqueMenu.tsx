import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  MessageSquare, 
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
      {/* Top-Left Menu Button */}
      <motion.div
        className="fixed top-6 left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) setIsOpen(true);
          }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary via-primary-glow to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 group border-2 border-background/20"
          size="icon"
        >
          <motion.div
            key="menu"
            initial={{ rotate: 180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Menu className="w-6 h-6 text-white" />
          </motion.div>
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" />
        </Button>
      </motion.div>

      {/* Top-Right Close Button (when menu is open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-[60]"
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                console.log('X button clicked!'); // Debug log
                setIsOpen(false);
              }}
              className="w-14 h-14 rounded-full bg-background/95 backdrop-blur-md border-2 border-border/60 hover:bg-background shadow-2xl transition-all duration-300 hover:scale-110"
              size="icon"
            >
              <X className="w-6 h-6 text-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Center Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center max-w-md w-full">
                {/* App Logo */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-glow to-primary rounded-full flex items-center justify-center shadow-2xl mx-auto mb-4 border-4 border-background/30">
                    <Sparkles className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">UTA Copilot</h2>
                  <p className="text-muted-foreground">Your Campus Assistant</p>
                </motion.div>

                {/* Menu Options in Center */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      onClick={() => handleNavigation(item.path)}
                      className="group cursor-pointer p-4 rounded-2xl bg-background/70 backdrop-blur-md border border-border/30 hover:bg-background/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                          {item.label}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons in Center */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 25 }}
                  className="flex gap-3 w-full"
                >
                  <Button
                    onClick={onThemeToggle}
                    variant="outline"
                    className="flex-1 rounded-xl py-3 font-medium bg-background/70 backdrop-blur-md border border-border/30 hover:bg-background/90"
                  >
                    {isDark ? '☀️ Light' : '🌙 Dark'}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="flex-1 rounded-xl py-3 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};