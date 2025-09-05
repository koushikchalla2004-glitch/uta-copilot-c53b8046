import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface TypingAnimationProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
  className?: string;
  showCursor?: boolean;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  onComplete,
  speed = 50,
  className = '',
  showCursor = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTypingCursor, setShowTypingCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Typing complete
      setTimeout(() => {
        setShowTypingCursor(false);
        onComplete?.();
      }, 500);
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setShowTypingCursor(true);
  }, [text]);

  return (
    <div className={`flex gap-3 max-w-[80%] ${className}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      {/* Message Bubble with Typing */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl px-4 py-3">
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {displayedText}
          {showCursor && showTypingCursor && (
            <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse"></span>
          )}
        </p>
        <p className="text-xs mt-1 text-white/50">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex gap-3 max-w-[80%] ${className}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      {/* Beautiful Loading Animation */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Pulsing Brain Icon */}
          <div className="relative">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-ping opacity-30"></div>
          </div>
          
          {/* Animated Dots */}
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Thinking Text with Gradient */}
          <span className="text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-sm font-medium animate-pulse">
            Thinking...
          </span>
        </div>
      </div>
    </div>
  );
};