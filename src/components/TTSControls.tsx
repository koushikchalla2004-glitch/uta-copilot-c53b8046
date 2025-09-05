import React from 'react';
import { Button } from './ui/button';
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TTSControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasAudio: boolean;
  error: string | null;
  enabled: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onToggleEnabled: () => void;
  onClearError: () => void;
  className?: string;
}

export const TTSControls: React.FC<TTSControlsProps> = ({
  isPlaying,
  isLoading,
  hasAudio,
  error,
  enabled,
  onPlayPause,
  onStop,
  onToggleEnabled,
  onClearError,
  className
}) => {
  if (error) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearError}
          className="text-xs text-destructive border-destructive/30"
        >
          <VolumeX className="w-3 h-3 mr-1" />
          Audio Error
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="outline"
          disabled
          className="text-xs"
        >
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Generating...
        </Button>
      </div>
    );
  }

  if (!hasAudio) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleEnabled}
          className={cn(
            "text-xs",
            enabled ? "text-primary" : "text-muted-foreground"
          )}
        >
          {enabled ? (
            <Volume2 className="w-3 h-3" />
          ) : (
            <VolumeX className="w-3 h-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        size="sm"
        variant="outline"
        onClick={onPlayPause}
        className="text-xs h-7 px-2"
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onStop}
        className="text-xs h-7 px-2"
      >
        <Square className="w-3 h-3" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleEnabled}
        className={cn(
          "text-xs h-7 px-2",
          enabled ? "text-primary" : "text-muted-foreground"
        )}
      >
        {enabled ? (
          <Volume2 className="w-3 h-3" />
        ) : (
          <VolumeX className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};