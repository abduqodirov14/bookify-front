import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/director') ||
    pathname.startsWith('/librarian');

  if (isProtected) {
    const token =
      request.cookies.get('bookify_token')?.value ||
      request.cookies.get('fianny_token')?.value;

    if (!token) {
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/director/:path*',
    '/librarian/:path*',
  ],
};
