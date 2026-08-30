import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const p = new PrismaClient();

const MEAL_LABEL: Record<string, string> = {
  BREAKFAST: 'საუზმე',
  LUNCH: 'სადილი',
  DINNER: 'ვახშამი',
  SNACK: 'სნექი',
};

const AGE_LABEL: Record<string, string> = {
  FROM_6: '6-8 თვე',
  FROM_9: '9-11 თვე',
  FROM_12: '12-23 თვე',
  FROM_24: '24+ თვე',
};

async function main() {
  const dishes = await p.dish.findMany({
    select: { titleKa: true, mealType: true, ageGroups: true },
    orderBy: [{ mealType: 'asc' }, { titleKa: 'asc' }],
  });

  const byMeal: Record<string, typeof dishes> = {};
  for (const d of dishes) {
    (byMeal[d.mealType] ??= []).push(d);
  }

  const lines: string[] = [];
  lines.push(`სულ კერძი ბაზაში: ${dishes.length}`);
  lines.push('');

  for (const mealType of Object.keys(MEAL_LABEL)) {
    const list = byMeal[mealType] ?? [];
    if (list.length === 0) continue;
    lines.push(`── ${MEAL_LABEL[mealType]} (${list.length}) ──────────────────────`);
    for (const d of list) {
      const ages = d.ageGroups.map(a => AGE_LABEL[a] ?? a).join(', ');
      lines.push(`${d.titleKa}  [${ages}]`);
    }
    lines.push('');
  }

  const out = lines.join('\n');
  writeFileSync('dish-list.txt', out, 'utf-8');
  console.log(out);
  console.log('\n✅ ჩაიწერა ფაილში: dish-list.txt (პროექტის მთავარ საქაღალდეში)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
