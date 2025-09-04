import React from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, isSpeaking, isConnected }) => {
  if (!isConnected) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening 
          ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-500/30' 
          : isSpeaking
          ? 'bg-blue-500/20 border-2 border-blue-400 shadow-lg shadow-blue-500/30'
          : 'bg-emerald-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
      }`}>
        
        {/* Outer ripple effect */}
        {(isListening || isSpeaking) && (
          <>
            <div className={`absolute inset-0 rounded-full animate-ping ${
              isListening ? 'bg-green-400/30' : 'bg-blue-400/30'
            }`}></div>
            <div className={`absolute inset-2 rounded-full animate-pulse ${
              isListening ? 'bg-green-400/20' : 'bg-blue-400/20'
            }`}></div>
          </>
        )}
        
        {/* Voice bars animation */}
        <div className="flex items-center justify-center gap-1">
          {isListening ? (
            // Listening bars - green and responsive
            <>
              <div className={`w-1 bg-green-400 rounded-full animate-pulse ${
                isListening ? 'h-4 animate-bounce' : 'h-2'
              }`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-1 bg-green-400 rounded-full animate-pulse ${
                isListening ? 'h-6 animate-bounce' : 'h-2'
              }`} style={{ animationDelay: '100ms' }}></div>
              <div className={`w-1 bg-green-400 rounded-full animate-pulse ${
                isListening ? 'h-3 animate-bounce' : 'h-2'
              }`} style={{ animationDelay: '200ms' }}></div>
              <div className={`w-1 bg-green-400 rounded-full animate-pulse ${
                isListening ? 'h-8 animate-bounce' : 'h-2'
              }`} style={{ animationDelay: '300ms' }}></div>
              <div className={`w-1 bg-green-400 rounded-full animate-pulse ${
                isListening ? 'h-4 animate-bounce' : 'h-2'
              }`} style={{ animationDelay: '400ms' }}></div>
            </>
          ) : isSpeaking ? (
            // Speaking bars - blue and dynamic
            <>
              <div className="w-1 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '50ms' }}></div>
              <div className="w-1 h-8 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
              <div className="w-1 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-7 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></div>
            </>
          ) : (
            // Idle state - subtle emerald
            <>
              <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
              <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </>
          )}
        </div>
        
        {/* Center dot */}
        <div className={`absolute w-2 h-2 rounded-full ${
          isListening 
            ? 'bg-green-400 animate-ping' 
            : isSpeaking
            ? 'bg-blue-400 animate-ping'
            : 'bg-emerald-400 animate-pulse'
        }`}></div>
      </div>
    </div>
  );
};

export default VoiceVisualizer;