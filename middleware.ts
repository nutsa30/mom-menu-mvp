import { NextRequest, NextResponse } from 'next/server';

function decodePayload(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('mom_menu_token')?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/admin')) {
      const payload = decodePayload(token);
      if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  if ((pathname === '/login' || pathname === '/register' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register', '/signup'],
};
