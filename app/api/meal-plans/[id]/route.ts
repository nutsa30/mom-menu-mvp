import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

async function adminGuard() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await req.json();
  const plan = await prisma.mealPlan.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.titleKa && { titleKa: body.titleKa }),
      ...(body.titleEn && { titleEn: body.titleEn }),
    },
  });
  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard();
  if (guard) return guard;

  await prisma.mealPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
