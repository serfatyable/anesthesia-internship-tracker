/**
 * CSRF protection middleware
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

// Generate a secure CSRF token using Web Crypto API (Edge Runtime compatible)
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Get CSRF token from request
function getCSRFToken(request: NextRequest): string | null {
  // Try to get from header first
  const headerToken = request.headers.get(CSRF_HEADER);
  if (headerToken) {
    return headerToken;
  }

  // Try to get from form data
  const contentType = request.headers.get('content-type');
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    // This would need to be handled in the route handler
    // as we can't read the body here in middleware
    return null;
  }

  return null;
}

// Verify CSRF token
async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  const token = getCSRFToken(request);
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  if (!cookieToken) {
    return false;
  }

  // Simple string comparison for Edge Runtime compatibility
  // In production, consider using a more sophisticated approach
  return token === cookieToken;
}

// Set CSRF token in response
export function setCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken();

  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}

// CSRF protection middleware
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip CSRF protection for safe methods
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }

  // Skip CSRF protection for authentication and session routes
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/session') ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return null;
  }

  // Skip CSRF protection for static files and health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/errors')
  ) {
    return null;
  }

  // In development, be more lenient with CSRF protection
  if (process.env.NODE_ENV === 'development') {
    // Only enforce CSRF for specific sensitive routes in development
    if (
      pathname.startsWith('/api/cases') ||
      pathname.startsWith('/api/logs') ||
      pathname.startsWith('/api/verifications')
    ) {
      if (!(await verifyCSRFToken(request))) {
        console.warn('CSRF token mismatch in development - allowing request');
        return null; // Allow in development
      }
    }
    return null;
  }

  // Verify CSRF token for state-changing requests in production
  if (!(await verifyCSRFToken(request))) {
    return NextResponse.json(
      {
        error: 'CSRF token mismatch',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        code: 'CSRF_TOKEN_MISMATCH',
      },
      { status: 403 },
    );
  }

  return null;
}

// Get CSRF token for client-side use (Edge Runtime compatible)
export async function getCSRFTokenForClient(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

    if (!token) {
      throw new Error('CSRF token not found. Please refresh the page.');
    }

    return token;
  } catch (error) {
    // Fallback for Edge Runtime compatibility
    throw new Error('CSRF token not available in this context.');
  }
}

// Generate CSRF token endpoint
export async function generateCSRFTokenEndpoint(): Promise<NextResponse> {
  const token = generateCSRFToken();

  const response = NextResponse.json({ token });

  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}

// CSRF token validation for API routes
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  return await verifyCSRFToken(request);
}

// Helper to add CSRF token to forms
export async function addCSRFTokenToForm(formData: FormData): Promise<FormData> {
  const token = await getCSRFTokenForClient();
  formData.append('_csrf', token);
  return formData;
}

// Helper to add CSRF token to fetch requests
export async function addCSRFTokenToHeaders(headers: Headers): Promise<Headers> {
  const token = await getCSRFTokenForClient();
  headers.set(CSRF_HEADER, token);
  return headers;
}
