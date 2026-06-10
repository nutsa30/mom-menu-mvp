import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/baby-ingredient-status/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowed = ['tried', 'liked', 'disliked', 'ateWell', 'refused', 'allergic', 'comment'];
  const data: Record<string, any> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.tried && !data.triedAt) data.triedAt = new Date();

  const updated = await prisma.babyIngredientStatus.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}
