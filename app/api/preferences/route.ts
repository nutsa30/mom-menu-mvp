import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validTimeZone } from '@/lib/market';

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const body = await req.json();
  const data: { locale?: string; units?: string; timeZone?: string } = {};
  if (body.locale === 'ka' || body.locale === 'en') data.locale = body.locale;
  if (body.units === 'metric' || body.units === 'us' || body.units === 'uk') data.units = body.units;
  if (validTimeZone(body.timeZone)) data.timeZone = body.timeZone;
  const session = await getSession();
  if (session) await prisma.user.update({ where: { id: session.id }, data });
  if (data.locale) (await cookies()).set('mommenu_locale', data.locale, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 365 * 86400 });
  if (data.units) (await cookies()).set('mommenu_units', data.units, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 365 * 86400 });
  if (data.timeZone) (await cookies()).set('mommenu_timezone', data.timeZone, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 365 * 86400 });
  return NextResponse.json({ ok: true });
}
