import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { oncePerLocalDay } from '../lib/communication-delivery';
import { prisma } from '../lib/prisma';
import { resend } from '../lib/resend';
import { sendWeeklyMenuEmail, sendBirthdayEmail } from '../lib/email';

async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(database.hostname), 'Communication review requires a local disposable database');
  const kind = `review-${randomUUID()}`;
  const originalSend = resend.emails.send;
  let sends = 0;
  try {
    assert.equal(await oncePerLocalDay('localreview', kind, '2026-10-06', async () => { sends++; }), true);
    assert.equal(await oncePerLocalDay('localreview', kind, '2026-10-06', async () => { sends++; }), false);
    assert.equal(sends, 1);
    await assert.rejects(() => oncePerLocalDay('localreview', kind, '2026-10-07', async () => { throw new Error('provider failure'); }));
    assert.equal(await oncePerLocalDay('localreview', kind, '2026-10-07', async () => { sends++; }), true);
    const birthdayMessages: { subject: string; html: string }[] = [];
    resend.emails.send = (async (message: { subject: string; html: string }) => {
      birthdayMessages.push(message);
      return { data: { id: 'local-review-only' }, headers: null, error: null };
    }) as typeof resend.emails.send;
    await sendBirthdayEmail('parent@review.local');
    await sendBirthdayEmail('georgian@review.local');
    assert.match(birthdayMessages[0].subject, /birthday/i);
    assert(!/[ა-ჰ]/.test(birthdayMessages[0].html), 'English birthday email must not contain Georgian copy');
    assert(/[ა-ჰ]/.test(birthdayMessages[1].subject), 'Georgian account keeps its Georgian birthday email');
    resend.emails.send = (async () => ({ data: null, headers: null, error: { name: 'validation_error', statusCode: 422, message: 'simulated provider error' } })) as typeof resend.emails.send;
    await assert.rejects(() => sendWeeklyMenuEmail('parent@review.local', 'Local review'), /simulated provider error/);
    await assert.rejects(() => sendBirthdayEmail('parent@review.local'), /simulated provider error/);
    console.log('PASS: per-user local-day deduplication, failed delivery retry and email provider error propagation; no external requests.');
  } finally {
    resend.emails.send = originalSend;
    await prisma.communicationDelivery.deleteMany({ where: { kind } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
