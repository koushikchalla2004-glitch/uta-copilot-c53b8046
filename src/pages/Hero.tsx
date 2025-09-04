import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Mic, MicOff, Volume2, User, LogOut, Send, Bot, Phone, PhoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import { TypingAnimation, TypingIndicator } from '@/components/TypingAnimation';
import * as THREE from 'three';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

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

// Enhanced Voice Assistant Animation with Particles
const VoiceAssistantOrb = ({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) => {
  const orbRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Create particles for voice visualization
  const particleCount = 200;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  useFrame((state) => {
    if (orbRef.current) {
      const material = orbRef.current.material as THREE.MeshPhongMaterial;
      const time = state.clock.elapsedTime;
      
      if (isListening) {
        // Listening animation - green pulsing with particles
        const pulse = 1 + Math.sin(time * 8) * 0.3;
        orbRef.current.scale.setScalar(pulse);
        material.color.setHex(0x00ff88);
        material.emissive.setHex(0x002211);
        
        // Animate particles outward
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time;
            const radius = 2 + Math.sin(time * 4 + i * 0.1) * 1.5;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(time * 3 + i * 0.05) * 2;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
        
      } else if (isSpeaking) {
        // Speaking animation - blue with dynamic scaling and particles
        const speak = 1 + Math.sin(time * 12) * 0.4 + Math.sin(time * 20) * 0.2;
        orbRef.current.scale.setScalar(speak);
        material.color.setHex(0x0088ff);
        material.emissive.setHex(0x001122);
        
        // Animate particles in wave pattern
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const wave = Math.sin(time * 6 + i * 0.2) * 2;
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
            const radius = 3 + wave;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = wave;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
        
      } else {
        // Idle animation - purple gentle float
        const idle = 1 + Math.sin(time * 2) * 0.1;
        orbRef.current.scale.setScalar(idle);
        material.color.setHex(0x6366f1);
        material.emissive.setHex(0x111122);
        
        // Gentle particle movement
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.2;
            const radius = 2.5 + Math.sin(time + i * 0.1) * 0.5;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(time * 0.5 + i * 0.1) * 1;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }
      
      // Continuous rotation
      orbRef.current.rotation.y = time * 0.5;
      orbRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    }
    
    // Animate glow effect
    if (glowRef.current) {
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
      const time = state.clock.elapsedTime;
      
      if (isListening) {
        const glowIntensity = 0.3 + Math.sin(time * 8) * 0.2;
        glowRef.current.scale.setScalar(2 + glowIntensity);
        glowMaterial.opacity = glowIntensity;
        glowMaterial.color.setHex(0x00ff88);
      } else if (isSpeaking) {
        const glowIntensity = 0.4 + Math.sin(time * 12) * 0.3;
        glowRef.current.scale.setScalar(2.5 + glowIntensity);
        glowMaterial.opacity = glowIntensity;
        glowMaterial.color.setHex(0x0088ff);
      } else {
        const glowIntensity = 0.1 + Math.sin(time * 2) * 0.05;
        glowRef.current.scale.setScalar(1.8 + glowIntensity);
        glowMaterial.opacity = glowIntensity;
        glowMaterial.color.setHex(0x6366f1);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial transparent opacity={0.9} />
      </mesh>
      
      {/* Glow Effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={isListening ? 0.1 : isSpeaking ? 0.15 : 0.05} 
          color={isListening ? "#00ff88" : isSpeaking ? "#0088ff" : "#6366f1"} 
          transparent 
          opacity={0.8} 
        />
      </points>
    </group>
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
  console.log('Hero component rendering...');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the real-time voice hook
  const {
    isConnected: voiceConnected,
    isConnecting: voiceConnecting,
    isListening,
    isSpeaking,
    messages: voiceMessages,
    connectToVoiceChat,
    disconnectVoiceChat,
    sendTextMessage
  } = useRealtimeVoice();

  // State for text-only chat when voice is not connected
  const [textMessages, setTextMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your UTA Copilot. Ask me anything about campus life, classes, dining, parking, or university services. You can type your questions or use voice chat for a more natural conversation!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Use voice messages if connected, otherwise use text messages
  const chatMessages = voiceConnected ? voiceMessages : textMessages;

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!searchQuery.trim()) return;
    
    if (voiceConnected) {
      // Send through voice chat
      sendTextMessage(searchQuery);
      setSearchQuery('');
    } else {
      // Send through text-only AI search
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: searchQuery,
        isUser: true,
        timestamp: new Date()
      };

      setTextMessages(prev => [...prev, userMessage]);
      setSearchQuery('');
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('ai-search', {
          body: { query: userMessage.text }
        });

        if (error) {
          throw error;
        }

        const messageId = (Date.now() + 1).toString();
        const aiMessage: ChatMessage = {
          id: messageId,
          text: data?.response || "I couldn't process your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
          isTyping: true
        };

        setTypingMessageId(messageId);
        setTextMessages(prev => [...prev, aiMessage]);
      } catch (error: any) {
        console.error('Search error:', error);
        const errorId = (Date.now() + 1).toString();
        const errorMessage: ChatMessage = {
          id: errorId,
          text: "I'm having trouble connecting to the AI service right now. Please try again in a moment, or contact campus support for immediate assistance.",
          isUser: false,
          timestamp: new Date(),
          isTyping: true
        };
        setTypingMessageId(errorId);
        setTextMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVoiceToggle = () => {
    if (voiceConnected) {
      disconnectVoiceChat();
    } else {
      connectToVoiceChat();
    }
  };

  const toggleVoiceAssistant = () => {
    handleVoiceToggle();
  };

  console.log('Hero about to render, voiceConnected:', voiceConnected, 'isListening:', isListening, 'isSpeaking:', isSpeaking);
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Voice Visualizer */}
      <VoiceVisualizer
        isListening={isListening} 
        isSpeaking={isSpeaking} 
        isConnected={voiceConnected} 
      />
      
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
          className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Chat Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="text-center py-8 px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              UTA Copilot
            </span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Your intelligent campus companion powered by AI
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {message.isUser ? (
                    <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                      {/* User Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      
                      {/* User Message Bubble */}
                      <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white rounded-2xl px-4 py-3">
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p className="text-xs mt-1 text-white/70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // AI Message with Typing Animation
                    (message as any).isTyping ? (
                      <TypingAnimation
                        text={message.text}
                        onComplete={() => {
                          setTypingMessageId(null);
                          setTextMessages(prev => 
                            prev.map(msg => 
                              msg.id === message.id 
                                ? { ...msg, isTyping: false }
                                : msg
                            )
                          );
                        }}
                        speed={30}
                      />
                    ) : (
                      <div className="flex gap-3 max-w-[80%]">
                        {/* AI Avatar */}
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* AI Message Bubble */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl px-4 py-3">
                          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <p className="text-xs mt-1 text-white/50">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
              
              {/* Loading Indicator */}
              {(isLoading || voiceConnecting) && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-4">
              {/* Voice Status Indicator */}
              {voiceConnected && (
                <div className="mb-3 text-center">
                  {isListening ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 animate-pulse">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm font-medium animate-bounce">🎤 Listening...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-6 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  ) : isSpeaking ? (
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <div className="relative">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm font-medium animate-bounce">🔊 UTA Copilot is speaking...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-8 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-1 h-7 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/60 text-sm flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      ✅ Voice chat active - Speak naturally or type below
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={voiceConnected ? "Voice chat active - speak or type..." : "Ask me anything about UTA..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading || voiceConnecting}
                    className="bg-transparent border-none text-white placeholder-white/60 text-base py-3 px-4 focus:ring-0 focus:border-none"
                  />
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || voiceConnecting || !searchQuery.trim()}
                  className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700 p-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
                
                {/* Voice Chat Toggle */}
                <Button
                  onClick={handleVoiceToggle}
                  disabled={voiceConnecting}
                  className={`p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    voiceConnected
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                      : voiceConnecting
                      ? 'bg-yellow-500 shadow-lg shadow-yellow-500/30'
                      : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700 shadow-lg shadow-emerald-500/30'
                  } ${voiceConnected || voiceConnecting ? 'animate-pulse' : ''}`}
                >
                  {/* Ripple effect for active states */}
                  {(voiceConnected || voiceConnecting) && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping"></div>
                  )}
                  
                  {voiceConnecting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : voiceConnected ? (
                    <div className="relative">
                      <PhoneOff className="w-5 h-5 text-white animate-bounce" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  ) : (
                    <Phone className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                  )}
                </Button>
              </div>
              
              {/* Instructions */}
              {!voiceConnected && (
                <div className="mt-3 text-center text-white/60 text-sm">
                  💡 Click the phone icon to start voice chat for a more natural conversation!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;