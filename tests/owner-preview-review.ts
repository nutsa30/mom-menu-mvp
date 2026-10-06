import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';

async function main() {
  const db = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(db.hostname), 'Requires the disposable local review database');
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@review.local' } });
  assert.equal(owner.role, 'ADMIN');
  const child = await prisma.child.create({ data: {
    name: `Preview ${randomUUID()}`, userId: owner.id,
    birthDate: new Date('2025-01-01'), ageGroup: 'FROM_12',
  } });
  const origin = 'http://localhost:3001';
  let cookie = '';
  async function request(path: string, body?: object) {
    const response = await fetch(origin + path, {
      method: body ? 'POST' : 'GET', redirect: 'follow',
      headers: { origin, cookie, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const additions = response.headers.getSetCookie().map(c => c.split(';')[0]);
    if (additions.length) cookie = [cookie, ...additions].filter(Boolean).join('; ');
    return response;
  }
  try {
    await prisma.user.update({ where: { id: owner.id }, data: { subscriptionStatus: 'FREE' } });
    assert.equal((await request('/api/auth/login', { email: owner.email, password: 'Review-only-2026!' })).status, 200);
    assert.equal((await request('/api/admin/preview', { market: 'INTL' })).status, 200);
    for (const path of ['/', '/dashboard', '/recipes', '/about', '/blog', '/subscription']) {
      const response = await request(path);
      assert.equal(response.status, 200, path);
      assert.match(response.url, /lang=en/, path);
      assert.match(response.headers.get('x-mommenu-cache-key') || '', /INTL-en$/);
    }
    const dashboard = await (await request('/dashboard')).text();
    assert.match(dashboard, /Shopping/);
    assert.equal((await request('/api/daily-log?childId=' + child.id)).status, 200);
    assert.equal((await request('/api/shopping-list?childId=' + child.id)).status, 200);
    assert.equal((await request('/api/subscription/bog-checkout', { interval: 1 })).status, 409);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
    assert.equal(after.subscriptionStatus, 'FREE');
    assert.equal(after.market, owner.market);
    console.log('PASS: unpaid administrator previews all public pages and dashboard; paid features open; account billing stays unchanged; checkout remains blocked');
  } finally {
    await request('/api/admin/preview', { market: 'AUTO' });
    await prisma.user.update({ where: { id: owner.id }, data: { subscriptionStatus: owner.subscriptionStatus } });
    await prisma.dailyLog.deleteMany({ where: { childId: child.id } });
    await prisma.child.delete({ where: { id: child.id } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
