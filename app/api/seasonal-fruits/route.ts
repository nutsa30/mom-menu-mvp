import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSuitableAgeGroups } from '@/lib/meal';

function currentSeason(): string {
  const m = new Date().getMonth();
  if (m <= 1 || m === 11) return 'WINTER';
  if (m <= 4) return 'SPRING';
  if (m <= 7) return 'SUMMER';
  return 'AUTUMN';
}

const SEASON_KA: Record<string, string> = {
  SPRING: 'გაზაფხული', SUMMER: 'ზაფხული',
  AUTUMN: 'შემოდგომა', WINTER: 'ზამთარი',
};
const SEASON_ICON: Record<string, string> = {
  SPRING: '🌸', SUMMER: '☀️', AUTUMN: '🍂', WINTER: '❄️',
};

const NUTRIENT_KA: Record<string, string> = {
  vitaminCmg: 'C ვიტამინი', vitaminAmcg: 'A ვიტამინი',
  vitaminDmcg: 'D ვიტამინი', vitaminEmg: 'E ვიტამინი',
  vitaminKmcg: 'K ვიტამინი', vitaminB6mg: 'B6', vitaminB12mcg: 'B12',
  ironMg: 'რკინა', calciumMg: 'კალციუმი', potassiumMg: 'კალიუმი',
  fiberGrams: 'ბოჭკო', folateMcg: 'ფოლატი', omega3Mg: 'Omega-3',
};
const NUTRIENT_UNIT: Record<string, string> = {
  vitaminCmg: 'mg', vitaminAmcg: 'mcg', vitaminDmcg: 'mcg', vitaminEmg: 'mg',
  vitaminKmcg: 'mcg', vitaminB6mg: 'mg', vitaminB12mcg: 'mcg',
  ironMg: 'mg', calciumMg: 'mg', potassiumMg: 'mg',
  fiberGrams: 'g', folateMcg: 'mcg', omega3Mg: 'mg',
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const season = currentSeason();
  const suitableAges = getSuitableAgeGroups(child.ageGroup);

  const fruits = await prisma.ingredient.findMany({
    where: {
      type: 'FRUIT',
      seasons: { has: season as any },
      ageGroups: { hasSome: suitableAges },
    },
    orderBy: { titleKa: 'asc' },
  });

  const result = fruits.map((f) => {
    const vitamins: { label: string; value: string }[] = [];
    for (const [key, label] of Object.entries(NUTRIENT_KA)) {
      const val = (f as any)[key];
      if (val && Number(val) > 0) {
        vitamins.push({ label, value: `${val}${NUTRIENT_UNIT[key]}` });
      }
    }
    return {
      id: f.id,
      titleKa: f.titleKa,
      titleEn: f.titleEn,
      imageUrl: f.imageUrl,
      benefitsKa: f.benefitsKa,
      vitamins,
    };
  });

  return NextResponse.json({
    season,
    seasonKa: SEASON_KA[season],
    seasonIcon: SEASON_ICON[season],
    fruits: result,
  });
}
