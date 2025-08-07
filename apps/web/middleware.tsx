import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/middleware/rate_limit';
import { authenticationIgnore } from '@/app/src/constants';

export const config = {
  matcher: ['/api/:path*/edge/:slug*', '/api/:path*/node/:slug*'],
};

export async function middleware(request: NextRequest) {
  const endpoint = request.nextUrl.pathname;

  // Handle 0.0.0.0 redirect FIRST
  if (request.headers.get('host')?.startsWith('0.0.0.0')) {
    const url = request.nextUrl.clone();
    url.hostname = 'localhost';
    return NextResponse.redirect(url);
  }

  // Rate limit
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Extract slug from URL path
  const pathSegments = endpoint.split('/').filter(Boolean);
  const slug = pathSegments[pathSegments.length - 1];

  // Auth check unless in ignore list
  if (!authenticationIgnore.includes(slug)) {
    const { verifyJWT } = await import('@/app/helpers/verifyJWT');
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.substring(7).trim();

    const jwtVerify = await verifyJWT(token);
    if (!jwtVerify) {
      console.warn(slug, 'not authenticated');
      return new NextResponse(
        JSON.stringify({
          status: false,
          code: 'not-authenticated',
          msg: 'Not Authenticated',
          data: {},
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  // Build x-url headers
  const host = request.headers.get('host');
  const part = request.nextUrl.pathname;
  const searchParams = request.nextUrl.search;
  const plateform = request.nextUrl.searchParams.get('plateform');

  const protocol =
    (host &&
      (host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.includes('172.20.10.3') ||
        host.includes('local'))) ||
    process.env.NODE_ENV === 'development'
      ? 'http://'
      : 'https://';

  let url = `${protocol}${host}${part}${searchParams}`;
  if (!host || !part) url = request.url;

  const response = NextResponse.next();
  response.headers.set('x-url', url);
  response.headers.set('plateform', plateform ?? 'web');

  return response;
}
