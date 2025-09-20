import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { VoiceVisualizer } from "./VoiceVisualizer";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistoryProps {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
}

export const ChatHistory = ({ messages, isListening, isSpeaking }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-primary/20 flex items-center justify-center animate-float">
            <VoiceVisualizer 
              isListening={isListening} 
              isSpeaking={isSpeaking}
              className="scale-150"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Voice Assistant Ready
            </h3>
            <p className="text-muted-foreground max-w-md">
              Tap the microphone to start a conversation. I can help you with questions, 
              creative tasks, and remember our conversation.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          {(isListening || isSpeaking) && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <VoiceVisualizer 
                  isListening={isListening} 
                  isSpeaking={isSpeaking}
                />
              </div>
              <div className="bg-card/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-border/30">
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Listening..." : "Speaking..."}
                </p>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};