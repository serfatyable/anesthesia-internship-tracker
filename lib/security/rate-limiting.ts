// lib/security/rate-limiting.ts

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => req.ip || 'unknown',
      ...config,
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  isAllowed(req: any): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.config.keyGenerator!(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up old entries
    if (this.store[key] && this.store[key].resetTime < windowStart) {
      delete this.store[key];
    }

    // Initialize or get current entry
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const entry = this.store[key];
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    if (entry.count >= this.config.maxRequests) {
      if (this.config.onLimitReached) {
        this.config.onLimitReached(req, null);
      }
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  recordRequest(req: any, success: boolean = true): void {
    const key = this.config.keyGenerator!(req);
    
    if (!this.store[key]) {
      return;
    }

    // Skip recording based on config
    if (success && this.config.skipSuccessfulRequests) {
      return;
    }
    
    if (!success && this.config.skipFailedRequests) {
      return;
    }

    this.store[key].count++;
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < windowStart) {
        delete this.store[key];
      }
    });
  }

  getStats(): { totalKeys: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
    return {
      totalKeys: Object.keys(this.store).length,
      entries: Object.entries(this.store).map(([key, data]) => ({
        key,
        count: data.count,
        resetTime: data.resetTime,
      })),
    };
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    keyGenerator: (req) => req.ip || 'unknown',
  }),

  // Strict rate limiting for auth endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => req.ip || 'unknown',
  }),

  // Rate limiting for file uploads
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => req.ip || 'unknown',
  }),

  // Rate limiting for password reset
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req) => req.ip || 'unknown',
  }),

  // Rate limiting for email verification
  emailVerification: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (req) => req.ip || 'unknown',
  }),
};

export function withRateLimit(
  limiter: RateLimiter,
  options: {
    skipIf?: (req: any) => boolean;
    onLimitReached?: (req: any, res: any) => void;
  } = {}
) {
  return (req: any, res: any, next: any) => {
    // Skip rate limiting if condition is met
    if (options.skipIf && options.skipIf(req)) {
      return next();
    }

    const result = limiter.isAllowed(req);

    if (!result.allowed) {
      if (options.onLimitReached) {
        options.onLimitReached(req, res);
      }
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    // Record the request
    limiter.recordRequest(req, true);

    next();
  };
}

export function createRateLimitResponse(
  message: string = 'Too Many Requests',
  retryAfter: number = 60
) {
  return {
    status: 429,
    headers: {
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': '0',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
    },
    body: {
      error: 'Too Many Requests',
      message,
      retryAfter,
    },
  };
}

export { RateLimiter, type RateLimitConfig, type RateLimitStore };
