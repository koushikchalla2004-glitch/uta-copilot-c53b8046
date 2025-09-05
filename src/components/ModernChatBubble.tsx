import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ModernChatBubbleProps {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  onRegenerate?: () => void;
}

export const ModernChatBubble: React.FC<ModernChatBubbleProps> = ({
  type,
  content,
  timestamp,
  isTyping = false,
  onRegenerate
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
      }, Math.random() * 30 + 15); // Random speed for natural feel

      return () => clearTimeout(timer);
    } else if (isTyping && type === 'assistant' && currentIndex >= content.length) {
      // Typing complete - hide cursor after a delay
      setTimeout(() => setShowCursor(false), 500);
    } else if (!isTyping) {
      // Not typing - show full content immediately
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

  return (
    <motion.div
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-6 message-slide-up`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={`max-w-[85%] flex ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            type === 'user' 
              ? 'bg-black text-white' 
              : 'bg-white/90 text-black border border-white/20 backdrop-blur-sm'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
        >
          {type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </motion.div>

        {/* Message Content */}
        <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'} flex-1`}>
          <motion.div
            className={`px-4 py-3 rounded-2xl ${
              type === 'user' 
                ? 'bg-black text-white rounded-br-lg shadow-lg max-w-fit' 
                : 'bg-white/95 text-black border border-white/20 rounded-bl-lg shadow-md backdrop-blur-lg w-full'
            } group relative transition-all duration-200 hover:shadow-xl`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Content with real typing animation */}
            {isTyping && type === 'assistant' ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {displayedText}
                {showCursor && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                )}
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            )}

            {/* Message Actions (for assistant messages) */}
            {type === 'assistant' && !isTyping && (
              <motion.div
                className="absolute -bottom-8 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className={`h-6 w-6 p-0 ${isLiked === true ? 'text-green-500' : ''}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsLiked(false)}
                  className={`h-6 w-6 p-0 ${isLiked === false ? 'text-red-500' : ''}`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Timestamp */}
          <motion.div
            className={`text-xs opacity-60 mt-1 ${
              type === 'user' ? 'text-white/70' : 'text-black/60'
            }`}
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