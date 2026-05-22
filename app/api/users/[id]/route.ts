import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Regular user can only update their own name / email
  if (session.id === params.id) {
    // Check email uniqueness if provided
    if (body.email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'email_taken' }, { status: 400 });
      }
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
      },
      select: { id: true, name: true, email: true, role: true, isBlocked: true, subscriptionStatus: true },
    });
    return NextResponse.json(user);
  }

  // Admin-only: block/role changes on other users
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.isBlocked !== undefined && { isBlocked: body.isBlocked }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.subscriptionStatus !== undefined && {
        subscriptionStatus: body.subscriptionStatus,
        isGifted: body.isGifted ?? false,
        subscriptionStartedAt: body.subscriptionStatus !== 'FREE' ? new Date() : null,
        subscriptionCanceledAt: body.subscriptionStatus === 'FREE' ? new Date() : null,
      }),
    },
    select: { id: true, name: true, email: true, role: true, isBlocked: true, subscriptionStatus: true },
  });
  return NextResponse.json(user);
}
