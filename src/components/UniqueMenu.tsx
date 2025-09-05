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
  Sparkles,
  Map,
  Calendar,
  UtensilsCrossed,
  Database
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
    { icon: MessageSquare, label: 'New Chat', path: '/hero', color: 'from-green-500 to-teal-600' },
    { icon: Map, label: 'Campus Map', path: '/map', color: 'from-blue-500 to-cyan-600' },
    { icon: Calendar, label: 'Events', path: '/events', color: 'from-purple-500 to-pink-600' },
    { icon: UtensilsCrossed, label: 'Dining', path: '/dining', color: 'from-orange-500 to-red-600' },
    { icon: Database, label: 'Data Setup', path: '/admin/data-setup', color: 'from-indigo-500 to-purple-600' },
    { icon: User, label: 'Profile', path: '/profile', color: 'from-gray-500 to-slate-600' }
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
      {/* Top-Left Menu Button - ChatGPT Style */}
      <motion.div
        className="fixed top-4 left-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) setIsOpen(true);
          }}
          variant="ghost"
          className="w-10 h-10 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          size="icon"
        >
          <motion.div
            key="menu"
            initial={{ rotate: 0, opacity: 1 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-1"
          >
            <div className="w-4 h-0.5 bg-gray-700 rounded-full" />
            <div className="w-4 h-0.5 bg-gray-700 rounded-full" />
            <div className="w-4 h-0.5 bg-gray-700 rounded-full" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Top-Right Close Button (when menu is open) - ChatGPT Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 right-4 z-[60]"
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              variant="ghost"
              className="w-10 h-10 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              size="icon"
            >
              <X className="w-5 h-5 text-gray-700" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Professional Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm"
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
                  <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 border border-white/20">
                    <Sparkles className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent animate-pulse-professional" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">UTA Copilot</h2>
                  <p className="text-slate-600">Your Campus Assistant</p>
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
                      className="group cursor-pointer p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/50 hover:bg-white/95 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg animate-fade-in-up"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors duration-200">
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
                    className="flex-1 rounded-xl py-3 font-medium bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white/95 btn-outline-professional"
                  >
                    🎨 Theme
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="flex-1 rounded-xl py-3 font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white btn-professional"
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