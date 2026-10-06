import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/baby-ingredient-status/[id]
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.babyIngredientStatus.findFirst({
    where: { id: params.id, child: { userId: session.id } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const allowed = ['tried', 'liked', 'disliked', 'ateWell', 'refused', 'allergic', 'comment'];
  const data: Record<string, any> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.liked === true) data.disliked = false;
  else if (body.disliked === true) data.liked = false;
  if (body.tried && !existing.triedAt) data.triedAt = new Date();

  const updated = await prisma.babyIngredientStatus.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}
