import { prisma } from '@/lib/prisma';
import { getSession, verifyPassword } from '@/lib/auth';
import { sendEmailChangeConfirmation } from '@/lib/email';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { newEmail, currentPassword } = await req.json();
  if (!newEmail || !currentPassword)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const normalizedEmail = newEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail))
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'wrong_password' }, { status: 400 });

  if (normalizedEmail === user.email)
    return NextResponse.json({ error: 'same_email' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 400 });

  // Don't switch the login email yet — send a confirmation link to the NEW
  // address first, since a typo here would otherwise lock the user out with
  // no way to reach an email address they don't actually control.
  const token = crypto.randomUUID();
  await prisma.user.update({
    where: { id: session.id },
    data: { pendingEmail: normalizedEmail, pendingEmailToken: token },
  });

  await sendEmailChangeConfirmation(normalizedEmail, user.name, token);

  return NextResponse.json({ success: true, pending: true });
}
