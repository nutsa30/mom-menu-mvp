import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany();

    const getRandom = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const breakfast = dishes.filter(d => d.mealType === "BREAKFAST");
    const lunch = dishes.filter(d => d.mealType === "LUNCH");
    const dinner = dishes.filter(d => d.mealType === "DINNER");
    const snack = dishes.filter(d => d.mealType === "SNACK");

    const plan = {
      breakfast: getRandom(breakfast),
      lunch: getRandom(lunch),
      dinner: getRandom(dinner),
      snack: getRandom(snack),
    };

    return NextResponse.json(plan);

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}