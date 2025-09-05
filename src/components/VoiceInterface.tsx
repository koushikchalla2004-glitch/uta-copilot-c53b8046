import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

export const useVoiceInterface = ({
  onTranscription,
  onSpeakingChange
}: VoiceInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [liveCaptionText, setLiveCaptionText] = useState('');
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  
  const { toast } = useToast();

  // Initialize speech recognition for live captions
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setCurrentTranscript(currentText);
        setLiveCaptionText(currentText);

        // Clear existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }

        // Set new silence timer (1 second) only if we have text and are recording
        if (currentText.trim() && isRecording) {
          const timer = setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              console.log('Auto-stopping recording due to silence (1 second)');
              stopRecording();
            }
          }, 1000);
          setSilenceTimer(timer);
        }
      };

      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      speechRecognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
      };
    }

    return () => {
      // Cleanup on unmount
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Start voice recording
  const startRecording = useCallback(async () => {
    console.log('Starting recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('MediaRecorder stopped');
        setIsProcessing(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            
            // Send to transcription service
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;

            if (data.text && data.text.trim()) {
              console.log('Transcription received:', data.text);
              onTranscription(data.text);
            } else {
              console.log('No transcription received or empty text');
            }
          } catch (error) {
            console.error('Transcription error:', error);
          } finally {
            console.log('Setting processing to false');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCurrentTranscript('');
      setLiveCaptionText('');

      // Start live speech recognition for captions
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  }, [onTranscription, toast]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    console.log('Stopping recording... Current state:', {
      mediaRecorderState: mediaRecorderRef.current?.state,
      isRecording
    });
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setLiveCaptionText('');
    
    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.log('Speech recognition already stopped');
      }
    }
  }, [silenceTimer]);

  // Speak text using TTS
  const speakText = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!audioEnabled || !text.trim()) return;

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      setIsSpeaking(true);
      setCurrentSpeechText(text);
      setLiveCaptionText(text);
      onSpeakingChange(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        onSpeakingChange(false);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        onSpeakingChange(false);
        currentAudioRef.current = null;
        toast({
          title: "Audio Error",
          description: "Failed to play audio response",
          variant: "destructive",
        });
      };

      await audio.play();

    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      onSpeakingChange(false);
    }
  }, [audioEnabled, onSpeakingChange, toast]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsSpeaking(false);
      onSpeakingChange(false);
    }
  }, [onSpeakingChange]);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      stopSpeaking();
    }
  }, [audioEnabled, stopSpeaking]);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    audioEnabled,
    liveCaptionText,
    currentTranscript,
    currentSpeechText,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    toggleAudio,
    // Simple mic button component for search engine
    MicButton: () => (
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        variant="ghost"
        size="icon"
        className={`transition-all ${
          isRecording 
            ? 'text-red-500 animate-pulse' 
            : 'text-muted-foreground hover:text-primary'
        }`}
      >
        {isProcessing ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    )
  };
};