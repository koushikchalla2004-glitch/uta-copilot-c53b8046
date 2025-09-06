import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface RealtimeVoiceChatProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const RealtimeVoiceChat: React.FC<RealtimeVoiceChatProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    messages,
    connectToVoiceChat,
    disconnectVoiceChat,
    sendTextMessage
  } = useRealtimeVoice();

  React.useEffect(() => {
    onSpeakingChange?.(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  const handleConnect = async () => {
    try {
      await connectToVoiceChat();
      toast({
        title: "Connected",
        description: "Voice chat is now active. Start speaking!",
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to connect to voice chat',
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectVoiceChat();
    toast({
      title: "Disconnected",
      description: "Voice chat has been ended.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Realtime Voice Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
                </Button>
              ) : (
                <Button 
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Chat
                </Button>
              )}
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4 text-sm">
              {isConnected && (
                <>
                  <div className={`flex items-center gap-1 ${isListening ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Mic className={`h-3 w-3 ${isListening ? 'animate-pulse' : ''}`} />
                    {isListening ? 'Listening' : 'Idle'}
                  </div>
                  <div className={`flex items-center gap-1 ${isSpeaking ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    <div className={`h-3 w-3 rounded-full ${isSpeaking ? 'bg-blue-600 animate-pulse' : 'bg-muted-foreground'}`} />
                    {isSpeaking ? 'Speaking' : 'Silent'}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Connection Status */}
          <div className={`text-sm px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 
            isConnecting ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-600'
          }`}>
            {isConnected ? '🟢 Connected - Voice chat is active' :
             isConnecting ? '🟡 Connecting to voice chat...' :
             '🔴 Disconnected - Click "Start Voice Chat" to begin'}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${!message.isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!isConnected && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">🎤 Ready for voice chat?</p>
              <p className="text-sm">
                Click "Start Voice Chat" to begin talking with UTA Copilot. 
                You can ask about campus dining, buildings, events, parking, and more!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimeVoiceChat;