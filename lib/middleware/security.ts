/**
 * Enhanced security middleware
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // XSS protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Control browser features
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; '),

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',

  // Cache control for sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// API-specific security headers
const API_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'production'
      ? process.env.NEXTAUTH_URL || 'https://your-domain.com'
      : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Security event types
type SecurityEvent =
  | 'suspicious_request'
  | 'invalid_origin'
  | 'rate_limit_exceeded'
  | 'csrf_token_mismatch'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'path_traversal_attempt'
  | 'unauthorized_access';

// Security event handler
function handleSecurityEvent(
  event: SecurityEvent,
  request: NextRequest,
  details?: Record<string, unknown>,
): void {
  const context = {
    operation: 'security_event',
    event,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent'),
    path: request.nextUrl.pathname,
    method: request.method,
    referer: request.headers.get('referer'),
    ...details,
  };

  logger.securityEvent(`Security event: ${event}`, context);
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';

  return 'unknown';
}

// Validate origin
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Allow requests without origin (e.g., direct API calls)

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXTAUTH_URL,
  ].filter(Boolean);

  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}

// Check for suspicious patterns
function isSuspiciousRequest(request: NextRequest): boolean {
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS
    /union\s+select/i, // SQL injection
    /drop\s+table/i, // SQL injection
    /javascript:/i, // XSS
    /vbscript:/i, // XSS
    /onload=/i, // XSS
    /onerror=/i, // XSS
  ];

  // Check URL path
  if (suspiciousPatterns.some((pattern) => pattern.test(path))) {
    return true;
  }

  // Check query parameters
  const queryString = request.nextUrl.search;
  if (suspiciousPatterns.some((pattern) => pattern.test(queryString))) {
    return true;
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = [/sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zap/i, /burp/i];

  if (suspiciousUserAgents.some((pattern) => pattern.test(userAgent))) {
    return true;
  }

  return false;
}

// Apply security headers
function applySecurityHeaders(response: NextResponse, isApiRoute: boolean = false): NextResponse {
  const headers = isApiRoute ? API_SECURITY_HEADERS : SECURITY_HEADERS;

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Apply CORS headers
function applyCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Main security middleware
export function securityMiddleware(request: NextRequest): NextResponse | null {
  const { pathname, method } = request.nextUrl;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    applyCORSHeaders(response);
    return response;
  }

  // Check for suspicious requests
  if (isSuspiciousRequest(request)) {
    handleSecurityEvent('suspicious_request', request, {
      reason: 'Suspicious patterns detected',
    });

    return new NextResponse('Forbidden', { status: 403 });
  }

  // Validate origin for API routes
  if (pathname.startsWith('/api/') && !isValidOrigin(request)) {
    handleSecurityEvent('invalid_origin', request, {
      origin: request.headers.get('origin'),
    });

    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check for common attack vectors
  if (pathname.includes('..') || pathname.includes('//')) {
    handleSecurityEvent('path_traversal_attempt', request);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check for SQL injection patterns in query parameters
  const queryString = request.nextUrl.search;
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /alter\s+table/i,
    /exec\s*\(/i,
    /execute\s*\(/i,
  ];

  if (sqlPatterns.some((pattern) => pattern.test(queryString))) {
    handleSecurityEvent('sql_injection_attempt', request, {
      queryString,
    });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
  ];

  if (xssPatterns.some((pattern) => pattern.test(queryString))) {
    handleSecurityEvent('xss_attempt', request, {
      queryString,
    });
    return new NextResponse('Forbidden', { status: 403 });
  }

  return null; // No security issues detected
}

// Enhanced response wrapper
export function withSecurityHeaders<T extends (...args: any[]) => any>(
  handler: T,
  isApiRoute: boolean = false,
): T {
  return ((...args: Parameters<T>) => {
    const result = handler(...args);

    if (result instanceof Promise) {
      return result.then((response: NextResponse) => {
        if (response instanceof NextResponse) {
          return applySecurityHeaders(response, isApiRoute);
        }
        return response;
      });
    }

    if (result instanceof NextResponse) {
      return applySecurityHeaders(result, isApiRoute);
    }

    return result;
  }) as T;
}

// Request sanitization
export function sanitizeRequest(request: NextRequest): NextRequest {
  // This would sanitize the request object
  // In a real implementation, you might want to create a sanitized copy
  return request;
}

// Security monitoring
export function monitorSecurityMetrics(request: NextRequest, response: NextResponse): void {
  const duration = performance.now();
  const statusCode = response.status;

  // Record security metrics
  if (statusCode >= 400) {
    logger.warn('Security-related response', {
      operation: 'security_response',
      statusCode,
      path: request.nextUrl.pathname,
      method: request.method,
      duration,
    });
  }
}

// Export security utilities
export {
  getClientIP,
  isValidOrigin,
  isSuspiciousRequest,
  applySecurityHeaders,
  applyCORSHeaders,
  handleSecurityEvent,
};
