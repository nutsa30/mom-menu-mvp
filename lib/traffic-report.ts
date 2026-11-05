import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { isSettled, refundsUsd } from './usd-settlement';

// Read-only reporting for /admin/traffic. Nothing here writes to the database.
// Money rules: gross is shown exactly as charged (GEL or USD, never converted). "Actually
// received lari" is only ever a figure the owner entered/confirmed (USD payments) or BOG's own
// net (GEL payments). No exchange rate is assumed anywhere in this file.

export type Attr = 'first' | 'last';
export type Filters = { source?: string; campaign?: string; country?: string };

const TBILISI_MS = 4 * 3600_000;
export const dayStart = (day: string) => new Date(Date.parse(day + 'T00:00:00Z') - TBILISI_MS);
export const tbilisiToday = () => new Date(Date.now() + TBILISI_MS).toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => new Date(Date.parse(day + 'T00:00:00Z') + n * 86400_000).toISOString().slice(0, 10);

export type Period = { start: Date; end: Date; from: string; to: string; days: number };
export function makePeriod(from: string, to: string): Period {
  const days = Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400_000) + 1;
  return { from, to, days, start: dayStart(from), end: dayStart(addDays(to, 1)) };
}
export function previousPeriod(p: Period): Period { return makePeriod(addDays(p.from, -p.days), addDays(p.from, -1)); }

export const landingMode = (f: Filters) => Boolean(f.source || f.campaign);

function eventCond(p: Period, f: Filters, landingOnly: boolean): Prisma.Sql {
  const c: Prisma.Sql[] = [Prisma.sql`"createdAt" >= ${p.start}`, Prisma.sql`"createdAt" < ${p.end}`];
  if (f.country) c.push(Prisma.sql`"country" = ${f.country}`);
  if (landingOnly) {
    c.push(Prisma.sql`"isLanding" = true`);
    if (f.source && f.source !== 'unknown') c.push(Prisma.sql`"source" = ${f.source}`);
    if (f.campaign) c.push(Prisma.sql`"campaign" = ${f.campaign}`);
  }
  return Prisma.join(c, ' AND ');
}
export function eventWhere(p: Period, f: Filters, landingOnly: boolean): Prisma.AnalyticsEventWhereInput {
  return {
    createdAt: { gte: p.start, lt: p.end },
    ...(f.country ? { country: f.country } : {}),
    ...(landingOnly ? {
      isLanding: true,
      ...(f.source && f.source !== 'unknown' ? { source: f.source } : {}),
      ...(f.campaign ? { campaign: f.campaign } : {}),
    } : {}),
  };
}

// Which accounts match the source / campaign / country filter, using first or last touch.
export function attrWhere(f: Filters, attr: Attr): Prisma.UserWhereInput {
  const pre = attr;
  const is: Record<string, unknown> = {};
  if (f.campaign) is[pre + 'Campaign'] = f.campaign;
  if (f.country) is.country = f.country;
  const and: Prisma.UserWhereInput[] = [];
  if (f.source === 'unknown') and.push({ OR: [{ attribution: { is: null } }, { attribution: { is: { [pre + 'Source']: null } as Prisma.UserAttributionWhereInput } }] });
  else if (f.source) is[pre + 'Source'] = f.source;
  if (Object.keys(is).length) and.push({ attribution: { is: is as Prisma.UserAttributionWhereInput } });
  return and.length ? { AND: and } : {};
}

const PAYMENT_SELECT = {
  id: true, userId: true, createdAt: true, status: true, currency: true, grossAmount: true, netAmount: true, commissionAmount: true,
  discountAmount: true, discountRefundFailed: true, creditAppliedAmount: true, creditRefundFailed: true,
  settledAmountGel: true, settledFxRate: true, cardType: true, billingIntervalMonths: true,
  user: { select: { attribution: { select: { firstSource: true, firstCampaign: true, firstContent: true, lastSource: true, lastCampaign: true, lastContent: true, country: true } } } },
} satisfies Prisma.PaymentSelect;
export type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof PAYMENT_SELECT }>;

const round2 = (n: number) => Math.round(n * 100) / 100;

export type Money = {
  payments: number; grossGel: number; grossUsd: number; paymentsGel: number; paymentsUsd: number;
  receivedGel: number;            // lari actually received: BOG net for GEL payments + owner-confirmed lari for USD payments
  usdUnconfirmed: number; usdUnconfirmedGross: number;   // USD payments whose received lari has not been entered yet
  referralRefundGel: number; referralRefundUsd: number;
};
export function emptyMoney(): Money {
  return { payments: 0, grossGel: 0, grossUsd: 0, paymentsGel: 0, paymentsUsd: 0, receivedGel: 0, usdUnconfirmed: 0, usdUnconfirmedGross: 0, referralRefundGel: 0, referralRefundUsd: 0 };
}
export function addPayment(m: Money, p: PaymentRow) {
  m.payments += 1;
  const refund = refundsUsd(p);   // generic: referral discount / credit that really went back to the customer
  if (p.currency === 'USD') {
    m.paymentsUsd += 1; m.grossUsd += p.grossAmount; m.referralRefundUsd += refund;
    if (isSettled(p)) m.receivedGel += p.settledAmountGel! - refund * p.settledFxRate!;
    else { m.usdUnconfirmed += 1; m.usdUnconfirmedGross += p.grossAmount; }
  } else {
    m.paymentsGel += 1; m.grossGel += p.grossAmount; m.referralRefundGel += refund;
    m.receivedGel += (p.netAmount ?? p.grossAmount - (p.commissionAmount ?? 0)) - refund;
  }
}
export function finishMoney(m: Money): Money {
  return { ...m, grossGel: round2(m.grossGel), grossUsd: round2(m.grossUsd), receivedGel: round2(m.receivedGel), usdUnconfirmedGross: round2(m.usdUnconfirmedGross), referralRefundGel: round2(m.referralRefundGel), referralRefundUsd: round2(m.referralRefundUsd) };
}

async function matchingUserIds(f: Filters, attr: Attr): Promise<string[] | null> {
  const where = attrWhere(f, attr);
  if (!Object.keys(where).length) return null;
  return (await prisma.user.findMany({ where: { ...where, role: 'USER' }, select: { id: true } })).map(u => u.id);
}

export type Summary = {
  visitors: number; pageViews: number; sessions: number; registrations: number;
  checkouts: number; newPayers: number; money: Money;
};

// One period's headline numbers (used for the current period and, with the same filters, the comparison).
export async function summarize(p: Period, f: Filters, attr: Attr): Promise<{ summary: Summary; payments: PaymentRow[]; payerIds: string[] }> {
  const landing = landingMode(f);
  const cond = eventCond(p, f, landing);
  const ids = await matchingUserIds(f, attr);
  const userFilter = ids ? { in: ids } : undefined;
  const [vis, views, sessions, registrations, checkouts, payments] = await Promise.all([
    prisma.$queryRaw<{ n: number }[]>(Prisma.sql`SELECT COUNT(DISTINCT "visitorKey")::int AS n FROM "AnalyticsEvent" WHERE ${cond}`),
    prisma.analyticsEvent.count({ where: eventWhere(p, f, landing) }),
    prisma.analyticsEvent.count({ where: eventWhere(p, f, true) }),
    prisma.user.count({ where: { createdAt: { gte: p.start, lt: p.end }, role: 'USER', ...attrWhere(f, attr) } }),
    prisma.checkoutOrder.findMany({ where: { createdAt: { gte: p.start, lt: p.end }, ...(userFilter ? { userId: userFilter } : {}) }, distinct: ['userId'], select: { userId: true } }),
    prisma.payment.findMany({ where: { status: 'SUCCESS', createdAt: { gte: p.start, lt: p.end }, ...(userFilter ? { userId: userFilter } : {}) }, select: PAYMENT_SELECT, orderBy: { createdAt: 'desc' } }),
  ]);
  const payerIds = [...new Set(payments.map(x => x.userId).filter((x): x is string => Boolean(x)))];
  // "New paying customer" = their very first successful payment ever happened inside this period.
  const earlier = payerIds.length ? await prisma.payment.groupBy({ by: ['userId'], where: { status: 'SUCCESS', userId: { in: payerIds }, createdAt: { lt: p.start } }, _count: { _all: true } }) : [];
  const hadBefore = new Set(earlier.map(e => e.userId));
  const money = emptyMoney();
  for (const x of payments) addPayment(money, x);
  return {
    summary: {
      visitors: vis[0]?.n ?? 0, pageViews: views, sessions, registrations, checkouts: checkouts.length,
      newPayers: payerIds.filter(id => !hadBefore.has(id)).length, money: finishMoney(money),
    },
    payments, payerIds,
  };
}

export async function dailySeries(p: Period, f: Filters) {
  const cond = eventCond(p, f, landingMode(f));
  const rows = await prisma.$queryRaw<{ day: string; visitors: number; views: number }[]>(Prisma.sql`
    SELECT to_char(("createdAt" + interval '4 hours'), 'YYYY-MM-DD') AS day,
           COUNT(DISTINCT "visitorKey")::int AS visitors, COUNT(*)::int AS views
    FROM "AnalyticsEvent" WHERE ${cond} GROUP BY 1 ORDER BY 1`);
  const map = new Map(rows.map(r => [r.day, r]));
  const out: { day: string; visitors: number; views: number }[] = [];
  for (let i = 0; i < p.days; i++) { const day = addDays(p.from, i); out.push(map.get(day) ?? { day, visitors: 0, views: 0 }); }
  return out;
}

export async function pageKindVisitors(p: Period, f: Filters) {
  const rows = await prisma.$queryRaw<{ kind: string; n: number }[]>(Prisma.sql`
    SELECT "pageKind" AS kind, COUNT(DISTINCT "visitorKey")::int AS n FROM "AnalyticsEvent"
    WHERE ${eventCond(p, f, false)} GROUP BY 1`);
  return Object.fromEntries(rows.map(r => [r.kind ?? 'other', r.n])) as Record<string, number>;
}

export async function countryVisitors(p: Period, f: Filters) {
  return prisma.$queryRaw<{ country: string | null; visitors: number; sessions: number }[]>(Prisma.sql`
    SELECT "country", COUNT(DISTINCT "visitorKey")::int AS visitors, (COUNT(*) FILTER (WHERE "isLanding"))::int AS sessions
    FROM "AnalyticsEvent" WHERE ${eventCond(p, f, landingMode(f))} GROUP BY 1 ORDER BY 2 DESC LIMIT 40`);
}

export async function landingGroups(p: Period, f: Filters) {
  const where = eventWhere(p, f, true);
  const [paths, sources, campaigns, contents, devices, browsers, systems, kinds] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ['path'], where, _count: { _all: true }, orderBy: { _count: { path: 'desc' } }, take: 12 }),
    prisma.analyticsEvent.groupBy({ by: ['source'], where, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ['source', 'medium', 'campaign'], where: { ...where, campaign: { not: null } }, _count: { _all: true }, orderBy: { _count: { campaign: 'desc' } }, take: 30 }),
    prisma.analyticsEvent.groupBy({ by: ['source', 'campaign', 'content'], where: { ...where, content: { not: null } }, _count: { _all: true }, orderBy: { _count: { content: 'desc' } }, take: 30 }),
    prisma.analyticsEvent.groupBy({ by: ['device'], where, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ['browser'], where, _count: { _all: true }, orderBy: { _count: { browser: 'desc' } }, take: 8 }),
    prisma.analyticsEvent.groupBy({ by: ['os'], where, _count: { _all: true }, orderBy: { _count: { os: 'desc' } }, take: 8 }),
    prisma.analyticsEvent.groupBy({ by: ['isNewVisitor', 'consented'], where, _count: { _all: true } }),
  ]);
  return { paths, sources, campaigns, contents, devices, browsers, systems, kinds };
}

export async function usersInPeriod(p: Period, f: Filters, attr: Attr) {
  return prisma.user.findMany({
    where: { createdAt: { gte: p.start, lt: p.end }, role: 'USER', ...attrWhere(f, attr) },
    select: { id: true, attribution: { select: { firstSource: true, firstCampaign: true, firstContent: true, lastSource: true, lastCampaign: true, lastContent: true, country: true } } },
  });
}

export async function latestRegistrations(f: Filters, attr: Attr) {
  const users = await prisma.user.findMany({
    where: { role: 'USER', ...attrWhere(f, attr) }, orderBy: { createdAt: 'desc' }, take: 25,
    select: {
      id: true, name: true, email: true, createdAt: true, market: true, subscriptionStatus: true,
      attribution: { select: { signupMethod: true, consented: true, firstSource: true, firstCampaign: true, firstContent: true, lastSource: true, lastCampaign: true, country: true, city: true, device: true, browser: true } },
    },
  });
  const paid = users.length ? await prisma.payment.findMany({ where: { userId: { in: users.map(u => u.id) }, status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] }) : [];
  const paidSet = new Set(paid.map(x => x.userId));
  return users.map(u => ({ ...u, paid: paidSet.has(u.id) }));
}

export async function failedAndRefunded(p: Period, userIds: string[] | null) {
  const base = { createdAt: { gte: p.start, lt: p.end }, ...(userIds ? { userId: { in: userIds } } : {}) };
  const [failed, reasons, refunded] = await Promise.all([
    prisma.payment.count({ where: { ...base, status: 'FAILED' } }),
    prisma.payment.groupBy({ by: ['failureReason'], where: { ...base, status: 'FAILED' }, _count: { _all: true }, orderBy: { _count: { failureReason: 'desc' } }, take: 5 }),
    prisma.payment.findMany({ where: { ...base, status: 'REFUNDED' }, select: { currency: true, grossAmount: true } }),
  ]);
  return {
    failed, reasons,
    refundedCount: refunded.length,
    refundedGel: round2(refunded.filter(r => r.currency !== 'USD').reduce((s, r) => s + r.grossAmount, 0)),
    refundedUsd: round2(refunded.filter(r => r.currency === 'USD').reduce((s, r) => s + r.grossAmount, 0)),
  };
}
export { matchingUserIds };
