import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// URGENT diagnostic (2026-09-07): Nutsa was just charged a REAL 21.01₾ via Lemon Squeezy
// today, even though her account has long since been on admin-gifted free access — the
// underlying Lemon Squeezy subscription itself was apparently never actually canceled when
// LS was retired from the site's checkout UI (see CLAUDE.md: "unreachable from the UI, but
// left in place"). That means ANY other account that still carries a non-null
// lsSubscriptionId could be in the exact same position: silently, really billed every
// month on Lemon Squeezy's side, regardless of what subscriptionStatus/isGifted says here.
// This lists every one of them so they can be checked/canceled in the Lemon Squeezy
// dashboard one by one.
async function main() {
  const users = await p.user.findMany({
    where: { lsSubscriptionId: { not: null } },
    select: {
      name: true,
      email: true,
      subscriptionStatus: true,
      isGifted: true,
      lsSubscriptionId: true,
      lsCustomerId: true,
      subscriptionCanceledAt: true,
    },
  });

  console.log(`სულ ${users.length} ანგარიშს აქვს დარჩენილი lsSubscriptionId (ლემონ სქუიზი):\n`);
  for (const u of users) {
    console.log('──────────────────────────────');
    console.log(u.name, `<${u.email}>`);
    console.log('subscriptionStatus:', u.subscriptionStatus, '| isGifted:', u.isGifted);
    console.log('lsSubscriptionId:', u.lsSubscriptionId);
    console.log('subscriptionCanceledAt (ჩვენს ბაზაში):', u.subscriptionCanceledAt?.toISOString() ?? 'null — ანუ ჩვენთანაც არასდროს გაუქმებულა!');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
