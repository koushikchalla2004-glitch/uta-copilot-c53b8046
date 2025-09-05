import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { ChatInterface } from '@/components/ChatInterface';
import { UniqueMenu } from '@/components/UniqueMenu';
import { Sparkles, MessageSquare, Zap, Users, ChevronDown, Map, Calendar, UtensilsCrossed, Info, User, LogOut } from 'lucide-react';

const Hero = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentInfoIndex, setCurrentInfoIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    
    // Rotate information lines every 5 seconds
    const interval = setInterval(() => {
      setCurrentInfoIndex((prev) => (prev + 1) % infoLines.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleThemeToggle = () => {
    setIsDark(false);
  };

  const infoLines = [
    "🎓 Discover campus events, dining options, and academic resources",
    "🗺️ Navigate UTA's campus with interactive maps and real-time directions", 
    "📚 Access library hours, study spaces, and academic support services",
    "🍕 Find dining locations, meal plans, and campus food options nearby",
    "🏢 Explore student organizations, clubs, and campus involvement opportunities",
    "🚌 Get shuttle schedules, parking info, and transportation around campus",
    "💡 Ask questions about admissions, registration, and student services"
  ];

  const menuItems = [
    { icon: MessageSquare, label: 'New Chat', color: 'from-green-500 to-teal-600' },
    { icon: Map, label: 'Campus Map', color: 'from-blue-500 to-cyan-600' },
    { icon: Calendar, label: 'Events', color: 'from-purple-500 to-pink-600' },
    { icon: UtensilsCrossed, label: 'Dining', color: 'from-orange-500 to-red-600' },
    { icon: Info, label: 'About', color: 'from-indigo-500 to-purple-600' },
    { icon: User, label: 'Profile', color: 'from-gray-500 to-slate-600' }
  ];

  return (
    <>
      <nav className="w-full h-16 bg-white flex items-center justify-between px-6 border-b border-gray-200 relative z-50">
        {/* Left side - UTA Copilot Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 text-black font-bold text-lg hover:text-gray-600 transition-colors font-mono"
          >
            <span>UTA Copilot</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Background overlay */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                >
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-600 text-sm font-mono">Your intelligent campus assistant</p>
                    </div>
                    
                    <div className="space-y-1">
                      {menuItems.map((item, index) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <item.icon className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-gray-700 font-medium font-mono text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-red-50 transition-colors duration-200 group">
                        <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-red-700 font-medium font-mono text-sm">Sign out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Center - Rotating Information */}
        <div className="flex-1 flex justify-center">
          <motion.div
            key={currentInfoIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-black font-medium text-base font-mono text-center max-w-2xl"
          >
            {infoLines[currentInfoIndex]}
          </motion.div>
        </div>
        
        {/* Right side spacer */}
        <div className="w-32"></div>
      </nav>
      <div className="relative min-h-screen bg-gradient-hero overflow-hidden flex flex-col pt-16">
      {/* 3D Stars Background - Made visible on white */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars 
            radius={100} 
            depth={50} 
            count={2000} 
            factor={4} 
            saturation={0.2}
            fade 
            speed={1}
          />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#000000" />
        </Canvas>
      </div>

      {/* Professional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>


      
      {/* Main Content - Integrated ChatInterface */}
      <div className="relative z-10 flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
    </>
  );
};

export default Hero;
