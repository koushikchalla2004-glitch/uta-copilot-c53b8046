import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { NavigationAgent, ReminderAgent, AgentRouter } from '@/utils/agents';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // Check if this should trigger a specialized agent
      const agentRoute = await AgentRouter.processQuery(userMessage);
      
      if (agentRoute.agent && agentRoute.confidence > 0.7) {
        // Handle specialized agent actions
        if (agentRoute.agent === 'navigation' && agentRoute.action === 'get_directions') {
          const result = await NavigationAgent.getDirections(agentRoute.params.building);
          const messageId = addMessage('assistant', result.message, true);
          setTimeout(() => updateMessageTyping(messageId, false), result.message.length * 25);
          
          if (result.success) {
            toast({
              title: "Navigation",
              description: `Opening directions to ${agentRoute.params.building}`,
            });
          }
          setIsTyping(false);
          return;
        }
        
        if (agentRoute.agent === 'reminder') {
          // For reminder, we still need AI to parse the exact datetime and event details
          // Fall through to AI call but with special context
        }
      }

      // Prepare short conversation history for context
      const history = messages.slice(-10).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

      // Call the AI search function with history
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: userMessage, conversation: history }
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

      // Add AI response with typing animation
      const messageId = addMessage('assistant', data.response || "I apologize, but I am unable to process your request at this time. Please try again momentarily.", true);
      setTimeout(() => updateMessageTyping(messageId, false), data.response ? data.response.length * 25 : 2000);

    } catch (error: any) {
      console.error('Chat error:', error);
      const messageId = addMessage('assistant', "I am currently experiencing technical difficulties. Please try your request again in a few moments.", true);
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
                       <span>{formatMessageWithLinks(message.content)}</span>
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
          UTA Copilot provides professional assistance with academic programs, campus services, and university resources
        </p>
      </div>
    </div>
  );
};