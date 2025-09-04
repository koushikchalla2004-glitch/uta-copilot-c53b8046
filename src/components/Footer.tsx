import React from 'react';
import { Github, Twitter, Instagram, Mail, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import appSymbol from '@/assets/app-symbol.png';

interface FooterProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export const Footer = ({ onThemeToggle, isDark }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#search' },
      { label: 'Voice Assistant', href: '#voice' },
      { label: 'Campus Guide', href: '#explore' },
      { label: 'About', href: '#about' },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Status', href: '#' },
    ],
    university: [
      { label: 'UTA Homepage', href: 'https://uta.edu', external: true },
      { label: 'Academic Calendar', href: '#', external: true },
      { label: 'Student Portal', href: '#', external: true },
      { label: 'Campus Map', href: '#', external: true },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="relative py-16 px-4 border-t border-[var(--glass-border)] glass-card">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={appSymbol} alt="UTA Companion" className="w-8 h-8" />
              <span className="font-inter-tight font-bold text-xl">UTA Companion</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
              Your intelligent campus companion for navigating University of Texas at Arlington. 
              Built by students, for students.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="glass-card p-2 hover:scale-105 transition-transform"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">UTA</h3>
            <ul className="space-y-3">
              {footerLinks.university.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                    {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3 ml-1" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>© {currentYear} UTA Companion. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Not officially affiliated with UTA</span>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {isDark ? 'Dark' : 'Light'} Mode
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="glass-card px-4 py-2"
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            UTA Companion is an independent student project and is not officially affiliated with, 
            endorsed by, or connected to the University of Texas at Arlington. All university marks, 
            names, and logos are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};