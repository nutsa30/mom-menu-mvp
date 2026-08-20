'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ga } from '@/lib/gtag';

export default function SubscriptionPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState<Record<string, string>>({ RECIPE_PLAN: '', FULL_PLAN: '' });
  const [promoStatus, setPromoStatus] = useState<Record<string, { discount: number; valid: boolean; msg: string }>>({});
  const [promoLoading, setPromoLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.subscriptionStatus) setCurrentPlan(d.subscriptionStatus); })
      .catch(() => {});
  }, []);

  const validatePromo = async (plan: string) => {
    const code = promoInput[plan]?.trim();
    if (!code) return;
    setPromoLoading(plan);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, plan }),
      });
      const data = await res.json();
      if (res.ok && data.discount) {
        setPromoStatus(p => ({ ...p, [plan]: { discount: data.discount, valid: true, msg: `✓ ${data.discount}% ფასდაკლება გამოიყენება` } }));
      } else {
        setPromoStatus(p => ({ ...p, [plan]: { discount: 0, valid: false, msg: data.error || 'კოდი არასწორია' } }));
      }
    } catch {
      setPromoStatus(p => ({ ...p, [plan]: { discount: 0, valid: false, msg: 'შეცდომა' } }));
    } finally { setPromoLoading(null); }
  };

  const handleSubscribeBog = async (plan: 'RECIPE_PLAN' | 'FULL_PLAN') => {
    setLoadingPlan(plan);
    const planLabel = plan === 'RECIPE_PLAN' ? 'რეცეპტების წვდომა' : 'სრული პაკეტი';
    const planPrice = plan === 'RECIPE_PLAN' ? 15 : 30;
    ga.subscribe(planLabel, planPrice);
    try {
      const res = await fetch('/api/subscription/bog-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === 'already_subscribed') {
        alert('ეს პაკეტი უკვე აქტიური გაქვთ');
      } else if (data.error === 'downgrade_not_allowed') {
        alert('სრული პაკეტიდან რეცეპტების პაკეტზე პირდაპირ გადასვლა ვერ ხერხდება.');
      } else {
        alert('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.');
      }
    } catch (e: any) {
      alert('გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const discountedPrice = (plan: string, base: number) => {
    const pct = promoStatus[plan]?.valid ? promoStatus[plan].discount : 0;
    return pct > 0 ? Math.round(base * (1 - pct / 100)) : null;
  };

  return (
    <main className="min-h-screen bg-[#465940] px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-black text-[#FDFBF0] mb-3">პაკეტის არჩევა</h1>
        <p className="text-[#FDFBF0]/60 mb-3">გაუქმება ნებისმიერ დროს შეგიძლია</p>
        <p className="text-[#FDFBF0]/50 text-sm max-w-xl mx-auto mb-12">
          პირველი შესყიდვისას გაქვთ 7 დღიანი უფასო ტესტ-პერიოდი — ბარათი მხოლოდ დროებით მოწმდება, თანხა არ ჩამოიჭრება. პირველი გადახდა მოხდება ზუსტად 7 დღეში, თუ ამ დრომდე არ გააუქმებთ. თუ ტესტ-პერიოდის განმავლობაში სხვა პაკეტზე გადახვალთ, ახალი პაკეტის თანხა მაშინვე ჩამოიჭრება და შემდეგი განახლება 30 დღეში მოხდება.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* RECIPE_PLAN */}
          <div className="rounded-[28px] bg-[#FDFBF0] p-8 flex flex-col min-w-0">
            <h2 className="text-xl font-semibold text-[#465940] mb-4">რეცეპტებზე წვდომა</h2>
            <div className="mb-6">
              {discountedPrice('RECIPE_PLAN', 15) ? (
                <div className="flex items-end gap-2 justify-center">
                  <span className="text-3xl line-through text-[#465940]/40 font-bold">15₾</span>
                  <span className="text-4xl font-black text-[#465940]">{discountedPrice('RECIPE_PLAN', 15)}₾</span>
                  <span className="text-[#465940]/60 text-sm">/თვე</span>
                </div>
              ) : (
                <div className="flex items-end gap-1 justify-center">
                  <span className="text-4xl font-black text-[#465940]">15₾</span>
                  <span className="text-[#465940]/60 text-sm mb-1">/თვე</span>
                </div>
              )}
            </div>
            <ul className="space-y-3 text-left flex-1 text-sm text-[#465940] mb-6">
              <li>✓ ასობით რეცეპტი სრული ინსტრუქციებით</li>
              <li>✓ ბლოგები, სტატიები და კვებითი რჩევები</li>
              <li>✓ საიტის ყველა კონტენტი შეუზღუდავად</li>
            </ul>
            <div className="flex gap-2 mb-1">
              <input
                value={promoInput['RECIPE_PLAN']}
                onChange={e => { setPromoInput(p => ({ ...p, RECIPE_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, RECIPE_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                onKeyDown={e => e.key === 'Enter' && validatePromo('RECIPE_PLAN')}
                placeholder="პრომოკოდი"
                className="flex-1 min-w-0 px-3 py-2 border border-[#465940]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#465940] bg-[#FDFBF0] text-[#465940]"
              />
              <button
                onClick={() => validatePromo('RECIPE_PLAN')}
                disabled={promoLoading === 'RECIPE_PLAN' || !promoInput['RECIPE_PLAN']}
                className="px-4 py-2 border border-[#465940] text-[#465940] rounded-xl text-xs font-bold hover:bg-[#465940]/10 transition disabled:opacity-40"
              >
                {promoLoading === 'RECIPE_PLAN' ? '...' : 'გამოყენება'}
              </button>
            </div>
            {promoStatus['RECIPE_PLAN']?.msg && (
              <p className="text-[#465940] text-xs mb-2 font-semibold">{promoStatus['RECIPE_PLAN'].msg}</p>
            )}
            <button
              onClick={() => handleSubscribeBog('RECIPE_PLAN')}
              disabled={loadingPlan !== null || currentPlan === 'RECIPE_PLAN'}
              className="w-full py-3.5 mt-3 border border-[#465940] text-[#465940] rounded-full font-semibold hover:bg-[#465940]/10 transition disabled:opacity-60"
            >
              {currentPlan === 'RECIPE_PLAN' ? '✓ აქტიურია' : loadingPlan === 'RECIPE_PLAN' ? 'მუშავდება...' : 'დაწყება'}
            </button>
            <p className="text-[#465940]/50 text-xs mt-2 text-center">
              ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.
            </p>
          </div>

          {/* FULL_PLAN */}
          <div className="rounded-[28px] bg-[#FDFBF0] p-8 flex flex-col min-w-0 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-2 text-[#FDFBF0] text-sm font-black px-6 py-2 rounded-full shadow-md" style={{ background: '#465940' }}>
                ⭐ საუკეთესო არჩევანი
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[#465940] mb-2 mt-4">სრული პაკეტი</h2>
            <div className="mb-4">
              {discountedPrice('FULL_PLAN', 30) ? (
                <div className="flex items-end gap-2 justify-center">
                  <span className="text-3xl line-through text-[#465940]/40 font-bold">30₾</span>
                  <span className="text-4xl font-black text-[#465940]">{discountedPrice('FULL_PLAN', 30)}₾</span>
                  <span className="text-[#465940]/60 text-sm">/თვე</span>
                </div>
              ) : (
                <div className="flex items-end gap-2 justify-center">
                  <span className="text-3xl line-through text-[#465940]/40 font-bold">30₾</span>
                  <span className="text-4xl font-black text-[#465940]">21₾</span>
                  <span className="text-[#465940]/60 text-sm mb-1">/თვე</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">-30%</span>
                <span className="text-red-500 text-sm font-semibold">ფასდაკლება</span>
              </div>
              <p className="text-[#465940]/60 text-sm mt-1">ყველაზე პოპულარული</p>
            </div>
            <ul className="space-y-3 text-left text-[#465940] flex-1 text-sm mb-6">
              <li>✓ ყველაფერი, რაც 15₾ გეგმაშია</li>
              <li>✓ შვილის პირადი პროფილი — ასაკი, ალერგენები და გემოვნება</li>
              <li>✓ კვირის კვების გეგმა და ავტომატური სავაჭრო სია</li>
            </ul>
            <div className="flex gap-2 mb-1">
              <input
                value={promoInput['FULL_PLAN']}
                onChange={e => { setPromoInput(p => ({ ...p, FULL_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, FULL_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                onKeyDown={e => e.key === 'Enter' && validatePromo('FULL_PLAN')}
                placeholder="პრომოკოდი"
                className="flex-1 min-w-0 px-3 py-2 border border-[#465940]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#465940] bg-[#FDFBF0] text-[#465940]"
              />
              <button
                onClick={() => validatePromo('FULL_PLAN')}
                disabled={promoLoading === 'FULL_PLAN' || !promoInput['FULL_PLAN']}
                className="px-4 py-2 text-[#FDFBF0] rounded-xl text-xs font-bold transition disabled:opacity-40"
                style={{ background: '#465940' }}
              >
                {promoLoading === 'FULL_PLAN' ? '...' : 'გამოყენება'}
              </button>
            </div>
            {promoStatus['FULL_PLAN']?.msg && (
              <p className="text-[#465940] text-xs mb-2 font-semibold">{promoStatus['FULL_PLAN'].msg}</p>
            )}
            <button
              onClick={() => handleSubscribeBog('FULL_PLAN')}
              disabled={loadingPlan !== null || currentPlan === 'FULL_PLAN'}
              className="w-full py-3.5 mt-3 text-[#FDFBF0] rounded-full font-bold shadow-lg transition disabled:opacity-60"
              style={{ background: '#465940' }}
            >
              {currentPlan === 'FULL_PLAN' ? '✓ აქტიურია' : loadingPlan === 'FULL_PLAN' ? 'მუშავდება...' : 'დაწყება'}
            </button>
            <p className="text-[#465940]/50 text-xs mt-2 text-center">
              ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.
            </p>
          </div>

        </div>

        <a href="/dashboard" className="mt-10 inline-block text-[#FDFBF0]/60 hover:text-[#FDFBF0] transition text-sm">
          ← დაბრუნება
        </a>
      </div>
    </main>
  );
}
