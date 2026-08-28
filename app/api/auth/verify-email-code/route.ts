import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { ensureReferralCode } from '@/lib/referral';
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

    // If this email already used a free trial on a previous (since-deleted) account,
    // start the new account already flagged so it can't farm another 7-day trial.
    const usedTrial = await prisma.usedTrialEmail.findUnique({ where: { email } });

    const user = await prisma.user.create({
      data: {
        name: pending.name, email, passwordHash: pending.passwordHash, emailVerified: true,
        bogTrialUsed: !!usedTrial,
      },
    });
    await prisma.pendingRegistration.delete({ where: { email } });
    // This is the real signup completion point (the User row is only created here, once
    // the emailed code is confirmed) — give every new user their permanent referral code
    // right away, same as the Google sign-in path.
    await ensureReferralCode(user.id);

    await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
    // Admin "new user registered" ping intentionally removed (per request): on the Resend
    // free plan every one of these counted against the shared 100/day sending limit, so a
    // handful of registrations could crowd out real user-facing emails (verification codes,
    // welcome emails) for the rest of the day. Only the emails users themselves need to
    // receive are sent from here now.
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
