import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle } from 'lucide-react';
import { parseVoiceCommand, applyEntitiesToFilters } from '@/utils/nlp';
import { CarFilters, ConversationState, VoiceCommand } from '@/types/car';
import { toast } from '@/hooks/use-toast';

interface VoiceSearchAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersUpdate: (filters: Partial<CarFilters>) => void;
  currentFilters: Partial<CarFilters>;
  onSearch: () => void;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const VoiceSearchAssistant: React.FC<VoiceSearchAssistantProps> = ({
  isOpen,
  onClose,
  onFiltersUpdate,
  currentFilters,
  onSearch,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentStep: 'greeting',
    collectedFilters: {},
  });

  const recognitionRef = useRef<any | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          handleVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Start conversation when opened
  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  const startConversation = useCallback(() => {
    const welcomeMessage = "Welcome to RedLine Motors voice assistant! I can help you find the perfect car. Tell me what you're looking for - for example, 'I need a used SUV under thirty thousand euros with automatic transmission.'";
    
    addMessage('assistant', welcomeMessage);
    speak(welcomeMessage);
    
    setConversationState({
      currentStep: 'collecting_preferences',
      collectedFilters: {},
    });
  }, []);

  const addMessage = useCallback((type: 'user' | 'assistant', text: string) => {
    const message: ConversationMessage = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, message]);
  }, []);

  const speak = useCallback((text: string) => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      utterance.voice = synthRef.current.getVoices().find(voice => voice.lang.startsWith('en')) || null;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  }, [isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const handleVoiceInput = useCallback((text: string) => {
    addMessage('user', text);
    
    const command = parseVoiceCommand(text);
    processVoiceCommand(command, text);
    
    setTranscript('');
  }, [conversationState, currentFilters]);

  const processVoiceCommand = useCallback((command: VoiceCommand, originalText: string) => {
    const { intent, entities } = command;
    
    switch (intent) {
      case 'search_cars':
      case 'specify_filters':
        handleFilterSpecification(entities, originalText);
        break;
        
      case 'confirm':
        handleConfirmation();
        break;
        
      case 'deny':
        handleDenial();
        break;
        
      case 'reset_filters':
        handleReset();
        break;
        
      default:
        handleUnknownCommand(originalText);
        break;
    }
  }, [conversationState, currentFilters]);

  const handleFilterSpecification = useCallback((entities: Record<string, any>, originalText: string) => {
    const updatedFilters = applyEntitiesToFilters(entities, conversationState.collectedFilters);
    
    setConversationState(prev => ({
      ...prev,
      collectedFilters: updatedFilters,
    }));
    
    // Update the actual filters
    onFiltersUpdate(updatedFilters);
    
    // Generate confirmation response
    const confirmationText = generateConfirmationText(entities, originalText);
    addMessage('assistant', confirmationText);
    speak(confirmationText);
    
    // Ask for more details or offer to search
    setTimeout(() => {
      const nextQuestion = generateNextQuestion(updatedFilters);
      addMessage('assistant', nextQuestion);
      speak(nextQuestion);
    }, 2000);
  }, [conversationState, onFiltersUpdate]);

  const handleConfirmation = useCallback(() => {
    const response = "Perfect! Let me search for cars matching your criteria.";
    addMessage('assistant', response);
    speak(response);
    
    setTimeout(() => {
      onSearch();
      onClose();
      toast({
        title: "Search Complete",
        description: "Found cars matching your voice search criteria!",
      });
    }, 1500);
  }, [onSearch, onClose]);

  const handleDenial = useCallback(() => {
    const response = "No problem! Please tell me what you'd like to change or search for instead.";
    addMessage('assistant', response);
    speak(response);
  }, []);

  const handleReset = useCallback(() => {
    setConversationState({
      currentStep: 'collecting_preferences',
      collectedFilters: {},
    });
    
    onFiltersUpdate({});
    
    const response = "All filters cleared! Let's start fresh. What kind of car are you looking for?";
    addMessage('assistant', response);
    speak(response);
  }, [onFiltersUpdate]);

  const handleUnknownCommand = useCallback((text: string) => {
    const response = "I didn't quite understand that. Could you try rephrasing? For example, you could say 'I want a BMW SUV under 50,000 euros' or 'Show me electric cars with heated seats.'";
    addMessage('assistant', response);
    speak(response);
  }, []);

  const generateConfirmationText = useCallback((entities: Record<string, any>, originalText: string): string => {
    const confirmations: string[] = [];
    
    if (entities.makes) {
      confirmations.push(`${entities.makes.join(' or ')} vehicles`);
    }
    
    if (entities.vehicleTypes) {
      confirmations.push(`${entities.vehicleTypes.join(' or ')} body type`);
    }
    
    if (entities.conditions) {
      confirmations.push(`${entities.conditions.join(' or ')} condition`);
    }
    
    if (entities.fuelTypes) {
      confirmations.push(`${entities.fuelTypes.join(' or ')} fuel type`);
    }
    
    if (entities.transmissions) {
      confirmations.push(`${entities.transmissions.join(' or ')} transmission`);
    }
    
    if (entities.priceRange) {
      if (entities.priceRange.max) {
        confirmations.push(`under €${entities.priceRange.max.toLocaleString()}`);
      }
      if (entities.priceRange.min) {
        confirmations.push(`over €${entities.priceRange.min.toLocaleString()}`);
      }
    }
    
    if (entities.features) {
      const featureNames = Object.keys(entities.features).map(key => {
        const featureMap: Record<string, string> = {
          heatedSeats: 'heated seats',
          navigationSystem: 'navigation system',
          sunroof: 'sunroof',
          carPlay: 'Apple CarPlay',
          alloyWheels: 'alloy wheels',
          ledHeadlights: 'LED headlights',
        };
        return featureMap[key] || key;
      });
      confirmations.push(`with ${featureNames.join(', ')}`);
    }
    
    if (confirmations.length > 0) {
      return `Got it! Looking for ${confirmations.join(', ')}.`;
    } else {
      return "I understand you're looking for a car. Could you be more specific about what you want?";
    }
  }, []);

  const generateNextQuestion = useCallback((filters: Partial<CarFilters>): string => {
    // Ask follow-up questions based on what's missing
    if (!filters.makes || filters.makes.length === 0) {
      return "What car brand would you prefer? For example, BMW, Mercedes, Audi, or Volkswagen?";
    }
    
    if (!filters.priceMax && !filters.priceMin) {
      return "What's your budget range? You can say something like 'under 30,000 euros' or 'between 20,000 and 50,000 euros'.";
    }
    
    if (!filters.vehicleTypes || filters.vehicleTypes.length === 0) {
      return "What type of vehicle interests you? For example, SUV, sedan, coupe, or estate?";
    }
    
    if (!filters.transmissions || filters.transmissions.length === 0) {
      return "Do you prefer automatic or manual transmission?";
    }
    
    return "Is there anything else specific you're looking for? Or should I search for cars with your current criteria?";
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Voice Car Search Assistant</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Conversation */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-80 p-4 border rounded-lg bg-muted/20">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Live Transcript */}
          {transcript && (
            <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30">
              <p className="text-sm text-muted-foreground mb-1">Live transcript:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center space-x-4">
            {isListening && (
              <Badge variant="default" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening...
              </Badge>
            )}
            
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking...
              </Badge>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className="px-8"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
            
            {isSpeaking && (
              <Button variant="outline" onClick={stopSpeaking}>
                <VolumeX className="h-4 w-4 mr-2" />
                Stop Speaking
              </Button>
            )}
          </div>
          
          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>💡 Try saying: "I want a used BMW SUV under 40,000 euros with heated seats"</p>
            <p>🔄 Or: "Show me electric cars with automatic transmission"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};