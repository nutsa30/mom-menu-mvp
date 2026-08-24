import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase().trim();
    const code = String(body.code || '');
    if (!email || !code) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending) return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    if (pending.expiresAt < new Date()) return NextResponse.json({ error: 'token_expired' }, { status: 400 });

    const codeHash = crypto.createHash('sha256').update(email + ':' + code).digest('hex');
    if (codeHash !== pending.codeHash) return NextResponse.json({ error: 'invalid_code' }, { status: 400 });

    // Someone could have taken this email in the meantime (e.g. via Google sign-up).
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.pendingRegistration.delete({ where: { email } });
      return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name: pending.name, email, passwordHash: pending.passwordHash, emailVerified: true },
    });
    await prisma.pendingRegistration.delete({ where: { email } });

    await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
