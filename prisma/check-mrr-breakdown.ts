// Read-only diagnostic — prints exactly which paying subscribers make up MRR and, for any
// promo-linked account, how much their permanent discount is actually knocking off the
// sticker price. Run this whenever the MRR total on Analytics doesn't match a manual
// "tier price × head count" calculation — the gap is almost always promo-code discounts
// (applyDiscount in lib/bog.ts applies a promo code's discountPercent to every renewal, not
// just the first payment), and this script shows precisely which accounts and how much.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const INTERVAL_PRICE: Record<number, number> = {
  1: Number(process.env.BOG_PLAN_1M_AMOUNT_GEL ?? 17),
  3: Number(process.env.BOG_PLAN_3M_AMOUNT_GEL ?? 39),
  6: Number(process.env.BOG_PLAN_6M_AMOUNT_GEL ?? 59),
};

function applyDiscount(base: number, discountPercent?: number | null) {
  if (!discountPercent) return base;
  return Math.round(base * (1 - discountPercent / 100) * 100) / 100;
}

async function main() {
  // Same filter analytics/page.tsx uses for payingUserRows: not gifted, not canceled, on a
  // paid tier, and has at least one real SUCCESS payment (excludes anyone still mid-trial).
  const paidUserIds = new Set(
    (await p.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] })).map((x) => x.userId)
  );
  const users = await p.user.findMany({
    where: { isGifted: false, subscriptionCanceledAt: null, subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] } },
    select: {
      id: true, name: true, email: true, subscriptionStatus: true, billingIntervalMonths: true,
      promoCode: { select: { code: true, discountPercent: true } },
    },
  });

  let stickerTotal = 0;
  let actualTotal = 0;
  let discountedCount = 0;
  const rows: string[] = [];

  for (const u of users) {
    if (!paidUserIds.has(u.id)) continue; // still mid-trial, not counted in MRR
    const sticker = u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths
      ? (INTERVAL_PRICE[u.billingIntervalMonths] ?? 30)
      : 15;
    const monthlySticker = sticker / (u.billingIntervalMonths || 1);
    const actual = applyDiscount(sticker, u.promoCode?.discountPercent) / (u.billingIntervalMonths || 1);
    stickerTotal += monthlySticker;
    actualTotal += actual;
    if (u.promoCode?.discountPercent) discountedCount++;
    const tag = u.promoCode?.discountPercent ? `${u.promoCode.discountPercent}% (${u.promoCode.code})` : '—';
    rows.push(
      `${(u.name ?? u.email).padEnd(28)} | ${String(u.billingIntervalMonths ?? '-').padStart(2)}თვ | ფასდაკლება: ${tag.padEnd(14)} | ${monthlySticker.toFixed(2)}₾ → ${actual.toFixed(2)}₾ MRR-ში`
    );
  }

  console.log('სახელი                       | ტარიფი | ფასდაკლება               | სუფთა ფასი → რეალურად MRR-ში');
  console.log('-'.repeat(105));
  for (const r of rows) console.log(r);
  console.log('-'.repeat(105));
  console.log(`სულ, ფასდაკლებამდე ("ტარიფი × რაოდენობა"): ${stickerTotal.toFixed(2)}₾`);
  console.log(`სულ, Analytics-ის MRR-ში რაც ჯდება:         ${actualTotal.toFixed(2)}₾`);
  console.log(`სხვაობა: ${(stickerTotal - actualTotal).toFixed(2)}₾ — ${discountedCount} მომხმარებელს აქვს პრომოკოდით ფასდაკლება`);

  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
