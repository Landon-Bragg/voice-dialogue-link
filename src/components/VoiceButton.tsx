import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  className?: string;
}

export const VoiceButton = ({ 
  isListening, 
  isSpeaking, 
  onToggleListening, 
  className 
}: VoiceButtonProps) => {
  return (
    <Button
      onClick={onToggleListening}
      size="lg"
      className={cn(
        "relative h-16 w-16 rounded-full transition-all duration-300",
        "bg-gradient-primary hover:shadow-glow border-0",
        isListening && "animate-pulse-glow shadow-voice",
        isSpeaking && "opacity-75 cursor-not-allowed",
        className
      )}
      disabled={isSpeaking}
    >
      {isSpeaking ? (
        <Volume2 className="h-6 w-6 text-primary-foreground" />
      ) : isListening ? (
        <MicOff className="h-6 w-6 text-primary-foreground" />
      ) : (
        <Mic className="h-6 w-6 text-primary-foreground" />
      )}
      
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-voice-pulse/20 animate-ping" />
      )}
    </Button>
  );
};