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

      {/* Circular Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-6 right-6 w-14 h-14 rounded-full bg-background/90 backdrop-blur-md border border-border hover:bg-background shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>

            {/* Central Layout */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              
              {/* Central App Logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-primary via-primary-glow to-primary rounded-full flex items-center justify-center shadow-2xl border-4 border-background/50 backdrop-blur-md">
                  <Sparkles className="w-16 h-16 text-white" />
                  
                  {/* Pulsing rings around logo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent animate-ping" />
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
                </div>
                
                {/* Logo Label */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center"
                >
                  <h3 className="text-lg font-bold text-foreground bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg">
                    UTA Copilot
                  </h3>
                </motion.div>
              </motion.div>

              {/* Menu Options in Circle Around Logo */}
              {menuItems.map((item, index) => {
                // Position options in cardinal directions with proper spacing
                const positions = [
                  { x: 0, y: -180 },    // Top - New Chat
                  { x: 180, y: 0 },     // Right - Profile  
                  { x: 0, y: 180 },     // Bottom - Maps
                  { x: -180, y: 0 }     // Left - About
                ];
                const { x, y } = positions[index];

                return (
                  <motion.div
                    key={item.label}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                    exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    transition={{ 
                      delay: 0.2 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation(item.path);
                    }}
                  >
                    <div className="group cursor-pointer relative">
                      {/* Option Circle */}
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} p-5 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-125 border-2 border-background/30 backdrop-blur-sm`}>
                        <item.icon className="w-10 h-10 text-white" />
                        
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse`} />
                      </div>
                      
                      {/* Option Label */}
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 whitespace-nowrap"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (0.2 + index * 0.1) + 0.3 }}
                      >
                        <span className="text-sm font-semibold text-foreground bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border shadow-lg group-hover:bg-background group-hover:scale-105 transition-all duration-200">
                          {item.label}
                        </span>
                      </motion.div>

                      {/* Connecting line to center */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 origin-left h-0.5 bg-gradient-to-r from-primary/40 to-transparent"
                        style={{
                          width: '120px',
                          transform: `translate(-50%, -50%) rotate(${Math.atan2(y, x) * (180 / Math.PI) + 180}deg)`
                        }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Logout Button - Positioned below the circle */}
              <motion.div
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, 200px)' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  delay: 0.8,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="lg"
                  className="rounded-full px-6 py-3 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-md border border-destructive/20"
                >
                  <LogOut className="w-5 h-5 mr-2" />
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