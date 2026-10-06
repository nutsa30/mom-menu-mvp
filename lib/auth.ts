import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

const COOKIE = 'mom_menu_token';

export type SessionUser = { id: string; email: string; name: string; role: 'USER' | 'ADMIN'; locale?: 'ka' | 'en'; market?: 'GE' | 'INTL' };

export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');
  return jwt.sign(user, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}

export async function setAuthCookie(user: SessionUser) {
  const preferences = await prisma.user.findUnique({ where: { id: user.id }, select: { locale: true, market: true } });
  const locale = preferences?.locale === 'en' ? 'en' : 'ka';
  const token = signToken({ ...user, locale, market: preferences?.market === 'INTL' ? 'INTL' : 'GE' });
  (await cookies()).set('mommenu_locale', locale, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 365 * 86400 });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export async function clearAuthCookie() { (await cookies()).delete(COOKIE); }

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }) as SessionUser; } catch { return null; }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  const account = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } });
  if (account?.role !== 'ADMIN') redirect('/dashboard');
  return session;
}

export async function currentDbUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id }, include: { children: true } });
}
