import { createHmac } from 'crypto';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geoFromHeaders } from '@/lib/attribution';
import { classifyTouch, pageKind, trackablePath } from '@/lib/traffic-source';
import { parseUserAgent } from '@/lib/user-agent';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RETENTION_DAYS = 400;

// Best-effort per-instance rate limit (the hash only lives in memory, never in the database).
const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string) {
  const now = Date.now();
  const hit = hits.get(key);
  if (!hit || hit.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(key, { n: 1, reset: now + 60_000 });
    return false;
  }
  hit.n += 1;
  return hit.n > 90;
}

function dayKey() {
  return new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10); // Tbilisi calendar day
}

// "Declined cookies" visitors: a hash of (secret + day + IP + browser). It cannot be reversed
// and changes every day, so it never identifies or follows a person.
function anonymousKey(ip: string, ua: string) {
  const secret = process.env.ANALYTICS_SALT || process.env.JWT_SECRET || 'mommenu-analytics';
  return 'a:' + createHmac('sha256', secret).update(`${dayKey()}|${ip}|${ua}`).digest('hex').slice(0, 20);
}

function str(v: unknown, max = 200) { return typeof v === 'string' ? v.slice(0, max) : undefined; }
const none = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  try {
    const text = await req.text();
    if (text.length > 4000) return none();
    const body = JSON.parse(text);
    const h = req.headers;
    const uaString = h.get('user-agent') || '';
    const ua = parseUserAgent(uaString);
    if (ua.bot) return none();

    const path = trackablePath(body?.path);
    if (!path) return none();

    const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '').split(',')[0].trim() || 'unknown';
    if (limited(ip + '|' + uaString.slice(0, 80))) return none();

    // The owner and staff browsing the site must not pollute visitor statistics.
    const session = await getSession().catch(() => null);
    if (session?.role === 'ADMIN') return none();

    const consented = body?.consent === true && typeof body?.vid === 'string' && UUID.test(body.vid);
    const visitorKey = consented ? 'v:' + body.vid : anonymousKey(ip, uaString);
    const landing = body?.landing === true;

    // Source / campaign are only worked out for the first page of a visit.
    const input = body?.touch && typeof body.touch === 'object' ? body.touch : {};
    const touch = landing ? classifyTouch({
      utm_source: str(input.utm_source), utm_medium: str(input.utm_medium), utm_campaign: str(input.utm_campaign),
      utm_content: str(input.utm_content), utm_term: str(input.utm_term),
      fbclid: str(input.fbclid, 10), gclid: str(input.gclid, 10), gbraid: str(input.gbraid, 10), wbraid: str(input.wbraid, 10),
      ttclid: str(input.ttclid, 10), epik: str(input.epik, 10), msclkid: str(input.msclkid, 10),
      referrer: str(body?.referrer, 300), ownHost: h.get('host'),
    }) : null;
    const geo = geoFromHeaders(h);

    await prisma.analyticsEvent.create({
      data: {
        type: 'page_view', visitorKey, consented, isNewVisitor: consented ? body.isNew === true : null,
        isLanding: landing, path, pageKind: pageKind(path),
        source: touch?.source, medium: touch?.medium, campaign: touch?.campaign, content: touch?.content, term: touch?.term,
        utmSource: touch?.utmSource, referrerHost: touch?.referrerHost,
        country: geo.country, region: geo.region, city: geo.city,
        device: ua.device, browser: ua.browser, os: ua.os,
      },
    });

    // Housekeeping without a cron job: now and then drop rows past the retention window.
    if (Math.random() < 0.005) {
      await prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION_DAYS * 86400_000) } } }).catch(() => {});
    }
    return none();
  } catch {
    return none(); // Analytics must never produce errors for visitors.
  }
}
