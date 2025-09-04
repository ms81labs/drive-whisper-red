import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from './VoiceProvider';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ className }) => {
  const { isConnected, isListening, startVoiceControl, stopVoiceControl } = useVoice();

  const handleToggle = async () => {
    if (isListening) {
      await stopVoiceControl();
    } else {
      await startVoiceControl();
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isListening ? "default" : "outline"}
      size="icon"
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isListening && "bg-primary hover:bg-primary/90 animate-pulse",
        className
      )}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isListening && (
        <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
      )}
    </Button>
  );
};