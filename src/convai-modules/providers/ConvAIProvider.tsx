/**
 * ConvAI Provider
 * 
 * A comprehensive React context provider that manages ElevenLabs ConvAI integration.
 * This provider combines base tools with domain-specific tools, handles errors,
 * implements rate limiting, and provides hooks for components to use.
 * 
 * @module convai/providers/ConvAIProvider
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { baseTools } from '../clientTools.base';
import { createToolRateLimiter, withRetry, getRateLimitMetrics } from '../security/rateLimiter';
import { env } from '../lib/env';
import { NavigateFunction, useNavigate } from 'react-router-dom';

// ==============================
// Types
// ==============================

/**
 * Local copy of possible agent statuses returned by the ElevenLabs hook.
 * We mirror the string literals so that we do not depend on the (un-exported)
 * AgentStatus enum in the SDK.
 */
export type AgentStatus =
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'processing'
  | 'error';

/**
 * ConvAI context state
 */
export interface ConvAIContextState {
  /** Whether the assistant is currently active */
  isActive: boolean;
  /** Whether the assistant is currently listening */
  isListening: boolean;
  /** Whether the assistant is currently speaking */
  isSpeaking: boolean;
  /** Whether the assistant is currently processing a request */
  isProcessing: boolean;
  /** Current status of the agent */
  status: AgentStatus;
  /** Error that occurred during assistant operation */
  error: Error | null;
  /** Start the assistant */
  startAssistant: () => Promise<void>;
  /** Stop the assistant */
  stopAssistant: () => Promise<void>;
  /** Speak text using the assistant's voice */
  speak: (text: string) => Promise<void>;
  /** Get current rate limit metrics */
  getMetrics: () => typeof getRateLimitMetrics extends () => infer R ? R : any;
  /** Debug information (only available when debug is enabled) */
  debug: {
    /** Log of all tool calls */
    toolCalls: Array<{
      tool: string;
      params: any;
      timestamp: number;
      success: boolean;
      error?: string;
    }>;
    /** Clear the debug log */
    clearLog: () => void;
  };
}

/**
 * ConvAI provider props
 */
export interface ConvAIProviderProps {
  /** Children to render */
  children: React.ReactNode;
  /** Domain-specific tools to add to base tools */
  domainTools?: Record<string, (...args: any[]) => any>;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Success handler */
  onSuccess?: (result: any) => void;
  /** Custom rate limit options */
  rateLimitOptions?: {
    /** Maximum number of calls allowed in the time window */
    maxCalls?: number;
    /** Time window in milliseconds */
    windowMs?: number;
  };
  /** Whether to enable debug mode */
  debug?: boolean;
  /** Custom navigation function (optional, will use react-router by default) */
  navigate?: NavigateFunction;
}

/**
 * Tool call result
 */
interface ToolCallResult {
  /** Tool name */
  tool: string;
  /** Parameters passed to the tool */
  params: any;
  /** Result of the tool call */
  result: any;
}

// ==============================
// Context Creation
// ==============================

/**
 * Create the ConvAI context with default values
 */
const ConvAIContext = createContext<ConvAIContextState>({
  isActive: false,
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  status: 'idle',
  error: null,
  startAssistant: async () => {},
  stopAssistant: async () => {},
  speak: async () => {},
  getMetrics: () => ({}),
  debug: {
    toolCalls: [],
    clearLog: () => {},
  },
});

// ==============================
// Provider Implementation
// ==============================

/**
 * ConvAI Provider Component
 */
export const ConvAIProvider: React.FC<ConvAIProviderProps> = ({
  children,
  domainTools = {},
  onError,
  onSuccess,
  rateLimitOptions,
  debug = env.FEATURE_DEBUG_TOOLS,
  navigate: externalNavigate,
}) => {
  // ==============================
  // Hooks and State
  // ==============================
  
  // Use react-router navigate if not provided
  const routerNavigate = useNavigate();
  const navigate = externalNavigate || routerNavigate;
  
  // ElevenLabs conversation hook
  const {
    startSession,
    endSession,
    status,
    isSpeaking: hookIsSpeaking,
    sendUserMessage,
    sendFeedback,
  } = useConversation({
    agentId: env.ELEVENLABS_AGENT_ID,
    voiceId: env.ELEVENLABS_VOICE_ID,
    enableDebug: debug,
    // Bridge ElevenLabs tool calls → our executeTool
    onUnhandledClientToolCall: async (toolCall: { name: string; arguments: any }) => {
      await executeTool(toolCall.name, toolCall.arguments);
    },
    onError: (err: Error) => {
      handleError(err);
    },
  });
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [toolCalls, setToolCalls] = useState<ConvAIContextState['debug']['toolCalls']>([]);
  
  // Refs
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = useRef(5);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ==============================
  // Tool Setup
  // ==============================
  
  // Create combined tools (base + domain-specific)
  const combinedTools = useRef<Record<string, (...args: any[]) => any>>({
    ...baseTools({ navigate }),
    ...domainTools,
  });
  
  // Apply rate limiting to all tools
  const rateLimitedTools = useRef(
    createToolRateLimiter({
      maxCalls: rateLimitOptions?.maxCalls || env.RATE_LIMIT,
      windowMs: rateLimitOptions?.windowMs || env.RATE_LIMIT_WINDOW_MS,
    })(combinedTools.current)
  );
  
  // ==============================
  // Helper Functions
  // ==============================
  
  /**
   * Log a tool call to the debug log
   */
  const logToolCall = useCallback((
    tool: string,
    params: any,
    success: boolean,
    error?: string
  ) => {
    if (debug) {
      setToolCalls(prev => [
        ...prev,
        {
          tool,
          params,
          timestamp: Date.now(),
          success,
          error,
        },
      ]);
    }
  }, [debug]);
  
  /**
   * Clear the debug log
   */
  const clearLog = useCallback(() => {
    setToolCalls([]);
  }, []);
  
  /**
   * Handle errors
   */
  const handleError = useCallback((error: Error) => {
    console.error('ConvAI Error:', error);
    setError(error);
    
    // Call external error handler if provided
    if (onError) {
      onError(error);
    }
    
    // Show error notification
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-notification', {
        detail: {
          message: `Error: ${error.message}`,
          type: 'error',
        },
        bubbles: true,
      });
      window.dispatchEvent(event);
    }
  }, [onError]);
  
  /**
   * Handle successful tool calls
   */
  const handleSuccess = useCallback((result: any) => {
    // Call external success handler if provided
    if (onSuccess) {
      onSuccess(result);
    }
    
    // Optional: provide visual feedback here if needed.
  }, [onSuccess]);
  
  /**
   * Execute a tool with error handling and logging
   */
  const executeTool = useCallback(async (
    toolName: string,
    params: any
  ): Promise<any> => {
    setIsProcessing(true);
    
    try {
      // Check if tool exists
      if (!rateLimitedTools.current[toolName]) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      // Execute the tool with retry logic
      const result = await withRetry(
        () => rateLimitedTools.current[toolName](params),
        {
          maxRetries: 2,
          retryOnRateLimit: true,
        }
      );
      
      // Log successful tool call
      logToolCall(toolName, params, true);
      
      // Handle success
      handleSuccess(result);
      
      return result;
    } catch (error) {
      // Log failed tool call
      logToolCall(
        toolName,
        params,
        false,
        error instanceof Error ? error.message : String(error)
      );
      
      // Handle error
      handleError(error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess, logToolCall]);
  
  /**
   * Handle tool calls from the agent
   */
  const handleToolCall = useCallback(async (
    toolCall: { name: string; arguments: any }
  ): Promise<ToolCallResult> => {
    const { name, arguments: args } = toolCall;
    
    try {
      // Execute the tool
      const result = await executeTool(name, args);
      
      return {
        tool: name,
        params: args,
        result,
      };
    } catch (error) {
      // Return error result
      return {
        tool: name,
        params: args,
        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }, [executeTool]);
  
  /**
   * Exponential backoff reconnect
   */
  const reconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts.current) {
      console.error('Max reconnect attempts reached');
      setError(new Error('Failed to connect to voice service after multiple attempts'));
      return;
    }
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Calculate backoff time
    const backoffTime = Math.min(
      30000, // Max 30 seconds
      1000 * Math.pow(2, reconnectAttempts.current)
    );
    
    console.log(`Attempting to reconnect in ${backoffTime / 1000} seconds...`);
    
    // Set timeout for reconnect
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      startAssistant();
    }, backoffTime);
  }, []);
  
  // ==============================
  // Public API Methods
  // ==============================
  
  /**
   * Start the assistant
   */
  const startAssistant = useCallback(async () => {
    try {
      setError(null);
      
      // Check if voice feature is enabled
      if (!env.isFeatureEnabled('VOICE')) {
        throw new Error('Voice control is disabled');
      }
      
      // Request microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          throw new Error('Microphone permission denied');
        }
      } else {
        throw new Error('Voice control not supported in this browser');
      }
      
      // Start the session
      await startSession();
      
      setIsActive(true);
      setIsListening(true);
      
      // Reset reconnect attempts on successful start
      reconnectAttempts.current = 0;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      
      // Attempt to reconnect
      reconnect();
    }
  }, [handleError, reconnect, startSession]);
  
  /**
   * Stop the assistant
   */
  const stopAssistant = useCallback(async () => {
    try {
      // Stop the session
      await endSession();
      
      setIsActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [handleError, endSession]);
  
  /**
   * Speak text using the assistant's voice
   */
  const speak = useCallback(async (text: string) => {
    try {
      if (!sendUserMessage) {
        throw new Error('Conversation not initialized');
      }
      
      setIsSpeaking(true);
      // Use sendUserMessage to send text to the agent
      // This will trigger the agent to respond with speech
      await sendUserMessage(text);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSpeaking(false);
    }
  }, [sendUserMessage, handleError]);
  
  /**
   * Get current rate limit metrics
   */
  const getMetrics = useCallback(() => {
    return getRateLimitMetrics();
  }, []);
  
  // ==============================
  // Effects
  // ==============================
  
  // Update status based on conversation status
  useEffect(() => {
    setIsListening(status === 'listening');
    setIsSpeaking(hookIsSpeaking || status === 'speaking');
    setIsProcessing(status === 'processing');
  }, [status, hookIsSpeaking]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop the session
      endSession().catch(console.error);
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [endSession]);
  
  // ==============================
  // Context Value
  // ==============================
  
  const contextValue: ConvAIContextState = {
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    status: status as AgentStatus,
    error,
    startAssistant,
    stopAssistant,
    speak,
    getMetrics,
    debug: {
      toolCalls,
      clearLog,
    },
  };
  
  // ==============================
  // Render
  // ==============================
  
  return (
    <ConvAIContext.Provider value={contextValue}>
      {children}
    </ConvAIContext.Provider>
  );
};

// ==============================
// Hook Export
// ==============================

/**
 * Hook to use the ConvAI context
 * 
 * @returns ConvAI context state
 * @throws Error if used outside of a ConvAIProvider
 */
export const useConvAI = (): ConvAIContextState => {
  const context = useContext(ConvAIContext);
  
  if (context === undefined) {
    throw new Error('useConvAI must be used within a ConvAIProvider');
  }
  
  return context;
};

// ==============================
// Additional Components
// ==============================

/**
 * Simple conversation widget component
 */
export const ConversationWidget: React.FC<{
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ 
  className = '',
  position = 'bottom-right',
}) => {
  const { isActive, isListening, isSpeaking, startAssistant, stopAssistant } = useConvAI();
  
  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };
  
  return (
    <div 
      className={`convai-widget ${className}`}
      style={{
        position: 'fixed',
        zIndex: 1000,
        ...positionStyles[position],
      }}
    >
      <button
        onClick={isActive ? stopAssistant : startAssistant}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: isListening ? '#f44336' : '#2196f3',
          color: 'white',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-label={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
      >
        {isListening ? (
          <span>⏹️</span>
        ) : (
          <span>🎤</span>
        )}
        
        {/* Pulse animation when active */}
        {isListening && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid #f44336',
              animation: 'convai-pulse 1.5s infinite',
            }}
          />
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'rgba(255,255,255,0.7)',
              animation: 'convai-speaking 1s infinite',
            }}
          />
        )}
      </button>
      
      {/* Add global styles for animations */}
      <style>
        {`
          @keyframes convai-pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            70% {
              transform: scale(1.5);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          
          @keyframes convai-speaking {
            0% {
              transform: scaleX(0.3);
            }
            50% {
              transform: scaleX(1);
            }
            100% {
              transform: scaleX(0.3);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConvAIProvider;
