import { useState, useEffect } from "react";
import { ChatHistory, Message } from "@/components/ChatHistory";
import { VoiceButton } from "@/components/VoiceButton";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useConversationMemory } from "@/hooks/useConversationMemory";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings, Share2, Trash2 } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  
  const { toast } = useToast();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: speechRecognitionSupported 
  } = useSpeechRecognition();
  
  const { 
    isSpeaking, 
    speak, 
    stop: stopSpeaking,
    isSupported: speechSynthesisSupported 
  } = useSpeechSynthesis();
  
  const {
    addMessage,
    getSystemPrompt,
    getConversationHistory,
    clearConversation,
    shareableLink,
    loadFromShare
  } = useConversationMemory();

  // Load API key on mount
  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  // Handle transcript when speech recognition completes
  useEffect(() => {
    if (transcript && !isListening) {
      handleUserMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  const handleUserMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    addMessage('user', text);

    // Call OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: getSystemPrompt() },
            ...getConversationHistory(),
            { role: 'user', content: text }
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      addMessage('assistant', aiResponse);
      
      // Speak the response
      if (speechSynthesisSupported) {
        await speak(aiResponse);
      }
      
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      if (!speechRecognitionSupported) {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
        return;
      }
      startListening();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    clearConversation();
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been cleared.",
    });
  };

  const handleShare = async () => {
    const shareCode = shareableLink();
    const shareUrl = `${window.location.origin}?share=${shareCode}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Shareable link copied to clipboard!",
      });
    } catch {
      toast({
        title: "Share Link",
        description: `Copy this link: ${shareUrl}`,
      });
    }
  };

  // Check for shared conversation on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('share');
    if (shareCode && loadFromShare(shareCode)) {
      toast({
        title: "Conversation Loaded",
        description: "Shared conversation context has been loaded.",
      });
    }
  }, []);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <ApiKeyInput onApiKeySet={setApiKey} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/20 bg-card/10 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Voice Assistant
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
            className="hover:bg-voice-primary/20"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearChat}
            className="hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-voice-primary/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-border/20 bg-card/10 backdrop-blur-sm">
          <ApiKeyInput onApiKeySet={setApiKey} storedKey={apiKey} />
        </div>
      )}

      {/* Chat Area */}
      <ChatHistory 
        messages={messages}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />

      {/* Voice Control */}
      <div className="p-6 border-t border-border/20 bg-card/10 backdrop-blur-sm">
        <div className="flex justify-center">
          <VoiceButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListening={handleVoiceToggle}
            className="animate-float"
          />
        </div>
        
        {(!speechRecognitionSupported || !speechSynthesisSupported) && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {!speechRecognitionSupported && "Speech recognition not supported. "}
            {!speechSynthesisSupported && "Speech synthesis not supported. "}
            Use a modern browser for full voice features.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;