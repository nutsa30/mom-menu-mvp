'use client';
import { useExperience } from '@/components/ExperienceProvider';

import Copy, { useCopy } from '@/components/Copy';
import LegalLinks from '@/components/LegalLinks';


import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ga, rememberCheckout } from '@/lib/gtag';

type BillingInterval = 1 | 3 | 6;

// Only a promo code still grants a free trial (2026-09-13 decision) — everyone else is
// charged immediately on subscribing. Mirrors PROMO_TRIAL_DAYS in the webhook and
// bog-checkout/route.ts's eligibleForTrial check, which is what actually enforces this.
const PROMO_TRIAL_DAYS = 3;

export default function SubscriptionClient({ planAmounts }: { planAmounts: Record<BillingInterval, number> }) {
  const copy = useCopy();
  const experience = useExperience();
  const english = experience.locale === 'en';
  const symbol = experience.currency === 'USD' ? '$' : '₾';
  const formatPrice = (value: string | number) => experience.currency === 'USD' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value)) : `${value}₾`;
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<BillingInterval | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<BillingInterval | null>(null);
  // Already started a BOG trial before (any tier, ever) — a checkout from here on charges
  // immediately with no trial, even when switching to a different interval than what's
  // currently active (see /api/subscription/bog-checkout). Cards must not promise a free
  // trial they won't actually give.
  const [bogTrialUsed, setBogTrialUsed] = useState(false);
  const [promoInput, setPromoInput] = useState<Record<BillingInterval, string>>({ 1: '', 3: '', 6: '' });
  const [promoStatus, setPromoStatus] = useState<Record<BillingInterval, { discount: number; valid: boolean; msg: string } | undefined>>({ 1: undefined, 3: undefined, 6: undefined });
  const [promoLoading, setPromoLoading] = useState<BillingInterval | null>(null);
  // Set when /api/subscription/bog-checkout refuses an interval switch because there's
  // still paid time left on the currently active plan (see that route's onActivePaidPeriod
  // check) — shown as a detail modal instead of a plain alert() so the reason and the way
  // out (cancel, then resubscribe once the paid period ends) are both actually visible.
  const [intervalBlocked, setIntervalBlocked] = useState<{ currentInterval: BillingInterval; renewsAt: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.subscriptionStatus) setCurrentPlan(d.subscriptionStatus);
        if (d?.billingIntervalMonths) setCurrentInterval(d.billingIntervalMonths);
        if (d?.bogTrialUsed) setBogTrialUsed(true);
      })
      .catch(() => {});
  }, []);

  const validatePromo = async (interval: BillingInterval) => {
    const code = promoInput[interval]?.trim();
    if (!code) return;
    setPromoLoading(interval);
    try {
      // Every trial-pricing tier grants the same FULL_PLAN feature access — promo codes
      // are validated against that one plan type regardless of which tier is being bought.
      const res = await fetch('/api/promo/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, plan: 'FULL_PLAN' }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoStatus(p => ({ ...p, [interval]: { discount: data.discountPercent, valid: true, msg: english ? `✓ ${data.discountPercent}% discount — with a ${PROMO_TRIAL_DAYS}-day trial` : `✓ ${data.discountPercent}% ფასდაკლება — ${PROMO_TRIAL_DAYS}-დღიანი სატესტო პერიოდით` } }));
      } else {
        const msg = data.error === 'wrong_plan' ? (english ? 'This code is for a different plan' : 'ეს კოდი სხვა გეგმისთვისაა')
          : data.error === 'limit_reached' ? (english ? 'This code has reached its usage limit' : 'კოდის ლიმიტი ამოიწურა')
          : (english ? 'Invalid code' : 'კოდი არასწორია');
        setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg } }));
      }
    } catch {
      setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: english ? 'Could not check the code. Please try again.' : 'შეცდომა' } }));
    } finally { setPromoLoading(null); }
  };

  const handleSubscribeBog = async (interval: BillingInterval) => {
    setLoadingPlan(interval);
    const planLabel = english ? `${interval}-month plan` : interval === 1 ? '1 თვის გეგმა' : interval === 3 ? '3 თვის გეგმა' : '6 თვის გეგმა';
    try {
      const appliedPromo = promoStatus[interval]?.valid ? promoInput[interval]?.trim() : undefined;
      const res = await fetch('/api/subscription/bog-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval, promoCode: appliedPromo }),
      });
      if (res.status === 401) { router.push(`/login?lang=${experience.locale}`); return; }
      const data = await res.json();
      if (res.ok && data.url) {
        ga.subscribe(planLabel, data.amount, data.currency);
        rememberCheckout(data.orderId);
        window.location.href = data.url;
        return;
      }
      if (data.error === 'already_subscribed') {
        alert(copy('ეს პაკეტი უკვე აქტიური გაქვთ'));
      } else if (data.error === 'interval_switch_blocked') {
        setIntervalBlocked({ currentInterval: data.currentInterval, renewsAt: data.renewsAt ?? null });
      } else if (data.error === 'child_too_young') {
        alert(english ? 'The package unlocks once your child turns 6 months old.' : data.message);
      } else {
        alert(copy('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.'));
      }
    } catch (e: any) {
      alert(copy('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.'));
    } finally {
      setLoadingPlan(null);
    }
  };

  const discountedPrice = (interval: BillingInterval, base: number) => {
    const status = promoStatus[interval];
    const pct = status?.valid ? status.discount : 0;
    // Cent-level rounding — matches applyDiscount() in lib/bog.ts exactly, so the price
    // shown here is never off from what BOG's payment page actually charges (rounding to
    // a whole number, as this used to, showed e.g. 14₾ on-site for a real 13.6₾ charge).
    return pct > 0 ? Math.round(base * (1 - pct / 100) * 100) / 100 : null;
  };

  return (
    <main className="min-h-screen bg-[#6F7A5C] px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-black text-[#F5F1E4] mb-3"> <Copy>{"პაკეტის არჩევა"}</Copy> </h1>
        <p className="text-[#F5F1E4]/60 mb-12"> <Copy>{"გაუქმება ნებისმიერ დროს შეგიძლია"}</Copy> </p>

        <div className="grid gap-6 lg:grid-cols-3">
          {([1, 3, 6] as BillingInterval[]).map((interval) => {
            const price = planAmounts[interval];
            const disc = discountedPrice(interval, price);
            const isRecommended = interval === 3;
            const monthlyBaseline = planAmounts[1] * interval;
            const savings = monthlyBaseline - price;
            const savingsPct = Math.round((savings / monthlyBaseline) * 100);
            const perMonth = (price / interval).toFixed(experience.market === 'INTL' ? 2 : interval === 6 ? 1 : 0);
            const cadence = english ? (interval === 1 ? 'month' : `every ${interval} months`) : interval === 1 ? 'თვეში' : `ყოველ ${interval} თვეში`;
            const renewalCadence = english ? (interval === 1 ? 'monthly' : `every ${interval} months`) : cadence;
            const isActive = currentPlan === 'FULL_PLAN' && currentInterval === interval && !loadingPlan;
            // Free trial retired for everyone except promo-code signups (2026-09-13
            // decision) — a referral code alone no longer grants one. Only a promo code
            // entered on this card does, and only if this account hasn't already used a
            // trial before (mirrors bog-checkout/route.ts's eligibleForTrial check exactly).
            const hasTrial = !bogTrialUsed && Boolean(promoStatus[interval]?.valid);

            return (
              <div key={interval} className={`rounded-[28px] bg-[#F5F1E4] p-5 sm:p-8 flex flex-col min-w-0 relative ${isRecommended ? 'lg:scale-105 z-10 border-2' : ''}`}
                style={isRecommended ? { borderColor: '#D9803B' } : undefined}>
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 text-white text-sm font-black px-6 py-2 rounded-full shadow-md whitespace-nowrap" style={{ background: '#D9803B' }}> <Copy>{"მშობლების არჩევანი"}</Copy> </span>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-[#6F7A5C] mb-1 mt-4">{english ? `${interval} ${interval === 1 ? 'month' : 'months'}` : `${interval} თვე`}</h2>
                <p className="text-sm mb-4 h-5" style={{ color: savings > 0 ? '#D9803B' : 'transparent' }}>
                  <Copy>{savings > 0 ? (english ? `You save ${formatPrice(savings)} (${savingsPct}%)` : `ზოგავთ ${savings}${symbol}-ს (${savingsPct}%)`) : '—'}</Copy>
                </p>

                {hasTrial ? (
                  <>
                    <div className="text-4xl font-black text-[#6F7A5C]">{formatPrice(0)}</div>
                    <p className="text-[#6F7A5C]/60 text-sm font-medium mb-2"> <Copy>{"პირველი"}</Copy> {PROMO_TRIAL_DAYS} <Copy>{"დღე"}</Copy> </p>
                  </>
                ) : (
                  <div className="text-4xl font-black text-[#6F7A5C]">{formatPrice(disc ?? price)}</div>
                )}

                <div className="flex justify-center items-baseline gap-1.5 mb-1">
                  {disc ? (
                    <>
                      <span className="text-base font-bold text-red-400 line-through">{formatPrice(price)}</span>
                      <span className="text-xl font-bold text-[#6F7A5C]">{formatPrice(disc)}</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-[#6F7A5C]">{formatPrice(price)}</span>
                  )}
                  <span className="text-[#6F7A5C]/50 text-sm">/ {cadence}</span>
                </div>
                {interval > 1 && (
                  <p className="text-[#6F7A5C]/45 text-xs mb-1"> <Copy>{"(გამოდის"}</Copy> {formatPrice(perMonth)} <Copy>{"თვეში"}</Copy>) </p>
                )}

                <p className="text-[#6F7A5C]/40 text-[11px] italic mt-2 mb-5">
                  <Copy>{hasTrial
                    ? english ? `Your card will be charged on day ${PROMO_TRIAL_DAYS + 1}. You can cancel during the trial at no cost.` : `თანხა ჩამოგეჭრებათ მე-${PROMO_TRIAL_DAYS + 1} დღეს. გაუქმება შესაძლებელია სატესტო პერიოდშივე, სრულიად უფასოდ.`
                    : bogTrialUsed
                      ? 'თანხა ჩამოგეჭრებათ დაუყოვნებლივ — სატესტო პერიოდი ერთხელ უკვე გამოყენებული გაქვთ.'
                      : 'თანხა ჩამოგეჭრებათ დაუყოვნებლივ, გამოწერისთანავე.'}</Copy>
                </p>

                <ul className="space-y-3 text-left flex-1 text-sm text-[#6F7A5C] mb-6">
                  <li> <Copy>{"ასობით რეცეპტი, სრული ინსტრუქციებით"}</Copy> </li>
                  <li> <Copy>{"შვილის პირადი პროფილი — ასაკი, ალერგენები და გემოვნება"}</Copy> </li>
                  <li> <Copy>{"კვირის კვების გეგმა და ავტომატური საყიდლების სია"}</Copy> </li>
                </ul>

                <div className="flex gap-2 mb-1">
                  <input
                    value={promoInput[interval]}
                    onChange={e => { setPromoInput(p => ({ ...p, [interval]: e.target.value })); setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: '' } })); }}
                    onKeyDown={e => e.key === 'Enter' && validatePromo(interval)}
                    placeholder={copy("პრომოკოდი")}
                    className="flex-1 min-w-0 px-3 py-2 border border-[#6F7A5C]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#6F7A5C] bg-[#F5F1E4] text-[#6F7A5C]"
                  />
                  <button
                    onClick={() => validatePromo(interval)}
                    disabled={promoLoading === interval || !promoInput[interval]}
                    className="px-4 py-2 border border-[#6F7A5C] text-[#6F7A5C] rounded-xl text-xs font-bold hover:bg-[#6F7A5C]/10 transition disabled:opacity-40"
                  >
                    <Copy>{promoLoading === interval ? '...' : 'გამოყენება'}</Copy>
                  </button>
                </div>
                {promoStatus[interval]?.msg && (
                  <p className="text-[#6F7A5C] text-xs mb-2 font-semibold"><Copy>{promoStatus[interval]!.msg}</Copy></p>
                )}
                <button
                  onClick={() => handleSubscribeBog(interval)}
                  disabled={loadingPlan !== null || isActive}
                  className="w-full py-3.5 mt-3 rounded-full font-bold transition disabled:opacity-60"
                  style={isRecommended ? { background: '#D9803B', color: '#FFFFFF' } : { border: '1px solid #6F7A5C', color: '#6F7A5C' }}
                >
                  <Copy>{isActive
                    ? '✓ აქტიურია'
                    : loadingPlan === interval
                      ? 'მუშავდება...'
                      : hasTrial
                        ? english ? `Start — ${PROMO_TRIAL_DAYS} days free` : `დაწყება — ${PROMO_TRIAL_DAYS} დღით უფასოდ`
                        : 'შეიძინე ახლავე'}</Copy>
                </button>
                <p className="text-[#6F7A5C]/50 text-xs mt-2 text-center">{english ? `Renews automatically ${renewalCadence}. Cancel at any time.` : `ავტომატურად განახლდება ${cadence}. გაუქმება ნებისმიერ დროს.`}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-[#F5F1E4]"><LegalLinks /></div>
        <a href={`/dashboard?lang=${experience.locale}`} className="mt-10 inline-block text-[#F5F1E4]/60 hover:text-[#F5F1E4] transition text-sm"> <Copy>{"← დაბრუნება"}</Copy> </a>
      </div>

      {intervalBlocked && (
        <IntervalSwitchBlockedModal
          currentInterval={intervalBlocked.currentInterval}
          renewsAt={intervalBlocked.renewsAt}
          onClose={() => setIntervalBlocked(null)}
          onGoCancel={() => router.push(`/dashboard?lang=${experience.locale}&tab=settings&focus=cancel`)}
        />
      )}
    </main>
  );
}

const INTERVAL_LABEL_KA: Record<BillingInterval, string> = { 1: '1-თვიან', 3: '3-თვიან', 6: '6-თვიან' };

// Explains why the "დაწყება" click didn't go through: switching interval mid-period would
// otherwise charge immediately AND discard whatever paid days remain on the current plan
// (see the interval_switch_blocked branch in app/api/subscription/bog-checkout/route.ts).
// The way out is to cancel the current plan first — access still runs out the paid period,
// nothing is lost — then come back and pick the new interval once it's actually free.
function IntervalSwitchBlockedModal({ currentInterval, renewsAt, onClose, onGoCancel }: {
  currentInterval: BillingInterval;
  renewsAt: string | null;
  onClose: () => void;
  onGoCancel: () => void;
}) {
  const experience = useExperience();
  const renewsLabel = renewsAt ? new Date(renewsAt).toLocaleDateString(experience.locale === 'en' ? 'en-US' : 'ka-GE', experience.locale === 'en' ? { timeZone: experience.timeZone, year: 'numeric', month: 'long', day: 'numeric' } : undefined) : null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="font-black text-[#465940] text-lg mb-3"> <Copy>{"ვერ შეგიცვლით პაკეტს სანამ გაქვთ აქტიური გამოწერა"}</Copy> </h3>
          {experience.locale === 'en' ? <p className="text-sm text-[#465940]/80 leading-relaxed mb-3">Your current {currentInterval}-month plan has already been paid for{renewsLabel ? <> and stays active until <strong>{renewsLabel}</strong></> : ''}.</p> : <p className="text-sm text-[#465940]/80 leading-relaxed mb-3"> <Copy>{"თქვენ ამჟამად გაქვთ აქტიური"}</Copy> {INTERVAL_LABEL_KA[currentInterval]} <Copy>{"პაკეტი, რომელიც უკვე გადახდილია"}</Copy> {renewsLabel ? <> <Copy>{"და მოქმედია"}</Copy> <span className="font-bold">{renewsLabel}</span> <Copy>{"-მდე"}</Copy> </> : ''}.</p>}
          <p className="text-sm text-[#465940]/80 leading-relaxed mb-3"> <Copy>{"თუ ახლავე გადავრთავთ სხვა პაკეტზე, ახალი პაკეტის თანხა დაუყოვნებლივ ჩამოგეჭრებათ და დარჩენილი გადახდილი დღეები დაიკარგება — ეს არასამართლიანი იქნებოდა თქვენთვის, ამიტომ არ ვუშვებთ."}</Copy> </p>
          {experience.locale === 'en' ? <p className="text-sm text-[#465940]/80 leading-relaxed mb-5">To choose a different plan, cancel your current subscription first. You will keep access {renewsLabel ? `until ${renewsLabel}` : 'until the end of your paid period'}. When that period ends, you can subscribe to your new plan.</p> : <p className="text-sm text-[#465940]/80 leading-relaxed mb-5"> <Copy>{"თუ ნამდვილად გსურთ სხვა პაკეტზე გადასვლა: გააუქმეთ მიმდინარე პაკეტი (წვდომას მაინც არ დაკარგავთ — დარჩება"}</Copy> <Copy>{renewsLabel ? `${renewsLabel}-მდე` : 'გადახდილი პერიოდის ბოლომდე'}</Copy> <Copy>{"), და მას შემდეგ რაც ეს პერიოდი ამოიწურება, თავისუფლად შეძლებთ ახალი პაკეტის შეძენას."}</Copy> </p>}
          <div className="flex flex-col gap-2">
            <button
              onClick={onGoCancel}
              className="w-full bg-[#465940] hover:bg-[#465940]/90 text-[#FDFBF0] px-5 py-3 rounded-full text-sm font-bold transition"
            > <Copy>{"მიმდინარე პაკეტის გაუქმება"}</Copy> </button>
            <button
              onClick={onClose}
              className="w-full text-[#465940]/60 hover:text-[#465940] px-5 py-2 rounded-full text-sm font-semibold transition"
            > <Copy>{"დახურვა"}</Copy> </button>
          </div>
        </div>
      </div>
    </div>
  );
}
