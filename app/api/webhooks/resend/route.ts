import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ─── Resend delivery-event webhook ──────────────────────────────────────────
// Resend signs webhook payloads using the Svix scheme: headers `svix-id`, `svix-timestamp`,
// `svix-signature`, verified as HMAC-SHA256 over "{svix-id}.{svix-timestamp}.{rawBody}"
// using the base64 portion of the webhook secret (format "whsec_<base64>"). This mirrors
// the existing hand-rolled verification in lib/bog.ts (verifyWebhookSignature) rather than
// adding the `svix` package as a new dependency for one endpoint.
//
// Configure in Resend's dashboard (Webhooks → Add endpoint → this URL, subscribed to at
// least: email.delivered, email.bounced, email.complained) and set RESEND_WEBHOOK_SECRET
// to the signing secret it gives you (starts with "whsec_").
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

function verifyResendWebhook(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');
  if (!secret || !svixId || !svixTimestamp || !svixSignature) return false;

  const tsSeconds = Number(svixTimestamp);
  if (!Number.isFinite(tsSeconds) || Math.abs(Date.now() / 1000 - tsSeconds) > TIMESTAMP_TOLERANCE_SECONDS) {
    return false; // stale or clock-skewed — reject rather than trust an old replayed payload
  }

  const secretBytes = Buffer.from(secret.startsWith('whsec_') ? secret.slice(6) : secret, 'base64');
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const expectedBuf = Buffer.from(expected, 'base64');

  // svix-signature can carry multiple space-separated "v1,<sig>" values (e.g. during
  // secret rotation) — a match on any of them is valid.
  return svixSignature.split(' ').some((entry) => {
    const sig = entry.includes(',') ? entry.split(',')[1] : entry;
    if (!sig) return false;
    let sigBuf: Buffer;
    try { sigBuf = Buffer.from(sig, 'base64'); } catch { return false; }
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

// Only the deliverability-relevant events change our stored status — "sent"/"opened"/
// "clicked" aren't tracked here (SENT is already set at send time; open/click tracking is
// a separate concern from "did it actually arrive").
const STATUS_BY_EVENT: Record<string, 'DELIVERED' | 'BOUNCED' | 'COMPLAINED'> = {
  'email.delivered': 'DELIVERED',
  'email.bounced': 'BOUNCED',
  'email.complained': 'COMPLAINED',
};

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyResendWebhook(rawBody, req.headers)) {
    console.error('Resend webhook: signature check failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true });
  }

  const eventType: string | undefined = payload?.type;
  const emailId: string | undefined = payload?.data?.email_id ?? payload?.data?.id;
  if (!eventType || !emailId) return NextResponse.json({ received: true });

  const newStatus = STATUS_BY_EVENT[eventType];
  if (!newStatus) return NextResponse.json({ received: true }); // event we don't act on

  const recipient = await prisma.emailRecipient.findUnique({ where: { resendMessageId: emailId } });
  if (!recipient) {
    // Not necessarily an error — could be a test send (no EmailRecipient row) or an event
    // that arrived before the send-side updateMany finished writing resendMessageId.
    console.error('Resend webhook: no EmailRecipient matches this message id', { emailId, eventType });
    return NextResponse.json({ received: true });
  }

  // A bounce/complaint arriving after an earlier bounce/complaint (Resend can send more
  // than one event per message) shouldn't downgrade a already-recorded worse outcome, but
  // DELIVERED should never overwrite a BOUNCED/COMPLAINED that arrived first out of order.
  if (recipient.status === 'BOUNCED' || recipient.status === 'COMPLAINED') {
    return NextResponse.json({ received: true });
  }

  await prisma.emailRecipient.update({
    where: { id: recipient.id },
    data: { status: newStatus, lastEventAt: new Date() },
  });

  return NextResponse.json({ received: true });
}
