import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';

async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(database.hostname), 'Registration review requires a local disposable database');
  const origin = 'http://localhost:3001';
  const emails: string[] = [];
  try {
    for (const market of ['GE', 'INTL'] as const) {
      const lang = market === 'GE' ? 'ka' : 'en';
      const headers = { origin, 'x-vercel-ip-country': market === 'GE' ? 'GE' : 'US', cookie: 'mommenu_units=us' };
      const formResponse = await fetch(`${origin}/register?lang=${lang}`, { headers });
      assert.equal(formResponse.status, 200);
      const html = await formResponse.text();
      const action = html.match(/name="(\$ACTION_ID_[^"]+)"/);
      assert(action, 'Registration must expose its real server action');
      const email = `registration-${randomUUID()}@review.local`;
      emails.push(email);
      const form = new FormData();
      form.set(action[1], ''); form.set('name', 'Local registration review'); form.set('email', email); form.set('password', 'Review-only-2026!');
      const registered = await fetch(`${origin}/register?lang=${lang}`, { method: 'POST', headers, body: form, redirect: 'manual' });
      assert([303, 307].includes(registered.status), await registered.text());
      assert.match(registered.headers.get('location') || '', /verify-email/);
      const pending = await prisma.pendingRegistration.findUniqueOrThrow({ where: { email } });
      assert.equal(pending.market, market); assert.equal(pending.locale, lang);
      assert.equal(await prisma.user.findUnique({ where: { email } }), null);
      // The sandbox suppresses email. Set a known OTP only on this disposable pending row.
      await prisma.pendingRegistration.update({ where: { email }, data: { codeHash: createHash('sha256').update(email + ':123456').digest('hex') } });
      const verified = await fetch(`${origin}/api/auth/verify-email-code`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code: '123456' }) });
      assert.equal(verified.status, 200, await verified.text());
      const user = await prisma.user.findUniqueOrThrow({ where: { email } });
      assert.equal(user.market, market); assert.equal(user.locale, lang); assert.equal(user.subscriptionCurrency, market === 'GE' ? 'GEL' : 'USD');
      assert.equal(user.emailVerified, true); assert(user.referralCode);
      assert.equal(user.units, 'us', 'A measurement preference chosen before signup must persist on the new account');
      const cookie = verified.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
      const child = await fetch(`${origin}/api/children`, { method: 'POST', headers: { ...headers, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Local review child', birthDate: '2025-04-05', allergies: [], likes: [], dislikes: [] }) });
      assert.equal(child.status, 200, await child.text());
    }
    console.log('PASS: real registration server action, pending-only signup, email verification, permanent market/currency, referral code and child onboarding in both markets; sandbox emails only.');
  } finally {
    await prisma.pendingRegistration.deleteMany({ where: { email: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
