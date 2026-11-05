import { requireAdmin } from '@/lib/auth';
import {
  addDays, countryVisitors, dailySeries, failedAndRefunded, landingGroups, landingMode, latestRegistrations, makePeriod,
  matchingUserIds, pageKindVisitors, previousPeriod, summarize, tbilisiToday, usersInPeriod,
  emptyMoney, addPayment, finishMoney,
  type Attr, type Filters, type Money, type PaymentRow, type Summary,
} from '@/lib/traffic-report';

export const dynamic = 'force-dynamic';

type SP = { range?: string; from?: string; to?: string; compare?: string; attr?: string; source?: string; campaign?: string; country?: string };

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', pinterest: 'Pinterest', tiktok: 'TikTok', google: 'Google',
  direct: 'პირდაპირი (direct)', referral: 'სხვა საიტიდან (referral)', other: 'სხვა', unknown: 'უცნობი (cookie არ დათანხმდა)',
};
const srcLabel = (s?: string | null) => SOURCE_LABEL[s || 'unknown'] ?? s ?? 'უცნობი';
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (v?: string) => (v && /^[\p{L}\p{N} _.+:|/-]{1,100}$/u.test(v) ? v : undefined);

function countryName(code?: string | null) {
  if (!code) return 'უცნობი';
  try { return new Intl.DisplayNames(['ka'], { type: 'region' }).of(code) || code; } catch { return code; }
}
const n0 = (n: number) => new Intl.NumberFormat('en-US').format(n);
const n2 = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const pct = (a: number, b: number) => (b > 0 ? `${(Math.round((a / b) * 1000) / 10).toString()}%` : '-');

function delta(cur: number, prev: number | undefined) {
  if (prev === undefined) return null;
  if (prev === 0) return cur === 0 ? <span className="text-xs text-[#465940]/50">0%</span> : <span className="text-xs text-[#465940]/50">ახალი</span>;
  const d = ((cur - prev) / prev) * 100;
  const up = d >= 0;
  return <span className={`text-xs font-semibold ${up ? 'text-[#2f7a3b]' : 'text-[#b3402f]'}`}>{up ? '▲' : '▼'} {Math.abs(Math.round(d))}% <span className="font-normal text-[#465940]/50">(წინა: {n0(prev)})</span></span>;
}

function Card({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return <section className="rounded-2xl bg-[#FDFBF0] p-4 text-[#465940] sm:p-5">
    <h2 className="mb-1 text-base font-bold">{title}</h2>
    {note && <p className="mb-3 text-xs leading-relaxed text-[#465940]/65">{note}</p>}
    {children}
  </section>;
}
function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-sm">
    <thead><tr className="border-b border-[#465940]/15 text-left text-xs uppercase tracking-wide text-[#465940]/60">
      {head.map((h, i) => <th key={i} className={`py-2 pr-3 font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>)}
    </tr></thead>
    <tbody>{rows.length ? rows.map((r, i) => <tr key={i} className="border-b border-[#465940]/10 last:border-0">
      {r.map((c, j) => <td key={j} className={`py-2 pr-3 tabular-nums ${j > 0 ? 'text-right' : 'font-medium'}`}>{c}</td>)}
    </tr>) : <tr><td colSpan={head.length} className="py-4 text-center text-[#465940]/50">{empty || 'მონაცემი ჯერ არ არის'}</td></tr>}</tbody>
  </table></div>;
}

export default async function TrafficPage(props: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await props.searchParams;
  const today = tbilisiToday();
  const range = sp.range === 'today' || sp.range === '7' || sp.range === '90' || sp.range === 'custom' ? sp.range : '30';
  let from = addDays(today, -29), to = today;
  if (range === 'today') from = today;
  else if (range === '7') from = addDays(today, -6);
  else if (range === '90') from = addDays(today, -89);
  else if (range === 'custom' && sp.from && sp.to && DAY_RE.test(sp.from) && DAY_RE.test(sp.to) && sp.from <= sp.to && sp.to <= today) {
    from = sp.from; to = sp.to;
    if (Date.parse(to) - Date.parse(from) > 366 * 86400_000) from = addDays(to, -365);
  }
  const period = makePeriod(from, to);
  const compare = sp.compare === '1';
  const attr: Attr = sp.attr === 'last' ? 'last' : 'first';
  const filters: Filters = {
    source: sp.source && (sp.source in SOURCE_LABEL) ? sp.source : undefined,
    campaign: clean(sp.campaign),
    country: sp.country && /^[A-Z]{2}$/.test(sp.country) ? sp.country : undefined,
  };
  const filtered = Boolean(filters.source || filters.campaign || filters.country);
  const lMode = landingMode(filters);

  const href = (over: Partial<Record<keyof SP, string | undefined>>) => {
    const base: Record<string, string | undefined> = { range, from: range === 'custom' ? from : undefined, to: range === 'custom' ? to : undefined, compare: compare ? '1' : undefined, attr: attr === 'last' ? 'last' : undefined, ...filters, ...over };
    const q = new URLSearchParams(Object.entries(base).filter(([, v]) => v) as [string, string][]).toString();
    return '/admin/traffic' + (q ? '?' + q : '');
  };

  const cur = await summarize(period, filters, attr);
  const prevP = previousPeriod(period);
  const [prev, series, kinds, countries, groups, periodUsers, latest, ids] = await Promise.all([
    compare ? summarize(prevP, filters, attr) : Promise.resolve(null),
    dailySeries(period, filters),
    pageKindVisitors(period, filters),
    countryVisitors(period, filters),
    landingGroups(period, filters),
    usersInPeriod(period, filters, attr),
    latestRegistrations(filters, attr),
    matchingUserIds(filters, attr),
  ]);
  const fr = await failedAndRefunded(period, ids);
  const S = cur.summary; const P: Summary | undefined = prev?.summary;
  const pre = attr; // 'first' | 'last'

  // ---- join registrations and payments to the source / country / campaign they came from ----
  type Bucket = { sessions: number; regs: number; payers: Set<string>; money: Money };
  const mk = (): Bucket => ({ sessions: 0, regs: 0, payers: new Set(), money: emptyMoney() });
  const bySource = new Map<string, Bucket>(), byCountry = new Map<string, Bucket>(), byCampaign = new Map<string, Bucket & { source: string; campaign: string }>(), byContent = new Map<string, Bucket & { source: string; campaign: string; content: string }>();
  const get = <T extends Bucket>(m: Map<string, T>, k: string, init: () => T) => { let b = m.get(k); if (!b) { b = init(); m.set(k, b); } return b; };
  const A = (a: any) => ({
    source: (a?.[pre + 'Source'] as string | null) || 'unknown',
    campaign: (a?.[pre + 'Campaign'] as string | null) || null,
    content: (a?.[pre + 'Content'] as string | null) || null,
    country: (a?.country as string | null) || 'unknown',
  });
  for (const g of groups.sources) get(bySource, g.source || 'unknown', mk).sessions += g._count._all;
  for (const c of countries) get(byCountry, c.country || 'unknown', mk).sessions += c.sessions;
  for (const g of groups.campaigns) { const b = get(byCampaign, `${g.source}|${g.campaign}`, () => ({ ...mk(), source: g.source || 'unknown', campaign: g.campaign || '' })); b.sessions += g._count._all; }
  for (const g of groups.contents) { const b = get(byContent, `${g.source}|${g.campaign}|${g.content}`, () => ({ ...mk(), source: g.source || 'unknown', campaign: g.campaign || '', content: g.content || '' })); b.sessions += g._count._all; }
  for (const u of periodUsers) {
    const a = A(u.attribution);
    get(bySource, a.source, mk).regs += 1; get(byCountry, a.country, mk).regs += 1;
    if (a.campaign) get(byCampaign, `${a.source}|${a.campaign}`, () => ({ ...mk(), source: a.source, campaign: a.campaign! })).regs += 1;
    if (a.content) get(byContent, `${a.source}|${a.campaign}|${a.content}`, () => ({ ...mk(), source: a.source, campaign: a.campaign || '', content: a.content! })).regs += 1;
  }
  for (const p of cur.payments as PaymentRow[]) {
    const a = A(p.user?.attribution);
    const buckets: Bucket[] = [get(bySource, a.source, mk), get(byCountry, a.country, mk)];
    if (a.campaign) buckets.push(get(byCampaign, `${a.source}|${a.campaign}`, () => ({ ...mk(), source: a.source, campaign: a.campaign! })));
    if (a.content) buckets.push(get(byContent, `${a.source}|${a.campaign}|${a.content}`, () => ({ ...mk(), source: a.source, campaign: a.campaign || '', content: a.content! })));
    for (const b of buckets) { addPayment(b.money, p); if (p.userId) b.payers.add(p.userId); }
  }
  const moneyCell = (m: Money) => {
    const f = finishMoney(m);
    const parts = [f.grossGel ? `${n2(f.grossGel)} ₾` : '', f.grossUsd ? `$${n2(f.grossUsd)}` : ''].filter(Boolean);
    return parts.length ? parts.join(' + ') : '-';
  };
  const receivedCell = (m: Money) => {
    const f = finishMoney(m);
    if (!f.payments) return '-';
    return <>{n2(f.receivedGel)} ₾{f.usdUnconfirmed ? <span className="ml-1 text-xs text-[#b3402f]" title="ამ გადახდების ჩარიცხული ლარი ჯერ არ არის შეყვანილი">+{f.usdUnconfirmed}?</span> : null}</>;
  };
  const sortedBuckets = <T extends Bucket>(m: Map<string, T>) => [...m.entries()].sort((a, b) => b[1].payers.size - a[1].payers.size || b[1].regs - a[1].regs || b[1].sessions - a[1].sessions);

  // ---- funnel ----
  const funnel: { label: string; value: number; hint?: string }[] = lMode ? [
    { label: 'ვიზიტები (შესვლები საიტზე)', value: S.sessions },
    { label: 'დარეგისტრირდა', value: S.registrations },
    { label: 'დაიწყო გადახდა (checkout)', value: S.checkouts },
    { label: 'ახალი გადამხდელი', value: S.newPayers },
  ] : [
    { label: 'ვიზიტორები', value: S.visitors },
    { label: 'მთავარი გვერდი', value: kinds.home ?? 0 },
    { label: 'მენიუს / რეცეპტის გვერდი', value: kinds.menu ?? 0 },
    { label: 'რეგისტრაციის გვერდი', value: kinds.register ?? 0 },
    { label: 'დარეგისტრირდა (ანგარიში შეიქმნა)', value: S.registrations },
    { label: 'პაკეტების გვერდი', value: kinds.pricing ?? 0 },
    { label: 'დაიწყო გადახდა (checkout)', value: S.checkouts },
    { label: 'ახალი გადამხდელი', value: S.newPayers },
  ];

  // ---- daily chart ----
  const maxV = Math.max(1, ...series.map(d => d.visitors));
  const W = 720, H = 160, padL = 34, padB = 20, padT = 8;
  const bw = (W - padL) / series.length;

  const money = S.money; const pm = P?.money;
  const aovGel = money.paymentsGel ? money.grossGel / money.paymentsGel : 0;
  const aovUsd = money.paymentsUsd ? money.grossUsd / money.paymentsUsd : 0;
  const newKinds = groups.kinds;
  const kindCount = (isNew: boolean | null, consented: boolean) => newKinds.filter(k => k.isNewVisitor === isNew && k.consented === consented).reduce((s, k) => s + k._count._all, 0);
  const newV = kindCount(true, true), retV = kindCount(false, true), anonV = newKinds.filter(k => !k.consented).reduce((s, k) => s + k._count._all, 0);

  const RangeLink = ({ id, label }: { id: string; label: string }) =>
    <a href={href({ range: id, from: undefined, to: undefined })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${range === id ? 'bg-[#FDFBF0] text-[#465940]' : 'border border-[#FDFBF0]/30 text-[#FDFBF0]/80 hover:bg-[#FDFBF0]/10'}`}>{label}</a>;

  return <main className="w-full max-w-6xl space-y-4 p-4 sm:p-8">
    <div>
      <h1 className="text-2xl font-bold text-[#FDFBF0]">ტრაფიკი და წყაროები</h1>
      <p className="mt-1 text-sm text-[#FDFBF0]/70">ვინ საიდან მოდის, ვინ რეგისტრირდება და ვინ იხდის. პერიოდი: {from === to ? from : `${from} - ${to}`} (თბილისის დროით)</p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <RangeLink id="today" label="დღეს" /><RangeLink id="7" label="7 დღე" /><RangeLink id="30" label="30 დღე" /><RangeLink id="90" label="90 დღე" />
      <form method="get" action="/admin/traffic" className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="range" value="custom" />
        {compare && <input type="hidden" name="compare" value="1" />}
        {attr === 'last' && <input type="hidden" name="attr" value="last" />}
        {filters.source && <input type="hidden" name="source" value={filters.source} />}
        {filters.campaign && <input type="hidden" name="campaign" value={filters.campaign} />}
        {filters.country && <input type="hidden" name="country" value={filters.country} />}
        <input id="traffic-from" type="date" name="from" defaultValue={from} max={today} className="rounded-lg bg-[#FDFBF0] px-2 py-1 text-xs text-[#465940]" />
        <input id="traffic-to" type="date" name="to" defaultValue={to} max={today} className="rounded-lg bg-[#FDFBF0] px-2 py-1 text-xs text-[#465940]" />
        <button className="rounded-full border border-[#FDFBF0]/30 px-3 py-1.5 text-xs font-bold text-[#FDFBF0]/80 hover:bg-[#FDFBF0]/10">არჩევა</button>
      </form>
      <a href={href({ compare: compare ? undefined : '1' })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${compare ? 'bg-[#FDFBF0] text-[#465940]' : 'border border-[#FDFBF0]/30 text-[#FDFBF0]/80 hover:bg-[#FDFBF0]/10'}`}>წინა პერიოდთან შედარება</a>
      <a href={href({ attr: attr === 'first' ? 'last' : undefined })} className="rounded-full border border-[#FDFBF0]/30 px-3 py-1.5 text-xs font-bold text-[#FDFBF0]/80 hover:bg-[#FDFBF0]/10"
         title="რეგისტრაცია და გადახდა მიეწერება ადამიანის პირველ ან ბოლო წყაროს">ათვლა: {attr === 'first' ? 'პირველი წყარო' : 'ბოლო წყარო'} (შეცვლა)</a>
    </div>

    {filtered && <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#FDFBF0]/10 p-3 text-sm text-[#FDFBF0]">
      <span className="font-semibold">ფილტრი:</span>
      {filters.source && <span className="rounded-full bg-[#FDFBF0] px-3 py-1 text-xs font-bold text-[#465940]">{srcLabel(filters.source)}</span>}
      {filters.campaign && <span className="rounded-full bg-[#FDFBF0] px-3 py-1 text-xs font-bold text-[#465940]">კამპანია: {filters.campaign}</span>}
      {filters.country && <span className="rounded-full bg-[#FDFBF0] px-3 py-1 text-xs font-bold text-[#465940]">{countryName(filters.country)}</span>}
      <a href={href({ source: undefined, campaign: undefined, country: undefined })} className="ml-auto text-xs font-bold underline">ფილტრის მოხსნა</a>
      {lMode && <p className="w-full text-xs text-[#FDFBF0]/70">წყაროს/კამპანიის ფილტრზე ვიზიტები ითვლება „შესვლებით“ (საიტზე პირველი გვერდი), რადგან წყარო მხოლოდ შესვლისას ფიქსირდება.</p>}
    </div>}

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { l: lMode ? 'ვიზიტები' : 'ვიზიტორები', v: lMode ? S.sessions : S.visitors, p: lMode ? P?.sessions : P?.visitors },
        { l: 'გვერდების ნახვა', v: S.pageViews, p: P?.pageViews },
        { l: 'რეგისტრაციები', v: S.registrations, p: P?.registrations },
        { l: 'ახალი გადამხდელები', v: S.newPayers, p: P?.newPayers },
        { l: 'გადახდის დაწყება', v: S.checkouts, p: P?.checkouts },
        { l: 'წარმატებული გადახდები', v: money.payments, p: pm?.payments },
      ].map(k => <div key={k.l} className="rounded-2xl bg-[#FDFBF0] p-4 text-[#465940]">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#465940]/60">{k.l}</div>
        <div className="text-3xl font-extrabold tabular-nums">{n0(k.v)}</div>
        {delta(k.v, k.p)}
      </div>)}
      <div className="rounded-2xl bg-[#FDFBF0] p-4 text-[#465940]"><div className="text-xs font-semibold uppercase tracking-wide text-[#465940]/60">ვიზიტორი → რეგისტრაცია</div><div className="text-3xl font-extrabold tabular-nums">{pct(S.registrations, lMode ? S.sessions : S.visitors)}</div></div>
      <div className="rounded-2xl bg-[#FDFBF0] p-4 text-[#465940]"><div className="text-xs font-semibold uppercase tracking-wide text-[#465940]/60">რეგისტრაცია → გადახდა</div><div className="text-3xl font-extrabold tabular-nums">{pct(S.newPayers, S.registrations)}</div></div>
    </div>

    <Card title="შემოსავალი" note="ბრუტო = რაც მომხმარებელმა გადაიხადა, თავის ვალუტაში (კურსით არაფერი გადაყვანილია). „რეალურად ჩარიცხული ₾“ = GEL გადახდებზე ბანკის ნეტო, USD გადახდებზე კი მხოლოდ ის ლარი, რაც შენ შეიყვანე ანალიტიკის გვერდზე. სავარაუდო კურსით არაფერი ითვლება.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><div className="text-xs text-[#465940]/60">ბრუტო, ლარში გადახდილი</div><div className="text-2xl font-extrabold tabular-nums">{n2(money.grossGel)} ₾</div><div className="text-xs text-[#465940]/60">{money.paymentsGel} გადახდა · საშ. ჩეკი {n2(aovGel)} ₾</div>{pm && <div>{delta(money.grossGel, pm.grossGel)}</div>}</div>
        <div><div className="text-xs text-[#465940]/60">ბრუტო, დოლარში გადახდილი</div><div className="text-2xl font-extrabold tabular-nums">${n2(money.grossUsd)}</div><div className="text-xs text-[#465940]/60">{money.paymentsUsd} გადახდა · საშ. ჩეკი ${n2(aovUsd)}</div>{pm && <div>{delta(money.grossUsd, pm.grossUsd)}</div>}</div>
        <div><div className="text-xs text-[#465940]/60">რეალურად ჩარიცხული ₾</div><div className="text-2xl font-extrabold tabular-nums">{n2(money.receivedGel)} ₾</div>
          {money.usdUnconfirmed > 0 && <div className="text-xs font-semibold text-[#b3402f]">+ {money.usdUnconfirmed} USD გადახდა (${n2(money.usdUnconfirmedGross)}) - ჩარიცხული ლარი შესატანია <a className="underline" href="/admin/analytics?market=INTL">ანალიტიკაში</a></div>}</div>
        <div><div className="text-xs text-[#465940]/60">დაბრუნებები</div><div className="text-sm">რეფერალური ფასდაკლება/კრედიტი: {n2(money.referralRefundGel)} ₾{money.referralRefundUsd ? ` + $${n2(money.referralRefundUsd)}` : ''}</div><div className="text-sm">სრული დაბრუნება (REFUNDED): {fr.refundedCount} · {n2(fr.refundedGel)} ₾{fr.refundedUsd ? ` + $${n2(fr.refundedUsd)}` : ''}</div><div className="text-sm">წარუმატებელი გადახდა: {fr.failed}</div></div>
      </div>
      {fr.reasons.length > 0 && fr.reasons.some(r => r.failureReason) && <p className="mt-3 text-xs text-[#465940]/70">წარუმატებლობის მიზეზები: {fr.reasons.filter(r => r.failureReason).map(r => `${r.failureReason} (${r._count._all})`).join('; ')}</p>}
    </Card>

    <Card title="ვიზიტორები დღეების მიხედვით" note="ზოგი სტუმარი cookie-ზე უარს ამბობს. ასეთი სტუმარი ერთ დღეში ზუსტად ითვლება, მაგრამ მრავალი დღის ჯამში იგივე ადამიანი შეიძლება რამდენჯერმე ჩაითვალოს. ამიტომ 7/30/90 დღის ვიზიტორთა რიცხვი ოდნავ მაღალია.">
      <svg viewBox={`0 0 ${W} ${H + padB}`} className="w-full" role="img" aria-label="ვიზიტორები დღეების მიხედვით">
        {[0, 0.5, 1].map(t => { const y = padT + (H - padT) * (1 - t); return <g key={t}><line x1={padL} x2={W} y1={y} y2={y} stroke="#465940" strokeOpacity="0.12" /><text x={padL - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#465940" fillOpacity="0.7">{Math.round(maxV * t)}</text></g>; })}
        {series.map((d, i) => { const h = ((H - padT) * d.visitors) / maxV; return <rect key={d.day} x={padL + i * bw + bw * 0.12} y={H - h} width={Math.max(1, bw * 0.76)} height={h} fill="#465940" rx="1.5"><title>{d.day}: {d.visitors} ვიზიტორი, {d.views} ნახვა</title></rect>; })}
        <text x={padL} y={H + 14} fontSize="9" fill="#465940" fillOpacity="0.7">{series[0]?.day}</text>
        <text x={W} y={H + 14} textAnchor="end" fontSize="9" fill="#465940" fillOpacity="0.7">{series[series.length - 1]?.day}</text>
      </svg>
    </Card>

    <Card title="გზა ვიზიტიდან გადახდამდე" note={lMode ? 'ფილტრის დროს ვნახავთ მხოლოდ ამ წყაროდან/კამპანიიდან მოსულ ადამიანებს.' : 'ეტაპები ერთმანეთს მკაცრად არ მოიცავს (მაგალითად, Google-ით რეგისტრაცია რეგისტრაციის გვერდს არ გადის), ამიტომ პროცენტი ორიენტირია, ზუსტი ჯაჭვი არა.'}>
      <div className="space-y-2">{funnel.map((st, i) => {
        const first = funnel[0].value || 1; const prevV = i ? funnel[i - 1].value : 0;
        const w = Math.max(2, Math.min(100, (st.value / first) * 100));
        return <div key={st.label}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm"><span className="font-medium">{st.label}</span>
            <span className="tabular-nums"><strong>{n0(st.value)}</strong> <span className="text-xs text-[#465940]/60">{i ? `· წინა ეტაპიდან ${prevV > 0 ? Math.min(100, Math.round((st.value / prevV) * 1000) / 10) + '%' : '-'}${prevV > st.value ? ` · გავარდა ${n0(prevV - st.value)} (${pct(prevV - st.value, prevV)})` : ''}` : ''}</span></span></div>
          <div className="mt-1 h-2.5 rounded-full bg-[#465940]/10"><div className="h-2.5 rounded-full bg-[#465940]" style={{ width: `${w}%` }} /></div>
        </div>;
      })}</div>
    </Card>

    <Card title="წყაროები" note="„ვიზიტები“ ითვლის ყველას (cookie-ს დათანხმებულსაც და უარმთქმელსაც). რეგისტრაცია და შემოსავალი წყაროსთან მხოლოდ იმ ადამიანებზე ებმება, ვინც cookie-ს დათანხმდა; დანარჩენი „უცნობში“ ხვდება. ამიტომ კონვერსია წყაროების მიხედვით ოდნავ დაბალი ჩანს. დაკლიკე წყაროს დეტალებისთვის.">
      <Table head={['წყარო', 'ვიზიტები', 'რეგისტრაცია', 'გადამხდელი', 'ბრუტო', 'ჩარიცხული ₾']} rows={sortedBuckets(bySource).map(([k, b]) => [
        <a key={k} className="underline decoration-dotted" href={href({ source: k })}>{srcLabel(k)}</a>, n0(b.sessions), n0(b.regs), n0(b.payers.size), moneyCell(b.money), receivedCell(b.money)])} />
    </Card>

    <Card title="ქვეყნები" note="ვიზიტორები ქვეყნის მიხედვით (IP-ს მიახლოებითი ადგილი, VPN-ს ვერ ცნობს). რეგისტრაცია და შემოსავალი - ქვეყანა, საიდანაც ადამიანი დარეგისტრირდა.">
      <Table head={['ქვეყანა', 'ვიზიტორი', 'ვიზიტი', 'რეგისტრაცია', 'გადამხდელი', 'ბრუტო', 'ჩარიცხული ₾']} rows={[...byCountry.entries()].map(([k]) => k).filter((k, i, a) => a.indexOf(k) === i).map(k => {
        const b = byCountry.get(k)!; const v = countries.find(c => (c.country || 'unknown') === k);
        return { k, b, visitors: v?.visitors ?? 0 };
      }).sort((x, y) => y.visitors - x.visitors || y.b.regs - x.b.regs).slice(0, 25).map(({ k, b, visitors }) => [
        k === 'unknown' ? 'უცნობი' : <a key={k} className="underline decoration-dotted" href={href({ country: k })}>{countryName(k)} ({k})</a>, n0(visitors), n0(b.sessions), n0(b.regs), n0(b.payers.size), moneyCell(b.money), receivedCell(b.money)])} />
    </Card>

    <Card title="რეკლამის კამპანიები (utm_campaign)" note="კამპანიის სახელი მოდის ბმულიდან. თუ ბმულს utm_campaign არ აქვს, აქ ვერ გამოჩნდება.">
      <Table head={['კამპანია', 'წყარო', 'ვიზიტები', 'რეგისტრაცია', 'გადამხდელი', 'ბრუტო', 'ჩარიცხული ₾']} rows={sortedBuckets(byCampaign).slice(0, 30).map(([k, b]) => [
        <a key={k} className="underline decoration-dotted" href={href({ campaign: b.campaign, source: b.source !== 'unknown' ? b.source : undefined })}>{b.campaign}</a>, srcLabel(b.source), n0(b.sessions), n0(b.regs), n0(b.payers.size), moneyCell(b.money), receivedCell(b.money)])} empty="კამპანიიანი ბმულით ვიზიტი ჯერ არ ყოფილა" />
    </Card>

    <Card title="რეკლამის ვარიანტები (utm_content)" note="რეკლამის ვარიანტი/ქრიეითივი, თუ ბმულში utm_content ჩაწერე.">
      <Table head={['ვარიანტი', 'კამპანია', 'წყარო', 'ვიზიტები', 'რეგისტრაცია', 'გადამხდელი', 'ბრუტო']} rows={sortedBuckets(byContent).slice(0, 30).map(([k, b]) => [b.content, b.campaign || '-', srcLabel(b.source), n0(b.sessions), n0(b.regs), n0(b.payers.size), moneyCell(b.money)])} empty="utm_content-იანი ბმულით ვიზიტი ჯერ არ ყოფილა" />
    </Card>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="პოპულარული შესასვლელი გვერდები" note="გვერდი, რომლითაც ადამიანმა საიტზე პირველად შემოაბიჯა.">
        <Table head={['გვერდი', 'შესვლები']} rows={groups.paths.map(g => [g.path, n0(g._count._all)])} />
      </Card>
      <Card title="ახალი და დაბრუნებული" note="იზომება მხოლოდ cookie-ს დათანხმებულებზე. დანარჩენზე ვერ ვიგებთ.">
        <Table head={['ტიპი', 'შესვლები']} rows={[['ახალი ვიზიტორი', n0(newV)], ['დაბრუნებული ვიზიტორი', n0(retV)], ['უცნობი (cookie უარყო ან არ უპასუხა)', n0(anonV)]]} />
      </Card>
      <Card title="მოწყობილობა">
        <Table head={['ტიპი', 'შესვლები']} rows={groups.devices.map(g => [g.device === 'mobile' ? 'მობილური' : g.device === 'tablet' ? 'ტაბლეტი' : g.device === 'desktop' ? 'კომპიუტერი' : g.device || '-', n0(g._count._all)])} />
      </Card>
      <Card title="ბრაუზერი (აპები ცალკეა)" note="Instagram app / TikTok app და ა.შ. ნიშნავს, რომ ადამიანი რეკლამიდან აპის შიდა ბრაუზერში შემოვიდა.">
        <Table head={['ბრაუზერი', 'შესვლები']} rows={groups.browsers.map(g => [g.browser || '-', n0(g._count._all)])} />
      </Card>
      <Card title="ოპერაციული სისტემა">
        <Table head={['OS', 'შესვლები']} rows={groups.systems.map(g => [g.os || '-', n0(g._count._all)])} />
      </Card>
    </div>

    <Card title="ბოლო რეგისტრაციები - ვინ საიდან მოვიდა" note="მხოლოდ ადმინს ჩანს. წყარო ივსება მხოლოდ მას შემდეგ, რაც ახალი ტრეკინგი გაეშვა და ადამიანმა cookie-ს დაეთანხმა; ძველ ანგარიშებზე და უარმთქმელებზე „უცნობია“.">
      <Table head={['თარიღი', 'სახელი / ელფოსტა', 'წყარო', 'კამპანია', 'ქვეყანა', 'მოწყობილობა', 'გადაიხადა']} rows={latest.map(u => {
        const a = u.attribution as any;
        return [u.createdAt.toISOString().slice(0, 16).replace('T', ' '), <span key={u.id}>{u.name}<br /><span className="text-xs text-[#465940]/60">{u.email}</span></span>,
          srcLabel(a?.[pre + 'Source']) + (a?.signupMethod === 'google' ? ' · Google-ით' : ''), a?.[pre + 'Campaign'] || '-', a?.country ? `${countryName(a.country)}${a.city ? ', ' + a.city : ''}` : '-',
          a?.device ? `${a.device === 'mobile' ? 'მობილური' : a.device === 'tablet' ? 'ტაბლეტი' : 'კომპიუტერი'} · ${a.browser ?? ''}` : '-', u.paid ? '✔' : '-'];
      })} />
    </Card>

    <p className="px-1 text-xs leading-relaxed text-[#FDFBF0]/60">კონფიდენციალურობა: IP მისამართი, ბარათის/ბანკის მონაცემები და სრული ბრაუზერის ტექსტი არ ინახება. cookie-ზე უარმთქმელი ვიზიტორი ითვლება ანონიმურად, ყოველდღე ახლად ცვლადი ჰეშით, რომელიც ადამიანს ვერ აღადგენს. 400 დღეზე ძველი ჩანაწერები ავტომატურად იშლება.</p>
  </main>;
}
