import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData } from '@/utils/VoiceRecorder';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const useRealtimeVoice = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your UTA Copilot. I can speak with you about campus life, classes, dining, parking, or any university services. Click 'Start Voice Chat' to begin our conversation!",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const connectToVoiceChat = useCallback(async () => {
    if (isConnected || isConnecting) return;

    try {
      setIsConnecting(true);
      console.log("Connecting to voice chat...");

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//xihwgrnqvlxchigttrzj.supabase.co/functions/v1/realtime-voice`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        toast({
          title: "Voice Chat Connected",
          description: "You can now speak with UTA Copilot!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data.type);

        switch (data.type) {
          case 'session.created':
            console.log("Session created, starting recording...");
            await startRecording();
            break;

          case 'input_audio_buffer.speech_started':
            console.log("Speech started");
            setIsListening(true);
            currentTranscriptRef.current = '';
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log("Speech stopped");
            setIsListening(false);
            break;

          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) {
              console.log("User transcript:", data.transcript);
              addMessage(data.transcript, true);
            }
            break;

          case 'response.audio.delta':
            if (data.delta && audioContextRef.current) {
              setIsSpeaking(true);
              // Convert base64 to Uint8Array
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
            }
            break;

          case 'response.audio_transcript.delta':
            if (data.delta) {
              currentTranscriptRef.current += data.delta;
            }
            break;

          case 'response.audio_transcript.done':
            if (currentTranscriptRef.current) {
              console.log("AI transcript:", currentTranscriptRef.current);
              addMessage(currentTranscriptRef.current, false);
              currentTranscriptRef.current = '';
            }
            break;

          case 'response.done':
            console.log("Response complete");
            setIsSpeaking(false);
            break;

          case 'error':
            console.error("Voice chat error:", data.message);
            toast({
              title: "Voice Chat Error",
              description: data.message,
              variant: "destructive"
            });
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice chat service",
          variant: "destructive"
        });
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        setIsConnecting(false);
        stopRecording();
      };

    } catch (error) {
      console.error("Error connecting to voice chat:", error);
      setIsConnecting(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive"
      });
    }
  }, [isConnected, isConnecting, toast, addMessage]);

  const startRecording = async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          const message = {
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          };
          wsRef.current.send(JSON.stringify(message));
        }
      });

      await recorderRef.current.start();
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start audio recording",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      console.log("Recording stopped");
    }
  };

  const disconnectVoiceChat = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopRecording();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    toast({
      title: "Voice Chat Disconnected",
      description: "Voice conversation ended",
    });
  }, [toast]);

  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected || !wsRef.current) return;

    addMessage(text, true);

    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    wsRef.current.send(JSON.stringify(message));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, [isConnected, addMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectVoiceChat();
    };
  }, [disconnectVoiceChat]);

  return {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    messages,
    connectToVoiceChat,
    disconnectVoiceChat,
    sendTextMessage
  };
};