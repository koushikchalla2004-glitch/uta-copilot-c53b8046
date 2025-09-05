import React, { useState } from 'react';
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
  const { toast } = useToast();

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
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4 message-slide-up`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={`max-w-[85%] flex ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            type === 'user' 
              ? 'bg-primary text-primary-foreground ml-2' 
              : 'bg-muted text-muted-foreground mr-2'
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
        <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'}`}>
          <motion.div
            className={`px-4 py-3 ${
              type === 'user' 
                ? 'chat-bubble-user' 
                : 'chat-bubble-assistant'
            } group relative`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Typing indicator */}
            {isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dots" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dots" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full typing-dots" />
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
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {onRegenerate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    className="h-6 w-6 p-0"
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
            className={`text-xs text-muted-foreground mt-1 ${
              type === 'user' ? 'mr-2' : 'ml-2'
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