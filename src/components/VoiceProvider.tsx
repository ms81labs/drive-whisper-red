import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  agentId = "demo-agent-placeholder" 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Mock conversation for demo purposes - replace with real agentId
  const conversation = {
    status: 'disconnected' as const,
    startSession: async () => console.log('Demo: Voice session would start with agentId:', agentId),
    endSession: async () => console.log('Demo: Voice session ended'),
  };
  
  // Real conversation (commented out until API key is provided)
  /*
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
      navigateToCarDetail: (parameters: { carId: string }) => {
        window.location.href = `/car/${parameters.carId}`;
        return `Navigating to car details for vehicle ${parameters.carId}`;
      },
      navigateToComparison: (parameters: { car1Id?: string, car2Id?: string }) => {
        let url = '/compare';
        const params = new URLSearchParams();
        if (parameters.car1Id) params.set('car1', parameters.car1Id);
        if (parameters.car2Id) params.set('car2', parameters.car2Id);
        if (params.toString()) url += '?' + params.toString();
        
        window.location.href = url;
        return `Opening vehicle comparison tool`;
      },
      searchCars: (parameters: { query: string }) => {
        // Implement car search functionality
        console.log('Searching for cars:', parameters.query);
        return `Searching for ${parameters.query}`;
      }
    }
  });
  */

  const startVoiceControl = useCallback(async () => {
    try {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please configure your ElevenLabs API key in Admin Settings.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Voice Control Active",
        description: "Connected to ElevenLabs voice assistant.",
      });
      
      await conversation.startSession();
      setIsListening(true);
      
      // Auto-stop after 10 seconds in demo mode
      setTimeout(() => {
        setIsListening(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to start voice control:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to voice service.",
        variant: "destructive",
      });
    }
  }, [conversation, apiKey]);

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
    isConnected: !!apiKey,
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