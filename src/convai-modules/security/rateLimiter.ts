/**
 * Rate Limiter Module
 * 
 * A comprehensive rate limiting system with multiple strategies:
 * - Fixed Window: Simple counting within time periods
 * - Sliding Window: Gradual expiration of old requests
 * - Token Bucket: Allows bursts while maintaining average rate
 * 
 * Features:
 * - Multiple storage adapters (memory, localStorage)
 * - Retry logic with exponential backoff
 * - Detailed metrics for monitoring
 * - Factory function to wrap all client tools
 * 
 * @module convai/security/rateLimiter
 */

import { env } from '../lib/env';

// ==============================
// Types
// ==============================

/**
 * Rate limiter configuration options
 */
export interface RateLimiterOptions {
  /** Maximum number of calls allowed in the time window */
  maxCalls: number;
  
  /** Time window in milliseconds */
  windowMs: number;
  
  /** Rate limiting strategy to use */
  strategy?: RateLimitStrategy;
  
  /** Storage adapter to use */
  storage?: StorageAdapter;
  
  /** Whether to enable metrics collection */
  enableMetrics?: boolean;
  
  /** Whether to throw errors or just log warnings */
  throwOnLimit?: boolean;
  
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Rate limiting strategies
 */
export type RateLimitStrategy = 'fixed-window' | 'sliding-window' | 'token-bucket';

/**
 * Rate limiter metrics
 */
export interface RateLimiterMetrics {
  /** Total number of calls made */
  totalCalls: number;
  
  /** Number of calls that were rate limited */
  limitedCalls: number;
  
  /** Number of calls that succeeded */
  successfulCalls: number;
  
  /** Average calls per minute */
  callsPerMinute: number;
  
  /** Peak calls per minute */
  peakCallsPerMinute: number;
  
  /** Current number of tokens (for token bucket) */
  currentTokens?: number;
  
  /** Timestamp of last reset */
  lastResetTime: number;
  
  /** Tool-specific metrics */
  toolMetrics: Record<string, {
    calls: number;
    limited: number;
  }>;
}

/**
 * Function wrapped with rate limiting
 */
export type RateLimitedFunction<T extends (...args: any[]) => any> = 
  (...args: Parameters<T>) => Promise<ReturnType<T>>;

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  /** Get a value from storage */
  get(key: string): Promise<any>;
  
  /** Set a value in storage */
  set(key: string, value: any, ttlMs?: number): Promise<void>;
  
  /** Increment a counter in storage */
  increment(key: string, amount?: number): Promise<number>;
  
  /** Delete a value from storage */
  delete(key: string): Promise<void>;
  
  /** Clear all values from storage */
  clear(): Promise<void>;
}

// ==============================
// Error Classes
// ==============================

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitExceededError extends Error {
  /** Time until rate limit resets (ms) */
  retryAfterMs: number;
  
  /** Tool that was rate limited */
  toolName?: string;
  
  constructor(message: string, retryAfterMs: number, toolName?: string) {
    super(message);
    this.name = 'RateLimitExceededError';
    this.retryAfterMs = retryAfterMs;
    this.toolName = toolName;
  }
}

// ==============================
// Storage Adapters
// ==============================

/**
 * In-memory storage adapter
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, { value: any; expiry: number | null }> = new Map();
  
  async get(key: string): Promise<any> {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (item.expiry !== null && item.expiry < Date.now()) {
      this.storage.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    const expiry = ttlMs ? Date.now() + ttlMs : null;
    this.storage.set(key, { value, expiry });
  }
  
  async increment(key: string, amount = 1): Promise<number> {
    const currentValue = await this.get(key) || 0;
    const newValue = currentValue + amount;
    await this.set(key, newValue);
    return newValue;
  }
  
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/**
 * LocalStorage adapter (for browser environments)
 */
class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;
  
  constructor(prefix = 'rate-limit:') {
    this.prefix = prefix;
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  async get(key: string): Promise<any> {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    
    const fullKey = this.getFullKey(key);
    const item = localStorage.getItem(fullKey);
    
    if (!item) {
      return null;
    }
    
    try {
      const { value, expiry } = JSON.parse(item);
      
      // Check if item has expired
      if (expiry !== null && expiry < Date.now()) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return value;
    } catch (error) {
      console.error('Error parsing localStorage item:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const fullKey = this.getFullKey(key);
    const expiry = ttlMs ? Date.now() + ttlMs : null;
    
    try {
      localStorage.setItem(fullKey, JSON.stringify({ value, expiry }));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }
  
  async increment(key: string, amount = 1): Promise<number> {
    const currentValue = await this.get(key) || 0;
    const newValue = currentValue + amount;
    await this.set(key, newValue);
    return newValue;
  }
  
  async delete(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    localStorage.removeItem(this.getFullKey(key));
  }
  
  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    // Only clear items with our prefix
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// ==============================
// Rate Limiting Strategies
// ==============================

/**
 * Fixed window rate limiting strategy
 * Simplest approach that counts requests in fixed time periods
 */
async function fixedWindowStrategy(
  storage: StorageAdapter,
  key: string,
  maxCalls: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;
  
  // Get current count for this window
  const count = await storage.increment(windowKey, 1);
  
  // Set expiry for the window key
  await storage.set(windowKey, count, windowMs);
  
  // Check if rate limit is exceeded
  if (count > maxCalls) {
    // Calculate time until next window
    const nextWindowStart = Math.ceil(now / windowMs) * windowMs;
    const retryAfterMs = nextWindowStart - now;
    
    return { allowed: false, retryAfterMs };
  }
  
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Sliding window rate limiting strategy
 * More sophisticated approach that gradually expires old requests
 */
async function slidingWindowStrategy(
  storage: StorageAdapter,
  key: string,
  maxCalls: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const now = Date.now();
  
  // Current window key and previous window key
  const currentWindowKey = `${key}:${Math.floor(now / windowMs)}`;
  const prevWindowKey = `${key}:${Math.floor(now / windowMs) - 1}`;
  
  // Get counts for current and previous windows
  const currentCount = await storage.get(currentWindowKey) || 0;
  const prevCount = await storage.get(prevWindowKey) || 0;
  
  // Calculate the position within the current window (0 to 1)
  const windowPosition = (now % windowMs) / windowMs;
  
  // Calculate the weighted count using the sliding window formula
  // As we move through the window, we count less of the previous window
  const weightedCount = prevCount * (1 - windowPosition) + currentCount;
  
  // Check if rate limit is exceeded
  if (weightedCount >= maxCalls) {
    // Calculate time until enough previous requests expire
    const remainingRequests = weightedCount - maxCalls + 1;
    const timePerRequest = windowMs / prevCount;
    const retryAfterMs = Math.ceil(remainingRequests * timePerRequest);
    
    return { allowed: false, retryAfterMs: Math.min(retryAfterMs, windowMs) };
  }
  
  // Increment the current window count
  await storage.increment(currentWindowKey, 1);
  
  // Set expiry for both window keys
  await storage.set(currentWindowKey, currentCount + 1, windowMs * 2);
  await storage.set(prevWindowKey, prevCount, windowMs);
  
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Token bucket rate limiting strategy
 * Allows bursts of activity while maintaining a long-term rate limit
 */
async function tokenBucketStrategy(
  storage: StorageAdapter,
  key: string,
  maxCalls: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number; currentTokens: number }> {
  const now = Date.now();
  const bucketKey = `${key}:bucket`;
  
  // Get current bucket state
  const bucketState = await storage.get(bucketKey) || { tokens: maxCalls, lastRefill: now };
  
  // Calculate tokens to add based on time elapsed since last refill
  const timeElapsed = now - bucketState.lastRefill;
  const tokensToAdd = (timeElapsed / windowMs) * maxCalls;
  
  // Refill the bucket (up to max capacity)
  bucketState.tokens = Math.min(maxCalls, bucketState.tokens + tokensToAdd);
  bucketState.lastRefill = now;
  
  // Check if we have enough tokens
  if (bucketState.tokens < 1) {
    // Calculate time until next token is available
    const timePerToken = windowMs / maxCalls;
    const retryAfterMs = Math.ceil((1 - bucketState.tokens) * timePerToken);
    
    // Update bucket state in storage
    await storage.set(bucketKey, bucketState, windowMs * 2);
    
    return { 
      allowed: false, 
      retryAfterMs, 
      currentTokens: bucketState.tokens 
    };
  }
  
  // Consume a token
  bucketState.tokens -= 1;
  
  // Update bucket state in storage
  await storage.set(bucketKey, bucketState, windowMs * 2);
  
  return { 
    allowed: true, 
    retryAfterMs: 0, 
    currentTokens: bucketState.tokens 
  };
}

// ==============================
// Metrics
// ==============================

/**
 * Global metrics object
 */
const globalMetrics: RateLimiterMetrics = {
  totalCalls: 0,
  limitedCalls: 0,
  successfulCalls: 0,
  callsPerMinute: 0,
  peakCallsPerMinute: 0,
  lastResetTime: Date.now(),
  toolMetrics: {},
};

/**
 * Update rate limiter metrics
 */
function updateMetrics(toolName: string, limited: boolean): void {
  const now = Date.now();
  
  // Update global metrics
  globalMetrics.totalCalls += 1;
  
  if (limited) {
    globalMetrics.limitedCalls += 1;
  } else {
    globalMetrics.successfulCalls += 1;
  }
  
  // Calculate calls per minute
  const minutesSinceReset = (now - globalMetrics.lastResetTime) / 60000;
  if (minutesSinceReset > 0) {
    globalMetrics.callsPerMinute = globalMetrics.totalCalls / minutesSinceReset;
    
    // Update peak if current rate is higher
    if (globalMetrics.callsPerMinute > globalMetrics.peakCallsPerMinute) {
      globalMetrics.peakCallsPerMinute = globalMetrics.callsPerMinute;
    }
    
    // Reset metrics every hour to avoid skewed averages
    if (minutesSinceReset > 60) {
      globalMetrics.totalCalls = 0;
      globalMetrics.limitedCalls = 0;
      globalMetrics.successfulCalls = 0;
      globalMetrics.lastResetTime = now;
    }
  }
  
  // Update tool-specific metrics
  if (!globalMetrics.toolMetrics[toolName]) {
    globalMetrics.toolMetrics[toolName] = { calls: 0, limited: 0 };
  }
  
  globalMetrics.toolMetrics[toolName].calls += 1;
  
  if (limited) {
    globalMetrics.toolMetrics[toolName].limited += 1;
  }
}

/**
 * Get current rate limiter metrics
 */
export function getRateLimitMetrics(): RateLimiterMetrics {
  return { ...globalMetrics };
}

// ==============================
// Retry Logic
// ==============================

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  
  /** Base delay for exponential backoff (ms) */
  baseDelayMs?: number;
  
  /** Maximum delay between retries (ms) */
  maxDelayMs?: number;
  
  /** Jitter factor to add randomness to delays (0-1) */
  jitter?: number;
  
  /** Whether to retry on rate limit errors */
  retryOnRateLimit?: boolean;
}

/**
 * Default retry options
 */
const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: 0.3,
  retryOnRateLimit: true,
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param options Retry options
 * @returns Function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a rate limit error and we're only retrying those
      if (
        opts.retryOnRateLimit && 
        !(error instanceof RateLimitExceededError) &&
        error instanceof Error
      ) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt >= opts.maxRetries!) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        opts.maxDelayMs!,
        opts.baseDelayMs! * Math.pow(2, attempt)
      );
      
      // Add jitter to prevent thundering herd problem
      const jitterFactor = 1 - opts.jitter! + (Math.random() * opts.jitter! * 2);
      const delay = Math.floor(baseDelay * jitterFactor);
      
      // If it's a rate limit error, use its retry time if longer
      if (error instanceof RateLimitExceededError && error.retryAfterMs > delay) {
        await sleep(error.retryAfterMs);
      } else {
        await sleep(delay);
      }
    }
  }
  
  // This should never happen, but TypeScript requires a return
  throw lastError || new Error('Retry failed');
}

/**
 * Sleep for a specified duration
 * 
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==============================
// Rate Limiter Factory
// ==============================

/**
 * Create a rate limiter function
 * 
 * @param options Rate limiter options
 * @returns Rate limiter function
 */
export function createRateLimiter(options: RateLimiterOptions) {
  // Default options
  const opts: Required<RateLimiterOptions> = {
    maxCalls: options.maxCalls || env.RATE_LIMIT,
    windowMs: options.windowMs || env.RATE_LIMIT_WINDOW_MS,
    strategy: options.strategy || 'token-bucket',
    storage: options.storage || new MemoryStorageAdapter(),
    enableMetrics: options.enableMetrics !== undefined ? options.enableMetrics : true,
    throwOnLimit: options.throwOnLimit !== undefined ? options.throwOnLimit : true,
    errorMessage: options.errorMessage || 'Rate limit exceeded. Please try again later.',
  };
  
  // Return a function that wraps another function with rate limiting
  return function rateLimiter<T extends (...args: any[]) => any>(
    fn: T,
    toolName = 'default'
  ): RateLimitedFunction<T> {
    // Create a unique key for this tool
    const key = `rate-limit:${toolName}`;
    
    // Return the wrapped function
    return async function(...args: Parameters<T>): Promise<ReturnType<T>> {
      // Skip rate limiting if disabled globally
      if (!env.isFeatureEnabled('RATE_LIMITING')) {
        return fn(...args);
      }
      
      // Apply the appropriate rate limiting strategy
      let result: { allowed: boolean; retryAfterMs: number; currentTokens?: number };
      
      switch (opts.strategy) {
        case 'fixed-window':
          result = await fixedWindowStrategy(opts.storage, key, opts.maxCalls, opts.windowMs);
          break;
        case 'sliding-window':
          result = await slidingWindowStrategy(opts.storage, key, opts.maxCalls, opts.windowMs);
          break;
        case 'token-bucket':
          result = await tokenBucketStrategy(opts.storage, key, opts.maxCalls, opts.windowMs);
          break;
        default:
          result = await tokenBucketStrategy(opts.storage, key, opts.maxCalls, opts.windowMs);
      }
      
      // Update metrics if enabled
      if (opts.enableMetrics) {
        updateMetrics(toolName, !result.allowed);
        
        // Update token count if available
        if (result.currentTokens !== undefined) {
          globalMetrics.currentTokens = result.currentTokens;
        }
      }
      
      // If rate limited, either throw or log a warning
      if (!result.allowed) {
        if (opts.throwOnLimit) {
          throw new RateLimitExceededError(
            opts.errorMessage,
            result.retryAfterMs,
            toolName
          );
        } else {
          console.warn(
            `Rate limit exceeded for ${toolName}. ` +
            `Try again in ${Math.ceil(result.retryAfterMs / 1000)} seconds.`
          );
          
          // Return a rejected promise
          return Promise.reject(
            new RateLimitExceededError(
              opts.errorMessage,
              result.retryAfterMs,
              toolName
            )
          );
        }
      }
      
      // Call the original function
      return fn(...args);
    };
  };
}

// ==============================
// Tool Wrapper Factory
// ==============================

/**
 * Create a rate limiter that wraps all client tools
 * 
 * @param options Rate limiter options
 * @returns Function to wrap a tools object
 */
export function createToolRateLimiter(options?: Partial<RateLimiterOptions>) {
  // Create the base rate limiter
  const rateLimiter = createRateLimiter({
    maxCalls: options?.maxCalls || env.RATE_LIMIT,
    windowMs: options?.windowMs || env.RATE_LIMIT_WINDOW_MS,
    strategy: options?.strategy || 'token-bucket',
    storage: options?.storage || new MemoryStorageAdapter(),
    enableMetrics: options?.enableMetrics !== undefined ? options?.enableMetrics : true,
    throwOnLimit: options?.throwOnLimit !== undefined ? options?.throwOnLimit : true,
    errorMessage: options?.errorMessage || 'Rate limit exceeded. Please try again later.',
  });
  
  // Return a function that wraps an entire tools object
  return function wrapTools<T extends Record<string, (...args: any[]) => any>>(
    tools: T
  ): T {
    const wrappedTools = { ...tools };
    
    // Wrap each function in the tools object
    for (const [name, fn] of Object.entries(tools)) {
      if (typeof fn === 'function') {
        wrappedTools[name as keyof T] = rateLimiter(fn, name) as any;
      }
    }
    
    return wrappedTools;
  };
}

// ==============================
// Exports
// ==============================

/**
 * Default export for convenience
 */
export default {
  createRateLimiter,
  createToolRateLimiter,
  withRetry,
  getRateLimitMetrics,
  MemoryStorageAdapter,
  LocalStorageAdapter,
};
