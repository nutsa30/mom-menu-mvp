import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { resend } from '../lib/resend';
import { POST } from '../app/api/auth/resend-verification/route';

async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(database.hostname), 'Use only a disposable local database');
  assert.equal(process.env.MOMMENU_SANDBOX, '1');
  const email = `delivery-${randomUUID()}@review.local`;
  const originalSend = resend.emails.send;
  const expiresAt = new Date(Date.now() + 600_000);
  try {
    await prisma.pendingRegistration.create({ data: { email, name: 'Delivery review', passwordHash: 'local-only', codeHash: 'previous-code-hash', expiresAt } });
    resend.emails.send = (async () => ({ data: null, error: { message: 'Synthetic provider rejection', name: 'validation_error', statusCode: 403 }, headers: null })) as typeof resend.emails.send;
    const request = () => new NextRequest('http://localhost:3001/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const failed = await POST(request());
    assert.equal(failed.status, 503);
    assert.deepEqual(await failed.json(), { error: 'email_send_failed' });
    const retained = await prisma.pendingRegistration.findUniqueOrThrow({ where: { email } });
    assert.equal(retained.codeHash, 'previous-code-hash');
    assert.equal(retained.expiresAt.getTime(), expiresAt.getTime());
    let sends = 0;
    resend.emails.send = (async () => { sends++; return { data: { id: 'sandbox-only' }, error: null, headers: null }; }) as typeof resend.emails.send;
    const success = await POST(request());
    assert.equal(success.status, 200);
    assert.equal(sends, 1);
    const refreshed = await prisma.pendingRegistration.findUniqueOrThrow({ where: { email } });
    assert.notEqual(refreshed.codeHash, 'previous-code-hash');
    console.log('PASS: provider rejection returns 503, preserves the earlier code and expiry, and successful retry refreshes the code. No real emails sent.');
  } finally {
    resend.emails.send = originalSend;
    await prisma.pendingRegistration.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
