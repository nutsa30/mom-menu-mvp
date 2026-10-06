import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  if (process.env.MOMMENU_SANDBOX !== '1' || !process.env.DATABASE_URL?.includes('127.0.0.1:55432')) throw new Error('Local preview only.');
  for (const email of ['owner@review.local','parent@review.local','georgian@review.local']) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'FULL_PLAN', billingIntervalMonths: 1, subscriptionAmount: user.market === 'INTL' ? 15 : 17, subscriptionRenewsAt: new Date(Date.now()+30*86400000), trialEndsAt: null } });
    for (const [id, name, birthDate, ageGroup] of [
      [`${user.id}-toddler`, 'Alex', '2025-04-05', 'FROM_12'],
      [`${user.id}-baby`, 'Sam', '2026-02-05', 'FROM_6'],
    ] as const) {
      await prisma.child.upsert({ where: { id }, update: {}, create: { id, name, userId: user.id, birthDate: new Date(birthDate), ageGroup } });
    }
  }
}
main().finally(() => prisma.$disconnect());
