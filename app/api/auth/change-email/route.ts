import { prisma } from '@/lib/prisma';
import { getSession, verifyPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { newEmail, currentPassword } = await req.json();
  if (!newEmail || !currentPassword)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail))
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'wrong_password' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 400 });

  await prisma.user.update({ where: { id: session.id }, data: { email: newEmail } });

  return NextResponse.json({ success: true });
}
