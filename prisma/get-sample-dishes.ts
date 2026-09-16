import { prisma } from '../lib/prisma';

// One-off: prints the exact same "most recent dish per meal type" that the real homepage
// (app/page.tsx) queries and passes into HomeClient as `dishes` — used only to pull real
// dish names into the landing-page preview mockup instead of invented placeholder titles.
async function main() {
  const [breakfast, lunch, snack, dinner] = await Promise.all([
    prisma.dish.findFirst({ where: { mealType: 'BREAKFAST' }, orderBy: { createdAt: 'desc' }, select: { titleKa: true } }),
    prisma.dish.findFirst({ where: { mealType: 'LUNCH' }, orderBy: { createdAt: 'desc' }, select: { titleKa: true } }),
    prisma.dish.findFirst({ where: { mealType: 'SNACK' }, orderBy: { createdAt: 'desc' }, select: { titleKa: true } }),
    prisma.dish.findFirst({ where: { mealType: 'DINNER' }, orderBy: { createdAt: 'desc' }, select: { titleKa: true } }),
  ]);

  console.log('საუზმე:', breakfast?.titleKa ?? '(არცერთი)');
  console.log('სადილი:', lunch?.titleKa ?? '(არცერთი)');
  console.log('სნექი:', snack?.titleKa ?? '(არცერთი)');
  console.log('ვახშამი:', dinner?.titleKa ?? '(არცერთი)');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
