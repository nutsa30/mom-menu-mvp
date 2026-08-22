'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ga } from '@/lib/gtag';

type S = Record<string, string | number>;
type Dish = { titleKa: string; titleEn: string; imageUrl: string | null } | null;
type Dishes = { breakfast: Dish; lunch: Dish; snack: Dish; dinner: Dish };
type RecentBlog = {
  id: string;
  titleKa: string;
  titleEn: string;
  imageUrl: string | null;
  createdAt: Date;
  contentKa: string;
  contentEn: string;
};

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in-view'); }
      else { el.classList.remove('in-view'); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useStaggeredFadeUp(delay = 120) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        Array.from(el.children).forEach((child, i) => {
          timers.push(setTimeout(() => child.classList.add('in-view'), i * delay));
        });
      } else {
        timers.forEach(clearTimeout);
        timers.length = 0;
        Array.from(el.children).forEach(child => child.classList.remove('in-view'));
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
    obs.observe(el);
    return () => { obs.disconnect(); timers.forEach(clearTimeout); };
  }, [delay]);
  return ref;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-[#FDFBF0]/95 text-[#465940]',
  lunch:     'bg-[#FDFBF0]/95 text-[#465940]',
  snack:     'bg-[#FDFBF0]/95 text-[#465940]',
  dinner:    'bg-[#FDFBF0]/95 text-[#465940]',
};

const SERIF_KA = "'Noto Serif Georgian', serif";

export default function HomeClient({ s, dishes, dishCount, recentBlogs }: {
  s: S; dishes: Dishes; dishCount: number; recentBlogs: RecentBlog[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const t = (kaKey: string, enKey: string) => (ka ? s[kaKey] : s[enKey]) as string;

  const refStats        = useStaggeredFadeUp(100);
  const refFeatures     = useFadeUp();
  const refFeatureCards = useStaggeredFadeUp(130);
  const refSamples      = useFadeUp();
  const refSampleCards  = useStaggeredFadeUp(100);
  const refSampleCards2 = useStaggeredFadeUp(100);
  const refPricing      = useFadeUp();
  const refPricingCards = useStaggeredFadeUp(180);
  const refBlog             = useFadeUp();
  const refBlogCards        = useStaggeredFadeUp(120);
  const refBlogCardsDesktop = useStaggeredFadeUp(120);

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
      if (res.ok && data.valid) {
        setPromoStatus(prev => ({ ...prev, [plan]: { discount: data.discountPercent, valid: true, msg: '' } }));
      } else {
        const msg = data.error === 'wrong_plan' ? (ka ? 'ეს კოდი სხვა გეგმისთვისაა' : 'This code is for a different plan') :
                    data.error === 'limit_reached' ? (ka ? 'კოდის ლიმიტი ამოიწურა' : 'Code limit reached') :
                    (ka ? 'კოდი არასწორია' : 'Invalid code');
        setPromoStatus(prev => ({ ...prev, [plan]: { discount: 0, valid: false, msg } }));
      }
    } catch {
      setPromoStatus(prev => ({ ...prev, [plan]: { discount: 0, valid: false, msg: ka ? 'შეცდომა' : 'Error' } }));
    }
    finally { setPromoLoading(null); }
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
      if (res.status === 401) { router.push(`/login?lang=${locale}`); return; }
      const data = await res.json();
      if (res.ok && data.url) { window.location.href = data.url; return; }
      if (data.error === 'already_subscribed') {
        alert(ka ? 'ეს პაკეტი უკვე აქტიური გაქვთ' : 'You already have this plan active');
      } else {
        alert(ka
          ? 'გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით ან დაგვიკავშირდეთ info@mommenu.ge-ზე.'
          : 'Payments are temporarily undergoing maintenance. Please try again later or contact us at info@mommenu.ge.');
      }
    } catch (e: any) {
      alert(ka
        ? 'გადახდის სერვისი დროებით ტექნიკურ სამუშაოებზეა. გთხოვთ სცადოთ მოგვიანებით.'
        : 'Payments are temporarily undergoing maintenance. Please try again later.');
    }
    finally { setLoadingPlan(null); }
  };

  const discountedPrice = (plan: string, base: number) => {
    const pct = promoStatus[plan]?.valid ? promoStatus[plan].discount : 0;
    return pct > 0 ? Math.round(base * (1 - pct / 100)) : null;
  };

  const plan1Price = Number(s.plan1Price ?? 15);
  const plan2Price = Number(s.plan2Price ?? 30);
  // Global sale prices set by admin (null = no discount)
  const plan1Sale = s.plan1SalePrice ? Number(s.plan1SalePrice) : null;
  const plan2Sale = s.plan2SalePrice ? Number(s.plan2SalePrice) : null;

  const mealEntries: { key: keyof Dishes; label: string; labelEn: string }[] = [
    { key: 'breakfast', label: 'საუზმე',  labelEn: 'Breakfast' },
    { key: 'lunch',     label: 'სადილი',  labelEn: 'Lunch' },
    { key: 'snack',     label: 'სნექი',   labelEn: 'Snack' },
    { key: 'dinner',    label: 'ვახშამი', labelEn: 'Dinner' },
  ];

  return (
    <main style={{ color: '#465940', background: '#FDFBF0', fontFamily: "'Rubik', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-10 md:pt-16 md:pb-14" style={{ background: '#FDFBF0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Mobile: food image */}
          <div className="md:hidden relative h-60 sm:h-72 rounded-[32px] overflow-hidden mb-6 shadow-lg">
            {s.heroImageUrl ? (
              <>
                <img src={s.heroImageUrl as string} alt="meal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#465940]/10 flex items-center justify-center text-6xl"></div>
            )}
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFBF0] text-[#465940] font-bold text-xs shadow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#E67E33"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {t('heroBadgeKa', 'heroBadgeEn')}
            </span>
          </div>

          {/* Text content */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <span className="hidden md:inline-flex items-center gap-2 mb-5 uppercase tracking-[0.15em] font-bold text-xs" style={{ color: '#E67E33' }}>
                <span style={{ width: 22, height: 1, background: '#E67E33', display: 'inline-block' }} />
                {t('heroBadgeKa', 'heroBadgeEn')}
                <span style={{ width: 22, height: 1, background: '#E67E33', display: 'inline-block' }} />
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] leading-[1.12] font-bold mb-5 sm:mb-6"
                style={{ color: '#465940', fontFamily: SERIF_KA }}>
                {t('heroTitleKa', 'heroTitleEn')}
              </h1>
              <p className="text-base text-[#465940]/70 mb-6 sm:mb-8 max-w-xl">
                {t('heroTextKa', 'heroTextEn')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/register?lang=${locale}`}
                  className="px-7 py-3.5 rounded-full font-bold shadow-md transition text-sm sm:text-base hover:opacity-90"
                  style={{ background: '#E67E33', color: '#FFFFFF' }}
                >
                  {t('heroCta1Ka', 'heroCta1En')} →
                </a>
                <a
                  href={`/?lang=${locale}#pricing`}
                  className="border-2 px-7 py-3.5 rounded-full font-bold hover:bg-[#465940]/5 transition text-sm sm:text-base"
                  style={{ borderColor: '#465940', color: '#465940' }}
                >
                  {t('heroCta2Ka', 'heroCta2En')}
                </a>
              </div>
            </div>

            {/* Desktop image */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-8 -right-8 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: '#E67E33' }} />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: '#465940' }} />
              <div className="relative bg-[#FDFBF0] p-4 rounded-full shadow-2xl aspect-square overflow-hidden" style={{ width: 460, height: 460, margin: '0 auto' }}>
                <img src={s.heroImageUrl as string} alt="meal" className="rounded-full w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="relative z-10 pb-14 sm:pb-20">
        <div ref={refStats} className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: `${Math.max(dishCount, 6)}+`, label: ka ? 'კერძი' : 'Recipes',
              icon: <path d="M4 19.5V5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v14.5M6.5 22H18a2 2 0 0 0 2-2v-.5a1 1 0 0 0-1-1H6.5a1.5 1.5 0 0 0 0 3Z" /> },
            { num: '4', label: ka ? 'ასაკობრივი ჯგუფი' : 'Age groups',
              icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
            { num: '3', label: ka ? 'წუთი შექმნაზე' : 'Min to set up',
              icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></> },
            { num: '100%', label: ka ? 'პერსონალიზებული' : 'Personalized',
              icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /> },
          ].map(({ num, label, icon }) => (
            <div key={label} className="fade-up flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#465940' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E67E33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black" style={{ color: '#465940' }}>{num}</p>
                <p className="text-xs text-[#465940]/60 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refFeatures} className="fade-up text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FDFBF0]" style={{ fontFamily: SERIF_KA }}>{t('featuresTitleKa', 'featuresTitleEn')}</h2>
          </div>
          <div ref={refFeatureCards} className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="fade-up text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 text-2xl border-2" style={{ borderColor: '#E67E33', background: 'rgba(253,251,240,0.06)' }}>
                  {s[`feature${i}Icon`]}
                </div>
                <h3 className="text-base font-bold mb-2 text-[#FDFBF0]">{t(`feature${i}TitleKa`, `feature${i}TitleEn`)}</h3>
                <p className="text-[#FDFBF0]/65 text-sm leading-relaxed max-w-[240px]">{t(`feature${i}DescKa`, `feature${i}DescEn`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Meal samples ─────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#FDFBF0' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refSamples} className="fade-up text-center mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-2 mb-2 uppercase tracking-[0.15em] font-bold text-xs" style={{ color: '#E67E33' }}>
              <span style={{ width: 22, height: 1, background: '#E67E33', display: 'inline-block' }} />
              {t('sampleSubtitleKa', 'sampleSubtitleEn')}
              <span style={{ width: 22, height: 1, background: '#E67E33', display: 'inline-block' }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#465940] mb-2" style={{ fontFamily: SERIF_KA }}>{t('sampleTitleKa', 'sampleTitleEn')}</h2>
            <a href={`/recipes?lang=${locale}`} className="text-sm font-bold" style={{ color: '#E67E33' }}>
              {ka ? 'ყველა →' : 'All →'}
            </a>
          </div>

          {/* Mobile: horizontal scroll */}
          <div ref={refSampleCards} className="sm:hidden flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-5 px-5">
            {mealEntries.map(({ key, label, labelEn }) => {
              const dish = dishes[key];
              return (
                <div key={key} className="fade-up flex-shrink-0 w-52 bg-white rounded-2xl overflow-hidden snap-start shadow-sm">
                  <div className="h-36 relative bg-[#465940]/10">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl"></div>
                    }
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${MEAL_COLORS[key]}`}>
                      {ka ? label : labelEn}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="font-bold text-sm text-[#465940] leading-snug">
                      {dish ? (ka ? dish.titleKa : dish.titleEn) : (ka ? 'კერძი არ არის' : 'No dish')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: uniform 4-card row */}
          <div ref={refSampleCards2} className="hidden sm:grid grid-cols-4 gap-6">
            {mealEntries.map(({ key, label, labelEn }) => {
              const dish = dishes[key];
              return (
                <div key={key} className="fade-up bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition group">
                  <div className="h-40 relative overflow-hidden bg-[#465940]/10">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl"></div>
                    }
                    <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${MEAL_COLORS[key]}`}>
                      {ka ? label : labelEn}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-[#465940] leading-snug">
                      {dish ? (ka ? dish.titleKa : dish.titleEn) : (ka ? 'კერძი არ არის' : 'No dish')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-14 sm:py-24" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refPricing} className="fade-up text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#FDFBF0]" style={{ fontFamily: SERIF_KA }}>{t('pricingTitleKa', 'pricingTitleEn')}</h2>
            <p className="text-[#FDFBF0]/70 text-sm max-w-xl mx-auto mb-3">{t('pricingSubtitleKa', 'pricingSubtitleEn')}</p>
            <p className="text-[#FDFBF0]/50 text-xs max-w-xl mx-auto">
              {ka
                ? 'პირველი შესყიდვისას გაქვთ 7 დღიანი უფასო ტესტ-პერიოდი — ბარათი მხოლოდ დროებით მოწმდება, თანხა არ ჩამოიჭრება. პირველი გადახდა მოხდება ზუსტად 7 დღეში, თუ ამ დრომდე არ გააუქმებთ. თუ ტესტ-პერიოდის განმავლობაში სხვა პაკეტზე გადახვალთ, ახალი პაკეტის თანხა მაშინვე ჩამოიჭრება და შემდეგი განახლება 30 დღეში მოხდება.'
                : 'Your first purchase includes a 7-day free trial — your card is only verified, not charged. The first real payment happens exactly 7 days later, unless you cancel before then. Upgrading during the trial charges the new plan immediately and starts a new 30-day cycle from that moment.'}
            </p>
          </div>
          <div ref={refPricingCards} className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto items-stretch">

            {/* Plan 1 */}
            <div className="fade-up bg-[#FDFBF0] p-7 sm:p-10 rounded-3xl text-center flex flex-col shadow-lg">
              <div className="h-10 mb-5" />
              <h3 className="text-xl font-bold mb-2 text-[#465940]">{t('plan1NameKa', 'plan1NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan1Price}₾</span>
                    <span className="text-4xl font-black text-[#465940] ml-2">{plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-black text-[#465940]">{plan1Price}₾</span>}
                <span className="text-[#465940]/50">/mo</span>
              </div>
              {plan1Sale && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg">
                    -{Math.round((1 - plan1Sale / plan1Price) * 100)}%
                  </span>
                  <span className="text-red-500 text-sm font-semibold">{ka ? 'ფასდაკლება' : 'OFF'}</span>
                </div>
              )}
              {!plan1Sale && promoStatus['RECIPE_PLAN']?.valid && <p className="text-[#E67E33] text-xs font-bold mt-1">{promoStatus['RECIPE_PLAN'].discount}% ფასდაკლება</p>}
              <div className="mb-6 h-6" />
              <ul className="space-y-3 text-left flex-1 text-sm text-[#465940]">
                <li>{t('plan1Feature1Ka', 'plan1Feature1En')}</li>
                <li>{t('plan1Feature2Ka', 'plan1Feature2En')}</li>
                <li>{t('plan1Feature3Ka', 'plan1Feature3En')}</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <input
                  value={promoInput['RECIPE_PLAN']}
                  onChange={e => { setPromoInput(p => ({ ...p, RECIPE_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, RECIPE_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                  onKeyDown={e => e.key === 'Enter' && validatePromo('RECIPE_PLAN')}
                  placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                  className="flex-1 min-w-0 px-3 py-2 border border-[#465940]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#465940] bg-[#FDFBF0] text-[#465940]"
                />
                <button onClick={() => validatePromo('RECIPE_PLAN')} disabled={promoLoading === 'RECIPE_PLAN' || !promoInput['RECIPE_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 border border-[#465940] text-[#465940] rounded-xl text-xs font-bold hover:bg-[#465940]/10 transition disabled:opacity-40">
                  {promoLoading === 'RECIPE_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['RECIPE_PLAN']?.msg && <p className="text-[#DC2626] text-xs mt-1 font-semibold">{promoStatus['RECIPE_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribeBog('RECIPE_PLAN')} disabled={loadingPlan !== null || currentPlan === 'RECIPE_PLAN'}
                className="w-full py-3.5 mt-4 border-2 border-[#465940] text-[#465940] rounded-full font-bold hover:bg-[#465940]/10 transition disabled:opacity-60">
                {currentPlan === 'RECIPE_PLAN' ? (ka ? '✓ აქტიურია' : '✓ Active') : loadingPlan === 'RECIPE_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
              <p className="text-[#465940]/45 text-xs mt-2">
                {ka ? 'ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.' : 'Renews automatically every month. Cancel anytime.'}
              </p>
            </div>

            {/* Plan 2 */}
            <div className="fade-up bg-[#FDFBF0] p-7 sm:p-10 rounded-3xl text-center flex flex-col relative shadow-2xl sm:scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap shadow-md"
                  style={{ background: '#E67E33', color: '#FFFFFF' }}>
                  {ka ? 'საუკეთესო არჩევანი' : 'Best Choice'}
                </div>
              </div>
              <div className="h-4 mb-5" />
              <h3 className="text-xl font-bold mb-2 text-[#465940]">{t('plan2NameKa', 'plan2NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan2Price}₾</span>
                    <span className="text-4xl font-black text-[#465940] ml-2">{plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-black text-[#465940]">{plan2Price}₾</span>}
                <span className="text-[#465940]/50">/mo</span>
              </div>
              {plan2Sale && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg">
                    -{Math.round((1 - plan2Sale / plan2Price) * 100)}%
                  </span>
                  <span className="text-red-500 text-sm font-semibold">{ka ? 'ფასდაკლება' : 'OFF'}</span>
                </div>
              )}
              {!plan2Sale && promoStatus['FULL_PLAN']?.valid && <p className="text-[#E67E33] text-xs font-bold mt-1">{promoStatus['FULL_PLAN'].discount}% ფასდაკლება</p>}
              <p className="font-medium mb-6 text-sm text-[#465940]/60">{ka ? 'ყველაზე პოპულარული' : 'Most Popular'}</p>
              <ul className="space-y-3 text-left text-[#465940] flex-1 text-sm">
                <li>{t('plan2Feature1Ka', 'plan2Feature1En')}</li>
                <li>{t('plan2Feature2Ka', 'plan2Feature2En')}</li>
                <li>{t('plan2Feature3Ka', 'plan2Feature3En')}</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <input
                  value={promoInput['FULL_PLAN']}
                  onChange={e => { setPromoInput(p => ({ ...p, FULL_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, FULL_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                  onKeyDown={e => e.key === 'Enter' && validatePromo('FULL_PLAN')}
                  placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                  className="flex-1 min-w-0 px-3 py-2 border border-[#465940]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#465940] bg-[#FDFBF0] text-[#465940]"
                />
                <button onClick={() => validatePromo('FULL_PLAN')} disabled={promoLoading === 'FULL_PLAN' || !promoInput['FULL_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40 hover:opacity-90"
                  style={{ background: '#E67E33', color: '#FFFFFF' }}>
                  {promoLoading === 'FULL_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['FULL_PLAN']?.msg && <p className="text-[#DC2626] text-xs mt-1 font-semibold">{promoStatus['FULL_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribeBog('FULL_PLAN')} disabled={loadingPlan !== null || currentPlan === 'FULL_PLAN'}
                className="w-full py-3.5 mt-4 rounded-full font-bold shadow-lg transition disabled:opacity-60 hover:opacity-90"
                style={{ background: '#E67E33', color: '#FFFFFF' }}>
                {currentPlan === 'FULL_PLAN' ? (ka ? '✓ აქტიურია' : '✓ Active') : loadingPlan === 'FULL_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
              <p className="text-[#465940]/45 text-xs mt-2">
                {ka ? 'ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.' : 'Renews automatically every month. Cancel anytime.'}
              </p>
            </div>

          </div>
        </div>
      </section>
      {/* ── Blog ─────────────────────────────────────────────── */}
      {recentBlogs.length > 0 && (
        <section className="relative z-10 py-14 sm:py-24" style={{ background: '#FDFBF0' }}>
          <div className="max-w-7xl mx-auto px-5">
            <div ref={refBlog} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#465940]" style={{ fontFamily: SERIF_KA }}>{ka ? 'ბლოგი' : 'Blog'}</h2>
                <p className="text-[#465940]/60 text-sm">
                  {ka ? 'სტატიები და იდეები ბავშვის კვებაზე' : 'Articles and ideas on child nutrition'}
                </p>
              </div>
              <a href={`/blog?lang=${locale}`} className="text-sm font-bold whitespace-nowrap" style={{ color: '#E67E33' }}>
                {ka ? 'ყველა →' : 'All →'}
              </a>
            </div>

            {/* Mobile: horizontal scroll */}
            <div ref={refBlogCards} className="sm:hidden flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-5 px-5">
              {recentBlogs.map((blog) => {
                const title = ka ? blog.titleKa : blog.titleEn;
                const raw = ka ? blog.contentKa : blog.contentEn;
                const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const excerpt = plain.length > 80 ? plain.slice(0, 80) + '...' : plain;
                const href = `/blog/${(blog as any).slug ?? blog.id}?lang=${locale}`;
                return (
                  <a key={blog.id} href={href}
                    className="fade-up flex-shrink-0 w-64 rounded-2xl overflow-hidden snap-start shadow-sm block bg-white">
                    {blog.imageUrl
                      ? <div className="h-36 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover" /></div>
                      : <div className="h-36 flex items-center justify-center text-4xl" style={{ background: 'rgba(70,89,64,0.1)' }}></div>
                    }
                    <div className="p-4">
                      <h3 className="font-bold text-[#465940] text-sm mb-1 leading-snug">{title}</h3>
                      <p className="text-xs text-[#465940]/60 leading-relaxed">{excerpt}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Desktop: 3-col grid */}
            <div ref={refBlogCardsDesktop} className="hidden sm:grid grid-cols-3 gap-6">
              {recentBlogs.map((blog) => {
                const title = ka ? blog.titleKa : blog.titleEn;
                const raw = ka ? blog.contentKa : blog.contentEn;
                const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const excerpt = plain.length > 120 ? plain.slice(0, 120) + '...' : plain;
                const d = new Date(blog.createdAt);
                const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
                const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const date = `${d.getDate()} ${ka ? KA_M[d.getMonth()] : EN_M[d.getMonth()]}, ${d.getFullYear()}`;
                const href = `/blog/${(blog as any).slug ?? blog.id}?lang=${locale}`;
                return (
                  <a key={blog.id} href={href}
                    className="fade-up rounded-2xl overflow-hidden group block bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition">
                    {blog.imageUrl
                      ? <div className="h-44 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
                      : <div className="h-44 flex items-center justify-center text-4xl" style={{ background: 'rgba(70,89,64,0.1)' }}></div>
                    }
                    <div className="p-5">
                      <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#E67E33' }}>{date}</p>
                      <h3 className="font-bold text-[#465940] text-base mb-2 leading-snug">{title}</h3>
                      <p className="text-sm text-[#465940]/65 leading-relaxed mb-3">{excerpt}</p>
                      <span className="text-xs font-bold group-hover:underline text-[#465940]">{ka ? 'წაიკითხე →' : 'Read →'}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
