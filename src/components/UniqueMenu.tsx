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


      {/* Center Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Center Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">UTA Copilot</h2>
                  <p className="text-gray-600 text-sm">Your intelligent campus assistant</p>
                </div>

                {/* Menu Options */}
                <div className="space-y-2 mb-8">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={onThemeToggle}
                    variant="outline"
                    className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Theme
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};