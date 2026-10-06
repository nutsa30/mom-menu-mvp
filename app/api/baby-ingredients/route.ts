import { paidApiError } from '@/lib/api-access';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/baby-ingredients?childId=X
// Returns all ingredients with this child's status for each
export async function GET(req: NextRequest) {
  const accessError = await paidApiError(true);
  if (accessError) return accessError;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');

  if (childId && !await prisma.child.findFirst({ where: { id: childId, userId: session.id }, select: { id: true } })) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ingredients = await prisma.babyIngredient.findMany({
    orderBy: [{ category: 'asc' }, { minAgeMonths: 'asc' }, { nameKa: 'asc' }],
  });

  if (!childId) return NextResponse.json(ingredients);

  const statuses = await prisma.babyIngredientStatus.findMany({
    where: { childId },
  });

  const statusMap = Object.fromEntries(statuses.map(s => [s.ingredientId, s]));

  const result = ingredients.map(ing => ({
    ...ing,
    status: statusMap[ing.id] ?? null,
  }));

  return NextResponse.json(result);
}
