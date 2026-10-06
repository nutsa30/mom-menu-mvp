import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PREVIEW_COOKIE } from '@/lib/experience';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, role: true } }) : null;
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const { market } = await req.json();
  if (market === 'AUTO') {
    (await cookies()).delete(PREVIEW_COOKIE);
    (await cookies()).delete('mommenu_locale');
  } else if ((market === 'GE' || market === 'INTL') && process.env.JWT_SECRET) {
    const token = jwt.sign({ market }, process.env.JWT_SECRET, { algorithm: 'HS256', audience: 'mommenu-preview', subject: user.id, expiresIn: '8h' });
    (await cookies()).set(PREVIEW_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
    (await cookies()).set('mommenu_locale', market === 'INTL' ? 'en' : 'ka', { sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' });
  } else return NextResponse.json({ error: 'Invalid preview mode' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
