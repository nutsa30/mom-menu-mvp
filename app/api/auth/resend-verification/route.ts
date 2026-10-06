import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email: rawEmail } = await req.json();
  if (!rawEmail) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const email = String(rawEmail).toLowerCase();

  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending) return NextResponse.json({ ok: true }); // silent — nothing pending for this email

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = crypto.createHash('sha256').update(email + ':' + code).digest('hex');
  await prisma.pendingRegistration.update({
    where: { email },
    data: { codeHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  try {
    await sendVerificationEmail(pending.email, pending.name, code);
  } catch (error) {
    // A failed delivery must not invalidate a code from an earlier delivered email.
    // Compare the new hash so a concurrent successful resend is not overwritten.
    await prisma.pendingRegistration.updateMany({
      where: { email, codeHash },
      data: { codeHash: pending.codeHash, expiresAt: pending.expiresAt },
    });
    console.error('Verification email resend failed', error instanceof Error ? error.message : 'Unknown provider error');
    return NextResponse.json({ error: 'email_send_failed' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
