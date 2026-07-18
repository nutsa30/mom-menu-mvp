import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    console.error('[google/callback] no code in request');
    return NextResponse.redirect(`${BASE}/login?error=google`);
  }

  const redirectUri = `${BASE}/api/auth/google/callback`;
  console.log('[google/callback] BASE:', BASE, 'redirect_uri:', redirectUri);

  // Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error('[google/callback] token exchange failed:', tokenRes.status, err);
    return NextResponse.redirect(`${BASE}/login?error=google`);
  }

  const { access_token } = await tokenRes.json();

  // Get user profile from Google
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    console.error('[google/callback] profile fetch failed:', profileRes.status);
    return NextResponse.redirect(`${BASE}/login?error=google`);
  }

  const { id: googleId, email, name } = await profileRes.json();
  if (!email) {
    console.error('[google/callback] no email in profile');
    return NextResponse.redirect(`${BASE}/login?error=google`);
  }

  // Find existing user by googleId or email
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        googleId,
        emailVerified: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId },
    });
  }

  if (user.isBlocked) return NextResponse.redirect(`${BASE}/login?error=blocked`);

  await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });

  return NextResponse.redirect(`${BASE}/dashboard`);
}
