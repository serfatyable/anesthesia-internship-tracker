import { NextRequest, NextResponse } from 'next/server';

/**
 * Compression middleware for API responses
 */
export function withCompression(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Add compression headers
    const acceptEncoding = req.headers.get('accept-encoding') || '';

    if (acceptEncoding.includes('gzip')) {
      response.headers.set('content-encoding', 'gzip');
      response.headers.set('vary', 'Accept-Encoding');
    }

    // Add cache headers for static data
    const url = new URL(req.url);
    if (
      url.pathname.startsWith('/api/procedures') ||
      url.pathname.startsWith('/api/requirements')
    ) {
      response.headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=600');
    } else if (url.pathname.startsWith('/api/progress')) {
      response.headers.set('cache-control', 'private, max-age=60, stale-while-revalidate=120');
    } else if (url.pathname.startsWith('/api/verify-queue')) {
      response.headers.set('cache-control', 'private, max-age=30, stale-while-revalidate=60');
    }

    return response;
  };
}

/**
 * Add performance headers to API responses
 */
export function addPerformanceHeaders(response: NextResponse): NextResponse {
  // Add performance headers
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-xss-protection', '1; mode=block');

  // Add timing headers
  response.headers.set('x-response-time', Date.now().toString());

  return response;
}
