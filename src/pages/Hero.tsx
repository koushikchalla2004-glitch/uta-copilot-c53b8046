import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Mic, MicOff, Volume2, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

// Moving 3D Stars Background
const MovingStars = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
      
      // Make stars twinkle
      const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      starsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const starsPosition = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000; i++) {
    starsPosition[i * 3] = (Math.random() - 0.5) * 200;
    starsPosition[i * 3 + 1] = (Math.random() - 0.5) * 200;
    starsPosition[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2000}
          array={starsPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
};

// Voice Assistant Animation
const VoiceAssistantOrb = ({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) => {
  const orbRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (orbRef.current) {
      const material = orbRef.current.material as THREE.MeshPhongMaterial;
      if (isListening) {
        orbRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.2);
        material.color.setHex(0x00ff88);
      } else if (isSpeaking) {
        orbRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 12) * 0.3);
        material.color.setHex(0x0088ff);
      } else {
        orbRef.current.scale.setScalar(1);
        material.color.setHex(0x6366f1);
      }
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={orbRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial transparent opacity={0.8} />
    </mesh>
  );
};

// 3D Scene
const StarScene = ({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <MovingStars />
      <VoiceAssistantOrb isListening={isListening} isSpeaking={isSpeaking} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Simulate search results
    const results = [
      `Found information about: ${searchQuery}`,
      "Academic calendar and important dates",
      "Campus map and building locations",
      "Student services and resources"
    ];
    setSearchResults(results);
    
    toast({
      title: "Search completed",
      description: `Found ${results.length} results for "${searchQuery}"`,
    });
  };

  const toggleVoiceAssistant = () => {
    if (isListening) {
      setIsListening(false);
      toast({
        title: "Voice Assistant",
        description: "Stopped listening",
      });
    } else {
      setIsListening(true);
      toast({
        title: "Voice Assistant",
        description: "Now listening... Speak your question",
      });
      
      // Simulate voice interaction
      setTimeout(() => {
        setIsListening(false);
        setIsSpeaking(true);
        setTimeout(() => {
          setIsSpeaking(false);
        }, 3000);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 3D Stars Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <StarScene isListening={isListening} isSpeaking={isSpeaking} />
        </Canvas>
      </div>

      {/* Top Navigation */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UTA Copilot</h1>
        </div>
        
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="border-white/30 text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              UTA Copilot
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your intelligent campus companion powered by AI. Ask questions, get directions, 
            and navigate university life with ease.
          </p>
        </div>

        {/* Search Engine */}
        <div className="w-full max-w-4xl mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Ask me anything about UTA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-white/10 border-white/30 text-white placeholder-white/60 text-lg py-4 pl-12 pr-4"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                </div>
                
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700 px-8 py-4 text-lg"
                >
                  Search
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg">Search Results:</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white/90">{result}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Voice Assistant */}
        <div className="text-center">
          <div className="mb-6">
            <Button
              onClick={toggleVoiceAssistant}
              className={`w-20 h-20 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
                  : isSpeaking
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700'
              } transform hover:scale-110`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>
          
          <div className="text-white/80">
            {isListening ? (
              <p className="text-lg font-semibold text-green-400">🎤 Listening...</p>
            ) : isSpeaking ? (
              <p className="text-lg font-semibold text-blue-400">🔊 Speaking...</p>
            ) : (
              <p className="text-lg">Click to ask about campus, classes, or services</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;