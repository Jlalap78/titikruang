import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/diskusi')) {
    const session = req.cookies.get('session')?.value;
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/diskusi/:path*'] };