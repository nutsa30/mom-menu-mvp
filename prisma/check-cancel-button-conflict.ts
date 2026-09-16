import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Real bug found 2026-09-07: components/DashboardClient.tsx's SettingsTab shows the
// Lemon-Squeezy "manage subscription" button (broken/deactivated store) whenever
// lsSubscriptionId is set on the account — even if that same account ALSO has a real,
// live BOG subscription (bogParentOrderId set). Whoever's in that overlap literally cannot
// cancel their real, active subscription from the site: the button they see calls the
// dead Lemon Squeezy portal instead of the working BOG cancel flow.
//
// This lists every account in that exact overlap so we know how many real customers were
// affected before today's fix (reordering the check in DashboardClient.tsx to prefer BOG).
async function main() {
  const affected = await p.user.findMany({
    where: {
      lsSubscriptionId: { not: null },
      bogParentOrderId: { not: null },
    },
    select: {
      name: true,
      email: true,
      subscriptionStatus: true,
      lsSubscriptionId: true,
      bogParentOrderId: true,
      subscriptionCanceledAt: true,
    },
  });

  console.log(`${affected.length} ანგარიშს ჰქონდა ორივე ერთდროულად (ვერ აუქმებდნენ რეალურ BOG გამოწერას საიტიდან):\n`);
  for (const u of affected) {
    console.log('──────────────────────────────');
    console.log(u.name, `<${u.email}>`);
    console.log('subscriptionStatus:', u.subscriptionStatus);
    console.log('subscriptionCanceledAt:', u.subscriptionCanceledAt?.toISOString() ?? 'null — ანუ ვერასდროს გაუუქმებია');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
