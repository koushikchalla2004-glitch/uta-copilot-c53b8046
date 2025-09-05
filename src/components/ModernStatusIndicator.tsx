import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Brain, Wifi, WifiOff } from 'lucide-react';

interface ModernStatusIndicatorProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isConnected?: boolean;
  className?: string;
}

export const ModernStatusIndicator: React.FC<ModernStatusIndicatorProps> = ({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  isConnected = true,
  className = ""
}) => {
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        label: 'Disconnected',
        color: 'status-indicator bg-red-500',
        iconColor: 'text-white'
      };
    }
    
    if (isListening) {
      return {
        icon: Mic,
        label: 'Listening',
        color: 'status-indicator status-listening',
        iconColor: 'text-white'
      };
    }
    
    if (isThinking) {
      return {
        icon: Brain,
        label: 'Thinking',
        color: 'status-indicator status-thinking',
        iconColor: 'text-white'
      };
    }
    
    if (isSpeaking) {
      return {
        icon: Volume2,
        label: 'Speaking',
        color: 'status-indicator status-speaking',
        iconColor: 'text-white'
      };
    }
    
    return {
      icon: Wifi,
      label: 'Ready',
      color: 'status-indicator bg-muted',
      iconColor: 'text-muted-foreground'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={status.color}
        animate={isListening || isSpeaking || isThinking ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isListening || isSpeaking || isThinking ? Infinity : 0 }}
      >
        <Icon className={`w-4 h-4 ${status.iconColor}`} />
      </motion.div>
      
      <span className="text-sm font-medium text-foreground">
        {status.label}
      </span>
      
      {/* Waveform indicator for voice activity */}
      {(isListening || isSpeaking) && (
        <motion.div
          className="flex items-center space-x-1 ml-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full waveform-bar"
              style={{ height: `${Math.random() * 20 + 10}px` }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};