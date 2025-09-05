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
import { useSentiment } from '@/hooks/useSentiment';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Optimization hooks
  const optimization = useResponseOptimization();
  const conversationMemory = useConversationMemory();
  
  // TTS for voice responses
  const tts = useTextToSpeech();

  // Sentiment analysis
  const sentiment = useSentiment();

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

    // Analyze user sentiment
    const userSentimentResult = sentiment.analyze(userMessage);
    const userSentimentLabel = sentiment.labelFromScore(userSentimentResult.score);
    
    // Add user message to conversation memory with sentiment metadata
    await conversationMemory.addMessage('user', userMessage, {
      sentiment: userSentimentLabel,
      sentimentScore: userSentimentResult.score,
    });
    
    // Add user message to UI
    addMessage('user', userMessage);
    optimization.setIsLoading(true);
    setIsTyping(true);

    try {
      let responseText = '';
      let isOptimizedResponse = false;

      // Enhanced AI call with conversation context
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

      // Enhanced AI response
      responseText = data.response || "I'm having a bit of trouble with that request right now. Could you try asking me something else? I'm here to help! 😊";

      // Humanize assistant response based on user's sentiment
      responseText = sentiment.humanizeResponse(responseText, userSentimentLabel);
      
      const messageId = addMessage('assistant', responseText, true);
      
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

    } catch (error: any) {
      console.error('Chat error:', error);
      const messageId = addMessage('assistant', "I couldn't complete that request right now. Please try again.", true);
      setTimeout(() => updateMessageTyping(messageId, false), 2000);
    } finally {
      setIsTyping(false);
      optimization.setIsLoading(false);
    }
  };

  const hasUserMessages = messages.filter(m => m.type === 'user').length > 0;

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

      {/* Welcome State - Centered Input */}
      {!hasUserMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-normal text-white mb-4">
              How can I help you today?
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Ask me anything about UTA campus, events, dining, or academics
            </p>
          </motion.div>

          {/* Centered Input */}
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-3 glass-card backdrop-blur-lg bg-white/10 border-white/20">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Message UTA Copilot..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 text-white placeholder:text-white/70 text-lg py-4"
                    disabled={isTyping}
                  />
                  
                  {/* Voice Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 border-2 transition-all duration-200 ${
                      voiceInterface.isRecording 
                        ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-lg' 
                        : isSpeaking 
                          ? 'bg-blue-500 text-white border-blue-500 animate-pulse shadow-lg' 
                          : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:border-white/50 shadow-sm'
                    }`}
                    onClick={voiceInterface.isRecording ? voiceInterface.stopRecording : voiceInterface.startRecording}
                    disabled={isTyping || isSpeaking}
                  >
                    {voiceInterface.isRecording ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <div className="w-0.5 h-3 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '0ms'}} />
                        <div className="w-0.5 h-4 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '100ms'}} />
                        <div className="w-0.5 h-2 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '200ms'}} />
                        <div className="w-0.5 h-4 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '300ms'}} />
                        <div className="w-0.5 h-3 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '400ms'}} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-0.5">
                        <div className="w-0.5 h-2 bg-current rounded-full transition-all duration-200" />
                        <div className="w-0.5 h-3 bg-current rounded-full transition-all duration-200" />
                        <div className="w-0.5 h-1.5 bg-current rounded-full transition-all duration-200" />
                        <div className="w-0.5 h-3 bg-current rounded-full transition-all duration-200" />
                        <div className="w-0.5 h-2 bg-current rounded-full transition-all duration-200" />
                      </div>
                    )}
                  </Button>
                </div>
                
                {inputValue.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={!inputValue.trim() || isTyping}
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 h-12 w-12 p-0 rounded-xl"
                    >
                      {isTyping ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </motion.div>
                )}
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Chat State - Full ChatGPT Layout */}
      {hasUserMessages && (
        <motion.div
          className="flex-1 flex flex-col h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <div className="py-6 space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ModernChatBubble
                        type={message.type}
                        content={message.content}
                        timestamp={message.timestamp}
                        isTyping={message.isTyping}
                        onRegenerate={() => {
                          updateMessageTyping(message.id, false);
                          if (message.type === 'assistant') {
                            triggerTTSForMessage(message.content);
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Fixed Input Section at Bottom */}
          <motion.div
            className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-white/10"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
              {/* Follow-up suggestions */}
              {followUpSuggestions.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 justify-center mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {followUpSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue(suggestion);
                        handleSendMessage(suggestion);
                        setFollowUpSuggestions([]);
                      }}
                      className="text-xs glass-card hover:glass-card-hover border-white/20 text-white/80 hover:text-white"
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </motion.div>
              )}

              {/* Search Input Section */}
              <div className="w-full max-w-3xl mx-auto">
                <Card className="p-2 glass-card backdrop-blur-lg bg-white/10 border-white/20">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Message UTA Copilot..."
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 text-white placeholder:text-white/70"
                        disabled={isTyping}
                      />
                      
                      {/* Voice Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 border-2 transition-all duration-200 ${
                          voiceInterface.isRecording 
                            ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-lg' 
                            : isSpeaking 
                              ? 'bg-blue-500 text-white border-blue-500 animate-pulse shadow-lg' 
                              : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:border-white/50 shadow-sm'
                        }`}
                        onClick={voiceInterface.isRecording ? voiceInterface.stopRecording : voiceInterface.startRecording}
                        disabled={isTyping || isSpeaking}
                      >
                        {voiceInterface.isRecording ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <div className="w-0.5 h-3 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '0ms'}} />
                            <div className="w-0.5 h-4 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '100ms'}} />
                            <div className="w-0.5 h-2 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '200ms'}} />
                            <div className="w-0.5 h-4 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '300ms'}} />
                            <div className="w-0.5 h-3 bg-white rounded-full animate-pulse waveform-bar" style={{animationDelay: '400ms'}} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-0.5">
                            <div className="w-0.5 h-2 bg-current rounded-full transition-all duration-200" />
                            <div className="w-0.5 h-3 bg-current rounded-full transition-all duration-200" />
                            <div className="w-0.5 h-1.5 bg-current rounded-full transition-all duration-200" />
                            <div className="w-0.5 h-3 bg-current rounded-full transition-all duration-200" />
                            <div className="w-0.5 h-2 bg-current rounded-full transition-all duration-200" />
                          </div>
                        )}
                      </Button>
                    </div>
                    
                    {inputValue.trim() && (
                      <Button 
                        type="submit" 
                        disabled={!inputValue.trim() || isTyping}
                        size="sm"
                        className="bg-white text-black hover:bg-white/90 h-8 w-8 p-0"
                      >
                        {isTyping ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </form>
                </Card>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ModernCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};