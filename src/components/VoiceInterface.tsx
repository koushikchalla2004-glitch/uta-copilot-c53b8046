import React, { useState, useRef, useCallback } from 'react';
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  // Start voice recording
  const startRecording = useCallback(async () => {
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
              onTranscription(data.text);
              toast({
                title: "Voice Input",
                description: `Heard: "${data.text}"`,
              });
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              title: "Voice Error",
              description: "Failed to process voice input",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      toast({
        title: "Listening",
        description: "Speak your question...",
      });

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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

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

      toast({
        title: "Speaking",
        description: `Using ${data.provider || 'TTS'} voice`,
      });

    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      onSpeakingChange(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech",
        variant: "destructive",
      });
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
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    toggleAudio,
    // UI Component
    VoiceControls: () => (
      <div className="flex items-center gap-2">
        {/* Microphone Button */}
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          variant={isRecording ? "destructive" : "default"}
          size="icon"
          className={`w-12 h-12 rounded-full transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* Audio Toggle Button */}
        <Button
          onClick={toggleAudio}
          variant="outline"
          size="icon"
          className="w-10 h-10"
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <Button
            onClick={stopSpeaking}
            variant="secondary"
            size="sm"
            className="animate-pulse"
          >
            Speaking...
          </Button>
        )}
      </div>
    )
  };
};