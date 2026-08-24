import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'invalid_code' }, { status: 400 });

    const tokenHash = crypto.createHash('sha256').update(user.id + ':' + code).digest('hex');
    const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.userId !== user.id) return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    if (record.usedAt) return NextResponse.json({ error: 'token_used' }, { status: 400 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: 'token_expired' }, { status: 400 });

    await prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });

    if (user.isBlocked) return NextResponse.json({ error: 'blocked' }, { status: 403 });

    await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
