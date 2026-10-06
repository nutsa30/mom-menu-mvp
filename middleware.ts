import { verifiedPayload } from './lib/edge-token';
import { marketForCountry, localeFor } from './lib/market';
﻿import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('mom_menu_token')?.value;
  const { pathname } = req.nextUrl;
  const session = await verifiedPayload(token);

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/admin')) {
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  if ((pathname === '/login' || pathname === '/register' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // APIs and static assets must never be redirected or have their business inputs rewritten.
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/admin') && !/\.[a-z0-9]+$/i.test(pathname)) {
    const preview = await verifiedPayload(req.cookies.get('mommenu_admin_preview')?.value, 'mommenu-preview');
    const isPreview = preview && session?.role === 'ADMIN' && preview.sub === session.id;
    const preference = req.cookies.get('mommenu_locale')?.value;
    const requested = req.nextUrl.searchParams.get('lang');
    const country = process.env.NODE_ENV !== 'production' && process.env.DEV_COUNTRY
      ? process.env.DEV_COUNTRY : req.headers.get('x-vercel-ip-country');
    const locale = isPreview ? localeFor(preview.market === 'INTL' ? 'INTL' : 'GE')
      : requested === 'en' || requested === 'ka' ? requested
      : preference === 'en' || preference === 'ka' ? preference
      : session ? session.locale === 'en' ? 'en' : 'ka' : localeFor(marketForCountry(country));
    if (requested !== locale) {
      const url = req.nextUrl.clone();
      url.searchParams.set('lang', locale);
      const response = NextResponse.redirect(url);
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('Vary', 'Cookie, X-Vercel-IP-Country');
      return response;
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-mommenu-locale', locale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set('mommenu_locale', locale, { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 365 * 86400 });
    response.headers.set('Cache-Control', 'private, no-store');
    const presentationMarket = isPreview ? preview.market : session ? session.market === 'INTL' ? 'INTL' : 'GE' : marketForCountry(country);
    response.headers.set('X-Mommenu-Cache-Key', `${session?.id || 'public'}-${presentationMarket}-${locale}`);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|OneSignalSDKWorker.js).*)'],
};

