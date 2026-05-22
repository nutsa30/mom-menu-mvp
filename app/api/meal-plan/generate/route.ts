import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSuitableAgeGroups } from '@/lib/meal';

const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

const nutrientTargetsByAgeGroup: Record<string, any> = {
  FROM_6: {
    calories: 500,
    proteinGrams: 11,
    ironMg: 11,
    calciumMg: 260,
    vitaminCmg: 50,
    vitaminAmcg: 500,
    fiberGrams: 5,
    fatGrams: 20,
    carbsGrams: 60,
  },
  FROM_9: {
    calories: 700,
    proteinGrams: 12,
    ironMg: 11,
    calciumMg: 270,
    vitaminCmg: 50,
    vitaminAmcg: 500,
    fiberGrams: 7,
    fatGrams: 25,
    carbsGrams: 90,
  },
  FROM_12: {
    calories: 900,
    proteinGrams: 13,
    ironMg: 7,
    calciumMg: 700,
    vitaminCmg: 15,
    vitaminAmcg: 300,
    fiberGrams: 14,
    fatGrams: 30,
    carbsGrams: 130,
  },
  FROM_24: {
    calories: 1200,
    proteinGrams: 19,
    ironMg: 10,
    calciumMg: 1000,
    vitaminCmg: 25,
    vitaminAmcg: 400,
    fiberGrams: 17,
    fatGrams: 35,
    carbsGrams: 130,
  },
};

function getNumber(value: any) {
  return typeof value === 'number' ? value : 0;
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function dishContainsDislike(dish: any, dislikes: string[]) {
  const text = [
    dish.titleKa,
    dish.titleEn,
    dish.descriptionKa,
    dish.descriptionEn,
    ...(dish.ingredientsKa || []),
    ...(dish.ingredientsEn || []),
  ]
    .join(' ')
    .toLowerCase();

  return dislikes.some((item) => text.includes(normalize(item)));
}

function dishContainsAllergen(dish: any, allergies: string[]) {
  const dishAllergens = (dish.allergens || []).map((item: string) =>
    normalize(item)
  );

  return allergies.some((item) => dishAllergens.includes(normalize(item)));
}

function calculateTotals(meals: any[]) {
  return {
    calories: meals.reduce((sum, dish) => sum + getNumber(dish.calories), 0),
    proteinGrams: meals.reduce((sum, dish) => sum + getNumber(dish.proteinGrams), 0),
    ironMg: meals.reduce((sum, dish) => sum + getNumber(dish.ironMg), 0),
    calciumMg: meals.reduce((sum, dish) => sum + getNumber(dish.calciumMg), 0),
    vitaminCmg: meals.reduce((sum, dish) => sum + getNumber(dish.vitaminCmg), 0),
    vitaminAmcg: meals.reduce((sum, dish) => sum + getNumber(dish.vitaminAmcg), 0),
    fiberGrams: meals.reduce((sum, dish) => sum + getNumber(dish.fiberGrams), 0),
    fatGrams: meals.reduce((sum, dish) => sum + getNumber(dish.fatGrams), 0),
    carbsGrams: meals.reduce((sum, dish) => sum + getNumber(dish.carbsGrams), 0),
  };
}

function calculateScore(totals: any, targets: any) {
  let score = 0;

  for (const key of Object.keys(targets)) {
    const target = targets[key];
    const value = totals[key] || 0;

    const percentage = Math.min(value / target, 1);
    score += percentage * 10;
  }

  return score;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId } = body;

    if (!childId) {
      return NextResponse.json(
        { error: 'childId is required' },
        { status: 400 }
      );
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    const dishes = await prisma.dish.findMany({
      where: {
        ageGroups: {
          hasSome: getSuitableAgeGroups(child.ageGroup),
        },
      },
    });

    const safeDishes = dishes.filter((dish) => {
      const hasAllergen = dishContainsAllergen(dish, child.allergies);
      const hasDislike = dishContainsDislike(dish, child.dislikes);

      return !hasAllergen && !hasDislike;
    });

    const grouped = {
      BREAKFAST: safeDishes.filter((dish) => dish.mealType === 'BREAKFAST'),
      LUNCH: safeDishes.filter((dish) => dish.mealType === 'LUNCH'),
      DINNER: safeDishes.filter((dish) => dish.mealType === 'DINNER'),
      SNACK: safeDishes.filter((dish) => dish.mealType === 'SNACK'),
    };

    for (const type of mealTypes) {
      if (grouped[type].length === 0) {
        return NextResponse.json(
          {
            error: `No safe meals found for ${type}`,
            missingMealType: type,
          },
          { status: 400 }
        );
      }
    }

    const targets = nutrientTargetsByAgeGroup[child.ageGroup];

    let bestPlan: any = null;
    let bestScore = -1;

    for (const breakfast of grouped.BREAKFAST) {
      for (const lunch of grouped.LUNCH) {
        for (const dinner of grouped.DINNER) {
          for (const snack of grouped.SNACK) {
            const meals = [breakfast, lunch, dinner, snack];
            const totals = calculateTotals(meals);
            const score = calculateScore(totals, targets);

            if (score > bestScore) {
              bestScore = score;
              bestPlan = {
                breakfast,
                lunch,
                dinner,
                snack,
                totals,
                score,
              };
            }
          }
        }
      }
    }

    if (!bestPlan) {
      return NextResponse.json(
        { error: 'Could not generate meal plan' },
        { status: 400 }
      );
    }

    const savedPlan = await prisma.mealPlan.create({
      data: {
        titleKa: `${child.name}-ს დღიური კვების გეგმა`,
        titleEn: `${child.name}'s daily meal plan`,
        ageGroup: child.ageGroup,
        userId: child.userId,
        childId: child.id,
        dayOffset: 0,
        items: {
          create: [
            {
              mealType: 'BREAKFAST',
              sortOrder: 1,
              dishId: bestPlan.breakfast.id,
            },
            {
              mealType: 'LUNCH',
              sortOrder: 2,
              dishId: bestPlan.lunch.id,
            },
            {
              mealType: 'DINNER',
              sortOrder: 3,
              dishId: bestPlan.dinner.id,
            },
            {
              mealType: 'SNACK',
              sortOrder: 4,
              dishId: bestPlan.snack.id,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            dish: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      mealPlan: savedPlan,
      totals: bestPlan.totals,
      score: bestPlan.score,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Something went wrong while generating meal plan' },
      { status: 500 }
    );
  }
}