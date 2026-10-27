// READ-ONLY diagnostic — writes nothing.
//   Part 1: Natia Gobejishvili — did she pay before canceling, and what happens on the 5th?
//   Part 2: signups that never showed up in admin/users — where could they be?
// Optional extra search terms (name or email fragments) can be passed as arguments:
//   npx tsx prisma/check-natia-and-missing-signups.ts someone@gmail.com
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const fmt = (d: Date | null | undefined) =>
  d ? d.toLocaleString('en-GB', { timeZone: 'Asia/Tbilisi', hour12: false }) : '-';

async function natia() {
  console.log('='.repeat(80));
  console.log('ნაწილი 1: ნათია გობეჯიშვილი');
  console.log('='.repeat(80));

  const users = await p.user.findMany({
    where: {
      OR: [
        { name: { contains: 'გობეჯიშვილ', mode: 'insensitive' } },
        { name: { contains: 'gobejishvil', mode: 'insensitive' } },
        { email: { contains: 'gobejishvil', mode: 'insensitive' } },
        { email: { contains: 'gobejish', mode: 'insensitive' } },
      ],
    },
    include: { promoCode: true },
  });

  if (users.length === 0) {
    console.log('მომხმარებელი ვერ მოიძებნა User ცხრილში (შესაძლოა ანგარიში წაშლილია).');
  }

  for (const u of users) {
    console.log(`\n${u.name} <${u.email}>  id=${u.id}`);
    console.log(`  market=${u.market}  status=${u.subscriptionStatus}  interval=${u.billingIntervalMonths ?? '-'} თვე  gifted=${u.isGifted}  blocked=${u.isBlocked}`);
    console.log(`  რეგისტრაცია:        ${fmt(u.createdAt)}`);
    console.log(`  გამოწერა დაიწყო:    ${fmt(u.subscriptionStartedAt)}`);
    console.log(`  გაუქმდა (canceled): ${fmt(u.subscriptionCanceledAt)}`);
    console.log(`  შემდეგი გადახდა:    ${fmt(u.subscriptionRenewsAt)}`);
    console.log(`  paymentFailedAt:    ${fmt(u.paymentFailedAt)}`);
    console.log(`  bogParentOrderId:   ${u.bogParentOrderId ? 'არის (ბარათი შენახულია)' : 'არ არის'}`);
    console.log(`  promo:              ${u.promoCode ? `${u.promoCode.code} (-${u.promoCode.discountPercent ?? 0}%)` : '-'}`);

    const payments = await p.payment.findMany({ where: { userId: u.id }, orderBy: { createdAt: 'asc' } });
    console.log(`\n  გადახდები (${payments.length}):`);
    for (const pay of payments) {
      console.log(`   - ${fmt(pay.createdAt)} | ${pay.status} | ${pay.grossAmount}${pay.currency} | ${pay.billingIntervalMonths ?? '-'}თვ | ${pay.failureReason ?? ''}`);
    }

    const cancels = await p.subscriptionCancellation.findMany({ where: { userId: u.id }, orderBy: { createdAt: 'asc' } });
    console.log(`\n  გაუქმების ჩანაწერები (${cancels.length}):`);
    for (const c of cancels) {
      console.log(`   - ${fmt(c.createdAt)} | გეგმა=${c.plan} | მიზეზი=${c.reason}${c.reasonText ? ` | "${c.reasonText}"` : ''}`);
    }

    const lastOk = [...payments].reverse().find((x) => x.status === 'SUCCESS');
    console.log('\n  დასკვნა:');
    console.log(`   ბოლო წარმატებული გადახდა: ${fmt(lastOk?.createdAt)}`);
    console.log(`   გაუქმების თარიღი:         ${fmt(u.subscriptionCanceledAt ?? cancels[cancels.length - 1]?.createdAt)}`);
    console.log(`   შემდეგი გადახდის თარიღი:  ${fmt(u.subscriptionRenewsAt)}`);
    const failedAfterCancel = payments.filter((x) => u.subscriptionCanceledAt && x.createdAt > u.subscriptionCanceledAt);
    console.log(`   გაუქმების შემდეგ გადახდის მცდელობა: ${failedAfterCancel.length === 0 ? 'არ ყოფილა' : failedAfterCancel.map((x) => `${fmt(x.createdAt)} ${x.status}`).join('; ')}`);
  }

  // Account may have been deleted too — payments keep a snapshot of who it was.
  const orphan = await p.payment.findMany({
    where: { userId: null, OR: [
      { deletedUserName: { contains: 'გობეჯიშვილ', mode: 'insensitive' } },
      { deletedUserEmail: { contains: 'gobejish', mode: 'insensitive' } },
    ] },
    orderBy: { createdAt: 'asc' },
  });
  if (orphan.length) {
    console.log(`\nწაშლილი ანგარიშის გადახდები (${orphan.length}):`);
    for (const pay of orphan) console.log(`   - ${fmt(pay.createdAt)} | ${pay.status} | ${pay.grossAmount}${pay.currency} | ${pay.deletedUserName} <${pay.deletedUserEmail}>`);
  }
  const deletions = await p.accountDeletion.findMany({
    where: { OR: [
      { userName: { contains: 'გობეჯიშვილ', mode: 'insensitive' } },
      { userEmail: { contains: 'gobejish', mode: 'insensitive' } },
    ] },
  });
  for (const d of deletions) console.log(`\nანგარიში წაშლილია: ${fmt(d.createdAt)} | ${d.userName} <${d.userEmail}> | მიზეზი=${d.reason}`);
}

async function missingSignups(extra: string[]) {
  console.log('\n' + '='.repeat(80));
  console.log('ნაწილი 2: დაკარგული რეგისტრაციები');
  console.log('='.repeat(80));

  const now = new Date();
  const pending = await p.pendingRegistration.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`\nA) ელფოსტის კოდის დადასტურებას ელოდებიან (PendingRegistration): ${pending.length}`);
  console.log('   (ამათ User ჩანაწერი ჯერ არ აქვთ - ამიტომ ადმინის სიაში არ ჩანან)');
  for (const r of pending) {
    console.log(`   - ${fmt(r.createdAt)} | ${r.name} <${r.email}> | market=${r.market} | ${r.expiresAt < now ? 'კოდის ვადა გაუვიდა' : 'კოდი ჯერ ძალაშია'}`);
  }

  const since = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
  const recent = await p.user.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' } });
  console.log(`\nB) ბოლო 21 დღეში შექმნილი მომხმარებლები ყველა market-ში: ${recent.length}`);
  console.log('   (ადმინის გვერდი აჩვენებს მხოლოდ არჩეულ market-ს - GE ან INTL)');
  for (const u of recent) {
    console.log(`   - ${fmt(u.createdAt)} | ${u.name} <${u.email}> | market=${u.market} | verified=${u.emailVerified} | ${u.subscriptionStatus}${u.googleId ? ' | google' : ''}`);
  }
  const byMarket = recent.reduce<Record<string, number>>((acc, u) => ((acc[u.market] = (acc[u.market] || 0) + 1), acc), {});
  console.log('   market-ების მიხედვით:', JSON.stringify(byMarket));

  const deletions = await p.accountDeletion.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' } });
  console.log(`\nC) ბოლო 21 დღეში თავად წაშლილი ანგარიშები: ${deletions.length}`);
  for (const d of deletions) console.log(`   - ${fmt(d.createdAt)} | ${d.userName} <${d.userEmail}> | მიზეზი=${d.reason}`);

  for (const term of extra) {
    console.log(`\nD) ძებნა: "${term}"`);
    const us = await p.user.findMany({ where: { OR: [{ name: { contains: term, mode: 'insensitive' } }, { email: { contains: term, mode: 'insensitive' } }] } });
    const ps = await p.pendingRegistration.findMany({ where: { OR: [{ name: { contains: term, mode: 'insensitive' } }, { email: { contains: term, mode: 'insensitive' } }] } });
    const ds = await p.accountDeletion.findMany({ where: { OR: [{ userName: { contains: term, mode: 'insensitive' } }, { userEmail: { contains: term, mode: 'insensitive' } }] } });
    console.log(`   User: ${us.length ? us.map((u) => `${u.name} <${u.email}> market=${u.market} ${fmt(u.createdAt)}`).join(' ; ') : 'არ მოიძებნა'}`);
    console.log(`   Pending: ${ps.length ? ps.map((r) => `${r.name} <${r.email}> ${fmt(r.createdAt)}`).join(' ; ') : 'არ მოიძებნა'}`);
    console.log(`   წაშლილი: ${ds.length ? ds.map((d) => `${d.userName} <${d.userEmail}> ${fmt(d.createdAt)}`).join(' ; ') : 'არ მოიძებნა'}`);
  }
}

async function main() {
  await natia();
  await missingSignups(process.argv.slice(2));
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
