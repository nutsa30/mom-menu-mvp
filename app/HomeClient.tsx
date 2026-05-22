'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

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
      if (e.isIntersecting) { el.classList.add('in-view'); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}



export default function HomeClient({ s, dishes, dishCount, recentBlogs }: { s: S; dishes: Dishes; dishCount: number; recentBlogs: RecentBlog[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const t = (kaKey: string, enKey: string) => (ka ? s[kaKey] : s[enKey]) as string;

  const refStats       = useFadeUp();
  const refFeatures    = useFadeUp();
  const refSamples     = useFadeUp();
  const refPricing     = useFadeUp();
  const refBlog        = useFadeUp();


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
    } catch { setPromoStatus(prev => ({ ...prev, [plan]: { discount: 0, valid: false, msg: ka ? 'შეცდომა' : 'Error' } })); }
    finally { setPromoLoading(null); }
  };

  const handleSubscribe = async (plan: 'RECIPE_PLAN' | 'FULL_PLAN') => {
    setLoadingPlan(plan);
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

  return (
    <main className="text-[#241915]">
      {/* Hero — sticky so content slides over it */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-[#fff8f6] sticky top-0 z-0 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#baead6] text-[#3f6b5b] font-semibold text-sm">
              {t('heroBadgeKa', 'heroBadgeEn')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] font-extrabold mb-6 tracking-tight">
              {t('heroTitleKa', 'heroTitleEn')}
            </h1>
            <p className="text-base sm:text-lg text-[#6b5b55] mb-8 max-w-xl">
              {t('heroTextKa', 'heroTextEn')}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`/register?lang=${locale}`} className="bg-[#ff7f50] text-white px-7 py-3.5 rounded-full font-semibold shadow-md hover:bg-[#e86e40] transition text-sm sm:text-base">
                {t('heroCta1Ka', 'heroCta1En')}
              </a>
              <a href={`/?lang=${locale}#pricing`} className="border border-[#d6c1b9] text-[#241915] px-7 py-3.5 rounded-full font-semibold hover:bg-[#fff1ec] transition text-sm sm:text-base">
                {t('heroCta2Ka', 'heroCta2En')}
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ffdbcf] rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#baead6] rounded-full blur-3xl" />
            <div className="relative bg-white p-4 rounded-[40px] shadow-2xl rotate-2">
              <img src={s.heroImageUrl as string} alt="meal" className="rounded-[32px] w-full h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 bg-white border-b border-orange-100">
        <div ref={refStats} className="fade-up max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: `${dishCount}+`, label: ka ? 'კერძი' : 'Recipes' },
            { num: '4', label: ka ? 'ასაკობრივი ჯგუფი' : 'Age groups' },
            { num: '3', label: ka ? 'წუთი პირველ შექმნაზე' : 'Min to set up' },
            { num: '100%', label: ka ? 'პერსონალიზებული' : 'Personalized' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-4xl font-black text-[#ff7f50]">{num}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 bg-[#fff1ec] py-16 sm:py-24 rounded-t-[32px] sm:rounded-t-[64px]">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={refFeatures} className="fade-up text-center mb-16">
            <h2 className="text-3xl font-bold">{t('featuresTitleKa', 'featuresTitleEn')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white p-8 rounded-[32px] shadow-[0_10px_30px_rgba(255,127,80,0.05)] hover:-translate-y-2 transition">
                <div className="w-14 h-14 bg-[#baead6] rounded-2xl flex items-center justify-center mb-6 text-2xl">
                  {s[`feature${i}Icon`]}
                </div>
                <h3 className="text-xl font-semibold mb-4">{t(`feature${i}TitleKa`, `feature${i}TitleEn`)}</h3>
                <p className="text-gray-600">{t(`feature${i}DescKa`, `feature${i}DescEn`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal samples — dynamic from DB */}
      <section className="relative z-10 bg-[#fff8f6] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={refSamples} className="fade-up flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('sampleTitleKa', 'sampleTitleEn')}</h2>
              <p className="text-gray-600">{t('sampleSubtitleKa', 'sampleSubtitleEn')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Breakfast — large */}
            <div className="h-64 md:h-auto md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[32px] md:rounded-[40px] group shadow-lg bg-[#f5f0ee]">
              {dishes.breakfast?.imageUrl
                ? <img src={dishes.breakfast.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="breakfast" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300"><span className="text-5xl">🍳</span><span className="text-sm font-semibold">ფოტო არ არის</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="bg-[#baead6] text-black text-xs font-bold px-3 py-1 rounded-full">{ka ? 'საუზმე' : 'Breakfast'}</span>
                {dishes.breakfast && <h3 className="text-2xl font-bold mt-3">{ka ? dishes.breakfast.titleKa : dishes.breakfast.titleEn}</h3>}
              </div>
            </div>
            {/* Lunch */}
            <div className="h-52 md:h-auto md:col-span-2 relative overflow-hidden rounded-[32px] md:rounded-[40px] group shadow-lg bg-[#f5f0ee]">
              {dishes.lunch?.imageUrl
                ? <img src={dishes.lunch.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="lunch" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300"><span className="text-4xl">🥗</span><span className="text-sm font-semibold">ფოტო არ არის</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="bg-[#ffe9e3] text-black text-xs font-bold px-3 py-1 rounded-full">{ka ? 'სადილი' : 'Lunch'}</span>
                {dishes.lunch && <h3 className="text-xl font-bold mt-2">{ka ? dishes.lunch.titleKa : dishes.lunch.titleEn}</h3>}
              </div>
            </div>
            {/* Snack */}
            <div className="h-48 md:h-auto relative overflow-hidden rounded-[32px] md:rounded-[40px] group shadow-lg bg-[#f5f0ee]">
              {dishes.snack?.imageUrl
                ? <img src={dishes.snack.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="snack" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300"><span className="text-3xl">🍎</span><span className="text-xs font-semibold">ფოტო არ არის</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="bg-[#ffddbb] text-black text-xs font-bold px-3 py-1 rounded-full">{ka ? 'სნექი' : 'Snack'}</span>
                {dishes.snack && <h3 className="text-lg font-bold mt-2">{ka ? dishes.snack.titleKa : dishes.snack.titleEn}</h3>}
              </div>
            </div>
            {/* Dinner */}
            <div className="h-48 md:h-auto relative overflow-hidden rounded-[32px] md:rounded-[40px] group shadow-lg bg-[#f5f0ee]">
              {dishes.dinner?.imageUrl
                ? <img src={dishes.dinner.imageUrl} className="absolute w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="dinner" />
                : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300"><span className="text-3xl">🍽️</span><span className="text-xs font-semibold">ფოტო არ არის</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="bg-[#ffb59c] text-black text-xs font-bold px-3 py-1 rounded-full">{ka ? 'ვახშამი' : 'Dinner'}</span>
                {dishes.dinner && <h3 className="text-lg font-bold mt-2">{ka ? dishes.dinner.titleKa : dishes.dinner.titleEn}</h3>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 bg-[#fff1ec] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={refPricing} className="fade-up text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('pricingTitleKa','pricingTitleEn')}</h2>
            <p className="text-gray-600 max-w-xl mx-auto">{t('pricingSubtitleKa','pricingSubtitleEn')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="bg-white p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-gray-200 text-center shadow-sm flex flex-col">
              <div className="h-10 mb-5" />
              <h3 className="text-xl font-semibold mb-2">{t('plan1NameKa','plan1NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {discountedPrice('RECIPE_PLAN', plan1Price) ? (
                  <>
                    <span className="text-2xl font-bold text-gray-400 line-through">{plan1Price}₾</span>
                    <span className="text-4xl font-bold text-green-600 ml-2">{discountedPrice('RECIPE_PLAN', plan1Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold">{plan1Price}₾</span>}
                <span className="text-gray-500">/mo</span>
              </div>
              {promoStatus['RECIPE_PLAN']?.valid && <p className="text-green-600 text-xs font-bold mt-1">{promoStatus['RECIPE_PLAN'].discount}% ფასდაკლება</p>}
              <div className="mb-6 h-6" />
              <ul className="space-y-4 text-left flex-1">
                <li>{t('plan1Feature1Ka','plan1Feature1En')}</li>
                <li>{t('plan1Feature2Ka','plan1Feature2En')}</li>
                <li>{t('plan1Feature3Ka','plan1Feature3En')}</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <input value={promoInput['RECIPE_PLAN']} onChange={e => { setPromoInput(p => ({ ...p, RECIPE_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, RECIPE_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                  onKeyDown={e => e.key === 'Enter' && validatePromo('RECIPE_PLAN')}
                  placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#ff7f50]" />
                <button onClick={() => validatePromo('RECIPE_PLAN')} disabled={promoLoading === 'RECIPE_PLAN' || !promoInput['RECIPE_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 border border-[#ff7f50] text-[#ff7f50] rounded-xl text-xs font-bold hover:bg-[#fff1ec] transition disabled:opacity-40">
                  {promoLoading === 'RECIPE_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['RECIPE_PLAN']?.msg && <p className="text-red-500 text-xs mt-1">{promoStatus['RECIPE_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribe('RECIPE_PLAN')} disabled={loadingPlan !== null}
                className="w-full py-4 mt-4 border border-[#ff7f50] text-[#ff7f50] rounded-full font-semibold hover:bg-[#fff1ec] transition disabled:opacity-60">
                {loadingPlan === 'RECIPE_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-white p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-2 border-[#ff7f50] text-center shadow-2xl sm:scale-105 relative z-10 flex flex-col">
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-[#ff7f50] text-white text-sm font-black px-6 py-2 rounded-full shadow-md">
                  ⭐ {ka ? 'საუკეთესო არჩევანი' : 'Best Choice'}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('plan2NameKa','plan2NameEn')}</h3>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                {discountedPrice('FULL_PLAN', plan2Price) ? (
                  <>
                    <span className="text-2xl font-bold text-gray-400 line-through">{plan2Price}₾</span>
                    <span className="text-4xl font-bold text-green-600 ml-2">{discountedPrice('FULL_PLAN', plan2Price)}₾</span>
                  </>
                ) : <span className="text-4xl font-bold text-gray-900">{plan2Price}₾</span>}
                <span className="text-gray-500">/mo</span>
              </div>
              {promoStatus['FULL_PLAN']?.valid && <p className="text-green-600 text-xs font-bold mt-1">{promoStatus['FULL_PLAN'].discount}% ფასდაკლება</p>}
              <p className="text-[#ff7f50] font-semibold mb-6">{ka ? 'ყველაზე პოპულარული' : 'Most Popular'}</p>
              <ul className="space-y-4 text-left text-gray-700 flex-1">
                <li>{t('plan2Feature1Ka','plan2Feature1En')}</li>
                <li>{t('plan2Feature2Ka','plan2Feature2En')}</li>
                <li>{t('plan2Feature3Ka','plan2Feature3En')}</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <input value={promoInput['FULL_PLAN']} onChange={e => { setPromoInput(p => ({ ...p, FULL_PLAN: e.target.value })); setPromoStatus(p => ({ ...p, FULL_PLAN: { discount: 0, valid: false, msg: '' } })); }}
                  onKeyDown={e => e.key === 'Enter' && validatePromo('FULL_PLAN')}
                  placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#ff7f50]" />
                <button onClick={() => validatePromo('FULL_PLAN')} disabled={promoLoading === 'FULL_PLAN' || !promoInput['FULL_PLAN']}
                  className="w-full sm:w-auto px-4 py-2 bg-[#ff7f50] text-white rounded-xl text-xs font-bold hover:bg-[#e86e40] transition disabled:opacity-40">
                  {promoLoading === 'FULL_PLAN' ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                </button>
              </div>
              {promoStatus['FULL_PLAN']?.msg && <p className="text-red-500 text-xs mt-1">{promoStatus['FULL_PLAN'].msg}</p>}
              <button onClick={() => handleSubscribe('FULL_PLAN')} disabled={loadingPlan !== null}
                className="w-full py-4 mt-4 bg-[#ff7f50] text-white rounded-full font-bold shadow-lg hover:bg-[#e86e40] transition disabled:opacity-60">
                {loadingPlan === 'FULL_PLAN' ? (ka ? 'მუშავდება...' : 'Processing...') : (ka ? 'დაწყება' : 'Get Started')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog section */}
      {recentBlogs.length > 0 && (
        <section className="relative z-10 bg-[#fff8f6] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div ref={refBlog} className="fade-up flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{ka ? 'ბლოგი' : 'Blog'}</h2>
                <p className="text-gray-600">
                  {ka
                    ? 'სტატიები ბავშვების კვებასა და ჯანსაღ განვითარებაზე'
                    : 'Articles on child nutrition and healthy development'}
                </p>
              </div>
              <a
                href={`/blog?lang=${locale}`}
                className="text-sm font-bold text-[#ff7f50] hover:text-[#e86e40] transition whitespace-nowrap"
              >
                {ka ? 'ყველა პოსტი →' : 'All posts →'}
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBlogs.map((blog) => {
                const title = ka ? blog.titleKa : blog.titleEn;
                const content = ka ? blog.contentKa : blog.contentEn;
                const excerpt = content.length > 120 ? content.slice(0, 120) + '...' : content;
                const d = new Date(blog.createdAt);
                const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
                const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const date = `${d.getDate()} ${ka ? KA_M[d.getMonth()] : EN_M[d.getMonth()]}, ${d.getFullYear()}`;
                const href = `/blog/${(blog as any).slug ?? blog.id}?lang=${locale}`;
                return (
                  <a
                    key={blog.id}
                    href={href}
                    className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition group block"
                  >
                    {blog.imageUrl ? (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={blog.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-[#fff1ec] flex items-center justify-center text-4xl">📝</div>
                    )}
                    <div className="p-5">
                      <p className="text-xs font-bold text-[#ff7f50] mb-2 uppercase tracking-wide">{date}</p>
                      <h3 className="font-black text-gray-900 text-base mb-2 leading-snug">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3">{excerpt}</p>
                      <span className="text-xs font-bold text-[#ff7f50] group-hover:underline">
                        {ka ? 'წაიკითხე →' : 'Read →'}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-[#fff1ec] border-t border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span style={{ color: '#2b1d18' }}>mo</span><span className="text-orange-500">M</span><span style={{ color: '#2b1d18' }}>eals</span>
            </h3>
            <p className="text-sm text-gray-600">{ka ? 'ვეხმარებით მშობლებს გაზარდონ ჯანსაღი, ბედნიერი ბავშვები პერსონალური კვების გეგმებით.' : 'Helping parents raise healthy, happy eaters with personalized meal planning.'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{ka ? 'პროდუქტი' : 'Product'}</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href={`/?lang=${locale}#pricing`} className="hover:text-[#ff7f50] transition">{ka ? 'ფასები' : 'Pricing'}</a></li>
              <li><a href={`/recipes?lang=${locale}`} className="hover:text-[#ff7f50] transition">{ka ? 'რეცეპტები' : 'Recipes'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{ka ? 'მხარდაჭერა' : 'Support'}</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href={`/how-it-works?lang=${locale}#faq`} className="hover:text-[#ff7f50] transition">FAQ</a></li>
              <li><a href="mailto:hello@momeals.ge" className="hover:text-[#ff7f50] transition">{ka ? 'კონტაქტი' : 'Contact'}</a></li>
              <li><a href={`/privacy?lang=${locale}`} className="hover:text-[#ff7f50] transition">{ka ? 'კონფიდენციალურობა' : 'Privacy Policy'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{ka ? 'კომპანია' : 'Company'}</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href={`/about?lang=${locale}`} className="hover:text-[#ff7f50] transition">{ka ? 'ჩვენ შესახებ' : 'About'}</a></li>
              <li><a href={`/terms?lang=${locale}`} className="hover:text-[#ff7f50] transition">{ka ? 'პირობები' : 'Terms'}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-orange-100 py-6 text-center text-sm text-gray-500">
          © 2026 moMeals. {ka ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
        </div>
      </footer>
    </main>
  );
}
