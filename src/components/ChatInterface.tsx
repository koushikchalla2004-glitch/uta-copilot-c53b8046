import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

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

  return <span>{displayedText}</span>;
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your UTA Copilot assistant. I can help you with campus information, dining options, building locations, events, academic programs, and much more. What would you like to know?",
      timestamp: new Date(),
      isTyping: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Location keywords for automatic map navigation
  const locationKeywords = [
    'where is', 'location', 'directions', 'navigate', 'find', 'building', 'hall', 'center',
    'library', 'gym', 'dining', 'cafeteria', 'parking', 'office', 'department'
  ];

  const buildingAliases = {
    'library': 'Central Library',
    'lib': 'Central Library',
    'central library': 'Central Library',
    'mac': 'Maverick Activities Center',
    'maverick activities': 'Maverick Activities Center',
    'gym': 'Maverick Activities Center',
    'fitness': 'Maverick Activities Center',
    'erb': 'Engineering Research Building',
    'engineering': 'Engineering Research Building',
    'uc': 'University Center',
    'university center': 'University Center',
    'student union': 'University Center',
    'business': 'Business Building',
    'bus': 'Business Building',
    'science': 'Science Hall',
    'sh': 'Science Hall',
    'ssb': 'Student Services Building',
    'student services': 'Student Services Building',
    'arlington hall': 'Arlington Hall',
    'ah': 'Arlington Hall',
    'dorm': 'Arlington Hall'
  };

  const detectLocationQuery = (query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return locationKeywords.some(keyword => lowerQuery.includes(keyword)) ||
           Object.keys(buildingAliases).some(alias => lowerQuery.includes(alias));
  };

  const findBuildingFromQuery = async (query: string): Promise<any | null> => {
    const lowerQuery = query.toLowerCase();
    
    // Check aliases first
    for (const [alias, buildingName] of Object.entries(buildingAliases)) {
      if (lowerQuery.includes(alias)) {
        const { data } = await supabase
          .from('buildings')
          .select('*')
          .ilike('name', `%${buildingName}%`)
          .limit(1);
        
        if (data && data.length > 0) {
          return data[0];
        }
      }
    }

    // Search by name or code
    const { data } = await supabase
      .from('buildings')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .limit(1);
    
    return data && data.length > 0 ? data[0] : null;
  };

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage('user', userMessage);
    setIsTyping(true);

    try {
      // Check if this is a location query
      if (detectLocationQuery(userMessage)) {
        const building = await findBuildingFromQuery(userMessage);
        
        if (building) {
          const messageId = addMessage('assistant', `I found ${building.name}! I'm redirecting you to the campus map to show you its exact location and get directions.`, true);
          setTimeout(() => updateMessageTyping(messageId, false), 2000);
          
          setTimeout(() => {
            navigate('/map', { 
              state: { 
                selectedBuilding: building,
                searchQuery: userMessage 
              } 
            });
          }, 1500);
          return;
        } else {
          const messageId = addMessage('assistant', "I couldn't find that specific building, but I'm taking you to the campus map where you can search manually and explore all available buildings.", true);
          setTimeout(() => updateMessageTyping(messageId, false), 2000);
          
          setTimeout(() => {
            navigate('/map', { state: { searchQuery: userMessage } });
          }, 1500);
          return;
        }
      }

      // For other queries, call the AI search function
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: userMessage }
      });

      if (error) {
        throw error;
      }

      // Add AI response with typing animation
      const messageId = addMessage('assistant', data.response || "I'm sorry, I couldn't generate a response right now. Please try again.", true);
      setTimeout(() => updateMessageTyping(messageId, false), data.response ? data.response.length * 25 : 2000);

    } catch (error: any) {
      console.error('Chat error:', error);
      const messageId = addMessage('assistant', "I'm experiencing some technical difficulties. Please try again in a moment.", true);
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

  const suggestions = [
    "What dining options are available on campus?",
    "Where is the Central Library?",
    "Tell me about UTA's engineering programs",
    "What events are happening today?",
    "How do I register for classes?"
  ];

  return (
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.type === 'assistant' && message.isTyping ? (
                      <TypewriterText 
                        text={message.content} 
                        onComplete={() => updateMessageTyping(message.id, false)}
                      />
                    ) : (
                      message.content
                    )}
                  </p>
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

        {/* Quick Suggestions (only show when no messages except welcome) */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <p className="text-center text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors duration-200 text-left"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
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
            placeholder="Ask me anything about UTA campus..."
            className="flex-1 resize-none min-h-[44px] rounded-xl"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          UTA Copilot can help with campus info, dining, buildings, events, and academics
        </p>
      </div>
    </div>
  );
};