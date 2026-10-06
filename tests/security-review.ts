import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

async function main() {
  assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL || '').hostname));
  assert.equal(process.env.MOMMENU_SANDBOX, '1');
  const origin = 'http://localhost:3001';
  const parent = await prisma.user.findUniqueOrThrow({ where: { email: 'parent@review.local' } });
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@review.local' } });
  const ge = await prisma.user.findUniqueOrThrow({ where: { email: 'georgian@review.local' }, include: { children: true } });
  const token = (user: typeof parent, role = user.role) => jwt.sign({ id: user.id, email: user.email, name: user.name, role }, process.env.JWT_SECRET!, { algorithm: 'HS256' });
  const call = (path: string, method = 'GET', auth = '', requestOrigin = origin, body?: object) => fetch(origin + path, {
    method, headers: { origin: requestOrigin, cookie: auth ? `mom_menu_token=${auth}` : '', 'content-type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body || {}), redirect: 'manual',
  });
  const before = [await prisma.dish.count(), await prisma.ingredient.count()];
  for (const task of ['birthday-wishes', 'update-age-groups', 'bog-renew', 'quickpay-renew', 'email-weekly', 'email-expiring', 'notify', 'international-communications']) {
    assert.equal((await call('/api/cron/' + task)).status, 401, task);
    assert.equal((await call('/api/cron/' + task + '?secret=mm2026')).status, 401, 'Legacy default secret is rejected');
  }
  for (const [path, method] of [
    ['/api/dishes', 'POST'], ['/api/dishes/review-missing', 'PUT'], ['/api/dishes/review-missing', 'DELETE'],
    ['/api/ingredients', 'POST'], ['/api/ingredients/review-missing', 'PUT'], ['/api/ingredients/review-missing', 'DELETE'],
  ]) {
    assert.equal((await call(path, method)).status, 401, path);
    assert.equal((await call(path, method, token(parent))).status, 403, path);
    assert.equal((await call(path, method, token(parent, 'ADMIN'))).status, 403, 'Forged role must be checked against database');
    assert.equal((await call(path, method, token(owner), 'https://attacker.invalid')).status, 403, 'Wrong Origin');
  }
  for (const path of ['/api/meals', '/api/generate-plan', '/api/meal-plan?childId=' + ge.children[0].id]) {
    assert.equal((await call(path)).status, 401, path);
  }
  assert.equal((await call('/api/meal-plan?childId=' + ge.children[0].id, 'GET', token(parent))).status, 404);
  assert.equal((await call('/api/meal-plan/generate', 'POST', token(parent), origin, { childId: ge.children[0].id })).status, 404);
  assert.deepEqual([await prisma.dish.count(), await prisma.ingredient.count()], before);
  console.log('PASS: anonymous writes, non-admin writes, forged role, cross-origin admin writes, paid API authentication and other-family meal-plan access are blocked; catalogue unchanged');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
