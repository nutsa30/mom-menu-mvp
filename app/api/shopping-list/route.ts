import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPaidAccess } from '@/lib/paid-access';
import { getSuitableAgeGroups } from '@/lib/meal';
import { getExperience } from '@/lib/experience';
import { localizedField } from '@/lib/content';
import { ingredientQuantity } from '@/lib/measurements';
import { aggregateIngredients, expandParenthetical, normalizeName } from '@/lib/shopping-list';

const MEAL_TYPES = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'] as const;

function planDays(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function pickDish(dishes: any[], likes: string[], dislikes: string[]) {
  if (!dishes.length) return null;
  const scored = dishes.map((d) => {
    const text = `${d.titleKa} ${d.titleEn} ${d.ingredientsKa.join(' ')} ${d.ingredientsEn.join(' ')}`.toLowerCase();
    const likeScore = likes.filter((l) => text.includes(l.toLowerCase())).length;
    const dislikeScore = dislikes.filter((dl) => text.includes(dl.toLowerCase())).length;
    return { d, score: likeScore - dislikeScore };
  });
  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const top = scored.filter((s) => s.score === topScore);
  return top[Math.floor(Math.random() * top.length)].d;
}

// GET /api/shopping-list?childId=X
// Generates 7 days of meal plans and returns deduplicated ingredient list
export async function GET(req: NextRequest) {
  const { locale, units } = await getExperience();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: session.id }, select: { subscriptionStatus: true, role: true, isBlocked: true, paymentFailedAt: true, subscriptionRenewsAt: true } });
  if (!hasPaidAccess(dbUser, true)) {
    return NextResponse.json({ error: 'FULL_PLAN required' }, { status: 403 });
  }

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const today = new Date().toISOString().split('T')[0];
  const planStart = req.nextUrl.searchParams.get('planStart') ?? today;
  const dates = planDays(planStart);

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const month = new Date().getMonth();
  const currentSeason = month <= 1 || month === 11 ? 'WINTER'
    : month <= 4 ? 'SPRING'
    : month <= 7 ? 'SUMMER'
    : 'AUTUMN';

  const fruitRows = await prisma.ingredient.findMany({ where: { type: 'FRUIT' }, select: { titleKa: true, titleEn: true, seasons: true } });
  const seasonalFruits = new Map<string, Set<string>>(fruitRows.map((f) => [normalizeName(localizedField(f, 'title', locale)).toLowerCase(), new Set(f.seasons)]));

  const allIngredients: string[] = [];
  const days: { date: string; dishes: string[] }[] = [];

  for (const date of dates) {

    let logs = await prisma.dailyLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true },
    });

    const existing = new Set(
      logs.filter((l) => l.dishId !== null || l.ingredientId !== null).map((l) => l.mealType)
    );
    const missing = MEAL_TYPES.filter((m) => !existing.has(m));

    for (const mealType of missing) {
      let logData: any = { childId, date, mealType, wasEaten: false };

      if (mealType === 'SNACK') {
        const suitableAges = getSuitableAgeGroups(child.ageGroup);
        const ingCandidates = await prisma.ingredient.findMany({
          where: { ageGroups: { hasSome: suitableAges }, seasons: { has: currentSeason as any } },
        });
        if (ingCandidates.length && Math.random() < 0.5) {
          const picked = ingCandidates[Math.floor(Math.random() * ingCandidates.length)];
          await prisma.dailyLog.upsert({
            where: { childId_date_mealType: { childId, date, mealType } },
            update: { ingredientId: picked.id, dishId: null },
            create: { ...logData, ingredientId: picked.id, dishId: null },
          });
          continue;
        }
      }

      const where: any = { mealType, ageGroups: { hasSome: getSuitableAgeGroups(child.ageGroup) } };
      if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
      const candidates = await prisma.dish.findMany({ where });
      const picked = pickDish(candidates, child.likes, child.dislikes);

      await prisma.dailyLog.upsert({
        where: { childId_date_mealType: { childId, date, mealType } },
        update: { dishId: picked?.id ?? null, ingredientId: null },
        create: { ...logData, dishId: picked?.id ?? null },
      });
    }

    logs = await prisma.dailyLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true },
    });

    const dayDishes: string[] = [];
    for (const log of logs) {
      if (log.dish?.ingredientsKa?.length) {
        for (const ing of localizedField(log.dish, 'ingredients', locale)) allIngredients.push(...expandParenthetical(ing));
        dayDishes.push(localizedField(log.dish, 'title', locale));
      }
      if (log.ingredient?.titleKa) {
        allIngredients.push(localizedField(log.ingredient, 'title', locale));
        dayDishes.push(localizedField(log.ingredient, 'title', locale));
      }
    }
    days.push({ date, dishes: dayDishes });
  }

  const ingredients = aggregateIngredients(allIngredients, seasonalFruits, currentSeason);
  if (locale === 'en') {
    const unitNames: Record<string, string> = { 'კგ': 'kg', 'მლ': 'ml', 'გ': 'g', 'ლ': 'l', 'ჭიქა': 'cups', 'სუფ.კ': 'tbsp', 'ჩ.კ': 'tsp', 'ც': 'pcs', 'ნაჭერი': 'slices', 'მწიკვი': 'pinches' };
    for (const item of ingredients) {
      item.amount = ingredientQuantity(item.amount.replace(/კგ|მლ|გ|ლ|ჭიქა|სუფ\.კ|ჩ\.კ|ც|ნაჭერი|მწიკვი/g, unit => unitNames[unit]), units);
    }
    ingredients.sort((a, b) => a.display.localeCompare(b.display, 'en'));
  } else if (units !== 'metric') {
    for (const item of ingredients) item.amount = ingredientQuantity(item.amount, units);
  }
  return NextResponse.json({ ingredients, days });
}
