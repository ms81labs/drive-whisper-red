/**
 * Environment Configuration Module
 * 
 * Type-safe wrapper around import.meta.env with validation and sensible defaults.
 * This module handles ElevenLabs configuration, rate limiting, and feature flags
 * for the ConvAI system.
 * 
 * @module convai/lib/env
 */

// ==============================
// Types
// ==============================

/**
 * Feature flags for ConvAI functionality
 */
export type FeatureFlag = 
  | 'VOICE'              // Main voice control feature
  | 'DEBUG_TOOLS'        // Debug logging and tools
  | 'RATE_LIMITING'      // Enable/disable rate limiting
  | 'PERSISTENT_HISTORY' // Store conversation history
  | 'VOICE_FEEDBACK'     // Audio feedback from assistant
  | 'DARK_MODE'          // Dark mode UI
  | 'ADMIN_FEATURES';    // Admin-only features

/**
 * Environment variable configuration
 */
interface EnvConfig {
  // ElevenLabs Configuration
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_AGENT_ID: string;
  ELEVENLABS_VOICE_ID: string;
  
  // Rate Limiting
  RATE_LIMIT: number;
  RATE_LIMIT_WINDOW_MS: number;
  
  // Feature Flags
  FEATURE_VOICE: boolean;
  FEATURE_DEBUG_TOOLS: boolean;
  FEATURE_RATE_LIMITING: boolean;
  FEATURE_PERSISTENT_HISTORY: boolean;
  FEATURE_VOICE_FEEDBACK: boolean;
  FEATURE_DARK_MODE: boolean;
  FEATURE_ADMIN_FEATURES: boolean;
  
  // Security
  JWT_SECRET: string;
  AUTH_ENABLED: boolean;
  
  // Misc Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  
  // Helper methods
  isFeatureEnabled(feature: FeatureFlag): boolean;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}

// ==============================
// Default Values
// ==============================

/**
 * Default values for optional environment variables
 */
const defaults = {
  RATE_LIMIT: 10,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  FEATURE_VOICE: true,
  FEATURE_DEBUG_TOOLS: false,
  FEATURE_RATE_LIMITING: true,
  FEATURE_PERSISTENT_HISTORY: false,
  FEATURE_VOICE_FEEDBACK: true,
  FEATURE_DARK_MODE: false,
  FEATURE_ADMIN_FEATURES: false,
  AUTH_ENABLED: true,
  NODE_ENV: 'development' as const,
  APP_URL: 'http://localhost:5173',
};

// ==============================
// Environment Access
// ==============================

/**
 * Safely access environment variables with type checking
 * 
 * @param key Environment variable name
 * @param defaultValue Optional default value
 * @returns Environment variable value or default
 */
function getEnvVar<T>(key: string, defaultValue?: T): string | T {
  const value = import.meta.env[`VITE_${key}`];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // Only throw in development to avoid runtime errors in production
    if (import.meta.env.DEV) {
      console.warn(`Environment variable VITE_${key} is not defined`);
    }
    return '';
  }
  
  return value;
}

/**
 * Get a boolean environment variable
 * 
 * @param key Environment variable name
 * @param defaultValue Optional default value
 * @returns Boolean value of environment variable
 */
function getBoolEnvVar(key: string, defaultValue = false): boolean {
  const value = getEnvVar(key, defaultValue.toString());
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get a numeric environment variable
 * 
 * @param key Environment variable name
 * @param defaultValue Optional default value
 * @returns Numeric value of environment variable
 */
function getNumEnvVar(key: string, defaultValue = 0): number {
  const value = getEnvVar(key, defaultValue.toString());
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ==============================
// Validation
// ==============================

/**
 * Validate required environment variables
 * 
 * @param requiredVars List of required environment variables
 * @throws Error if any required variables are missing
 */
function validateRequiredVars(requiredVars: string[]): void {
  if (!import.meta.env.DEV) return; // Only validate in development
  
  const missingVars = requiredVars.filter(key => 
    import.meta.env[`VITE_${key}`] === undefined
  );
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file or environment configuration.');
    
    // Don't throw in production to avoid breaking the app
    if (import.meta.env.DEV) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
}

/**
 * Check for insecure configurations
 */
function checkSecurityWarnings(): void {
  if (!import.meta.env.DEV) return; // Only check in development
  
  const warnings: string[] = [];
  
  // Check for insecure API key in client-side code
  if (getEnvVar('ELEVENLABS_API_KEY')) {
    warnings.push('ELEVENLABS_API_KEY should not be exposed in client-side code. Use a server proxy instead.');
  }
  
  // Check for missing rate limiting in production
  if (import.meta.env.PROD && !getBoolEnvVar('FEATURE_RATE_LIMITING', defaults.FEATURE_RATE_LIMITING)) {
    warnings.push('Rate limiting is disabled in production, which may lead to excessive API usage.');
  }
  
  // Check for missing authentication in production
  if (import.meta.env.PROD && !getBoolEnvVar('AUTH_ENABLED', defaults.AUTH_ENABLED)) {
    warnings.push('Authentication is disabled in production, which may pose security risks.');
  }
  
  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️ Security warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }
}

// ==============================
// Environment Configuration
// ==============================

/**
 * Create the environment configuration object
 */
function createEnvConfig(): EnvConfig {
  // Validate required environment variables
  validateRequiredVars(['ELEVENLABS_AGENT_ID']);
  
  // Check for security warnings
  checkSecurityWarnings();
  
  // Create the environment configuration object
  const env: EnvConfig = {
    // ElevenLabs Configuration
    ELEVENLABS_API_KEY: getEnvVar('ELEVENLABS_API_KEY', ''),
    ELEVENLABS_AGENT_ID: getEnvVar('ELEVENLABS_AGENT_ID', ''),
    ELEVENLABS_VOICE_ID: getEnvVar('ELEVENLABS_VOICE_ID', ''),
    
    // Rate Limiting
    RATE_LIMIT: getNumEnvVar('RATE_LIMIT', defaults.RATE_LIMIT),
    RATE_LIMIT_WINDOW_MS: getNumEnvVar('RATE_LIMIT_WINDOW_MS', defaults.RATE_LIMIT_WINDOW_MS),
    
    // Feature Flags
    FEATURE_VOICE: getBoolEnvVar('FEATURE_VOICE', defaults.FEATURE_VOICE),
    FEATURE_DEBUG_TOOLS: getBoolEnvVar('FEATURE_DEBUG_TOOLS', defaults.FEATURE_DEBUG_TOOLS),
    FEATURE_RATE_LIMITING: getBoolEnvVar('FEATURE_RATE_LIMITING', defaults.FEATURE_RATE_LIMITING),
    FEATURE_PERSISTENT_HISTORY: getBoolEnvVar('FEATURE_PERSISTENT_HISTORY', defaults.FEATURE_PERSISTENT_HISTORY),
    FEATURE_VOICE_FEEDBACK: getBoolEnvVar('FEATURE_VOICE_FEEDBACK', defaults.FEATURE_VOICE_FEEDBACK),
    FEATURE_DARK_MODE: getBoolEnvVar('FEATURE_DARK_MODE', defaults.FEATURE_DARK_MODE),
    FEATURE_ADMIN_FEATURES: getBoolEnvVar('FEATURE_ADMIN_FEATURES', defaults.FEATURE_ADMIN_FEATURES),
    
    // Security
    JWT_SECRET: getEnvVar('JWT_SECRET', ''),
    AUTH_ENABLED: getBoolEnvVar('AUTH_ENABLED', defaults.AUTH_ENABLED),
    
    // Misc Configuration
    NODE_ENV: getEnvVar('NODE_ENV', defaults.NODE_ENV) as 'development' | 'production' | 'test',
    APP_URL: getEnvVar('APP_URL', defaults.APP_URL),
    
    // Helper methods
    isFeatureEnabled(feature: FeatureFlag): boolean {
      const featureKey = `FEATURE_${feature}` as keyof EnvConfig;
      return this[featureKey] as boolean;
    },
    
    isDevelopment(): boolean {
      return this.NODE_ENV === 'development';
    },
    
    isProduction(): boolean {
      return this.NODE_ENV === 'production';
    },
    
    isTest(): boolean {
      return this.NODE_ENV === 'test';
    },
  };
  
  return env;
}

// ==============================
// Exports
// ==============================

/**
 * Environment configuration singleton
 */
export const env = createEnvConfig();

/**
 * Default export for convenience
 */
export default env;
