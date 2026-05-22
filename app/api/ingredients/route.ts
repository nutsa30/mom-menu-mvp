import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NUTRIENT_KEYS = [
  'calories','proteinGrams','carbsGrams','fatGrams','fiberGrams',
  'ironMg','calciumMg','zincMg','potassiumMg','magnesiumMg','phosphorusMg','sodiumMg',
  'vitaminAmcg','vitaminCmg','vitaminDmcg','vitaminEmg','vitaminKmcg',
  'vitaminB6mg','vitaminB12mcg','folateMcg','omega3Mg',
] as const;

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(ingredients);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nutrients: Record<string, number | null> = {};
    for (const k of NUTRIENT_KEYS) {
      nutrients[k] = body[k] ? Number(body[k]) : null;
    }
    const ingredient = await prisma.ingredient.create({
      data: {
        titleKa: body.titleKa,
        titleEn: body.titleEn,
        type: body.type ?? 'FRUIT',
        imageUrl: body.imageUrl || null,
        ageGroups: body.ageGroups ?? [],
        seasons: body.seasons ?? [],
        benefitsKa: body.benefitsKa ?? [],
        benefitsEn: body.benefitsEn ?? [],
        ...nutrients,
      },
    });
    return NextResponse.json(ingredient);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
