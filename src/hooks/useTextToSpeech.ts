import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSSettings {
  voice_id: string;
  model_id: string;
  enabled: boolean;
  autoPlay: boolean;
}

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  currentAudio: HTMLAudioElement | null;
  error: string | null;
}

export const useTextToSpeech = () => {
  const [settings, setSettings] = useState<TTSSettings>({
    voice_id: '9BWtsMINqrJLrRacOk9x', // Aria - natural female voice
    model_id: 'eleven_turbo_v2_5', // Fast, high quality
    enabled: true,
    autoPlay: false
  });

  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    currentAudio: null,
    error: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false, currentAudio: null }));
  }, []);

  const speakText = useCallback(async (text: string, autoPlay: boolean = settings.autoPlay) => {
    if (!settings.enabled || !text.trim()) return;

    // Stop any currently playing audio
    stopCurrentAudio();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('TTS: Converting text to speech...', text.substring(0, 50));

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voice_id: settings.voice_id,
          model_id: settings.model_id
        }
      });

      if (error) {
        throw new Error(error.message || 'TTS service error');
      }

      if (!data.success) {
        if (data.fallback) {
          console.warn('TTS: Service unavailable, continuing without audio');
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        throw new Error(data.error || 'TTS conversion failed');
      }

      // Convert base64 to audio blob
      const audioData = atob(data.audio);
      const audioBytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioBytes[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and setup audio element
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';

      // Setup event listeners
      audio.onloadeddata = () => {
        console.log('TTS: Audio loaded successfully');
        setState(prev => ({ ...prev, isLoading: false, currentAudio: audio }));
        
        if (autoPlay) {
          audio.play().catch(err => {
            console.warn('TTS: Autoplay failed (user interaction required):', err);
            setState(prev => ({ ...prev, error: 'Click to play audio (browser autoplay policy)' }));
          });
        }
      };

      audio.onplay = () => {
        setState(prev => ({ ...prev, isPlaying: true, error: null }));
      };

      audio.onpause = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      audio.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false, currentAudio: null }));
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (err) => {
        console.error('TTS: Audio playback error:', err);
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false, error: 'Audio playback failed' }));
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current = audio;

    } catch (error: any) {
      console.error('TTS: Error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'TTS service temporarily unavailable' 
      }));
    }
  }, [settings, stopCurrentAudio]);

  const playPauseAudio = useCallback(() => {
    if (!state.currentAudio) return;

    if (state.isPlaying) {
      state.currentAudio.pause();
    } else {
      state.currentAudio.play().catch(err => {
        console.error('TTS: Play error:', err);
        setState(prev => ({ ...prev, error: 'Audio playback failed' }));
      });
    }
  }, [state.currentAudio, state.isPlaying]);

  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    settings,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    error: state.error,
    hasAudio: !!state.currentAudio,

    // Actions
    speakText,
    playPauseAudio,
    stopCurrentAudio,
    updateSettings,
    clearError
  };
};