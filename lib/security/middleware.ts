// lib/security/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSecurityHeaders,
  isSecureRequest,
  getClientIP,
  getUserAgent,
  isSuspiciousRequest,
} from './headers';
import { rateLimiters } from './rate-limiting';
import { validateSecurity, sanitizeInput } from './validation';
import { monitoring } from '@/lib/monitoring';

export interface SecurityConfig {
  enableRateLimiting: boolean;
  enableSecurityHeaders: boolean;
  enableRequestValidation: boolean;
  enableSuspiciousRequestDetection: boolean;
  enableMonitoring: boolean;
  trustedProxies: string[];
  allowedOrigins: string[];
  blockedIPs: string[];
  blockedUserAgents: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  enableRateLimiting: true,
  enableSecurityHeaders: true,
  enableRequestValidation: true,
  enableSuspiciousRequestDetection: true,
  enableMonitoring: true,
  trustedProxies: [],
  allowedOrigins: [],
  blockedIPs: [],
  blockedUserAgents: [],
};

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
  }

  /**
   * Main security middleware function
   */
  async handleRequest(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // 1. Check if request is secure
      if (!isSecureRequest(request)) {
        return this.createSecurityResponse('HTTPS required', 426);
      }

      // 2. Get client information
      const clientIP = getClientIP(request);
      const userAgent = getUserAgent(request);

      // 3. Check for blocked IPs
      if (this.config.blockedIPs.includes(clientIP)) {
        return this.createSecurityResponse('Access denied', 403);
      }

      // 4. Check for blocked user agents
      if (
        this.config.blockedUserAgents.some(pattern =>
          new RegExp(pattern, 'i').test(userAgent)
        )
      ) {
        return this.createSecurityResponse('Access denied', 403);
      }

      // 5. Check for suspicious requests
      if (
        this.config.enableSuspiciousRequestDetection &&
        isSuspiciousRequest(request)
      ) {
        // Log suspicious request
        if (this.config.enableMonitoring) {
          monitoring.trackError(new Error('Suspicious request detected'), {
            clientIP,
            userAgent,
            url: request.url,
            method: request.method,
          });
        }

        return this.createSecurityResponse('Suspicious request detected', 400);
      }

      // 6. Validate request data
      if (this.config.enableRequestValidation) {
        const validationResult = await this.validateRequest(request);
        if (!validationResult.isValid) {
          return this.createSecurityResponse('Invalid request data', 400);
        }
      }

      // 7. Apply rate limiting
      if (this.config.enableRateLimiting) {
        const rateLimitResult = this.applyRateLimiting(request);
        if (!rateLimitResult.allowed) {
          return this.createSecurityResponse('Rate limit exceeded', 429);
        }
      }

      // 8. Process request
      const response = await handler(request);

      // 9. Add security headers
      if (this.config.enableSecurityHeaders) {
        addSecurityHeaders(response);
      }

      // 10. Log successful request
      if (this.config.enableMonitoring) {
        monitoring.trackAPICall(
          request.nextUrl.pathname,
          request.method,
          response.status,
          performance.now()
        );
      }

      return response;
    } catch (error) {
      // Log error
      if (this.config.enableMonitoring) {
        monitoring.trackError(
          error instanceof Error ? error : new Error('Unknown error'),
          {
            clientIP: getClientIP(request),
            userAgent: getUserAgent(request),
            url: request.url,
            method: request.method,
          }
        );
      }

      return this.createSecurityResponse('Internal server error', 500);
    }
  }

  /**
   * Validate request data
   */
  private async validateRequest(
    request: NextRequest
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    // const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    try {
      // Check URL for security threats
      const url = request.nextUrl.pathname + request.nextUrl.search;
      const securityCheck = validateSecurity(url);
      if (!securityCheck.isSafe) {
        errors.push(
          `Security threat detected: ${securityCheck.threats.join(', ')}`
        );
      }

      // Check user agent for security threats
      const userAgentCheck = validateSecurity(userAgent);
      if (!userAgentCheck.isSafe) {
        errors.push(
          `Suspicious user agent: ${userAgentCheck.threats.join(', ')}`
        );
      }

      // Check request body if it exists
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          const body = await request.text();
          if (body) {
            const bodyCheck = validateSecurity(body);
            if (!bodyCheck.isSafe) {
              errors.push(
                `Security threat in request body: ${bodyCheck.threats.join(', ')}`
              );
            }
          }
        } catch (error) {
          // If we can't read the body, it might be a security issue
          errors.push('Unable to read request body');
        }
      }

      // Check for common attack patterns in headers
      const suspiciousHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-remote-addr',
        'x-originating-ip',
        'x-remote-ip',
        'x-client-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
      ];

      for (const header of suspiciousHeaders) {
        const value = request.headers.get(header);
        if (value) {
          const headerCheck = validateSecurity(value);
          if (!headerCheck.isSafe) {
            errors.push(
              `Suspicious header ${header}: ${headerCheck.threats.join(', ')}`
            );
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Request validation failed'],
      };
    }
  }

  /**
   * Apply rate limiting
   */
  private applyRateLimiting(request: NextRequest): {
    allowed: boolean;
    remaining: number;
  } {
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    // Choose appropriate rate limiter based on endpoint
    let limiter = rateLimiters.api;

    if (pathname.startsWith('/api/auth/')) {
      limiter = rateLimiters.auth;
    } else if (pathname.startsWith('/api/upload/')) {
      limiter = rateLimiters.upload;
    } else if (pathname.includes('password-reset')) {
      limiter = rateLimiters.passwordReset;
    } else if (pathname.includes('email-verification')) {
      limiter = rateLimiters.emailVerification;
    }

    // Create a mock request object for rate limiting
    const mockReq = {
      ip: getClientIP(request),
      method,
      url: request.url,
    };

    const result = limiter.isAllowed(mockReq);

    if (result.allowed) {
      limiter.recordRequest(mockReq, true);
    }

    return result;
  }

  /**
   * Create security response
   */
  private createSecurityResponse(
    message: string,
    status: number
  ): NextResponse {
    const response = NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
        status,
      },
      { status }
    );

    if (this.config.enableSecurityHeaders) {
      addSecurityHeaders(response);
    }

    return response;
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware();

// Export utility functions
export const securityUtils = {
  /**
   * Create secure response
   */
  createSecureResponse: (body: any, init?: ResponseInit): NextResponse => {
    const response = NextResponse.json(body, init);
    return addSecurityHeaders(response);
  },

  /**
   * Check if request is from trusted source
   */
  isTrustedSource: (request: NextRequest, trustedIPs: string[]): boolean => {
    const clientIP = getClientIP(request);
    return trustedIPs.includes(clientIP);
  },

  /**
   * Sanitize request data
   */
  sanitizeRequestData: (data: any): any => {
    return sanitizeInput(data);
  },

  /**
   * Validate and sanitize input
   */
  validateAndSanitize: (
    input: string
  ): { isValid: boolean; sanitized: string; threats: string[] } => {
    const securityCheck = validateSecurity(input);
    const sanitized = sanitizeInput(input);

    return {
      isValid: securityCheck.isSafe,
      sanitized,
      threats: securityCheck.threats,
    };
  },
};
