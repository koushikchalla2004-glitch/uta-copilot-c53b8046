import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiriVoiceAnimationProps {
  isVisible: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
}

export const SiriVoiceAnimation: React.FC<SiriVoiceAnimationProps> = ({
  isVisible,
  isListening,
  isSpeaking,
  isProcessing
}) => {
  const getAnimationState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const animationState = getAnimationState();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Background blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
          
          {/* Siri-like animation container */}
          <div className="relative z-10">
            {/* Main circle */}
            <motion.div
              className="relative w-32 h-32 rounded-full"
              animate={{
                scale: animationState === 'listening' ? [1, 1.1, 1] : 
                       animationState === 'speaking' ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: animationState === 'listening' ? 1.5 : 
                         animationState === 'speaking' ? 0.8 : 0.5,
                repeat: animationState !== 'idle' ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary-glow to-primary opacity-80" />
              
              {/* Animated rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={{
                    scale: animationState === 'listening' ? [1, 1.5, 1] :
                           animationState === 'speaking' ? [1, 1.3, 1] : 1,
                    opacity: animationState !== 'idle' ? [0.3, 0.1, 0.3] : 0.3,
                  }}
                  transition={{
                    duration: 2,
                    repeat: animationState !== 'idle' ? Infinity : 0,
                    delay: ring * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Inner particles for listening state */}
              {animationState === 'listening' && (
                <div className="absolute inset-4">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: '0 0',
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.5, 1, 0.5],
                        opacity: [0.6, 1, 0.6],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 30],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 30],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Wave bars for speaking state */}
              {animationState === 'speaking' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        animate={{
                          height: [4, 16, 4],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Processing spinner */}
              {animationState === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              )}
            </motion.div>
            
            {/* Status text */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white text-lg font-medium">
                {animationState === 'listening' && 'Listening...'}
                {animationState === 'processing' && 'Processing...'}
                {animationState === 'speaking' && 'Speaking...'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};