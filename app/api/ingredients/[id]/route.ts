import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NUTRIENT_KEYS = [
  'calories','proteinGrams','carbsGrams','fatGrams','fiberGrams',
  'ironMg','calciumMg','zincMg','potassiumMg','magnesiumMg','phosphorusMg','sodiumMg',
  'vitaminAmcg','vitaminCmg','vitaminDmcg','vitaminEmg','vitaminKmcg',
  'vitaminB6mg','vitaminB12mcg','folateMcg','omega3Mg',
] as const;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!ingredient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(ingredient);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const n = (v: any) => (v != null && v !== '' ? Number(v) : null);
    const ingredient = await prisma.ingredient.update({
      where: { id: params.id },
      data: {
        titleKa: body.titleKa,
        titleEn: body.titleEn,
        type: body.type,
        imageUrl: body.imageUrl || null,
        ageGroups: { set: body.ageGroups ?? [] },
        seasons: { set: body.seasons ?? [] },
        benefitsKa: { set: body.benefitsKa ?? [] },
        benefitsEn: { set: body.benefitsEn ?? [] },
        calories:      body.calories      ? Math.round(Number(body.calories)) : null,
        proteinGrams:  n(body.proteinGrams),
        carbsGrams:    n(body.carbsGrams),
        fatGrams:      n(body.fatGrams),
        fiberGrams:    n(body.fiberGrams),
        ironMg:        n(body.ironMg),
        calciumMg:     n(body.calciumMg),
        zincMg:        n(body.zincMg),
        potassiumMg:   n(body.potassiumMg),
        magnesiumMg:   n(body.magnesiumMg),
        phosphorusMg:  n(body.phosphorusMg),
        sodiumMg:      n(body.sodiumMg),
        vitaminAmcg:   n(body.vitaminAmcg),
        vitaminCmg:    n(body.vitaminCmg),
        vitaminDmcg:   n(body.vitaminDmcg),
        vitaminEmg:    n(body.vitaminEmg),
        vitaminKmcg:   n(body.vitaminKmcg),
        vitaminB6mg:   n(body.vitaminB6mg),
        vitaminB12mcg: n(body.vitaminB12mcg),
        folateMcg:     n(body.folateMcg),
        omega3Mg:      n(body.omega3Mg),
      },
    });
    return NextResponse.json(ingredient);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.ingredient.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
