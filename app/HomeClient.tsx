'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ga } from '@/lib/gtag';
import PWAInstallButton from '@/components/PWAInstallButton';

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
  breakfast: 'bg-[#FDFBF0]/20 text-[#FDFBF0]',
  lunch:     'bg-[#FDFBF0]/20 text-[#FDFBF0]',
  snack:     'bg-[#FDFBF0]/20 text-[#FDFBF0]',
  dinner:    'bg-[#FDFBF0]/20 text-[#FDFBF0]',
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
  const [promoInput, setPromoInput] = useState<Record<string, string>>({ RECIPE_PLAN: '', FULL_PLAN: '' });
  const [promoStatus, setPromoStatus] = useState<Record<string, { discount: number; valid: boolean; msg: string }>>({});
  const [promoLoading, setPromoLoading] = useState<string | null>(null);

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

  const handleSubscribe = async (plan: 'RECIPE_PLAN' | 'FULL_PLAN') => {
    setLoadingPlan(plan);
    const planLabel = plan === 'RECIPE_PLAN' ? 'რეცეპტების წვდომა' : 'სრული პაკეტი';
    const planPrice = plan === 'RECIPE_PLAN' ? 15 : 30;
    ga.subscribe(planLabel, planPrice);
    try {
      const code = promoStatus[plan]?.valid ? promoInput[plan]?.trim() : undefined;
      const res = await fetch('/api/subscription/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, promoCode: code }),
      });
      if (res.status === 401) { router.push(`/login?lang=${locale}`); return; }
      if (res.ok) router.push(`/dashboard?lang=${locale}`);
      else alert((await res.json()).error || 'Error');
    } catch { alert('Error'); }
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
    <main style={{ color: '#FDFBF0' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-6 pb-10 md:pt-10 md:pb-14" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Mobile: food image */}
          <div className="md:hidden relative h-60 sm:h-72 rounded-3xl overflow-hidden mb-6 shadow-xl">
            {s.heroImageUrl ? (
              <>
                <img src={s.heroImageUrl as string} alt="meal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#FDFBF0]/20 flex items-center justify-center text-6xl">🍽️</div>
            )}
            <span className="absolute bottom-4 left-4 inline-block px-3 py-1.5 rounded-full bg-[#FDFBF0]/20 text-[#FDFBF0] font-semibold text-xs">
              {t('heroBadgeKa', 'heroBadgeEn')}
            </span>
          </div>

          {/* Text content */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <span className="hidden md:inline-block px-4 py-1.5 mb-6 rounded-full bg-[#FDFBF0]/20 text-[#FDFBF0] font-semibold text-sm">
                {t('heroBadgeKa', 'heroBadgeEn')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-[52px] leading-[1.25] sm:leading-[1.15] lg:leading-[1.1] font-extrabold mb-4 sm:mb-6 tracking-normal sm:tracking-tight"
                style={{ color: '#FDFBF0' }}>
                {t('heroTitleKa', 'heroTitleEn')}
              </h1>
              <p className="text-base text-[#FDFBF0]/70 mb-6 sm:mb-8 max-w-xl">
                {t('heroTextKa', 'heroTextEn')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/register?lang=${locale}`}
                  className="px-6 py-3 rounded-full font-semibold shadow-md transition text-sm sm:text-base"
                  style={{ background: '#FDFBF0', color: '#465940' }}
                >
                  {t('heroCta1Ka', 'heroCta1En')}
                </a>
                <a
                  href={`/?lang=${locale}#pricing`}
                  className="border border-[#FDFBF0]/30 text-[#FDFBF0] px-6 py-3 rounded-full font-semibold hover:bg-[#FDFBF0]/10 transition text-sm sm:text-base"
                >
                  {t('heroCta2Ka', 'heroCta2En')}
                </a>
              </div>

              <PWAInstallButton ka={ka} />
            </div>

            {/* Desktop image */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FDFBF0]/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#465940] rounded-full blur-3xl opacity-60" />
              <div className="relative bg-[#FDFBF0] p-4 rounded-[40px] shadow-2xl rotate-2">
                <img src={s.heroImageUrl as string} alt="meal" className="rounded-[32px] w-full h-[480px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="relative z-10 bg-[#FDFBF0]/10 border-b border-[#FDFBF0]/10">
        <div ref={refStats} className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 md:gap-4 text-center">
          {[
            { num: `${Math.max(dishCount, 6)}+`, label: ka ? 'კერძი' : 'Recipes' },
            { num: '4', label: ka ? 'ასაკობრივი ჯგუფი' : 'Age groups' },
            { num: '3', label: ka ? 'წუთი შექმნაზე' : 'Min to set up' },
            { num: '100%', label: ka ? 'პერსონალიზებული' : 'Personalized' },
          ].map(({ num, label }) => (
            <div key={label} className="fade-up">
              <p className="text-3xl sm:text-4xl font-black" style={{ color: '#FDFBF0' }}>{num}</p>
              <p className="text-xs sm:text-sm text-[#FDFBF0]/70 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24 rounded-t-[32px]" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refFeatures} className="fade-up text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FDFBF0]">{t('featuresTitleKa', 'featuresTitleEn')}</h2>
          </div>
          <div ref={refFeatureCards} className="grid sm:grid-cols-3 gap-4 sm:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="fade-up bg-[#FDFBF0] p-6 sm:p-8 rounded-3xl shadow-sm hover:-translate-y-1 transition">
                <div className="w-12 h-12 bg-[#465940]/10 rounded-2xl flex items-center justify-center mb-5 text-2xl">
                  {s[`feature${i}Icon`]}
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#465940]">{t(`feature${i}TitleKa`, `feature${i}TitleEn`)}</h3>
                <p className="text-[#465940]/70 text-sm leading-relaxed">{t(`feature${i}DescKa`, `feature${i}DescEn`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Meal samples ─────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refSamples} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#FDFBF0]">{t('sampleTitleKa', 'sampleTitleEn')}</h2>
              <p className="text-[#FDFBF0]/70 text-sm">{t('sampleSubtitleKa', 'sampleSubtitleEn')}</p>
            </div>
            <a href={`/recipes?lang=${locale}`} className="text-sm font-bold whitespace-nowrap" style={{ color: '#FDFBF0' }}>
              {ka ? 'ყველა →' : 'All →'}
            </a>
          </div>

          {/* Mobile: horizontal scroll */}
          <div ref={refSampleCards} className="sm:hidden flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-5 px-5">
            {mealEntries.map(({ key, label, labelEn }) => {
              const dish = dishes[key];
              return (
                <div key={key} className="fade-up flex-shrink-0 w-52 bg-[#FDFBF0] rounded-3xl overflow-hidden shadow-sm snap-start border border-[#FDFBF0]/20">
                  <div className="h-36 relative bg-[#465940]/20">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${MEAL_COLORS[key]}`}>
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

          {/* Desktop: mosaic grid */}
          <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-6 h-[560px]">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-[40px] group shadow-lg bg-[#FDFBF0]/20">
              {dishes.breakfast?.imageUrl
                ? <img src={dishes.breakfast.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="breakfast" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#FDFBF0]/50"><span className="text-5xl">🍳</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-[#FDFBF0]">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${MEAL_COLORS.breakfast}`}>{ka ? 'საუზმე' : 'Breakfast'}</span>
                {dishes.breakfast && <h3 className="text-2xl font-bold mt-3">{ka ? dishes.breakfast.titleKa : dishes.breakfast.titleEn}</h3>}
              </div>
            </div>
            <div className="col-span-2 relative overflow-hidden rounded-[40px] group shadow-lg bg-[#FDFBF0]/20">
              {dishes.lunch?.imageUrl
                ? <img src={dishes.lunch.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="lunch" />
                : <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#FDFBF0]/50">🥗</div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-[#FDFBF0]">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${MEAL_COLORS.lunch}`}>{ka ? 'სადილი' : 'Lunch'}</span>
                {dishes.lunch && <h3 className="text-xl font-bold mt-2">{ka ? dishes.lunch.titleKa : dishes.lunch.titleEn}</h3>}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[40px] group shadow-lg bg-[#FDFBF0]/20">
              {dishes.snack?.imageUrl
                ? <img src={dishes.snack.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="snack" />
                : <div className="absolute inset-0 flex items-center justify-center text-3xl text-[#FDFBF0]/50">🍎</div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-[#FDFBF0]">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${MEAL_COLORS.snack}`}>{ka ? 'სნექი' : 'Snack'}</span>
                {dishes.snack && <h3 className="text-base font-bold mt-2">{ka ? dishes.snack.titleKa : dishes.snack.titleEn}</h3>}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[40px] group shadow-lg bg-[#FDFBF0]/20">
              {dishes.dinner?.imageUrl
                ? <img src={dishes.dinner.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="dinner" />
                : <div className="absolute inset-0 flex items-center justify-center text-3xl text-[#FDFBF0]/50">🍽️</div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-[#FDFBF0]">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${MEAL_COLORS.dinner}`}>{ka ? 'ვახშამი' : 'Dinner'}</span>
                {dishes.dinner && <h3 className="text-base font-bold mt-2">{ka ? dishes.dinner.titleKa : dishes.dinner.titleEn}</h3>}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-14 sm:py-24" style={{ background: '#465940' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refPricing} className="fade-up text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#FDFBF0]">{t('pricingTitleKa', 'pricingTitleEn')}</h2>
            <p className="text-[#FDFBF0]/70 text-sm max-w-xl mx-auto">{t('pricingSubtitleKa', 'pricingSubtitleEn')}</p>
          </div>
          <div ref={refPricingCards} className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto items-stretch">

            {/* Plan 1 */}
            <div className="fade-up bg-[#FDFBF0] p-7 sm:p-10 rounded-3xl border border-[#465940]/20 text-center shadow-sm flex flex-col">
              <div className="h-10 mb-5" />
              <h3 className="text-xl font-semibold mb-2 text-[#465940]">{t('plan1NameKa', 'plan1NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan1Price}₾</span>
                    <span className="text-4xl font-bold text-[#465940] ml-2">{plan1Sale ?? discountedPrice('RECIPE_PLAN', plan1Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold text-[#465940]">{plan1Price}₾</span>}
                <span className="text-[#465940]/60">/mo</span>
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
              {promoStatus['RECIPE_PLAN']?.msg && <p className="text-[#465940] text-xs mt-1 font-semibold">{promoStatus['RECIPE_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribe('RECIPE_PLAN')} disabled={loadingPlan !== null}
                className="w-full py-3.5 mt-4 border border-[#465940] text-[#465940] rounded-full font-semibold hover:bg-[#465940]/10 transition disabled:opacity-60">
                {loadingPlan === 'RECIPE_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
            </div>

            {/* Plan 2 */}
            <div className="fade-up bg-[#FDFBF0] p-7 sm:p-10 rounded-3xl border-2 border-[#465940]/30 text-center shadow-2xl sm:scale-105 relative z-10 flex flex-col">
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 text-[#FDFBF0] text-sm font-black px-6 py-2 rounded-full shadow-md"
                  style={{ background: '#465940' }}>
                  ⭐ {ka ? 'საუკეთესო არჩევანი' : 'Best Choice'}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#465940]">{t('plan2NameKa', 'plan2NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {(plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)) ? (
                  <>
                    <span className="text-2xl font-bold text-red-400 line-through">{plan2Price}₾</span>
                    <span className="text-4xl font-bold text-[#465940] ml-2">{plan2Sale ?? discountedPrice('FULL_PLAN', plan2Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold text-[#465940]">{plan2Price}₾</span>}
                <span className="text-[#465940]/60">/mo</span>
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
              <p className="font-semibold mb-6 text-sm text-[#465940]/70">{ka ? 'ყველაზე პოპულარული' : 'Most Popular'}</p>
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
                  className="w-full sm:w-auto px-4 py-2 text-[#FDFBF0] rounded-xl text-xs font-bold transition disabled:opacity-40"
                  style={{ background: '#465940' }}>
                  {promoLoading === 'FULL_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['FULL_PLAN']?.msg && <p className="text-[#465940] text-xs mt-1 font-semibold">{promoStatus['FULL_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribe('FULL_PLAN')} disabled={loadingPlan !== null}
                className="w-full py-3.5 mt-4 text-[#FDFBF0] rounded-full font-bold shadow-lg transition disabled:opacity-60"
                style={{ background: '#465940' }}>
                {loadingPlan === 'FULL_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
            </div>

          </div>
        </div>
      </section>
      {/* ── Blog ─────────────────────────────────────────────── */}
      {recentBlogs.length > 0 && (
        <section className="relative z-10 py-14 sm:py-24" style={{ background: '#465940' }}>
          <div className="max-w-7xl mx-auto px-5">
            <div ref={refBlog} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#FDFBF0]">{ka ? 'ბლოგი' : 'Blog'}</h2>
                <p className="text-[#FDFBF0]/70 text-sm">
                  {ka ? 'სტატიები ბავშვების კვებასა და ჯანსაღ განვითარებაზე' : 'Articles on child nutrition and healthy development'}
                </p>
              </div>
              <a href={`/blog?lang=${locale}`} className="text-sm font-bold whitespace-nowrap" style={{ color: '#FDFBF0' }}>
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
                    className="fade-up flex-shrink-0 w-64 rounded-3xl overflow-hidden snap-start border border-[#FDFBF0]/20 block"
                    style={{ background: '#465940' }}>
                    {blog.imageUrl
                      ? <div className="h-36 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover" /></div>
                      : <div className="h-36 flex items-center justify-center text-4xl" style={{ background: '#3a4d35' }}>📝</div>
                    }
                    <div className="p-4">
                      <h3 className="font-black text-[#FDFBF0] text-sm mb-1 leading-snug">{title}</h3>
                      <p className="text-xs text-[#FDFBF0]/60 leading-relaxed">{excerpt}</p>
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
                    className="fade-up rounded-[28px] border border-[#FDFBF0]/20 overflow-hidden hover:border-[#FDFBF0]/40 hover:-translate-y-1 transition group block"
                    style={{ background: '#465940' }}>
                    {blog.imageUrl
                      ? <div className="h-44 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
                      : <div className="h-44 flex items-center justify-center text-4xl" style={{ background: '#3a4d35' }}>📝</div>
                    }
                    <div className="p-5">
                      <p className="text-xs font-bold mb-2 uppercase tracking-wide text-[#FDFBF0]/50">{date}</p>
                      <h3 className="font-black text-[#FDFBF0] text-base mb-2 leading-snug">{title}</h3>
                      <p className="text-sm text-[#FDFBF0]/65 leading-relaxed mb-3">{excerpt}</p>
                      <span className="text-xs font-bold group-hover:underline text-[#FDFBF0]/80">{ka ? 'წაიკითხე →' : 'Read →'}</span>
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
