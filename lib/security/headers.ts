// lib/security/headers.ts

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
  'X-XSS-Protection': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export const securityHeaders: SecurityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.example.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export function createSecureResponse(
  body: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init);
  return addSecurityHeaders(response);
}

export function isSecureRequest(request: NextRequest): boolean {
  const protocol = request.headers.get('x-forwarded-proto') || 
                   request.nextUrl.protocol;
  return protocol === 'https';
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return request.ip || 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegram/i,
    /slackbot/i,
    /discordbot/i,
    /googlebot/i,
    /bingbot/i,
    /yandexbot/i,
    /baiduspider/i,
    /duckduckbot/i,
    /applebot/i,
    /ia_archiver/i,
    /archive\.org_bot/i,
    /wayback/i,
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

export function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = getUserAgent(request);
  const ip = getClientIP(request);
  
  // Check for common attack patterns in URL
  const url = request.nextUrl.pathname + request.nextUrl.search;
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /vbscript:/i,  // VBScript injection
    /onload=/i,  // Event handler injection
    /onerror=/i,  // Event handler injection
    /eval\(/i,  // Code injection
    /expression\(/i,  // CSS expression injection
    /url\(/i,  // CSS URL injection
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    return true;
  }
  
  // Check for suspicious user agents
  if (isBot(userAgent)) {
    return false; // Bots are not necessarily suspicious
  }
  
  // Check for empty or very short user agents
  if (userAgent.length < 10) {
    return true;
  }
  
  // Check for common attack tools
  const attackTools = [
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
  ];
  
  if (attackTools.some(tool => tool.test(userAgent))) {
    return true;
  }
  
  return false;
}
