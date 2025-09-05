import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, RefreshCw, ThumbsUp, ThumbsDown, ExternalLink, MapPin, Calendar, Clock, Building2, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ResponseCardProps {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  onRegenerate?: () => void;
  metadata?: {
    source?: string;
    strategy?: string;
    agents?: string[];
    confidence?: number;
    processingTime?: number;
    sources?: any[];
  };
}

// Helper function to detect and format links and emails in text
const formatMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[\S]+|www\.[\S]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[\S]*)?)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  let parts = text.split(urlRegex);
  parts = parts.flatMap(part => {
    if (urlRegex.test(part)) {
      return [part];
    }
    return part.split(emailRegex);
  });
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
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

// Function to detect response type and extract structured data
const parseResponse = (content: string, metadata?: any) => {
  const lowerContent = content.toLowerCase();
  
  // Detect if this is location-based response
  if (lowerContent.includes('located') || lowerContent.includes('building') || lowerContent.includes('room') || lowerContent.includes('floor')) {
    return {
      type: 'location',
      icon: MapPin,
      title: 'Location Information',
      color: 'text-blue-500'
    };
  }
  
  // Detect if this is event-based response
  if (lowerContent.includes('event') || lowerContent.includes('date') || lowerContent.includes('time') || lowerContent.includes('schedule')) {
    return {
      type: 'event',
      icon: Calendar,
      title: 'Event Information',
      color: 'text-green-500'
    };
  }
  
  // Detect if this is dining-based response
  if (lowerContent.includes('dining') || lowerContent.includes('food') || lowerContent.includes('restaurant') || lowerContent.includes('meal')) {
    return {
      type: 'dining',
      icon: Users,
      title: 'Dining Information',
      color: 'text-orange-500'
    };
  }
  
  // Detect if this is academic-based response
  if (lowerContent.includes('course') || lowerContent.includes('class') || lowerContent.includes('professor') || lowerContent.includes('academic')) {
    return {
      type: 'academic',
      icon: Building2,
      title: 'Academic Information',
      color: 'text-purple-500'
    };
  }
  
  // Default response type
  return {
    type: 'general',
    icon: Bot,
    title: 'UTA Copilot Response',
    color: 'text-primary'
  };
};

export const ResponseCard: React.FC<ResponseCardProps> = ({
  type,
  content,
  timestamp,
  isTyping = false,
  onRegenerate,
  metadata
}) => {
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const { toast } = useToast();

  // Typing animation effect
  useEffect(() => {
    if (isTyping && type === 'assistant') {
      setDisplayedText('');
      setCurrentIndex(0);
      setShowCursor(true);
    }
  }, [isTyping, type, content]);

  useEffect(() => {
    if (isTyping && type === 'assistant' && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 30 + 15);

      return () => clearTimeout(timer);
    } else if (isTyping && type === 'assistant' && currentIndex >= content.length) {
      setTimeout(() => setShowCursor(false), 500);
    } else if (!isTyping) {
      setDisplayedText(content);
      setShowCursor(false);
    }
  }, [isTyping, type, content, currentIndex]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // For user messages, keep the simple bubble design
  if (type === 'user') {
    return (
      <motion.div
        className="flex justify-end mb-6"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-[85%] flex flex-row-reverse items-start gap-3">
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-black text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
          >
            <User className="w-4 h-4" />
          </motion.div>
          
          <div className="flex flex-col items-end flex-1">
            <motion.div
              className="px-4 py-3 rounded-2xl bg-black text-white rounded-br-lg shadow-lg max-w-fit"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </motion.div>
            
            <motion.div
              className="text-xs opacity-60 mt-1 text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {formatTime(timestamp)}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // For assistant messages, use enhanced card design
  const responseInfo = parseResponse(content, metadata);
  const IconComponent = responseInfo.icon;

  return (
    <motion.div
      className="flex justify-start mb-6"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-[85%] flex flex-row items-start gap-3 w-full">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/90 text-black border border-white/20 backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
        >
          <Bot className="w-4 h-4" />
        </motion.div>

        <div className="flex flex-col items-start flex-1 w-full">
          <motion.div
            className="w-full group"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="bg-white/95 border border-white/20 shadow-lg backdrop-blur-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${responseInfo.color}`} />
                    {responseInfo.title}
                  </CardTitle>
                  
                  {metadata && (
                    <div className="flex items-center gap-2">
                      {metadata.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(metadata.confidence * 100)}% confident
                        </Badge>
                      )}
                      {metadata.strategy && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {metadata.strategy}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {metadata?.agents && metadata.agents.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Powered by: {metadata.agents.map(agent => agent.replace('_', ' ')).join(', ')} agent{metadata.agents.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {isTyping ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formatMessageWithLinks(displayedText)}
                    {showCursor && (
                      <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                    )}
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formatMessageWithLinks(content)}
                  </div>
                )}

                {metadata?.processingTime && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Response generated in {metadata.processingTime}ms</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Message Actions */}
            {!isTyping && (
              <motion.div
                className="flex items-center justify-end space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0, y: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="h-6 w-6 p-0 text-white/60 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {onRegenerate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    className="h-6 w-6 p-0 text-white/60 hover:text-white"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsLiked(true)}
                  className={`h-6 w-6 p-0 ${isLiked === true ? 'text-green-500' : 'text-white/60 hover:text-white'}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsLiked(false)}
                  className={`h-6 w-6 p-0 ${isLiked === false ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="text-xs opacity-60 mt-1 text-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {formatTime(timestamp)}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
