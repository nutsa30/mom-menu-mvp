// Read-only: shows what the "პირველი საკვები" tracker does for one mother's children.
// Run: npx tsx prisma/check-child-first-foods.ts mother@email.com
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// same calendar-month count the tracker uses
function ageInMonths(birth: Date, now = new Date()) {
  let m = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) m--;
  return Math.max(0, m);
}

async function main() {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  if (!email) { console.log('მიუთითე დედის ელფოსტა: npx tsx prisma/check-child-first-foods.ts mail@example.com'); return; }
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, name: true, subscriptionStatus: true, subscriptionCanceledAt: true, children: { select: { id: true, name: true, birthDate: true } } },
  });
  if (!user) { console.log('ასეთი ელფოსტით მომხმარებელი ვერ მოიძებნა'); return; }
  console.log(`${user.name}  გეგმა: ${user.subscriptionStatus}${user.subscriptionCanceledAt ? ' (გაუქმებული)' : ''}`);
  const ingredients = await prisma.babyIngredient.findMany({ select: { id: true, nameKa: true, category: true, minAgeMonths: true } });
  for (const c of user.children) {
    const age = ageInMonths(c.birthDate);
    const statuses = await prisma.babyIngredientStatus.findMany({ where: { childId: c.id }, select: { ingredientId: true, tried: true, allergic: true } });
    const tried = new Set(statuses.filter((s) => s.tried).map((s) => s.ingredientId));
    const visible = ingredients.filter((i) => i.minAgeMonths <= age || tried.has(i.id));
    const vegs = visible.filter((i) => i.category === 'vegetable');
    console.log(`\nბავშვი: ${c.name}  დაბადება: ${c.birthDate.toISOString().slice(0, 10)}  საიტი ითვლის: ${age} თვედ`);
    console.log(`ძველი წესით ჩანდა: ${visible.length} ინგრედიენტი, აქედან ბოსტნეული ${vegs.length}: ${vegs.map((v) => v.nameKa).join(', ') || '-'}`);
    const zucchini = ingredients.find((i) => i.nameKa === 'ყაბაყი');
    console.log(`ყაბაყი ჩანდა: ${zucchini && (zucchini.minAgeMonths <= age || tried.has(zucchini.id)) ? 'კი' : 'არა'}`);
    console.log(`უკვე გასინჯული: ${tried.size}`);
  }
}
main().finally(() => prisma.$disconnect());
