import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ExternalLink, Clock, Lightbulb, Zap, Command } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ModernChatBubble } from './ModernChatBubble';
import { ModernCommandPalette } from './ModernCommandPalette';
import { ModernStatusIndicator } from './ModernStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { NavigationAgent, ReminderAgent, AgentRouter } from '@/utils/agents';
import { multiAgentCoordinator } from '@/utils/multi-agent-coordinator';
import { useVoiceInterface } from './VoiceInterface';
import { LiveCaptions } from './LiveCaptions';
import { useResponseOptimization } from '@/hooks/useResponseOptimization';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { TTSControls } from './TTSControls';
import { MultiAgentDashboard } from './MultiAgentDashboard';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// Helper function to detect and format links and emails in text
const formatMessageWithLinks = (text: string) => {
  // Combined regex for URLs and email addresses
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  // First split by URLs, then by emails
  let parts = text.split(urlRegex);
  
  // Process each part to check for emails
  parts = parts.flatMap(part => {
    if (urlRegex.test(part)) {
      return [part]; // Keep URLs as-is for now
    }
    return part.split(emailRegex);
  });
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Handle URLs
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    } else if (emailRegex.test(part)) {
      // Handle emails
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-primary hover:text-primary/80 underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Typing animation component
const TypewriterText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 30 + 20); // Random speed between 20-50ms for natural feel

      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{formatMessageWithLinks(displayedText)}</span>;
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm UTA Copilot. Ask me anything about campus - dining, events, courses, buildings, or student services.",
      timestamp: new Date(),
      isTyping: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Optimization hooks
  const optimization = useResponseOptimization();
  const conversationMemory = useConversationMemory();
  
  // TTS for voice responses
  const tts = useTextToSpeech();

  // Voice interface for chat
  const voiceInterface = useVoiceInterface({
    onTranscription: async (text) => {
      console.log('Voice transcription received:', text);
      setInputValue(text);
      await handleSendMessage(text);
    },
    onSpeakingChange: setIsSpeaking
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'assistant', content: string, isTyping = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isTyping
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessageTyping = (messageId: string, isTyping: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping } : msg
    ));
  };

  // Helper function to trigger TTS after message is complete
  const triggerTTSForMessage = (content: string) => {
    // Clean content for TTS (remove prefixes and markdown)
    const cleanContent = content
      .replace(/^[⚡💨🎯🧠]\s*/, '') // Remove optimization prefixes
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/__(.*?)__/g, '$1') // Remove underline markdown
      .trim();

    if (cleanContent.length > 10) { // Only speak substantial content
      tts.speakText(cleanContent, tts.settings.autoPlay);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputValue.trim();
    if (!userMessage) return;
    
    setInputValue('');
    
    // Add user message to conversation memory
    await conversationMemory.addMessage('user', userMessage);
    
    // Add user message to UI
    addMessage('user', userMessage);
    optimization.setIsLoading(true);
    setIsTyping(true);

    try {
      let responseText = '';
      let isOptimizedResponse = false;

      // 1. Check FAQ templates first (instant response)
      const faqResponse = await optimization.checkFAQTemplates(userMessage);
      if (faqResponse) {
        responseText = faqResponse;
        isOptimizedResponse = true;
        
        const messageId = addMessage('assistant', `⚡ ${responseText}`, true);
        setTimeout(() => {
          updateMessageTyping(messageId, false);
          // Generate follow-up suggestions
          const suggestions = optimization.generateFollowUpSuggestions(userMessage, faqResponse);
          setFollowUpSuggestions(suggestions);
        }, responseText.length * 15); // Faster typing for cached responses
        
        await conversationMemory.addMessage('assistant', responseText, { source: 'faq' });
        optimization.setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // 2. Check response cache
      const cachedResponse = await optimization.checkCache(userMessage);
      if (cachedResponse) {
        responseText = cachedResponse.response || cachedResponse;
        isOptimizedResponse = true;
        
        const messageId = addMessage('assistant', `💨 ${responseText}`, true);
        setTimeout(() => {
          updateMessageTyping(messageId, false);
          const suggestions = optimization.generateFollowUpSuggestions(userMessage, responseText);
          setFollowUpSuggestions(suggestions);
        }, responseText.length * 20);
        
        await conversationMemory.addMessage('assistant', responseText, { source: 'cache' });
        optimization.setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // 3. Check local database first (quick search)
      const localData = await optimization.searchLocalData(userMessage);
      if (localData && localData.results?.length > 0) {
        let quickResponse = `Here's what I found in our campus database:\n\n`;
        
        if (localData.type === 'dining') {
          quickResponse += "🍽️ **Dining Locations:**\n";
          localData.results.forEach((place: any) => {
            quickResponse += `• ${place.name} (${place.campus_area})${place.is_open ? ' - Open' : ' - Closed'}\n`;
          });
        } else if (localData.type === 'buildings') {
          quickResponse += "🏢 **Buildings:**\n";
          localData.results.forEach((building: any) => {
            quickResponse += `• ${building.name} (${building.code}) - ${building.category}\n`;
          });
        } else if (localData.type === 'events') {
          quickResponse += "📅 **Upcoming Events:**\n";
          localData.results.forEach((event: any) => {
            const eventDate = new Date(event.start_time).toLocaleDateString();
            quickResponse += `• ${event.title} - ${eventDate} at ${event.location}\n`;
          });
        } else if (localData.type === 'courses') {
          quickResponse += "📚 **Courses:**\n";
          localData.results.forEach((course: any) => {
            quickResponse += `• ${course.code}: ${course.title} (${course.credits} credits)\n`;
          });
        }

        quickResponse += "\nWould you like more details about any of these?";
        
        const messageId = addMessage('assistant', `🎯 ${quickResponse}`, true);
        setTimeout(() => {
          updateMessageTyping(messageId, false);
          const suggestions = optimization.generateFollowUpSuggestions(userMessage, quickResponse);
          setFollowUpSuggestions(suggestions);
        }, quickResponse.length * 20);

        // Store in cache for future use
        await optimization.storeInCache(userMessage, quickResponse, localData.type);
        await conversationMemory.addMessage('assistant', quickResponse, { source: 'local_database' });
        
        optimization.setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // 4. Try Multi-Agent System (NEW - High Performance)
      console.log('🤖 Trying multi-agent system...');
      const agentResult = await multiAgentCoordinator.processComplexQuery(userMessage);
      
      if (agentResult.primary.success && agentResult.primary.confidence > 0.6) {
        let agentResponse = agentResult.primary.message;
        
        // Add performance indicators
        const performanceInfo = `\n\n_🚀 Processed by ${agentResult.agentsUsed.join(', ')} agent(s) in ${agentResult.totalTime}ms using ${agentResult.strategy} strategy_`;
        
        // If we have secondary results, combine them
        if (agentResult.secondary && agentResult.secondary.length > 0) {
          agentResponse += '\n\n**Additional Information:**\n';
          agentResult.secondary.forEach(secondary => {
            if (secondary.success) {
              agentResponse += `\n${secondary.message.substring(0, 200)}...\n`;
            }
          });
        }

        const prefix = agentResult.strategy === 'parallel' ? '⚡' : 
                      agentResult.strategy === 'cascade' ? '🔄' : '🎯';
        
        const messageId = addMessage('assistant', `${prefix} ${agentResponse}`, true);
        setTimeout(() => {
          updateMessageTyping(messageId, false);
          const suggestions = optimization.generateFollowUpSuggestions(userMessage, agentResponse);
          setFollowUpSuggestions(suggestions);
        }, agentResponse.length * 15); // Fast response for agent-handled queries

        // Store in cache for future use
        await optimization.storeInCache(userMessage, agentResponse, agentResult.primary.source);
        await conversationMemory.addMessage('assistant', agentResponse, { 
          source: 'multi_agent',
          agents: agentResult.agentsUsed,
          strategy: agentResult.strategy,
          processingTime: agentResult.totalTime
        });
        
        optimization.setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // 5. Check for specialized legacy agents (fallback)
      const agentRoute = await AgentRouter.processQuery(userMessage);
      
      if (agentRoute.agent && agentRoute.confidence > 0.7) {
        // Handle specialized agent actions
        if (agentRoute.agent === 'navigation' && agentRoute.action === 'get_directions') {
          const result = await NavigationAgent.getDirections(agentRoute.params.building);
          const messageId = addMessage('assistant', result.message, true);
          setTimeout(() => {
            updateMessageTyping(messageId, false);
          }, result.message.length * 25);
          
          if (result.success) {
            toast({
              title: "Navigation",
              description: `Opening directions to ${agentRoute.params.building}`,
            });
          }
          
          await conversationMemory.addMessage('assistant', result.message, { source: 'navigation_agent' });
          optimization.setIsLoading(false);
          setIsTyping(false);
          return;
        }
      }

      // 5. Enhanced AI call with conversation context
      const recentContext = conversationMemory.getRecentContext(6);
      const contextSummary = conversationMemory.getContextSummary();
      
      const { data, error } = await supabase.functions.invoke('enhanced-ai-search', {
        body: { 
          query: userMessage, 
          conversation: recentContext,
          context: contextSummary
        }
      });

      if (error) {
        throw error;
      }

      // Handle function calls from AI
      if (data.function_calls) {
        for (const call of data.function_calls) {
          if (call.name === 'get_directions') {
            const result = await NavigationAgent.getDirections(call.arguments.building);
            toast({
              title: "Navigation",
              description: result.message,
            });
          } else if (call.name === 'set_reminder') {
            const result = await ReminderAgent.setReminder(
              call.arguments.title,
              call.arguments.datetime,
              call.arguments.type || 'event'
            );
            toast({
              title: "Reminder",
              description: result.message,
            });
          }
        }
      }

      // Enhanced AI response
      responseText = data.response || "I'm having a bit of trouble with that request right now. Could you try asking me something else? I'm here to help! 😊";
      
      const prefix = data.enhanced ? '🧠 ' : '';
      const messageId = addMessage('assistant', `${prefix}${responseText}`, true);
      
      setTimeout(() => {
        updateMessageTyping(messageId, false);
        const suggestions = optimization.generateFollowUpSuggestions(userMessage, responseText);
        setFollowUpSuggestions(suggestions);
      }, responseText.length * 25);

      // Store successful AI response in cache
      if (data.response && responseText.length > 20) {
        await optimization.storeInCache(userMessage, responseText, 'ai_response');
      }
      
      await conversationMemory.addMessage('assistant', responseText, { 
        source: data.enhanced ? 'enhanced_ai' : 'ai', 
        sources: data.sources 
      });

      // Handle "near me" queries with geolocation
      if (/(near me|nearby|closest|nearest)/i.test(userMessage)) {
        const geoMessageId = addMessage(
          'assistant',
          'Let me find what\'s nearby using your location...',
          true
        );
        
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                updateMessageTyping(geoMessageId, false);
                
                const { data: nearbyData, error: nearbyError } = await supabase.functions.invoke('places-nearby', {
                  body: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    limit: 5
                  }
                });

                if (nearbyError) throw nearbyError;

                const buildings = nearbyData.results.buildings || [];
                const dining = nearbyData.results.dining || [];
                const events = nearbyData.results.events || [];

                let response = "Here's what I found near you:\n\n";
                
                if (buildings.length > 0) {
                  response += "🏢 **Buildings:**\n";
                  buildings.forEach((building: any) => {
                    response += `• ${building.name} (${building.distance}) - ${building.category || 'Building'}\n`;
                  });
                  response += "\n";
                }
                
                if (dining.length > 0) {
                  response += "🍽️ **Dining:**\n";
                  dining.forEach((place: any) => {
                    response += `• ${place.name}${place.is_open ? ' (Open)' : ''}\n`;
                  });
                  response += "\n";
                }
                
                if (events.length > 0) {
                  response += "📅 **Upcoming Events:**\n";
                  events.forEach((event: any) => {
                    const eventDate = new Date(event.start_time).toLocaleDateString();
                    response += `• ${event.title} - ${eventDate}\n`;
                  });
                }

                if (buildings.length === 0 && dining.length === 0 && events.length === 0) {
                  response = "I couldn't find specific campus facilities near your exact location, but I can help you with general campus information or directions to specific buildings!";
                }

                const responseMessageId = addMessage('assistant', response, true);
                setTimeout(() => updateMessageTyping(responseMessageId, false), response.length * 25);
                
              } catch (error) {
                console.error('Nearby search error:', error);
                updateMessageTyping(geoMessageId, false);
                const errorMessageId = addMessage('assistant', 'I had trouble finding nearby places. Try asking about a specific building or area on campus!', true);
                setTimeout(() => updateMessageTyping(errorMessageId, false), 2000);
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              updateMessageTyping(geoMessageId, false);
              const fallbackMessageId = addMessage(
                'assistant',
                'I need location access to find nearby places. You can also tell me a building name or area on campus and I\'ll help you find what\'s around there!',
                true
              );
              setTimeout(() => updateMessageTyping(fallbackMessageId, false), 3000);
            },
            { timeout: 10000, enableHighAccuracy: true }
          );
        } else {
          updateMessageTyping(geoMessageId, false);
          const noGeoMessageId = addMessage(
            'assistant', 
            'Your device doesn\'t support location services. Tell me a building name or area on campus and I\'ll help you find what\'s nearby!',
            true
          );
          setTimeout(() => updateMessageTyping(noGeoMessageId, false), 2500);
        }
        return;
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const messageId = addMessage('assistant', "That one's on me—I couldn't complete that just now. Want me to try again? If it's a 'near me' request, share your location or a nearby building so I can be precise.", true);
      setTimeout(() => updateMessageTyping(messageId, false), 2000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Live Captions for Chat */}
      <LiveCaptions
        isVisible={voiceInterface.isRecording || voiceInterface.isProcessing}
        currentText={voiceInterface.liveCaptionText}
        isListening={voiceInterface.isRecording}
        isSpeaking={false}
        isProcessing={voiceInterface.isProcessing}
      />

      <div className="flex flex-col h-screen max-w-5xl mx-auto">
        {/* Modern Header */}
        <motion.div 
          className="flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-12 h-12 professional-gradient rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-6 h-6 text-foreground" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">UTA Copilot</h3>
              <p className="text-sm text-muted-foreground">Your AI Campus Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Modern Status Indicator */}
            <ModernStatusIndicator
              isListening={voiceInterface.isRecording}
              isSpeaking={isSpeaking}
              isThinking={isTyping}
              isConnected={true}
            />
            
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center space-x-2 glass-card"
            >
              <Command className="w-4 h-4" />
              <span className="text-xs">⌘K</span>
            </Button>
            
            {/* TTS Controls */}
            <TTSControls
              isPlaying={tts.isPlaying}
              isLoading={tts.isLoading}
              hasAudio={tts.hasAudio}
              error={tts.error}
              enabled={tts.settings.enabled}
              onPlayPause={tts.playPauseAudio}
              onStop={tts.stopCurrentAudio}
              onToggleEnabled={() => tts.updateSettings({ enabled: !tts.settings.enabled })}
              onClearError={tts.clearError}
            />
          </div>
        </motion.div>

        {/* Modern Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-muted/20 to-background">
          {messages.map((message) => (
            <ModernChatBubble
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              isTyping={message.isTyping}
              onRegenerate={() => {
                // Handle message regeneration
                console.log('Regenerating message...');
              }}
            />
          ))}

          {/* Enhanced Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="flex items-end space-x-2">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Bot className="w-4 h-4" />
                  </motion.div>
                  <div className="chat-bubble-assistant">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground mr-2">AI is thinking</span>
                      <div className="w-2 h-2 bg-primary/60 rounded-full typing-dots" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full typing-dots" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full typing-dots" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modern Follow-up Suggestions */}
          <AnimatePresence>
            {followUpSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-4"
              >
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Suggested follow-ups
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => handleSendMessage(suggestion)}
                      className="suggestion-pill"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Modern Input Area */}
        <motion.div 
          className="p-6 border-t border-border bg-card/80 backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex space-x-3 items-end">
            <div className="flex-1 relative">
              <div className="modern-input-container">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything about UTA campus..."
                  className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-base py-4 px-4"
                  disabled={isTyping}
                />
                <voiceInterface.MicButton />
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-4 rounded-xl professional-gradient shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
          
          {/* Live captions */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <LiveCaptions 
              isVisible={voiceInterface.isRecording || voiceInterface.isProcessing}
              currentText={voiceInterface.liveCaptionText}
              isListening={voiceInterface.isRecording}
              isSpeaking={false}
              isProcessing={voiceInterface.isProcessing}
            />
          </motion.div>
        </motion.div>

        {/* Command Palette */}
        <ModernCommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
        />

        {/* Multi-Agent Dashboard */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <MultiAgentDashboard />
        </motion.div>
      </div>
    </>
  );
};