import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/baby-ingredient-status — upsert status for an ingredient
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, ingredientId, tried, liked, disliked, ateWell, refused, allergic, comment } = await req.json();
  if (!childId || !ingredientId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const status = await prisma.babyIngredientStatus.upsert({
    where: { childId_ingredientId: { childId, ingredientId } },
    update: {
      ...(tried !== undefined && { tried }),
      ...(liked !== undefined && { liked }),
      ...(disliked !== undefined && { disliked }),
      ...(ateWell !== undefined && { ateWell }),
      ...(refused !== undefined && { refused }),
      ...(allergic !== undefined && { allergic }),
      ...(comment !== undefined && { comment }),
      ...(tried && !await prisma.babyIngredientStatus.findUnique({
        where: { childId_ingredientId: { childId, ingredientId } },
        select: { triedAt: true },
      }).then(s => s?.triedAt) && { triedAt: new Date() }),
    },
    create: {
      childId,
      ingredientId,
      tried: tried ?? false,
      liked: liked ?? null,
      disliked: disliked ?? null,
      ateWell: ateWell ?? null,
      refused: refused ?? null,
      allergic: allergic ?? false,
      comment: comment ?? null,
      triedAt: tried ? new Date() : null,
    },
  });

  return NextResponse.json(status);
}
