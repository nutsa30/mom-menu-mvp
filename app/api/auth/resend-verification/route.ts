import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.emailVerified) return NextResponse.json({ ok: true }); // silent

  const token = crypto.randomUUID();
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: token } });

  try { await sendVerificationEmail(user.email, user.name, token); } catch {}

  return NextResponse.json({ ok: true });
}
