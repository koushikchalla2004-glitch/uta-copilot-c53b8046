import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceInterface } from './VoiceInterface';
import { SiriVoiceAnimation } from './SiriVoiceAnimation';
import { LiveCaptions } from './LiveCaptions';

interface FloatingVoiceButtonProps {
  onTranscription: (text: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  className?: string;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({
  onTranscription,
  onSpeakingChange = () => {},
  className = ''
}) => {
  const voice = useVoiceInterface({
    onTranscription,
    onSpeakingChange
  });

  const getButtonState = () => {
    if (voice.isProcessing) return 'processing';
    if (voice.isRecording) return 'recording';
    return 'idle';
  };

  const buttonState = getButtonState();

  return (
    <>
      {/* Siri Voice Animation */}
      <SiriVoiceAnimation
        isVisible={voice.isRecording || voice.isSpeaking || voice.isProcessing}
        isListening={voice.isRecording}
        isSpeaking={voice.isSpeaking}
        isProcessing={voice.isProcessing}
      />

      {/* Live Captions */}
      <LiveCaptions
        isVisible={voice.isRecording || voice.isSpeaking || voice.isProcessing}
        currentText={voice.liveCaptionText}
        isListening={voice.isRecording}
        isSpeaking={voice.isSpeaking}
        isProcessing={voice.isProcessing}
      />

      {/* Floating Voice Controls */}
      <div className={`fixed bottom-6 right-6 z-40 flex flex-col gap-3 ${className}`}>
        {/* Audio Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={voice.toggleAudio}
          className={`w-12 h-12 rounded-full shadow-lg transition-all ${
            voice.audioEnabled 
              ? 'bg-primary/20 text-primary border-2 border-primary/30' 
              : 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
          }`}
        >
          {voice.audioEnabled ? (
            <Volume2 className="w-5 h-5 mx-auto" />
          ) : (
            <VolumeX className="w-5 h-5 mx-auto" />
          )}
        </motion.button>

        {/* Main Voice Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
          disabled={voice.isProcessing}
          className={`w-16 h-16 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 ${
            buttonState === 'recording' 
              ? 'bg-red-500/90 text-white animate-pulse ring-4 ring-red-500/30' 
              : buttonState === 'processing'
              ? 'bg-blue-500/90 text-white'
              : 'bg-primary/90 text-white hover:bg-primary'
          } ${voice.isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <AnimatePresence mode="wait">
            {voice.isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"
              />
            ) : voice.isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <MicOff className="w-6 h-6 mx-auto" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Mic className="w-6 h-6 mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Status Indicator */}
        <AnimatePresence>
          {(voice.isRecording || voice.isProcessing || voice.isSpeaking) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            >
              {voice.isRecording && 'Listening...'}
              {voice.isProcessing && 'Processing...'}
              {voice.isSpeaking && 'Speaking...'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};