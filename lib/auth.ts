import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

const COOKIE = 'mom_menu_token';

export type SessionUser = { id: string; email: string; name: string; role: 'USER' | 'ADMIN' };

export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export function signToken(user: SessionUser) {
  return jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export async function setAuthCookie(user: SessionUser) {
  const token = signToken(user);
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export async function clearAuthCookie() { cookies().delete(COOKIE); }

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as SessionUser; } catch { return null; }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== 'ADMIN') redirect('/dashboard');
  return session;
}

export async function currentDbUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id }, include: { children: true } });
}
