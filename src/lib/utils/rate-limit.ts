// Rate Limiting Utility for API Protection
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Create a cache to store rate limit data
const cache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum number of keys to store
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (identifier: string): RateLimitResult => {
      const now = Date.now();
      const key = `rate_limit:${identifier}`;
      const existing = cache.get(key);

      // If no existing entry or the reset time has passed, create new entry
      if (!existing || now >= existing.resetTime) {
        const resetTime = now + options.interval;
        cache.set(key, { count: 1, resetTime });
        
        return {
          success: true,
          limit: options.uniqueTokenPerInterval,
          remaining: options.uniqueTokenPerInterval - 1,
          reset: resetTime,
        };
      }

      // Check if limit is exceeded
      if (existing.count >= options.uniqueTokenPerInterval) {
        return {
          success: false,
          limit: options.uniqueTokenPerInterval,
          remaining: 0,
          reset: existing.resetTime,
        };
      }

      // Increment count
      existing.count += 1;
      cache.set(key, existing);

      return {
        success: true,
        limit: options.uniqueTokenPerInterval,
        remaining: options.uniqueTokenPerInterval - existing.count,
        reset: existing.resetTime,
      };
    },
  };
}