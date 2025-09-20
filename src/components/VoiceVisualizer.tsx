import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const VoiceVisualizer = ({ isListening, isSpeaking, className }: VoiceVisualizerProps) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isListening || isSpeaking) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isListening, isSpeaking]);

  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {bars.map((bar, index) => (
        <div
          key={`${animationKey}-${bar}`}
          className={cn(
            "w-2 rounded-full transition-all duration-300",
            isListening || isSpeaking
              ? "bg-voice-primary animate-voice-wave h-8"
              : "bg-muted h-4",
            // Stagger the animation
            isListening && `animate-delay-[${index * 100}ms]`,
            isSpeaking && `animate-delay-[${index * 150}ms]`
          )}
          style={{
            animationDelay: isListening || isSpeaking ? `${index * 100}ms` : '0ms'
          }}
        />
      ))}
    </div>
  );
};