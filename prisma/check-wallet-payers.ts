import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Looks up specific users identified from BOG's Business Manager as having paid via
// Apple Pay or Google Pay (confirmed with BOG support: those can never be recharged
// automatically — see lib/bog.ts's payment_method fix). Accepts either an email address
// or a BOG "business order ID" of the form mm_<userId>_<interval>M (copy it straight out
// of BOG's "დეტალები" panel — no need to figure out the email yourself).
//
// Usage:
//   npx tsx prisma/check-wallet-payers.ts someone@example.com mm_cmtot6clf0000l10496l7wpsj_1M ...
async function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error('გამოყენება: npx tsx prisma/check-wallet-payers.ts <email ან mm_..._1M> [კიდევ...]');
    process.exit(1);
  }

  for (const raw of inputs) {
    const businessIdMatch = raw.match(/^mm_([a-z0-9]+)_([136])M$/);
    const user = businessIdMatch
      ? await p.user.findUnique({ where: { id: businessIdMatch[1] } })
      : await p.user.findUnique({ where: { email: raw } });

    if (!user) {
      console.log(`⚠️  ვერ მოიძებნა: ${raw}`);
      continue;
    }

    const success = await p.payment.findFirst({ where: { userId: user.id, status: 'SUCCESS' }, orderBy: { createdAt: 'desc' } });

    console.log('──────────────────────────────');
    console.log(user.name, `<${user.email}>`, `(${raw})`);
    console.log('subscriptionStatus:', user.subscriptionStatus);
    console.log('bogParentOrderId:', user.bogParentOrderId ?? 'null');
    console.log('paymentFailedAt:', user.paymentFailedAt?.toISOString() ?? 'null');
    console.log('bogTrialUsed:', user.bogTrialUsed);
    console.log('ოდესმე რეალურად გადაუხდია:', success ? `დიახ (${success.grossAmount}₾, ${success.createdAt.toISOString()})` : 'არასდროს (ჯერ ტრიალზეა ან ჯერ არ ჩამოჭრილა)');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
