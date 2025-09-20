import { useState, useCallback } from 'react';

export interface ConversationContext {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  userProfile: {
    name?: string;
    preferences?: string[];
    context?: string;
  };
}

export const useConversationMemory = () => {
  const [context, setContext] = useState<ConversationContext>({
    messages: [],
    userProfile: {}
  });

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setContext(prev => ({
      ...prev,
      messages: [...prev.messages, { role, content }]
    }));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<ConversationContext['userProfile']>) => {
    setContext(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...updates }
    }));
  }, []);

  const getSystemPrompt = useCallback(() => {
    const { userProfile, messages } = context;
    
    let systemPrompt = `You are a helpful AI voice assistant. Be conversational, concise, and engaging. `;
    
    if (userProfile.name) {
      systemPrompt += `The user's name is ${userProfile.name}. `;
    }
    
    if (userProfile.preferences?.length) {
      systemPrompt += `User preferences: ${userProfile.preferences.join(', ')}. `;
    }
    
    if (userProfile.context) {
      systemPrompt += `Additional context: ${userProfile.context}. `;
    }
    
    systemPrompt += `Keep responses natural and friendly for voice interaction. Avoid long responses unless specifically asked.`;
    
    return systemPrompt;
  }, [context]);

  const getConversationHistory = useCallback(() => {
    return context.messages.slice(-10); // Keep last 10 messages for context
  }, [context.messages]);

  const clearConversation = useCallback(() => {
    setContext(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  const shareableLink = useCallback(() => {
    // Simple base64 encoding of conversation context for sharing
    const shareData = {
      userProfile: context.userProfile,
      messageCount: context.messages.length
    };
    return btoa(JSON.stringify(shareData));
  }, [context]);

  const loadFromShare = useCallback((shareCode: string) => {
    try {
      const shareData = JSON.parse(atob(shareCode));
      setContext(prev => ({
        ...prev,
        userProfile: shareData.userProfile || {}
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    context,
    addMessage,
    updateUserProfile,
    getSystemPrompt,
    getConversationHistory,
    clearConversation,
    shareableLink,
    loadFromShare
  };
};