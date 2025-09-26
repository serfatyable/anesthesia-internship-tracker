import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // protect /admin
  if (pathname.startsWith('/admin')) {
    if (!token?.role || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
