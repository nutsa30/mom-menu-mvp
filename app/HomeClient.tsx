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
  breakfast: 'bg-white/90 text-[#09090B]',
  lunch:     'bg-white/90 text-[#09090B]',
  snack:     'bg-white/90 text-[#09090B]',
  dinner:    'bg-white/90 text-[#09090B]',
};

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
    <main style={{ color: '#09090B', background: '#FFFFFF', fontFamily: "'Rubik', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-10 md:pt-16 md:pb-14" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Mobile: food image */}
          <div className="md:hidden relative h-60 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-[#E4E4E7]">
            {s.heroImageUrl ? (
              <>
                <img src={s.heroImageUrl as string} alt="meal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center text-6xl"></div>
            )}
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#09090B] font-medium text-xs border border-[#E4E4E7]">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#465940' }} />
              {t('heroBadgeKa', 'heroBadgeEn')}
            </span>
          </div>

          {/* Text content */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <span className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] text-[#52525B] font-medium text-sm">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#465940' }} />
                {t('heroBadgeKa', 'heroBadgeEn')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-[52px] leading-[1.25] sm:leading-[1.15] lg:leading-[1.1] font-bold mb-4 sm:mb-6 tracking-normal sm:tracking-tight"
                style={{ color: '#09090B' }}>
                {t('heroTitleKa', 'heroTitleEn')}
              </h1>
              <p className="text-base text-[#52525B] mb-6 sm:mb-8 max-w-xl">
                {t('heroTextKa', 'heroTextEn')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/register?lang=${locale}`}
                  className="px-6 py-3 rounded-lg font-medium transition text-sm sm:text-base hover:opacity-90"
                  style={{ background: '#18181B', color: '#FAFAFA' }}
                >
                  {t('heroCta1Ka', 'heroCta1En')}
                </a>
                <a
                  href={`/?lang=${locale}#pricing`}
                  className="border border-[#E4E4E7] text-[#09090B] px-6 py-3 rounded-lg font-medium hover:bg-[#FAFAFA] transition text-sm sm:text-base"
                >
                  {t('heroCta2Ka', 'heroCta2En')}
                </a>
              </div>
            </div>

            {/* Desktop image */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white p-3 rounded-2xl border border-[#E4E4E7]">
                <img src={s.heroImageUrl as string} alt="meal" className="rounded-xl w-full h-[480px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="relative z-10 border-t border-b border-[#E4E4E7]" style={{ background: '#FAFAFA' }}>
        <div ref={refStats} className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 md:gap-4 text-center">
          {[
            { num: `${Math.max(dishCount, 6)}+`, label: ka ? 'კერძი' : 'Recipes' },
            { num: '4', label: ka ? 'ასაკობრივი ჯგუფი' : 'Age groups' },
            { num: '3', label: ka ? 'წუთი შექმნაზე' : 'Min to set up' },
            { num: '100%', label: ka ? 'პერსონალიზებული' : 'Personalized' },
          ].map(({ num, label }) => (
            <div key={label} className="fade-up">
              <p className="text-3xl sm:text-4xl font-bold" style={{ color: '#09090B' }}>{num}</p>
              <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refFeatures} className="fade-up text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09090B]">{t('featuresTitleKa', 'featuresTitleEn')}</h2>
          </div>
          <div ref={refFeatureCards} className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="fade-up bg-white p-6 sm:p-7 rounded-xl border border-[#E4E4E7] hover:border-[#D4D4D8] transition">
                <div className="w-9 h-9 bg-[#F4F4F5] rounded-lg flex items-center justify-center mb-5 text-lg">
                  {s[`feature${i}Icon`]}
                </div>
                <h3 className="text-base font-semibold mb-2 text-[#09090B]">{t(`feature${i}TitleKa`, `feature${i}TitleEn`)}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{t(`feature${i}DescKa`, `feature${i}DescEn`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Meal samples ─────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24 border-t border-[#E4E4E7]" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refSamples} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#09090B]">{t('sampleTitleKa', 'sampleTitleEn')}</h2>
              <p className="text-[#71717A] text-sm">{t('sampleSubtitleKa', 'sampleSubtitleEn')}</p>
            </div>
            <a href={`/recipes?lang=${locale}`} className="text-sm font-medium whitespace-nowrap" style={{ color: '#09090B' }}>
              {ka ? 'ყველა →' : 'All →'}
            </a>
          </div>

          {/* Mobile: horizontal scroll */}
          <div ref={refSampleCards} className="sm:hidden flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-5 px-5">
            {mealEntries.map(({ key, label, labelEn }) => {
              const dish = dishes[key];
              return (
                <div key={key} className="fade-up flex-shrink-0 w-52 bg-white rounded-xl overflow-hidden snap-start border border-[#E4E4E7]">
                  <div className="h-36 relative bg-[#F4F4F5]">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl"></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#E4E4E7] ${MEAL_COLORS[key]}`}>
                      {ka ? label : labelEn}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="font-semibold text-sm text-[#09090B] leading-snug">
                      {dish ? (ka ? dish.titleKa : dish.titleEn) : (ka ? 'კერძი არ არის' : 'No dish')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: mosaic grid */}
          <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-4 h-[560px]">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl group border border-[#E4E4E7] bg-[#F4F4F5]">
              {dishes.breakfast?.imageUrl
                ? <img src={dishes.breakfast.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="breakfast" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#A1A1AA]"><span className="text-5xl"></span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border border-[#E4E4E7] ${MEAL_COLORS.breakfast}`}>{ka ? 'საუზმე' : 'Breakfast'}</span>
                {dishes.breakfast && <h3 className="text-2xl font-bold mt-3">{ka ? dishes.breakfast.titleKa : dishes.breakfast.titleEn}</h3>}
              </div>
            </div>
            <div className="col-span-2 relative overflow-hidden rounded-2xl group border border-[#E4E4E7] bg-[#F4F4F5]">
              {dishes.lunch?.imageUrl
                ? <img src={dishes.lunch.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="lunch" />
                : <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#A1A1AA]"></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border border-[#E4E4E7] ${MEAL_COLORS.lunch}`}>{ka ? 'სადილი' : 'Lunch'}</span>
                {dishes.lunch && <h3 className="text-xl font-bold mt-2">{ka ? dishes.lunch.titleKa : dishes.lunch.titleEn}</h3>}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl group border border-[#E4E4E7] bg-[#F4F4F5]">
              {dishes.snack?.imageUrl
                ? <img src={dishes.snack.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="snack" />
                : <div className="absolute inset-0 flex items-center justify-center text-3xl text-[#A1A1AA]"></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border border-[#E4E4E7] ${MEAL_COLORS.snack}`}>{ka ? 'სნექი' : 'Snack'}</span>
                {dishes.snack && <h3 className="text-base font-bold mt-2">{ka ? dishes.snack.titleKa : dishes.snack.titleEn}</h3>}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl group border border-[#E4E4E7] bg-[#F4F4F5]">
              {dishes.dinner?.imageUrl
                ? <img src={dishes.dinner.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="dinner" />
                : <div className="absolute inset-0 flex items-center justify-center text-3xl text-[#A1A1AA]"></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border border-[#E4E4E7] ${MEAL_COLORS.dinner}`}>{ka ? 'ვახშამი' : 'Dinner'}</span>
                {dishes.dinner && <h3 className="text-base font-bold mt-2">{ka ? dishes.dinner.titleKa : dishes.dinner.titleEn}</h3>}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-14 sm:py-24 border-t border-[#E4E4E7]" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refPricing} className="fade-up text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#09090B]">{t('pricingTitleKa', 'pricingTitleEn')}</h2>
            <p className="text-[#52525B] text-sm max-w-xl mx-auto mb-3">{t('pricingSubtitleKa', 'pricingSubtitleEn')}</p>
            <p className="text-[#A1A1AA] text-xs max-w-xl mx-auto">
              {ka
                ? 'პირველი შესყიდვისას გაქვთ 7 დღიანი უფასო ტესტ-პერიოდი — ბარათი მხოლოდ დროებით მოწმდება, თანხა არ ჩამოიჭრება. პირველი გადახდა მოხდება ზუსტად 7 დღეში, თუ ამ დრომდე არ გააუქმებთ. თუ ტესტ-პერიოდის განმავლობაში სხვა პაკეტზე გადახვალთ, ახალი პაკეტის თანხა მაშინვე ჩამოიჭრება და შემდეგი განახლება 30 დღეში მოხდება.'
                : 'Your first purchase includes a 7-day free trial — your card is only verified, not charged. The first real payment happens exactly 7 days later, unless you cancel before then. Upgrading during the trial charges the new plan immediately and starts a new 30-day cycle from that moment.'}
            </p>
          </div>
          <div ref={refPricingCards} className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto items-stretch">

            {/* Plan 1 */}
            <div className="fade-up bg-white p-7 sm:p-10 rounded-2xl border border-[#E4E4E7] text-center flex flex-col">
              <div className="h-10 mb-5" />
              <h3 className="text-xl font-semibold mb-2 text-[#09090B]">{t('plan1NameKa', 'plan1NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan1Price}₾</span>
                    <span className="text-4xl font-bold text-[#09090B] ml-2">{plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold text-[#09090B]">{plan1Price}₾</span>}
                <span className="text-[#A1A1AA]">/mo</span>
              </div>
              {plan1Sale && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg">
                    -{Math.round((1 - plan1Sale / plan1Price) * 100)}%
                  </span>
                  <span className="text-red-500 text-sm font-semibold">{ka ? 'ფასდაკლება' : 'OFF'}</span>
                </div>
              )}
              {!plan1Sale && promoStatus['RECIPE_PLAN']?.valid && <p className="text-[#465940] text-xs font-bold mt-1">{promoStatus['RECIPE_PLAN'].discount}% ფასდაკლება</p>}
              <div className="mb-6 h-6" />
              <ul className="space-y-3 text-left flex-1 text-sm text-[#3F3F46]">
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
                  className="flex-1 min-w-0 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-[#09090B] bg-white text-[#09090B]"
                />
                <button onClick={() => validatePromo('RECIPE_PLAN')} disabled={promoLoading === 'RECIPE_PLAN' || !promoInput['RECIPE_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 border border-[#E4E4E7] text-[#09090B] rounded-lg text-xs font-semibold hover:bg-[#FAFAFA] transition disabled:opacity-40">
                  {promoLoading === 'RECIPE_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['RECIPE_PLAN']?.msg && <p className="text-[#DC2626] text-xs mt-1 font-semibold">{promoStatus['RECIPE_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribeBog('RECIPE_PLAN')} disabled={loadingPlan !== null || currentPlan === 'RECIPE_PLAN'}
                className="w-full py-3.5 mt-4 border border-[#E4E4E7] text-[#09090B] rounded-lg font-medium hover:bg-[#FAFAFA] transition disabled:opacity-60">
                {currentPlan === 'RECIPE_PLAN' ? (ka ? '✓ აქტიურია' : '✓ Active') : loadingPlan === 'RECIPE_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
              <p className="text-[#A1A1AA] text-xs mt-2">
                {ka ? 'ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.' : 'Renews automatically every month. Cancel anytime.'}
              </p>
            </div>

            {/* Plan 2 */}
            <div className="fade-up bg-white p-7 sm:p-10 rounded-2xl border-2 text-center sm:scale-105 relative z-10 flex flex-col" style={{ borderColor: '#18181B' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: '#18181B', color: '#FAFAFA' }}>
                  {ka ? 'საუკეთესო არჩევანი' : 'Best Choice'}
                </div>
              </div>
              <div className="h-3 mb-5" />
              <h3 className="text-xl font-semibold mb-2 text-[#09090B]">{t('plan2NameKa', 'plan2NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan2Price}₾</span>
                    <span className="text-4xl font-bold text-[#09090B] ml-2">{plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold text-[#09090B]">{plan2Price}₾</span>}
                <span className="text-[#A1A1AA]">/mo</span>
              </div>
              {plan2Sale && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg">
                    -{Math.round((1 - plan2Sale / plan2Price) * 100)}%
                  </span>
                  <span className="text-red-500 text-sm font-semibold">{ka ? 'ფასდაკლება' : 'OFF'}</span>
                </div>
              )}
              {!plan2Sale && promoStatus['FULL_PLAN']?.valid && <p className="text-[#465940] text-xs font-bold mt-1">{promoStatus['FULL_PLAN'].discount}% ფასდაკლება</p>}
              <p className="font-medium mb-6 text-sm text-[#A1A1AA]">{ka ? 'ყველაზე პოპულარული' : 'Most Popular'}</p>
              <ul className="space-y-3 text-left text-[#3F3F46] flex-1 text-sm">
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
                  className="flex-1 min-w-0 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-[#09090B] bg-white text-[#09090B]"
                />
                <button onClick={() => validatePromo('FULL_PLAN')} disabled={promoLoading === 'FULL_PLAN' || !promoInput['FULL_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-40 hover:opacity-90"
                  style={{ background: '#18181B', color: '#FAFAFA' }}>
                  {promoLoading === 'FULL_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['FULL_PLAN']?.msg && <p className="text-[#DC2626] text-xs mt-1 font-semibold">{promoStatus['FULL_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribeBog('FULL_PLAN')} disabled={loadingPlan !== null || currentPlan === 'FULL_PLAN'}
                className="w-full py-3.5 mt-4 rounded-lg font-medium transition disabled:opacity-60 hover:opacity-90"
                style={{ background: '#18181B', color: '#FAFAFA' }}>
                {currentPlan === 'FULL_PLAN' ? (ka ? '✓ აქტიურია' : '✓ Active') : loadingPlan === 'FULL_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
              <p className="text-[#A1A1AA] text-xs mt-2">
                {ka ? 'ავტომატურად განახლდება ყოველ თვე. გაუქმება ნებისმიერ დროს.' : 'Renews automatically every month. Cancel anytime.'}
              </p>
            </div>

          </div>
        </div>
      </section>
      {/* ── Blog ─────────────────────────────────────────────── */}
      {recentBlogs.length > 0 && (
        <section className="relative z-10 py-14 sm:py-24 border-t border-[#E4E4E7]" style={{ background: '#FFFFFF' }}>
          <div className="max-w-7xl mx-auto px-5">
            <div ref={refBlog} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#09090B]">{ka ? 'ბლოგი' : 'Blog'}</h2>
                <p className="text-[#71717A] text-sm">
                  {ka ? 'სტატიები და იდეები ბავშვის კვებაზე' : 'Articles and ideas on child nutrition'}
                </p>
              </div>
              <a href={`/blog?lang=${locale}`} className="text-sm font-medium whitespace-nowrap" style={{ color: '#09090B' }}>
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
                    className="fade-up flex-shrink-0 w-64 rounded-xl overflow-hidden snap-start border border-[#E4E4E7] block"
                    style={{ background: '#FFFFFF' }}>
                    {blog.imageUrl
                      ? <div className="h-36 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover" /></div>
                      : <div className="h-36 flex items-center justify-center text-4xl" style={{ background: '#F4F4F5' }}></div>
                    }
                    <div className="p-4">
                      <h3 className="font-semibold text-[#09090B] text-sm mb-1 leading-snug">{title}</h3>
                      <p className="text-xs text-[#71717A] leading-relaxed">{excerpt}</p>
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
                    className="fade-up rounded-2xl border border-[#E4E4E7] overflow-hidden hover:border-[#D4D4D8] transition group block"
                    style={{ background: '#FFFFFF' }}>
                    {blog.imageUrl
                      ? <div className="h-44 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
                      : <div className="h-44 flex items-center justify-center text-4xl" style={{ background: '#F4F4F5' }}></div>
                    }
                    <div className="p-5">
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-[#A1A1AA]">{date}</p>
                      <h3 className="font-semibold text-[#09090B] text-base mb-2 leading-snug">{title}</h3>
                      <p className="text-sm text-[#71717A] leading-relaxed mb-3">{excerpt}</p>
                      <span className="text-xs font-medium group-hover:underline text-[#09090B]">{ka ? 'წაიკითხე →' : 'Read →'}</span>
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
