import React, { createContext, useContext, useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from '@/hooks/use-toast';

interface VoiceContextType {
  isConnected: boolean;
  isListening: boolean;
  startVoiceControl: () => Promise<void>;
  stopVoiceControl: () => Promise<void>;
  speak: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: React.ReactNode;
  agentId?: string;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ 
  children, 
  agentId = "your-agent-id" 
}) => {
  const [isListening, setIsListening] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice conversation connected');
      toast({
        title: "Voice Control Active",
        description: "You can now control the dealership with your voice!",
      });
    },
    onDisconnect: () => {
      console.log('Voice conversation disconnected');
      setIsListening(false);
    },
    onMessage: (message) => {
      console.log('Voice message:', message);
      // Handle voice commands here
      if (message.message && message.message.toLowerCase().includes('show cars')) {
        // Scroll to cars section
        const carsSection = document.getElementById('featured-cars');
        carsSection?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onError: (error) => {
      console.error('Voice error:', error);
      toast({
        title: "Voice Control Error",
        description: "There was an issue with voice control. Please try again.",
        variant: "destructive",
      });
    },
    clientTools: {
      navigateToSection: (parameters: { section: string }) => {
        const element = document.getElementById(parameters.section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return `Navigated to ${parameters.section} section`;
        }
        return "Section not found";
      },
      searchCars: (parameters: { query: string }) => {
        // Implement car search functionality
        console.log('Searching for cars:', parameters.query);
        return `Searching for ${parameters.query}`;
      }
    }
  });

  const startVoiceControl = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For demo purposes, we'll use a mock agent ID
      // In production, you would get this from your ElevenLabs dashboard
      await conversation.startSession({ 
        agentId: agentId 
      });
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start voice control:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone access to use voice control.",
        variant: "destructive",
      });
    }
  }, [conversation, agentId]);

  const stopVoiceControl = useCallback(async () => {
    try {
      await conversation.endSession();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop voice control:', error);
    }
  }, [conversation]);

  const speak = useCallback((text: string) => {
    // Simple text-to-speech for immediate feedback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const value: VoiceContextType = {
    isConnected: conversation.status === 'connected',
    isListening,
    startVoiceControl,
    stopVoiceControl,
    speak,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};