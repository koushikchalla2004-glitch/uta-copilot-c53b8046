import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCaptionsProps {
  isVisible: boolean;
  currentText: string;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
}

export const LiveCaptions: React.FC<LiveCaptionsProps> = ({
  isVisible,
  currentText,
  isListening,
  isSpeaking,
  isProcessing
}) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (currentText) {
      setDisplayText(currentText);
    } else if (isListening) {
      setDisplayText('Listening...');
    } else if (isProcessing) {
      setDisplayText('Processing...');
    } else if (isSpeaking) {
      setDisplayText('Speaking...');
    } else {
      setDisplayText('');
    }
  }, [currentText, isListening, isProcessing, isSpeaking]);

  if (!isVisible || !displayText) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/20 shadow-2xl max-w-md">
          <motion.p
            key={displayText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-medium"
          >
            {displayText}
          </motion.p>
          
          {/* Animated dots for processing states */}
          {(isListening || isProcessing || isSpeaking) && (
            <div className="flex justify-center items-center mt-2 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};