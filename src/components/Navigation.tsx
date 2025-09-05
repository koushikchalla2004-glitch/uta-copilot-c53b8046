import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import utaCopilotLogo from '@/assets/uta-copilot-logo.png';

interface NavigationProps {
  onThemeToggle: () => void;
  isDark: boolean;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export const Navigation = ({ onThemeToggle, isDark, onLogout, isAuthenticated }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 10);
      
      // Only hide nav on manual scroll, not programmatic scroll
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);
      if (scrollDiff > 5 && currentScrollY > lastScrollY && currentScrollY > 100) {
        // Check if this is a manual scroll by checking scroll speed
        setTimeout(() => {
          const newScrollY = window.scrollY;
          if (Math.abs(newScrollY - currentScrollY) < 10) {
            // Likely manual scroll, hide nav
            setIsVisible(false);
          }
        }, 100);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { label: 'Search', href: '#search' },
    { label: 'Voice', href: '#voice' },
    { label: 'Explore', href: '#explore' },
    { label: 'About', href: '#about' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <img src={utaCopilotLogo} alt="UTA Copilot" className="w-8 h-8" />
            <span className="font-inter-tight font-bold text-lg text-black">UTA Copilot</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-600 hover:text-black transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="p-2 text-black hover:bg-gray-100"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* CTA Button */}
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="hidden sm:flex"
              >
                Logout
              </Button>
            ) : (
              <Button className="btn-hero hidden sm:flex">
                Open App
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-black hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left text-gray-600 hover:text-black transition-colors duration-200 py-2 font-medium"
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="w-full mt-4"
                >
                  Logout
                </Button>
              ) : (
                <Button className="btn-hero w-full mt-4">
                  Open App
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};