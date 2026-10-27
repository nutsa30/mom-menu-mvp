// READ-ONLY — writes nothing. Finds a specific signup (Teona) and everyone who registered
// after her, in every market, whether they finished email confirmation or not.
//   npx tsx prisma/find-signups-after.ts teona.tsnobiladze724@eab.tsu.edu.ge თემო temo
// First argument = the anchor (email fragment), the rest = extra name/email search terms.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const fmt = (d: Date | null | undefined) =>
  d ? d.toLocaleString('en-GB', { timeZone: 'Asia/Tbilisi', hour12: false }) : '-';

async function main() {
  const [anchor, ...terms] = process.argv.slice(2);
  if (!anchor) { console.log('მიუთითე ელფოსტა ან მისი ნაწილი'); return; }
  const now = new Date();

  const frag = anchor.split('@')[0];
  const matchUser = { OR: [{ email: { contains: frag, mode: 'insensitive' as const } }, { name: { contains: 'წნობილაძ', mode: 'insensitive' as const } }, { name: { contains: 'tsnobiladze', mode: 'insensitive' as const } }] };

  const u = await p.user.findMany({ where: matchUser });
  const pend = await p.pendingRegistration.findMany({ where: matchUser });
  const del = await p.accountDeletion.findMany({ where: { OR: [{ userEmail: { contains: frag, mode: 'insensitive' } }, { userName: { contains: 'წნობილაძ', mode: 'insensitive' } }] } });

  console.log(`ანკერი: "${anchor}"`);
  console.log(`  User ცხრილში:        ${u.length ? u.map((x) => `${x.name} <${x.email}> market=${x.market} verified=${x.emailVerified} ${x.subscriptionStatus} შექმნილია ${fmt(x.createdAt)}`).join(' ; ') : 'არ არის'}`);
  console.log(`  Pending (კოდი):      ${pend.length ? pend.map((x) => `${x.name} <${x.email}> market=${x.market} შექმნილია ${fmt(x.createdAt)} ${x.expiresAt < now ? '(კოდის ვადა გასულია)' : '(კოდი ძალაშია)'}`).join(' ; ') : 'არ არის'}`);
  console.log(`  თავად წაშლილი:       ${del.length ? del.map((x) => `${x.userName} <${x.userEmail}> ${fmt(x.createdAt)}`).join(' ; ') : 'არ არის'}`);

  const anchorDate = [...u.map((x) => x.createdAt), ...pend.map((x) => x.createdAt)].sort((a, b) => a.getTime() - b.getTime())[0];
  if (!anchorDate) {
    console.log('\nანკერის დრო ვერ დავადგინე, ამიტომ უბრალოდ ბოლო 14 დღეს ვაჩვენებ.');
  }
  const since = anchorDate ?? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const afterUsers = await p.user.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } });
  const afterPending = await p.pendingRegistration.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } });
  const afterDeleted = await p.accountDeletion.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } });

  console.log(`\nყველა, ვინც ${fmt(since)}-დან დარეგისტრირდა (ყველა market):`);
  console.log(`\n  დასრულებული რეგისტრაცია - User (${afterUsers.length}):`);
  for (const x of afterUsers) console.log(`   - ${fmt(x.createdAt)} | ${x.name} <${x.email}> | market=${x.market} | verified=${x.emailVerified} | ${x.subscriptionStatus}${x.googleId ? ' | google' : ''}`);
  console.log(`\n  კოდის დადასტურებას ელოდება - Pending (${afterPending.length}):`);
  for (const x of afterPending) console.log(`   - ${fmt(x.createdAt)} | ${x.name} <${x.email}> | market=${x.market} | ${x.expiresAt < now ? 'კოდის ვადა გასულია' : 'კოდი ძალაშია'}`);
  console.log(`\n  ანგარიში თავად წაშალეს (${afterDeleted.length}):`);
  for (const x of afterDeleted) console.log(`   - ${fmt(x.createdAt)} | ${x.userName} <${x.userEmail}> | მიზეზი=${x.reason}`);

  for (const t of terms) {
    const m = { OR: [{ name: { contains: t, mode: 'insensitive' as const } }, { email: { contains: t, mode: 'insensitive' as const } }] };
    const a = await p.user.findMany({ where: m });
    const b = await p.pendingRegistration.findMany({ where: m });
    console.log(`\nძებნა "${t}":`);
    console.log(`  User:    ${a.length ? a.map((x) => `${x.name} <${x.email}> market=${x.market} ${fmt(x.createdAt)}`).join(' ; ') : 'არ არის'}`);
    console.log(`  Pending: ${b.length ? b.map((x) => `${x.name} <${x.email}> ${fmt(x.createdAt)}`).join(' ; ') : 'არ არის'}`);
  }
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
