import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/baby-meal-suggestions — all suggestions with their ingredients
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const suggestions = await prisma.babyMealSuggestion.findMany({
    include: {
      ingredientLinks: { include: { ingredient: true } },
    },
    orderBy: [{ minAgeMonths: 'asc' }, { titleKa: 'asc' }],
  });

  return NextResponse.json(suggestions);
}
