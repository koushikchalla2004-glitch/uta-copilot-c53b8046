import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ExternalLink, Clock, Lightbulb, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { NavigationAgent, ReminderAgent, AgentRouter } from '@/utils/agents';
import { useVoiceInterface } from './VoiceInterface';
import { LiveCaptions } from './LiveCaptions';
import { useResponseOptimization } from '@/hooks/useResponseOptimization';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { TTSControls } from './TTSControls';

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

      // 4. Check for specialized agents
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

      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-transparent border border-border/10 rounded-lg">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/40 bg-background/50 backdrop-blur-sm rounded-t-lg">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            UTA Copilot
          </h1>
          <p className="text-muted-foreground">
            Your intelligent campus assistant
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <Card className={`p-4 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-background/70 backdrop-blur-sm border border-border/30'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">
                      {message.type === 'assistant' && message.isTyping ? (
                        <TypewriterText 
                          text={message.content} 
                          onComplete={() => {
                            updateMessageTyping(message.id, false);
                            // Trigger TTS after typing animation completes
                            if (message.type === 'assistant') {
                              triggerTTSForMessage(message.content);
                            }
                          }}
                        />
                       ) : (
                         <span>{formatMessageWithLinks(message.content)}</span>
                       )}
                    </p>
                    
                    {/* TTS Controls for assistant messages */}
                    {message.type === 'assistant' && !message.isTyping && (
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
                        className="ml-2 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm border border-border/30 text-muted-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="p-4 bg-background/70 backdrop-blur-sm border border-border/30">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">UTA Copilot is thinking...</span>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Follow-up Suggestions */}
        {followUpSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center px-4"
          >
            {followUpSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue(suggestion);
                  setFollowUpSuggestions([]);
                }}
                className="text-xs hover:bg-primary/10 transition-colors"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-border/40 bg-background/50 backdrop-blur-sm rounded-b-lg">
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={voiceInterface.isRecording ? "Listening..." : "Ask me anything about UTA campus..."}
            className="flex-1 resize-none min-h-[44px] rounded-xl"
            disabled={isTyping || voiceInterface.isRecording}
          />
          <voiceInterface.MicButton />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          UTA Copilot provides professional assistance with academic programs, campus services, and university resources
        </p>
      </div>
    </div>
    </>
  );
};