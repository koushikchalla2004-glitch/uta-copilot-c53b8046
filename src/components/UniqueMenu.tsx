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
      {/* Centered Menu Button */}
      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary via-primary-glow to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 group border-4 border-background/20"
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <Sparkles className="w-10 h-10 text-white mb-1" />
                <span className="text-xs font-bold text-white">MENU</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-primary-glow opacity-20 animate-ping group-hover:animate-none" />
        </Button>
      </motion.div>

      {/* Bottom Dock Menu */}
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

            {/* Bottom Dock */}
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 pb-6 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Menu Options */}
              <div className="bg-background/95 backdrop-blur-xl rounded-t-3xl border border-border/50 shadow-2xl">
                {/* Header */}
                <div className="text-center py-6 border-b border-border/50">
                  <h3 className="text-xl font-bold text-foreground mb-1">UTA Copilot</h3>
                  <p className="text-sm text-muted-foreground">Choose an option</p>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-4 p-6">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: 20 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      onClick={() => handleNavigation(item.path)}
                      className="group cursor-pointer p-4 rounded-2xl hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {item.label}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {item.label === 'New Chat' && 'Start conversation'}
                            {item.label === 'Profile' && 'View settings'}
                            {item.label === 'Maps' && 'Campus navigation'}
                            {item.label === 'About' && 'Learn more'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 p-6 pt-0">
                  <Button
                    onClick={onThemeToggle}
                    variant="outline"
                    className="flex-1 rounded-xl py-3 font-medium"
                  >
                    {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="flex-1 rounded-xl py-3 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};