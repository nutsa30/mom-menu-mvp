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
type Testimonial = { id: string; authorName: string; content: string };

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
  breakfast: 'bg-[#F5F1E4]/95 text-[#6F7A5C]',
  lunch:     'bg-[#F5F1E4]/95 text-[#6F7A5C]',
  snack:     'bg-[#F5F1E4]/95 text-[#6F7A5C]',
  dinner:    'bg-[#F5F1E4]/95 text-[#6F7A5C]',
};

const SERIF_KA = "'Noto Serif Georgian', serif";

type BillingInterval = 1 | 3 | 6;

export default function HomeClient({ s, dishes, dishCount, recentBlogs, planAmounts, testimonials, canLeaveTestimonial }: {
  s: S; dishes: Dishes; dishCount: number; recentBlogs: RecentBlog[];
  planAmounts: Record<BillingInterval, number>;
  testimonials: Testimonial[]; canLeaveTestimonial: boolean;
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

  const [loadingPlan, setLoadingPlan] = useState<BillingInterval | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<BillingInterval | null>(null);
  // Already redeemed a friend's referral code — the trial is 3 days regardless of any
  // promo code, matching what the BOG webhook actually grants (see /api/auth/me).
  const [hasReferral, setHasReferral] = useState(false);
  const [promoInput, setPromoInput] = useState<Record<BillingInterval, string>>({ 1: '', 3: '', 6: '' });
  const [promoStatus, setPromoStatus] = useState<Record<BillingInterval, { discount: number; valid: boolean; msg: string } | undefined>>({ 1: undefined, 3: undefined, 6: undefined });
  const [promoLoading, setPromoLoading] = useState<BillingInterval | null>(null);

  const refTestimonials = useFadeUp();
  const refTestimonialCards = useStaggeredFadeUp(100);
  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialStatus, setTestimonialStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const TESTIMONIALS_PREVIEW_COUNT = 3;
  const visibleTestimonials = showAllTestimonials ? testimonials : testimonials.slice(0, TESTIMONIALS_PREVIEW_COUNT);
  const submitTestimonial = async () => {
    if (!testimonialText.trim()) return;
    setTestimonialStatus('sending');
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testimonialText.trim() }),
    });
    setTestimonialStatus(res.ok ? 'sent' : 'error');
  };

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
      // are validated against that one plan type regardless of which tier/duration the
      // customer is applying the code to.
      const res = await fetch('/api/promo/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, plan: 'FULL_PLAN' }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoStatus(prev => ({ ...prev, [interval]: { discount: data.discountPercent, valid: true, msg: '' } }));
      } else {
        const msg = data.error === 'wrong_plan' ? (ka ? 'ეს კოდი სხვა გეგმისთვისაა' : 'This code is for a different plan') :
                    data.error === 'limit_reached' ? (ka ? 'კოდის ლიმიტი ამოიწურა' : 'Code limit reached') :
                    (ka ? 'კოდი არასწორია' : 'Invalid code');
        setPromoStatus(prev => ({ ...prev, [interval]: { discount: 0, valid: false, msg } }));
      }
    } catch {
      setPromoStatus(prev => ({ ...prev, [interval]: { discount: 0, valid: false, msg: ka ? 'შეცდომა' : 'Error' } }));
    }
    finally { setPromoLoading(null); }
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
      if (res.status === 401) { router.push(`/login?lang=${locale}`); return; }
      const data = await res.json();
      if (res.ok && data.url) { window.location.href = data.url; return; }
      if (data.error === 'already_subscribed') {
        alert(ka ? 'ეს პაკეტი უკვე აქტიური გაქვთ' : 'You already have this plan active');
      } else if (data.error === 'child_too_young') {
        alert(ka ? data.message : 'The package unlocks once your child turns 6 months old.');
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

  const discountedPrice = (interval: BillingInterval, base: number) => {
    const status = promoStatus[interval];
    const pct = status?.valid ? status.discount : 0;
    return pct > 0 ? Math.round(base * (1 - pct / 100)) : null;
  };

  const mealEntries: { key: keyof Dishes; label: string; labelEn: string }[] = [
    { key: 'breakfast', label: 'საუზმე',  labelEn: 'Breakfast' },
    { key: 'lunch',     label: 'სადილი',  labelEn: 'Lunch' },
    { key: 'snack',     label: 'სნექი',   labelEn: 'Snack' },
    { key: 'dinner',    label: 'ვახშამი', labelEn: 'Dinner' },
  ];

  return (
    <main style={{ color: '#6F7A5C', background: '#F5F1E4', fontFamily: "'Rubik', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(to right, #f9ead4, #f8e2cd, #f5e3c9, #e9ceb0, #e3cbab)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 mb-3 sm:mb-5 uppercase tracking-[0.12em] sm:tracking-[0.15em] font-bold text-[10px] sm:text-xs" style={{ color: '#D9803B' }}>
              <span style={{ width: 16, height: 1, background: '#D9803B', display: 'inline-block' }} />
              {t('heroBadgeKa', 'heroBadgeEn')}
              <span style={{ width: 16, height: 1, background: '#D9803B', display: 'inline-block' }} />
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] leading-[1.2] sm:leading-[1.15] font-bold mb-3 sm:mb-5"
              style={{ color: '#6F7A5C', fontFamily: SERIF_KA }}>
              {t('heroTitleKa', 'heroTitleEn')}
            </h1>
            <p className="text-sm sm:text-base text-[#6F7A5C]/75 mb-5 sm:mb-7">
              {t('heroTextKa', 'heroTextEn')}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              <a
                href={`/register?lang=${locale}`}
                className="px-6 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-bold shadow-md transition text-sm sm:text-base hover:opacity-90"
                style={{ background: '#D9803B', color: '#FFFFFF' }}
              >
                {t('heroCta1Ka', 'heroCta1En')} →
              </a>
              <a
                href={`/?lang=${locale}#pricing`}
                className="border-2 px-6 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-bold hover:bg-[#6F7A5C]/10 transition text-sm sm:text-base"
                style={{ borderColor: '#6F7A5C', color: '#6F7A5C' }}
              >
                {t('heroCta2Ka', 'heroCta2En')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      {(testimonials.length > 0 || canLeaveTestimonial) && (
        <section className="relative z-10 py-14 sm:py-20" style={{ background: '#6F7A5C' }}>
          <div className="max-w-7xl mx-auto px-5">
            <div ref={refTestimonials} className="fade-up mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#F5F1E4]" style={{ fontFamily: SERIF_KA }}>
                {ka ? 'რას ამბობენ მშობლები' : 'What parents say'}
              </h2>
              <p className="text-[#F5F1E4]/60 text-sm">
                {ka ? 'ნამდვილი შეფასებები mom menu-ს მომხმარებლებისგან' : 'Real feedback from mom menu parents'}
              </p>
            </div>

            {canLeaveTestimonial && testimonialStatus !== 'sent' && (
              <div className="fade-up in-view mb-8 rounded-2xl p-6 bg-[#F5F1E4]">
                <h3 className="font-bold text-[#6F7A5C] mb-3">
                  {ka ? 'გაგვიზიარე შენი აზრი საიტზე' : 'Share your thoughts about the site'}
                </h3>
                <textarea
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={ka ? 'რას ფიქრობ mom menu-ზე?' : 'What do you think of mom menu?'}
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-white resize-none"
                />
                {testimonialStatus === 'error' && (
                  <p className="text-red-600 text-xs mt-1">{ka ? 'შეცდომა. სცადე თავიდან.' : 'Error. Please try again.'}</p>
                )}
                <button onClick={submitTestimonial} disabled={testimonialStatus === 'sending' || !testimonialText.trim()}
                  className="mt-3 px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-50"
                  style={{ background: '#6F7A5C', color: '#F5F1E4' }}>
                  {testimonialStatus === 'sending' ? (ka ? 'იგზავნება...' : 'Sending...') : (ka ? 'გამოქვეყნება' : 'Submit')}
                </button>
              </div>
            )}

            {testimonialStatus === 'sent' && (
              <p className="fade-up in-view mb-8 text-[#F5F1E4] font-semibold text-sm">
                {ka ? '✓ მადლობა შეფასებისთვის! მალე გამოქვეყნდება.' : '✓ Thanks for the feedback! It will appear here once reviewed.'}
              </p>
            )}

            {testimonials.length > 0 && (
              <>
                <div ref={refTestimonialCards} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleTestimonials.map((tst) => (
                    <div key={tst.id} className="fade-up rounded-2xl p-5 bg-[#F5F1E4]/10">
                      <p className="text-[#F5F1E4]/90 text-sm leading-relaxed mb-3">"{tst.content}"</p>
                      <p className="text-[#F5F1E4] text-sm font-bold">{tst.authorName}</p>
                    </div>
                  ))}
                </div>
                {!showAllTestimonials && testimonials.length > TESTIMONIALS_PREVIEW_COUNT && (
                  <div className="text-center mt-6">
                    <button onClick={() => setShowAllTestimonials(true)}
                      className="px-6 py-2.5 rounded-full text-sm font-bold border-2 transition hover:bg-[#F5F1E4]/10"
                      style={{ borderColor: 'rgba(245,241,228,0.3)', color: '#F5F1E4' }}>
                      {ka ? `ყველას ნახვა (+${testimonials.length - TESTIMONIALS_PREVIEW_COUNT})` : `Show all (+${testimonials.length - TESTIMONIALS_PREVIEW_COUNT})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="relative z-10 pt-14 pb-14 sm:pt-20 sm:pb-20">
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
            <div key={label} className="fade-up flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ background: '#6F7A5C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9803B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black" style={{ color: '#6F7A5C' }}>{num}</p>
                <p className="text-xs text-[#6F7A5C]/60 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#6F7A5C' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refFeatures} className="fade-up text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F1E4]" style={{ fontFamily: SERIF_KA }}>{t('featuresTitleKa', 'featuresTitleEn')}</h2>
          </div>
          <div ref={refFeatureCards} className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {[1, 2, 3].map(i => {
              const FEATURE_ICONS: Record<number, JSX.Element> = {
                1: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
                2: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
                3: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></>,
              };
              return (
              <div key={i} className="fade-up text-center flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 border-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D9803B]/15" style={{ borderColor: '#D9803B', background: 'rgba(245,241,228,0.06)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D9803B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{FEATURE_ICONS[i]}</svg>
                </div>
                <h3 className="text-base font-bold mb-2 text-[#F5F1E4]">{t(`feature${i}TitleKa`, `feature${i}TitleEn`)}</h3>
                <p className="text-[#F5F1E4]/65 text-sm leading-relaxed max-w-[240px]">{t(`feature${i}DescKa`, `feature${i}DescEn`)}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* ── Meal samples ─────────────────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-24" style={{ background: '#F5F1E4' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refSamples} className="fade-up text-center mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-2 mb-2 uppercase tracking-[0.15em] font-bold text-xs" style={{ color: '#D9803B' }}>
              <span style={{ width: 22, height: 1, background: '#D9803B', display: 'inline-block' }} />
              {t('sampleSubtitleKa', 'sampleSubtitleEn')}
              <span style={{ width: 22, height: 1, background: '#D9803B', display: 'inline-block' }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#6F7A5C] mb-2" style={{ fontFamily: SERIF_KA }}>{t('sampleTitleKa', 'sampleTitleEn')}</h2>
            <a href={`/recipes?lang=${locale}`} className="text-sm font-bold" style={{ color: '#D9803B' }}>
              {ka ? 'ყველა →' : 'All →'}
            </a>
          </div>

          {/* Mobile: horizontal scroll */}
          <div ref={refSampleCards} className="sm:hidden flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-5 px-5">
            {mealEntries.map(({ key, label, labelEn }) => {
              const dish = dishes[key];
              return (
                <div key={key} className="fade-up flex-shrink-0 w-52 bg-white rounded-2xl overflow-hidden snap-start shadow-sm">
                  <div className="h-36 relative bg-[#6F7A5C]/10">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl"></div>
                    }
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${MEAL_COLORS[key]}`}>
                      {ka ? label : labelEn}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="font-bold text-sm text-[#6F7A5C] leading-snug">
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
                <div key={key} className="fade-up bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
                  <div className="h-52 relative overflow-hidden bg-[#6F7A5C]/10">
                    {dish?.imageUrl
                      ? <img src={dish.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={key} />
                      : <div className="w-full h-full flex items-center justify-center text-4xl"></div>
                    }
                    <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${MEAL_COLORS[key]}`}>
                      {ka ? label : labelEn}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-[#6F7A5C] leading-snug">
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
      <section id="pricing" className="relative z-10 py-14 sm:py-24" style={{ background: '#6F7A5C' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div ref={refPricing} className="fade-up text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold" style={{ background: 'rgba(217,128,59,0.18)', color: '#D9803B' }}>
              {ka ? 'აქცია: 7 დღე სრულიად უფასოდ' : 'Offer: 7 days completely free'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#F5F1E4]" style={{ fontFamily: SERIF_KA }}>{t('pricingTitleKa', 'pricingTitleEn')}</h2>
            <p className="text-[#F5F1E4]/70 text-sm max-w-xl mx-auto">{t('pricingSubtitleKa', 'pricingSubtitleEn')}</p>
          </div>
          <div ref={refPricingCards} className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
            {([1, 3, 6] as BillingInterval[]).map((interval) => {
              const price = planAmounts[interval];
              const disc = discountedPrice(interval, price);
              const isRecommended = interval === 3;
              const monthlyBaseline = planAmounts[1] * interval;
              const savings = monthlyBaseline - price;
              const savingsPct = Math.round((savings / monthlyBaseline) * 100);
              const perMonth = (price / interval).toFixed(interval === 6 ? 1 : 0);
              const cadenceKa = interval === 1 ? 'თვეში' : `ყოველ ${interval} თვეში`;
              const cadenceEn = interval === 1 ? 'month' : `${interval} months`;
              const isActive = currentPlan === 'FULL_PLAN' && currentInterval === interval && !loadingPlan;
              // A referral code (redeemed anywhere on the site already) or this card's own
              // promo code shortens the trial to 3 days — mirrors exactly what the BOG
              // webhook grants (referredByUserId / promoCodeId), so this never promises a
              // trial length checkout won't actually give.
              const trialDays = hasReferral || promoStatus[interval]?.valid ? 3 : 7;

              return (
                <div key={interval}
                  className={`fade-up bg-[#F5F1E4] p-7 sm:p-8 rounded-3xl text-center flex flex-col relative transition-transform duration-300 hover:-translate-y-1 ${isRecommended ? 'shadow-2xl sm:scale-105 z-10 border-2' : 'shadow-lg'}`}
                  style={isRecommended ? { borderColor: '#D9803B' } : undefined}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap shadow-md"
                        style={{ background: '#D9803B', color: '#FFFFFF' }}>
                        {ka ? 'მშობლების არჩევანი' : "Parents' Choice"}
                      </div>
                    </div>
                  )}
                  <div className={isRecommended ? 'h-4 mb-4' : 'h-0 mb-5'} />

                  <h3 className="text-xl font-bold text-[#6F7A5C]">{ka ? `${interval} თვე` : `${interval} Month${interval > 1 ? 's' : ''}`}</h3>
                  <p className="text-sm mt-1 mb-5 h-5" style={{ color: savings > 0 ? '#D9803B' : 'transparent' }}>
                    {savings > 0 ? (ka ? `ზოგავთ ${savings}₾-ს (${savingsPct}%)` : `Save ${savings}₾ (${savingsPct}%)`) : '—'}
                  </p>

                  <div className="text-4xl font-black text-[#6F7A5C]">0₾</div>
                  <p className="text-[#6F7A5C]/60 text-sm font-medium mb-2">{ka ? `პირველი ${trialDays} დღე` : `first ${trialDays} days`}</p>

                  <div className="flex justify-center items-baseline gap-1.5">
                    {disc ? (
                      <>
                        <span className="text-base font-bold text-red-400 line-through">{price}₾</span>
                        <span className="text-xl font-bold text-[#6F7A5C]">{disc}₾</span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-[#6F7A5C]">{price}₾</span>
                    )}
                    <span className="text-[#6F7A5C]/50 text-sm">{ka ? `/ ${cadenceKa}` : `/ ${cadenceEn}`}</span>
                  </div>
                  {interval > 1 && (
                    <p className="text-[#6F7A5C]/45 text-xs mt-0.5">
                      ({ka ? `გამოდის ${perMonth}₾ თვეში` : `= ${perMonth}₾ / month`})
                    </p>
                  )}
                  {promoStatus[interval]?.valid && <p className="text-[#D9803B] text-xs font-bold mt-1">{promoStatus[interval]!.discount}% {ka ? 'ფასდაკლება' : 'off'}</p>}

                  <p className="text-[#6F7A5C]/40 text-[11px] italic mt-3 mb-5">
                    {ka
                      ? `თანხა ჩამოგეჭრებათ მე-${trialDays + 1} დღეს. გაუქმება შესაძლებელია სატესტო პერიოდშივე, სრულიად უფასოდ.`
                      : `You'll be charged on day ${trialDays + 1}. Cancel anytime during the trial at no cost.`}
                  </p>

                  <ul className="space-y-3 text-left flex-1 text-sm text-[#6F7A5C]">
                    <li>{t('plan2Feature1Ka', 'plan2Feature1En')}</li>
                    <li>{t('plan2Feature2Ka', 'plan2Feature2En')}</li>
                    <li>{t('plan2Feature3Ka', 'plan2Feature3En')}</li>
                  </ul>

                  <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <input
                      value={promoInput[interval]}
                      onChange={e => { setPromoInput(p => ({ ...p, [interval]: e.target.value })); setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: '' } })); }}
                      onKeyDown={e => e.key === 'Enter' && validatePromo(interval)}
                      placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                      className="flex-1 min-w-0 px-3 py-2 border border-[#6F7A5C]/20 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#6F7A5C] bg-[#F5F1E4] text-[#6F7A5C]"
                    />
                    <button onClick={() => validatePromo(interval)} disabled={promoLoading === interval || !promoInput[interval]}
                      className="w-full sm:w-auto px-4 py-2 border border-[#6F7A5C] text-[#6F7A5C] rounded-xl text-xs font-bold hover:bg-[#6F7A5C]/10 transition disabled:opacity-40">
                      {promoLoading === interval ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                    </button>
                  </div>
                  {promoStatus[interval]?.msg && <p className="text-[#DC2626] text-xs mt-1 font-semibold">{promoStatus[interval]!.msg}</p>}

                  <button onClick={() => handleSubscribeBog(interval)} disabled={loadingPlan !== null || isActive}
                    className={`w-full py-3.5 mt-4 rounded-full font-bold transition disabled:opacity-60 ${isRecommended ? 'shadow-lg hover:opacity-90' : 'border-2 hover:bg-[#6F7A5C]/10'}`}
                    style={isRecommended ? { background: '#D9803B', color: '#FFFFFF' } : { borderColor: '#6F7A5C', color: '#6F7A5C' }}>
                    {isActive ? (ka ? '✓ აქტიურია' : '✓ Active') : loadingPlan === interval ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაიწყე უფასოდ' : 'Start Free')}
                  </button>
                  <p className="text-[#6F7A5C]/45 text-xs mt-2">
                    {ka ? `ავტომატურად განახლდება ${cadenceKa}. გაუქმება ნებისმიერ დროს.` : `Renews automatically every ${cadenceEn}. Cancel anytime.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* ── Blog ─────────────────────────────────────────────── */}
      {recentBlogs.length > 0 && (
        <section className="relative z-10 py-14 sm:py-24" style={{ background: '#F5F1E4' }}>
          <div className="max-w-7xl mx-auto px-5">
            <div ref={refBlog} className="fade-up flex justify-between items-end mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#6F7A5C]" style={{ fontFamily: SERIF_KA }}>{ka ? 'ბლოგი' : 'Blog'}</h2>
                <p className="text-[#6F7A5C]/60 text-sm">
                  {ka ? 'სტატიები და იდეები ბავშვის კვებაზე' : 'Articles and ideas on child nutrition'}
                </p>
              </div>
              <a href={`/blog?lang=${locale}`} className="text-sm font-bold whitespace-nowrap" style={{ color: '#D9803B' }}>
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
                      : <div className="h-36 flex items-center justify-center text-4xl" style={{ background: 'rgba(111,122,92,0.1)' }}></div>
                    }
                    <div className="p-4">
                      <h3 className="font-bold text-[#6F7A5C] text-sm mb-1 leading-snug">{title}</h3>
                      <p className="text-xs text-[#6F7A5C]/60 leading-relaxed">{excerpt}</p>
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
                    className="fade-up rounded-2xl overflow-hidden group block bg-white shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                    {blog.imageUrl
                      ? <div className="h-52 overflow-hidden"><img src={blog.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
                      : <div className="h-52 flex items-center justify-center text-4xl" style={{ background: 'rgba(111,122,92,0.1)' }}></div>
                    }
                    <div className="p-5">
                      <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#D9803B' }}>{date}</p>
                      <h3 className="font-bold text-[#6F7A5C] text-base mb-2 leading-snug">{title}</h3>
                      <p className="text-sm text-[#6F7A5C]/65 leading-relaxed mb-3">{excerpt}</p>
                      <span className="text-xs font-bold group-hover:underline text-[#6F7A5C]">{ka ? 'წაიკითხე →' : 'Read →'}</span>
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
