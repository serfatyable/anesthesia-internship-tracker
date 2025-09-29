import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { csrfProtection, setCSRFToken } from '@/lib/middleware/csrf';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF protection for state-changing requests
  const csrfResponse = await csrfProtection(req);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Get authentication token
  const token = await getToken({ req });

  // Set CSRF token for authenticated users
  let response = NextResponse.next();
  if (token?.id) {
    response = setCSRFToken(response);
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token?.id || !token?.role) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (
      !canAccessAdmin({ id: token.id as string, role: token.role as string })
    ) {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }

  // Protect tutor routes
  if (pathname.startsWith('/verify') || pathname.startsWith('/tutor')) {
    if (!token?.id || !token?.role) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;
    if (userRole !== 'TUTOR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }

  // Protect dashboard routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/logs') ||
    pathname.startsWith('/rotations')
  ) {
    if (!token?.id || !token?.role) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/verify/:path*',
    '/tutor/:path*',
    '/dashboard/:path*',
    '/logs/:path*',
    '/rotations/:path*',
    '/api/((?!auth|session|health|errors).)*',
  ],
};
