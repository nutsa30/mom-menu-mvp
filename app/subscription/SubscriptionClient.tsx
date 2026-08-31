'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ga } from '@/lib/gtag';

type BillingInterval = 1 | 3 | 6;

export default function SubscriptionClient({ planAmounts }: { planAmounts: Record<BillingInterval, number> }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<BillingInterval | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<BillingInterval | null>(null);
  // Already redeemed a friend's referral code — the trial is 3 days regardless of any
  // promo code, matching what the BOG webhook actually grants (see /api/auth/me).
  const [hasReferral, setHasReferral] = useState(false);
  const [promoInput, setPromoInput] = useState<Record<BillingInterval, string>>({ 1: '', 3: '', 6: '' });
  const [promoStatus, setPromoStatus] = useState<Record<BillingInterval, { discount: number; valid: boolean; msg: string } | undefined>>({ 1: undefined, 3: undefined, 6: undefined });
  const [promoLoading, setPromoLoading] = useState<BillingInterval | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.subscriptionStatus) setCurrentPlan(d.subscriptionStatus);
        if (d?.billingIntervalMonths) setCurrentInterval(d.billingIntervalMonths);
        if (d?.hasReferral) setHasReferral(true);
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
        setPromoStatus(p => ({ ...p, [interval]: { discount: data.discountPercent, valid: true, msg: `✓ ${data.discountPercent}% ფასდაკლება — სატესტო პერიოდი 3 დღეა (ჩვეულებრივი 7 დღის ნაცვლად)` } }));
      } else {
        const msg = data.error === 'wrong_plan' ? 'ეს კოდი სხვა გეგმისთვისაა'
          : data.error === 'limit_reached' ? 'კოდის ლიმიტი ამოიწურა'
          : 'კოდი არასწორია';
        setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg } }));
      }
    } catch {
      setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: 'შეცდომა' } }));
    } finally { setPromoLoading(null); }
  };

  const handleSubscribeBog = async (interval: BillingInterval) => {
    setLoadingPlan(interval);
    const planLabel = interval === 1 ? '1 თვის გეგმა' : interval === 3 ? '3 თვის გეგმა' : '6 თვის გეგმა';
    ga.subscribe(planLabel, planAmounts[interval]);
    try {
      const appliedPromo = promoStatus[interval]?.valid ? promoInput[interval]?.trim() : undefined;
      const res = await fetch('/api/subscription/bog-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval, promoCode: appliedPromo }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === 'already_subscribed') {
        alert('ეს პაკეტი უკვე აქტიური გაქვთ');
      } else if (data.error === 'child_too_young') {
        alert(data.message);
      } else {
        alert('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.');
      }
    } catch (e: any) {
      alert('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const discountedPrice = (interval: BillingInterval, base: number) => {
    const status = promoStatus[interval];
    const pct = status?.valid ? status.discount : 0;
    return pct > 0 ? Math.round(base * (1 - pct / 100)) : null;
  };

  return (
    <main className="min-h-screen bg-[#6F7A5C] px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-black text-[#F5F1E4] mb-3">პაკეტის არჩევა</h1>
        <p className="text-[#F5F1E4]/60 mb-12">გაუქმება ნებისმიერ დროს შეგიძლია</p>

        <div className="grid gap-6 md:grid-cols-3">
          {([1, 3, 6] as BillingInterval[]).map((interval) => {
            const price = planAmounts[interval];
            const disc = discountedPrice(interval, price);
            const isRecommended = interval === 3;
            const monthlyBaseline = planAmounts[1] * interval;
            const savings = monthlyBaseline - price;
            const savingsPct = Math.round((savings / monthlyBaseline) * 100);
            const perMonth = (price / interval).toFixed(interval === 6 ? 1 : 0);
            const cadence = interval === 1 ? 'თვეში' : `ყოველ ${interval} თვეში`;
            const isActive = currentPlan === 'FULL_PLAN' && currentInterval === interval && !loadingPlan;
            // A referral code (redeemed anywhere on the site already) or this card's own
            // promo code shortens the trial to 3 days — mirrors exactly what the BOG
            // webhook grants (referredByUserId / promoCodeId), so this never promises a
            // trial length checkout won't actually give.
            const trialDays = hasReferral || promoStatus[interval]?.valid ? 3 : 7;

            return (
              <div key={interval} className={`rounded-[28px] bg-[#F5F1E4] p-8 flex flex-col min-w-0 relative ${isRecommended ? 'md:scale-105 z-10 border-2' : ''}`}
                style={isRecommended ? { borderColor: '#D9803B' } : undefined}>
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 text-white text-sm font-black px-6 py-2 rounded-full shadow-md whitespace-nowrap" style={{ background: '#D9803B' }}>
                      მშობლების არჩევანი
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-[#6F7A5C] mb-1 mt-4">{interval} თვე</h2>
                <p className="text-sm mb-4 h-5" style={{ color: savings > 0 ? '#D9803B' : 'transparent' }}>
                  {savings > 0 ? `ზოგავთ ${savings}₾-ს (${savingsPct}%)` : '—'}
                </p>

                <div className="text-4xl font-black text-[#6F7A5C]">0₾</div>
                <p className="text-[#6F7A5C]/60 text-sm font-medium mb-2">პირველი {trialDays} დღე</p>

                <div className="flex justify-center items-baseline gap-1.5 mb-1">
                  {disc ? (
                    <>
                      <span className="text-base font-bold text-red-400 line-through">{price}₾</span>
                      <span className="text-xl font-bold text-[#6F7A5C]">{disc}₾</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-[#6F7A5C]">{price}₾</span>
                  )}
                  <span className="text-[#6F7A5C]/50 text-sm">/ {cadence}</span>
                </div>
                {interval > 1 && (
                  <p className="text-[#6F7A5C]/45 text-xs mb-1">(გამოდის {perMonth}₾ თვეში)</p>
                )}

                <p className="text-[#6F7A5C]/40 text-[11px] italic mt-2 mb-5">
                  თანხა ჩამოგეჭრებათ მე-{trialDays + 1} დღეს. გაუქმება შესაძლებელია სატესტო პერიოდშივე, სრულიად უფასოდ.
                </p>

                <ul className="space-y-3 text-left flex-1 text-sm text-[#6F7A5C] mb-6">
                  <li>ასობით რეცეპტი, სრული ინსტრუქციებით</li>
                  <li>შვილის პირადი პროფილი — ასაკი, ალერგენები და გემოვნება</li>
                  <li>კვირის კვების გეგმა და ავტომატური საყიდლების სია</li>
                </ul>

                <div className="flex gap-2 mb-1">
                  <input
                    value={promoInput[interval]}
                    onChange={e => { setPromoInput(p => ({ ...p, [interval]: e.target.value })); setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: '' } })); }}
                    onKeyDown={e => e.key === 'Enter' && validatePromo(interval)}
                    placeholder="პრომოკოდი"
                    className="flex-1 min-w-0 px-3 py-2 border border-[#6F7A5C]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#6F7A5C] bg-[#F5F1E4] text-[#6F7A5C]"
                  />
                  <button
                    onClick={() => validatePromo(interval)}
                    disabled={promoLoading === interval || !promoInput[interval]}
                    className="px-4 py-2 border border-[#6F7A5C] text-[#6F7A5C] rounded-xl text-xs font-bold hover:bg-[#6F7A5C]/10 transition disabled:opacity-40"
                  >
                    {promoLoading === interval ? '...' : 'გამოყენება'}
                  </button>
                </div>
                {promoStatus[interval]?.msg && (
                  <p className="text-[#6F7A5C] text-xs mb-2 font-semibold">{promoStatus[interval]!.msg}</p>
                )}
                <button
                  onClick={() => handleSubscribeBog(interval)}
                  disabled={loadingPlan !== null || isActive}
                  className="w-full py-3.5 mt-3 rounded-full font-bold transition disabled:opacity-60"
                  style={isRecommended ? { background: '#D9803B', color: '#FFFFFF' } : { border: '1px solid #6F7A5C', color: '#6F7A5C' }}
                >
                  {isActive ? '✓ აქტიურია' : loadingPlan === interval ? 'მუშავდება...' : 'დაწყება'}
                </button>
                <p className="text-[#6F7A5C]/50 text-xs mt-2 text-center">
                  ავტომატურად განახლდება {cadence}. გაუქმება ნებისმიერ დროს.
                </p>
              </div>
            );
          })}
        </div>

        <a href="/dashboard" className="mt-10 inline-block text-[#F5F1E4]/60 hover:text-[#F5F1E4] transition text-sm">
          ← დაბრუნება
        </a>
      </div>
    </main>
  );
}
