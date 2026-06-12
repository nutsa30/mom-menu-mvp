import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const dish = await withRetry(() => prisma.dish.create({
      data: {
        titleEn: body.titleEn,
        titleKa: body.titleKa,
        descriptionEn: body.descriptionEn,
        descriptionKa: body.descriptionKa,
        ageGroups: Array.isArray(body.ageGroups) ? body.ageGroups : (body.ageGroup ? [body.ageGroup] : []),
        ingredientsEn: body.ingredientsEn || [],
        ingredientsKa: body.ingredientsKa || [],
        allergens: body.allergens || [],
        imageUrl: body.imageUrl || null,
        mealType: body.mealType,

        calories: body.calories ? Number(body.calories) : null,
        proteinGrams: body.proteinGrams ? Number(body.proteinGrams) : null,
        ironMg: body.ironMg ? Number(body.ironMg) : null,
        calciumMg: body.calciumMg ? Number(body.calciumMg) : null,
        vitaminCmg: body.vitaminCmg ? Number(body.vitaminCmg) : null,
        vitaminAmcg: body.vitaminAmcg ? Number(body.vitaminAmcg) : null,
        vitaminDmcg: body.vitaminDmcg ? Number(body.vitaminDmcg) : null,
        vitaminEmg: body.vitaminEmg ? Number(body.vitaminEmg) : null,
        vitaminKmcg: body.vitaminKmcg ? Number(body.vitaminKmcg) : null,
        vitaminB6mg: body.vitaminB6mg ? Number(body.vitaminB6mg) : null,
        vitaminB12mcg: body.vitaminB12mcg ? Number(body.vitaminB12mcg) : null,
        folateMcg: body.folateMcg ? Number(body.folateMcg) : null,
        zincMg: body.zincMg ? Number(body.zincMg) : null,
        potassiumMg: body.potassiumMg ? Number(body.potassiumMg) : null,
        magnesiumMg: body.magnesiumMg ? Number(body.magnesiumMg) : null,
        phosphorusMg: body.phosphorusMg ? Number(body.phosphorusMg) : null,
        sodiumMg: body.sodiumMg ? Number(body.sodiumMg) : null,
        fiberGrams: body.fiberGrams ? Number(body.fiberGrams) : null,
        fatGrams: body.fatGrams ? Number(body.fatGrams) : null,
        carbsGrams: body.carbsGrams ? Number(body.carbsGrams) : null,
        omega3Mg: body.omega3Mg ? Number(body.omega3Mg) : null,

        blwNoteKa: body.blwNoteKa || null,
        blwNoteEn: body.blwNoteEn || null,
        pureeNoteKa: body.pureeNoteKa || null,
        pureeNoteEn: body.pureeNoteEn || null,
      },
    }));

    return NextResponse.json(dish);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create dish" }, { status: 500 });
  }
}
