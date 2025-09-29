// lib/security/index.ts

export { securityHeaders, addSecurityHeaders, createSecureResponse, isSecureRequest, getClientIP, getUserAgent, isBot, isSuspiciousRequest } from './headers';
export { rateLimiters, withRateLimit, createRateLimitResponse, RateLimiter } from './rate-limiting';
export { commonSchemas, sanitizers, validateInput, sanitizeInput, securityValidators, validateSecurity } from './validation';
export { encryptionService, cryptoUtils, EncryptionService } from './encryption';
export { securityMiddleware, securityUtils, SecurityMiddleware } from './middleware';

// Re-export types
export type { SecurityHeaders } from './headers';
export type { RateLimitConfig, RateLimitStore } from './rate-limiting';
export type { EncryptionConfig } from './encryption';
export type { SecurityConfig } from './middleware';

// Security configuration
export const securityConfig = {
  // Rate limiting configuration
  rateLimiting: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    },
    emailVerification: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
    },
  },

  // Security headers configuration
  headers: {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.example.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true,
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      interestCohort: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
    },
  },

  // Encryption configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 16,  // 128 bits
    saltLength: 32, // 256 bits
    iterations: 100000, // PBKDF2 iterations
  },

  // Validation configuration
  validation: {
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 10,
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // Monitoring configuration
  monitoring: {
    enableSecurityLogging: true,
    enableThreatDetection: true,
    enablePerformanceMonitoring: true,
    logLevel: 'info',
  },
};

// Security utilities
export const security = {
  /**
   * Initialize security middleware
   */
  init: (config?: Partial<typeof securityConfig>) => {
    // Merge with default config
    const mergedConfig = { ...securityConfig, ...config };
    
    // Initialize rate limiters with new config
    // This would be done in the actual implementation
    
    return mergedConfig;
  },

  /**
   * Check if security is properly configured
   */
  isConfigured: (): boolean => {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL',
    ];

    return requiredEnvVars.every(envVar => process.env[envVar]);
  },

  /**
   * Get security status
   */
  getStatus: () => {
    return {
      configured: security.isConfigured(),
      rateLimiting: {
        enabled: true,
        limiters: Object.keys(securityConfig.rateLimiting),
      },
      headers: {
        enabled: true,
        policies: Object.keys(securityConfig.headers),
      },
      encryption: {
        enabled: true,
        algorithm: securityConfig.encryption.algorithm,
      },
      validation: {
        enabled: true,
        maxStringLength: securityConfig.validation.maxStringLength,
      },
      monitoring: {
        enabled: securityConfig.monitoring.enableSecurityLogging,
        threatDetection: securityConfig.monitoring.enableThreatDetection,
      },
    };
  },

  /**
   * Validate security configuration
   */
  validateConfig: (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check rate limiting configuration
    Object.entries(securityConfig.rateLimiting).forEach(([name, config]) => {
      if (config.maxRequests <= 0) {
        errors.push(`Rate limiter ${name}: maxRequests must be positive`);
      }
      if (config.windowMs <= 0) {
        errors.push(`Rate limiter ${name}: windowMs must be positive`);
      }
    });

    // Check encryption configuration
    if (securityConfig.encryption.keyLength < 16) {
      errors.push('Encryption key length must be at least 16 bytes');
    }
    if (securityConfig.encryption.ivLength < 12) {
      errors.push('Encryption IV length must be at least 12 bytes');
    }
    if (securityConfig.encryption.iterations < 10000) {
      errors.push('Encryption iterations must be at least 10000');
    }

    // Check validation configuration
    if (securityConfig.validation.maxStringLength <= 0) {
      errors.push('Max string length must be positive');
    }
    if (securityConfig.validation.maxArrayLength <= 0) {
      errors.push('Max array length must be positive');
    }
    if (securityConfig.validation.maxObjectDepth <= 0) {
      errors.push('Max object depth must be positive');
    }
    if (securityConfig.validation.maxFileSize <= 0) {
      errors.push('Max file size must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
