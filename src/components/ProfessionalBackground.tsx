import React from 'react';
import { motion } from 'framer-motion';

interface ProfessionalBackgroundProps {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export const ProfessionalBackground = ({ 
  variant = 'primary', 
  children 
}: ProfessionalBackgroundProps) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50',
    secondary: 'bg-gradient-to-br from-blue-50 via-sky-50 to-slate-50',
    accent: 'bg-gradient-to-br from-sky-100 via-blue-50 to-slate-50'
  };

  return (
    <div className={`relative min-h-screen ${gradientClasses[variant]} overflow-hidden`}>
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="professional-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#professional-grid)" className="text-sky-600"/>
        </svg>
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-r from-sky-200/20 to-blue-300/20 rounded-full blur-2xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -25, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-10 w-40 h-40 bg-gradient-to-r from-blue-200/20 to-sky-300/20 rounded-full blur-2xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-gradient-to-r from-sky-300/20 to-blue-200/20 rounded-full blur-2xl"
        animate={{
          x: [0, 25, -25, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-sky-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};