'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ga } from '@/lib/gtag';

type S = Record<string, string | number>;
type Dish = { titleKa: string; titleEn: string; imageUrl: string | null; ingredientsKa: string[]; ingredientsEn: string[] } | null;
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

// ─── Visual tokens ───────────────────────────────────────────────────────
// Kept identical to the tokens already used across this page, Nav and
// SiteFooter (INK/CREAM/ACCENT) — a different, "more premium" shade would
// create a visible seam where this page meets the nav bar and footer that
// wrap it. The upgrade here is restraint (flat fields, one accent, generous
// space, editorial serif type) rather than a new palette.
const INK = '#6F7A5C';
const CREAM = '#F5F1E4';
const ACCENT = '#D9803B';
const SERIF_KA = "'Noto Serif Georgian', serif";

// Free trial retired for everyone except promo-code signups (2026-09-13 decision) — only
// mirrors PROMO_TRIAL_DAYS in the webhook / bog-checkout/route.ts's eligibleForTrial check,
// which is what actually enforces this. No "7-day trial" wording exists anywhere below.
const PROMO_TRIAL_DAYS = 3;

type BillingInterval = 1 | 3 | 6;

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

// Drives the connected "one continuous story" section: which step's text is centered in the
// viewport decides which product visual the sticky panel (desktop) shows. Plain
// IntersectionObserver, no scroll libraries — respects prefers-reduced-motion on its own
// since it only ever toggles which block is rendered, never a scroll-linked transform.
function useActiveStep(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = refs.current.findIndex((el) => el === e.target);
          if (idx !== -1) setActive(idx);
        });
      },
      { threshold: 0.6, rootMargin: '-15% 0px -15% 0px' }
    );
    refs.current.slice(0, count).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [count]);
  return { refs, active };
}

// Desktop-only "pinned" scrollytelling driver: the wrapper is `count` viewport-heights tall
// and its inner panel visually stays put while the person scrolls through it, swapping the
// active question/visual in place. Deliberately NOT implemented with CSS `position: sticky`:
// this app's root layout wraps every page in a div with `overflow-x: hidden` (added to avoid
// an iOS fixed-element touch bug — see app/layout.tsx), and per the CSS spec a non-`visible`
// overflow on one axis computes the other axis to `auto` too, which turns that wrapper into a
// scroll-containing ancestor and silently breaks `position: sticky` in most browsers (the
// panel just scrolls away instead of pinning) — that's why this looked fine on mobile (which
// never uses this pinned panel) but showed long empty stretches on desktop. Fixed by driving
// the pin manually: 'before' the wrapper reaches the top, the panel sits at the wrapper's own
// top (normal document position); while scrolling through the wrapper, the panel is
// `position: fixed` to the viewport; once the wrapper's bottom has scrolled past, the panel
// rests at the wrapper's bottom. No scroll-jacking, no animation library — native scroll read
// via a rAF-throttled listener.
function useScrollStory(count: number) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [pin, setPin] = useState<'before' | 'pinned' | 'after'>('before');
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      setPin(rect.top > 0 ? 'before' : rect.bottom <= vh ? 'after' : 'pinned');

      const total = rect.height - vh;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      const idx = Math.min(count - 1, Math.floor(progress * count));
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);
  return { wrapperRef, active, pin };
}

const dishLabel = (d: Dish, ka: boolean) =>
  d ? (ka ? d.titleKa : d.titleEn) : (ka ? 'კერძი არ არის' : 'No dish');

// ─── Small, honest UI mockups ────────────────────────────────────────────
// Every mockup below shows REAL data already passed into this page (actual dish titles from
// `dishes`, the actual dish count, actual prices) — never invented product content. A couple
// of illustrative pantry/shopping items (rice, banana, egg…) are generic grocery examples,
// not app data, used only to show the shape of the "what I have at home" input.

function MenuDigestMock({ dishes, ka }: { dishes: Dishes; ka: boolean }) {
  const rows: { key: keyof Dishes; labelKa: string; labelEn: string }[] = [
    { key: 'breakfast', labelKa: 'საუზმე', labelEn: 'Breakfast' },
    { key: 'lunch', labelKa: 'სადილი', labelEn: 'Lunch' },
    { key: 'snack', labelKa: 'სნექი', labelEn: 'Snack' },
    { key: 'dinner', labelKa: 'ვახშამი', labelEn: 'Dinner' },
  ];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-4" style={{ color: ACCENT }}>
        {ka ? 'დღევანდელი მენიუ' : "Today's menu"}
      </p>
      <ul className="space-y-3.5">
        {rows.map((r) => {
          const dish = dishes[r.key];
          return (
            <li key={r.key} className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wide w-12 shrink-0" style={{ color: `${INK}66` }}>
                {ka ? r.labelKa : r.labelEn}
              </span>
              <span className="flex-1 text-sm font-bold truncate" style={{ color: INK }}>{dishLabel(dish, ka)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecipeCardMock({ dish, ka }: { dish: Dish; ka: boolean }) {
  return (
    <div className="rounded-3xl bg-white shadow-xl overflow-hidden w-full">
      <div className="h-28 sm:h-32" style={{ background: `${INK}12` }}>
        {dish?.imageUrl && <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" />}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: ACCENT }}>{ka ? 'რეცეპტი' : 'Recipe'}</p>
        <p className="text-sm font-bold" style={{ color: INK }}>{dishLabel(dish, ka)}</p>
      </div>
    </div>
  );
}

function PantryMatchMock({ dish, ka }: { dish: Dish; ka: boolean }) {
  // Pull the chips from the matched dish's own real ingredient list, so "I have at home" and
  // "matching dish" always actually agree with each other — whichever dish happens to be most
  // recently added never produces a mismatched pairing. Falls back to a couple of generic
  // grocery examples only for the rare dish with no recorded ingredients yet.
  const realIngredients = (ka ? dish?.ingredientsKa : dish?.ingredientsEn) ?? [];
  const items = realIngredients.length > 0
    ? realIngredients.slice(0, 4)
    : ka ? ['ბრინჯი', 'ბანანი', 'კვერცხი', 'ხაჭო'] : ['Rice', 'Banana', 'Egg', 'Cottage cheese'];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: ACCENT }}>{ka ? 'სახლში მაქვს' : 'I have at home'}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((i) => (
          <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: `${INK}0D`, color: INK }}>{i}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: `${INK}55` }}>
        <span>↓</span><span>{ka ? 'შესაფერისი კერძი' : 'Matching dish'}</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `${INK}08` }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: `${INK}12` }}>
          {dish?.imageUrl && <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" />}
        </div>
        <p className="text-sm font-bold" style={{ color: INK }}>{dishLabel(dish, ka)}</p>
      </div>
    </div>
  );
}

// Feature 10, practical recipe filters — the homepage story gets its own small mockup so a
// visiting parent sees the actual new capability (pick a time budget, get a real matching
// dish), not just a description of it. Same visual shape as PantryMatchMock (chips → arrow
// → matched dish), built from the same real `dishes` data passed into this page.
function QuickFilterMock({ dish, ka }: { dish: Dish; ka: boolean }) {
  const chips = ka ? ['⏱️ 10 წუთში', '⏱️ 20 წუთში'] : ['⏱️ 10 min', '⏱️ 20 min'];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: ACCENT }}>{ka ? 'დრო მაქვს მცირე' : 'Short on time'}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c, i) => (
          <span key={c} className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={i === 0 ? { background: ACCENT, color: '#fff' } : { background: `${INK}0D`, color: INK }}>
            {c}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: `${INK}55` }}>
        <span>↓</span><span>{ka ? 'ამ დროში მომზადებადი კერძი' : 'Ready in that time'}</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `${INK}08` }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: `${INK}12` }}>
          {dish?.imageUrl && <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" />}
        </div>
        <p className="text-sm font-bold" style={{ color: INK }}>{dishLabel(dish, ka)}</p>
      </div>
    </div>
  );
}

function TriedChipsMock({ ka }: { ka: boolean }) {
  const chips = ka
    ? [['ასაკი', '9 თვე+'], ['გასინჯული', '24 პროდუქტი'], ['არ მოსწონს', '2'], ['ალერგენი', 'თხილი']]
    : [['Age', '9mo+'], ['Tried', '24 items'], ["Doesn't like", '2'], ['Allergen', 'Nuts']];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full grid grid-cols-2 gap-3">
      {chips.map(([label, val]) => (
        <div key={label} className="rounded-2xl p-3.5" style={{ background: `${INK}08` }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: `${INK}70` }}>{label}</p>
          <p className="text-sm font-bold" style={{ color: INK }}>{val}</p>
        </div>
      ))}
    </div>
  );
}

function DislikeReplaceMock({ from, to, ka }: { from: Dish; to: Dish; ka: boolean }) {
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full space-y-3">
      <div className="flex items-center gap-3 rounded-2xl p-3 bg-red-50">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: `${INK}12` }}>
          {from?.imageUrl && <img src={from.imageUrl} className="w-full h-full object-cover" alt="" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: INK }}>{dishLabel(from, ka)}</p>
          <p className="text-[11px] font-bold text-red-500">{ka ? 'არ მოეწონა' : "Didn't like it"}</p>
        </div>
      </div>
      <div className="text-center text-xs" style={{ color: `${INK}40` }}>↓</div>
      <div className="flex items-center gap-3 rounded-2xl p-3 bg-emerald-50">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: `${INK}12` }}>
          {to?.imageUrl && <img src={to.imageUrl} className="w-full h-full object-cover" alt="" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: INK }}>{dishLabel(to, ka)}</p>
          <p className="text-[11px] font-bold text-emerald-600">{ka ? 'სხვა შესაფერისი კერძი' : 'Another good match'}</p>
        </div>
      </div>
    </div>
  );
}

function ShoppingListMock({ ka }: { ka: boolean }) {
  const items = ka
    ? ['ბანანი — 4 ცალი', 'ხაჭო — 400 გრ', 'კვერცხი — 10 ცალი', 'ბრინჯი — 1 კგ']
    : ['Bananas — 4', 'Cottage cheese — 400g', 'Eggs — 10', 'Rice — 1kg'];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: ACCENT }}>{ka ? 'საყიდლების სია' : 'Shopping list'}</p>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: INK }}>
            <span className="w-4 h-4 rounded-md border-2 shrink-0" style={{ borderColor: `${INK}30` }} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayTimelineMock({ dishes, ka }: { dishes: Dishes; ka: boolean }) {
  const points = [
    { t: ka ? 'დილა' : 'Morning', label: ka ? 'საუზმე' : 'Breakfast', dish: dishes.breakfast, status: ka ? 'ჭამა' : 'Eaten' },
    { t: ka ? 'შუადღე' : 'Midday', label: ka ? 'სადილი' : 'Lunch', dish: dishes.lunch, status: ka ? 'ჭამა' : 'Eaten' },
    { t: ka ? 'საღამო' : 'Evening', label: ka ? 'ვახშამი' : 'Dinner', dish: dishes.dinner, status: ka ? 'დაგეგმილია' : 'Planned' },
  ];
  return (
    <div className="rounded-3xl bg-white shadow-xl p-5 sm:p-6 w-full">
      <ul className="space-y-4">
        {points.map((p) => (
          <li key={p.label} className="flex items-center gap-3">
            <div className="text-[10px] font-bold uppercase tracking-wide w-12 shrink-0" style={{ color: `${INK}55` }}>{p.t}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: INK }}>{dishLabel(p.dish, ka)}</p>
              <p className="text-[11px]" style={{ color: `${INK}70` }}>{p.label}</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: `${INK}0D`, color: `${INK}B0` }}>{p.status}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${INK}15` }}>
        <p className="text-[11px] font-semibold" style={{ color: `${INK}70` }}>{ka ? 'დღის ბოლოს' : 'End of day'}</p>
        <p className="text-[11px] font-bold" style={{ color: ACCENT }}>{ka ? 'კვების ისტორია' : 'Feeding history'} →</p>
      </div>
    </div>
  );
}

// Central-hub ecosystem diagram for the "core value" section — a radial diagram on tablet/
// desktop (real SVG connecting lines from one center node), a simple hub-then-grid layout
// on mobile where full radial geometry stops being legible.
function EcosystemDiagram({ dishCount, ka }: { dishCount: number; ka: boolean }) {
  const nodes = [
    ka ? 'ბავშვის პროფილი' : 'Child profile',
    ka ? 'გასინჯული პროდუქტები' : 'Tried foods',
    ka ? 'ალერგენები' : 'Allergens',
    ka ? 'კვების გეგმა' : 'Meal plan',
    `${Math.max(dishCount, 6)}+ ${ka ? 'რეცეპტი' : 'recipes'}`,
    ka ? 'რა მაქვს სახლში' : 'What I have',
    ka ? 'საყიდლების სია' : 'Shopping list',
    ka ? 'კვების ისტორია' : 'Feeding history',
    ka ? 'ვიტამინები' : 'Vitamins',
  ];
  const W = 560, H = 500, cx = W / 2, cy = H / 2, r = 210;
  const pos = nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <div className="mx-auto" style={{ maxWidth: 560 }}>
      <div className="hidden md:block relative" style={{ height: H }}>
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`}>
          {pos.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={`${CREAM}30`} strokeWidth="1.5" />
          ))}
        </svg>
        <div
          className="absolute rounded-full flex items-center justify-center text-center px-5 font-bold -translate-x-1/2 -translate-y-1/2"
          style={{ width: 148, height: 148, left: cx, top: cy, background: ACCENT, color: '#fff', fontFamily: SERIF_KA, fontSize: 16, lineHeight: 1.25 }}
        >
          {ka ? 'ბავშვის კვება' : "Child's nutrition"}
        </div>
        {nodes.map((label, i) => (
          <div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-3.5 py-2.5 rounded-2xl text-center"
            style={{ left: pos[i].x, top: pos[i].y, background: `${CREAM}14`, color: CREAM, maxWidth: 130 }}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="md:hidden">
        <div
          className="mx-auto mb-5 rounded-full flex items-center justify-center text-center px-6 font-bold"
          style={{ width: 140, height: 140, background: ACCENT, color: '#fff', fontFamily: SERIF_KA, fontSize: 16 }}
        >
          {ka ? 'ბავშვის კვება' : "Child's nutrition"}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {nodes.map((label) => (
            <div key={label} className="text-xs font-bold px-3 py-2.5 rounded-xl text-center" style={{ background: `${CREAM}14`, color: CREAM }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VALUE_ITEMS: { ka: string; en: string; descKa: string; descEn: string }[] = [
  { ka: 'დაგეგმე', en: 'Plan', descKa: 'კვირის მენიუ ასაკის მიხედვით, ერთხელ.', descEn: 'A weekly menu by age, set once.' },
  { ka: 'მოამზადე', en: 'Cook', descKa: 'გახსენი კერძი და მიყევი რეცეპტს.', descEn: 'Open the dish and follow the recipe.' },
  { ka: 'შეინახე', en: 'Save', descKa: 'დააფიქსირე რა ჭამა და როგორ მოეწონა.', descEn: 'Log what they ate and whether they liked it.' },
  { ka: 'შეცვალე', en: 'Swap', descKa: 'არ მოეწონა? აირჩიე სხვა შესაფერისი კერძი.', descEn: "Didn't work out? Pick another good match." },
  { ka: 'იყიდე', en: 'Shop', descKa: 'მენიუდან გამომდინარე საყიდლების სია.', descEn: 'A shopping list built from the menu.' },
  { ka: 'გაიხსენე', en: 'Recall', descKa: 'რა გასინჯა შენმა შვილმა და როდის.', descEn: 'What your child has tried, and when.' },
];

export default function HomeClient({ s, dishes, dishCount, recentBlogs, planAmounts, testimonials, canLeaveTestimonial }: {
  s: S; dishes: Dishes; dishCount: number; recentBlogs: RecentBlog[];
  planAmounts: Record<BillingInterval, number>;
  testimonials: Testimonial[]; canLeaveTestimonial: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const refStory = useActiveStep(6);
  const storyPin = useScrollStory(6);
  const refCoreValue = useFadeUp();
  const refDaily = useFadeUp();
  const refSummary = useFadeUp();
  const refSummaryRows = useStaggeredFadeUp(90);
  const refPricing = useFadeUp();
  const refPricingCards = useStaggeredFadeUp(140);
  const refFinal = useFadeUp();

  const [loadingPlan, setLoadingPlan] = useState<BillingInterval | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<BillingInterval | null>(null);
  const [promoOpen, setPromoOpen] = useState<Record<BillingInterval, boolean>>({ 1: false, 3: false, 6: false });
  const [promoInput, setPromoInput] = useState<Record<BillingInterval, string>>({ 1: '', 3: '', 6: '' });
  const [promoStatus, setPromoStatus] = useState<Record<BillingInterval, { discount: number; valid: boolean; msg: string } | undefined>>({ 1: undefined, 3: undefined, 6: undefined });
  const [promoLoading, setPromoLoading] = useState<BillingInterval | null>(null);
  // Set when /api/subscription/bog-checkout refuses an interval switch because there's
  // still paid time left on the currently active plan (see that route's onActivePaidPeriod
  // check) — shown as a detail modal instead of a plain alert() so the reason and the way
  // out (cancel, then resubscribe once the paid period ends) are both actually visible.
  const [intervalBlocked, setIntervalBlocked] = useState<{ currentInterval: BillingInterval; renewsAt: string | null } | null>(null);

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
      } else if (data.error === 'interval_switch_blocked') {
        setIntervalBlocked({ currentInterval: data.currentInterval, renewsAt: data.renewsAt ?? null });
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
    // Cent-level rounding — matches applyDiscount() in lib/bog.ts exactly, so the price
    // shown here is never off from what BOG's payment page actually charges.
    return pct > 0 ? Math.round(base * (1 - pct / 100) * 100) / 100 : null;
  };

  const STORY_STEPS: { q: string; visual: JSX.Element }[] = [
    { q: ka ? 'რა მოვამზადო?' : 'What should I make?', visual: <MenuDigestMock dishes={dishes} ka={ka} /> },
    { q: ka ? 'მხოლოდ 10 წუთი მაქვს — რა გავაკეთო?' : 'I only have 10 minutes — what can I make?', visual: <QuickFilterMock dish={dishes.dinner} ka={ka} /> },
    { q: ka ? 'სახლში რაც მაქვს, იმით რამე გამოვა?' : 'Can I make something from what I already have?', visual: <PantryMatchMock dish={dishes.snack} ka={ka} /> },
    { q: ka ? 'ეს უკვე გასინჯული აქვს?' : 'Has this one been tried already?', visual: <TriedChipsMock ka={ka} /> },
    { q: ka ? 'თუ ეს არ მოეწონა, ახლა რა გავაკეთო?' : "If they don't like it, what now?", visual: <DislikeReplaceMock from={dishes.lunch} to={dishes.dinner} ka={ka} /> },
    { q: ka ? 'საყიდლებზე რა ვიყიდო?' : 'What do I need from the store?', visual: <ShoppingListMock ka={ka} /> },
  ];

  return (
    <main style={{ color: INK, background: CREAM, fontFamily: "'Rubik', sans-serif" }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .mm-parallax { transform: none !important; }
        }
        .mm-hero-card { transition: transform 0.5s cubic-bezier(.22,1,.36,1); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: INK }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.14] font-bold mb-6" style={{ color: CREAM, fontFamily: SERIF_KA }}>
                {ka ? 'ბავშვის კვებაზე ყოველდღე ფიქრი აღარ მოგიწევს.' : "You won't have to think about your child's food every single day."}
              </h1>
              <p className="text-base sm:text-lg mb-8" style={{ color: `${CREAM}B0` }}>
                {ka
                  ? 'Mommenu გეხმარება დაგეგმო ბავშვის კვება, იპოვო შესაფერისი კერძი, გამოიყენო ის პროდუქტები, რაც სახლში გაქვს და ყველაფერი ერთ ადგილას აკონტროლო.'
                  : "Mommenu helps you plan your child's meals, find the right dish, use what's already in the kitchen, and keep track of all of it in one place."}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a href={`/register?lang=${locale}`}
                  className="px-7 py-3.5 rounded-full font-bold shadow-md transition text-sm sm:text-base hover:opacity-90"
                  style={{ background: ACCENT, color: '#fff' }}>
                  {ka ? 'Mommenu-ს დაწყება' : 'Start Mommenu'}
                </a>
                <a href="#story" className="text-sm sm:text-base font-bold underline underline-offset-4" style={{ color: CREAM }}>
                  {ka ? 'ნახე როგორ მუშაობს' : 'See how it works'}
                </a>
              </div>
            </div>

            {/* Layered real-product preview — not one screenshot but several connected
                states, so the hero reads as "one system" rather than a single feature. */}
            <div className="relative h-[460px] sm:h-[540px] lg:h-[600px]">
              <div className="mm-parallax mm-hero-card absolute w-[68%] sm:w-[54%]" style={{ left: '0%', top: '32%', transform: 'rotate(-4deg)' }}>
                <PantryMatchMock dish={dishes.breakfast} ka={ka} />
              </div>
              <div className="mm-parallax mm-hero-card absolute w-[58%] sm:w-[48%]" style={{ right: '0%', top: '0%', transform: 'rotate(3deg)' }}>
                <RecipeCardMock dish={dishes.dinner} ka={ka} />
              </div>
              <div className="mm-parallax mm-hero-card absolute w-[64%] sm:w-[54%]" style={{ left: '30%', bottom: '0%', transform: 'rotate(1.5deg)' }}>
                <MenuDigestMock dishes={dishes} ka={ka} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY: "დედის ჩვეულებრივი დღე" ──────────────────────
          Mobile: a normal flowing column where each step fades in/out as it crosses the
          viewport (useActiveStep). Desktop: a genuinely pinned scrollytelling panel — the
          wrapper is 5 viewport-heights tall, the inner panel is position:sticky, so the
          person stays put and the question + visual swap in place as they scroll
          (useScrollStory turns scroll position into a step index). No scroll-jacking, no
          animation library — native scroll read via a rAF-throttled listener. */}
      <section id="story" className="relative z-10" style={{ background: INK }}>
        {/* Mobile / tablet (< lg): flowing list */}
        <div className="lg:hidden py-16 sm:py-28">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="text-2xl sm:text-4xl font-bold mb-14 sm:mb-20 max-w-2xl" style={{ color: CREAM, fontFamily: SERIF_KA }}>
              {ka ? 'ყველაფერი ერთი კითხვით იწყება: დღეს რა ვაჭამო?' : 'It always starts with one question: what do I feed them today?'}
            </h2>
            <div>
              {STORY_STEPS.map((step, i) => (
                <div
                  key={i}
                  ref={(el) => { refStory.refs.current[i] = el; }}
                  className="py-10 sm:py-16 transition-all duration-500 ease-out"
                  style={{
                    opacity: refStory.active === i ? 1 : 0,
                    transform: refStory.active === i ? 'translateY(0)' : 'translateY(18px)',
                  }}
                >
                  <p className="text-3xl sm:text-5xl font-bold" style={{ color: CREAM, fontFamily: SERIF_KA }}>{step.q}</p>
                  <div className="mt-6 max-w-sm">{step.visual}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop (lg+): pinned scrollytelling */}
        <div ref={storyPin.wrapperRef} className="hidden lg:block relative" style={{ height: `${STORY_STEPS.length * 85}vh` }}>
          <div
            className="h-screen flex items-center overflow-hidden left-0 right-0"
            style={{ position: storyPin.pin === 'pinned' ? 'fixed' : 'absolute', top: storyPin.pin === 'after' ? 'auto' : 0, bottom: storyPin.pin === 'after' ? 0 : 'auto' }}
          >
            <div className="max-w-6xl mx-auto px-8 w-full">
              <h2 className="text-4xl font-bold mb-16 max-w-2xl" style={{ color: CREAM, fontFamily: SERIF_KA }}>
                {ka ? 'ყველაფერი ერთი კითხვით იწყება: დღეს რა ვაჭამო?' : 'It always starts with one question: what do I feed them today?'}
              </h2>
              <div className="grid grid-cols-2 gap-20 items-center">
                <div className="relative h-[240px]">
                  {STORY_STEPS.map((step, i) => (
                    <p
                      key={i}
                      className="absolute top-0 left-0 right-0 text-5xl font-bold transition-all duration-500 ease-out"
                      style={{
                        color: CREAM,
                        fontFamily: SERIF_KA,
                        opacity: storyPin.active === i ? 1 : 0,
                        transform: storyPin.active === i ? 'translateY(0)' : 'translateY(18px)',
                      }}
                    >
                      {step.q}
                    </p>
                  ))}
                </div>
                <div className="max-w-sm ml-auto">{STORY_STEPS[storyPin.active].visual}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUE: ecosystem ────────────────────────────── */}
      <section className="relative z-10 py-16 sm:py-28" style={{ background: INK }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div ref={refCoreValue} className="fade-up text-center mb-14 sm:mb-20 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4" style={{ color: CREAM, fontFamily: SERIF_KA }}>
              {ka ? 'Mommenu უბრალოდ რეცეპტების კრებული არ არის.' : "Mommenu isn't just a recipe collection."}
            </h2>
            <p className="text-sm sm:text-base" style={{ color: `${CREAM}A0` }}>
              {ka
                ? 'ის იმახსოვრებს ბავშვის კვებას და ყოველდღიურ გადაწყვეტილებებს ერთმანეთთან აკავშირებს.'
                : "It remembers your child's feeding history and connects your daily decisions to it."}
            </p>
          </div>
          <EcosystemDiagram dishCount={dishCount} ka={ka} />
        </div>
      </section>

      {/* ── DAILY USE ─────────────────────────────────────────── */}
      <section className="relative z-10 py-16 sm:py-28" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div ref={refDaily} className="fade-up grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 max-w-sm w-full mx-auto lg:mx-0">
              <DayTimelineMock dishes={dishes} ka={ka} />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-4xl font-bold mb-4" style={{ color: INK, fontFamily: SERIF_KA }}>
                {ka ? 'Mommenu-ს ერთხელ არ იყენებ. მას ყოველდღიურ რუტინაში იყენებ.' : "You don't use Mommenu once. You use it every day."}
              </h2>
              <p className="text-base sm:text-lg" style={{ color: `${INK}A0` }}>
                {ka
                  ? 'დილით საუზმე, შუადღეს სადილი, საღამოს ვახშამი — და დღის ბოლოს ყველაფერი კვების ისტორიაშია.'
                  : 'Breakfast in the morning, lunch at midday, dinner in the evening — and by the end of the day, it\'s all in the feeding history.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE SUMMARY ─────────────────────────────────────── */}
      <section className="relative z-10 py-16 sm:py-28" style={{ background: INK }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div ref={refSummary} className="fade-up text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: CREAM, fontFamily: SERIF_KA }}>
              {ka ? 'ერთი Mommenu. ნაკლები ფიქრი ყოველდღე.' : 'One Mommenu. Less to think about, every day.'}
            </h2>
          </div>
          <div ref={refSummaryRows}>
            {VALUE_ITEMS.map((item, i) => (
              <div key={item.ka} className="fade-up flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-5"
                style={{ borderTop: i === 0 ? `1px solid ${CREAM}22` : undefined, borderBottom: `1px solid ${CREAM}22` }}>
                <p className="text-xl sm:text-2xl font-bold sm:w-40 shrink-0" style={{ color: CREAM, fontFamily: SERIF_KA }}>
                  {ka ? item.ka : item.en}
                </p>
                <p className="text-sm sm:text-base" style={{ color: `${CREAM}90` }}>{ka ? item.descKa : item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (kept — existing feature, quiet placement before pricing) ── */}
      {(testimonials.length > 0 || canLeaveTestimonial) && (
        <section className="relative z-10 py-16 sm:py-24" style={{ background: CREAM }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-14" style={{ color: INK, fontFamily: SERIF_KA }}>
              {ka ? 'რას ამბობენ მშობლები' : 'What parents say'}
            </h2>

            {canLeaveTestimonial && testimonialStatus !== 'sent' && (
              <div className="mb-10 rounded-3xl p-6" style={{ background: `${INK}08` }}>
                <h3 className="font-bold mb-3" style={{ color: INK }}>
                  {ka ? 'გაგვიზიარე შენი აზრი საიტზე' : 'Share your thoughts about the site'}
                </h3>
                <textarea
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={ka ? 'რას ფიქრობ Mommenu-ზე?' : 'What do you think of Mommenu?'}
                  className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition text-sm bg-white resize-none"
                  style={{ borderColor: `${INK}20`, color: INK }}
                />
                {testimonialStatus === 'error' && (
                  <p className="text-red-600 text-xs mt-1">{ka ? 'შეცდომა. სცადე თავიდან.' : 'Error. Please try again.'}</p>
                )}
                <button onClick={submitTestimonial} disabled={testimonialStatus === 'sending' || !testimonialText.trim()}
                  className="mt-3 px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-50"
                  style={{ background: INK, color: CREAM }}>
                  {testimonialStatus === 'sending' ? (ka ? 'იგზავნება...' : 'Sending...') : (ka ? 'გამოქვეყნება' : 'Submit')}
                </button>
              </div>
            )}

            {testimonialStatus === 'sent' && (
              <p className="mb-10 font-semibold text-sm" style={{ color: INK }}>
                {ka ? 'მადლობა შეფასებისთვის — მალე გამოქვეყნდება.' : 'Thanks for the feedback — it will appear here once reviewed.'}
              </p>
            )}

            {testimonials.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleTestimonials.map((tst) => (
                    <div key={tst.id} className="rounded-2xl p-5" style={{ background: `${INK}06` }}>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: `${INK}D0` }}>&quot;{tst.content}&quot;</p>
                      <p className="text-sm font-bold" style={{ color: INK }}>{tst.authorName}</p>
                    </div>
                  ))}
                </div>
                {!showAllTestimonials && testimonials.length > TESTIMONIALS_PREVIEW_COUNT && (
                  <div className="mt-6">
                    <button onClick={() => setShowAllTestimonials(true)}
                      className="text-sm font-bold underline underline-offset-4" style={{ color: INK }}>
                      {ka ? `ყველას ნახვა (+${testimonials.length - TESTIMONIALS_PREVIEW_COUNT})` : `Show all (+${testimonials.length - TESTIMONIALS_PREVIEW_COUNT})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-16 sm:py-28" style={{ background: INK }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div ref={refPricing} className="fade-up text-center mb-12 sm:mb-16 max-w-xl mx-auto">
            <p className="text-base sm:text-lg" style={{ color: `${CREAM}B0` }}>
              {ka
                ? 'თუ ბავშვის კვებაზე ყოველ კვირას გიწევს ფიქრი, Mommenu სწორედ ამ ფიქრის შესამცირებლად არის შექმნილი.'
                : "If you spend every week thinking about your child's food, Mommenu exists to shrink that thinking."}
            </p>
          </div>
          <div ref={refPricingCards} className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
            {([1, 3, 6] as BillingInterval[]).map((interval) => {
              const price = planAmounts[interval];
              const disc = discountedPrice(interval, price);
              // 6-month plan is the visually recommended tier — the owner's explicit choice
              // for best value, not the previous default of 3.
              const isRecommended = interval === 6;
              const perMonth = (price / interval).toFixed(interval === 6 ? 2 : 0);
              const cadenceKa = interval === 1 ? 'თვეში' : `ყოველ ${interval} თვეში`;
              const cadenceEn = interval === 1 ? 'month' : `${interval} months`;
              const isActive = currentPlan === 'FULL_PLAN' && currentInterval === interval && !loadingPlan;
              // Free trial retired for everyone except promo-code signups (2026-09-13
              // decision) — only a promo code entered on this specific card still grants
              // one, always for exactly PROMO_TRIAL_DAYS.
              const hasTrial = Boolean(promoStatus[interval]?.valid);

              return (
                <div key={interval}
                  className={`fade-up p-7 sm:p-8 rounded-3xl text-center flex flex-col relative transition-transform duration-300 hover:-translate-y-1 ${isRecommended ? 'sm:scale-105 z-10 border-2' : ''}`}
                  style={{ background: CREAM, borderColor: isRecommended ? ACCENT : 'transparent' }}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap shadow-md" style={{ background: ACCENT, color: '#fff' }}>
                        {ka ? 'საუკეთესო ღირებულება' : 'Best value'}
                      </div>
                    </div>
                  )}
                  <div className={isRecommended ? 'h-4 mb-4' : 'h-0 mb-5'} />

                  <h3 className="text-xl font-bold" style={{ color: INK }}>{ka ? `${interval} თვე` : `${interval} Month${interval > 1 ? 's' : ''}`}</h3>

                  <div className="flex justify-center items-baseline gap-1.5 mt-5">
                    {disc ? (
                      <>
                        <span className="text-base font-bold text-red-400 line-through">{price}₾</span>
                        <span className="text-xl font-bold" style={{ color: INK }}>{disc}₾</span>
                      </>
                    ) : (
                      <span className="text-xl font-bold" style={{ color: INK }}>{price}₾</span>
                    )}
                    <span className="text-sm" style={{ color: `${INK}80` }}>{ka ? `/ ${cadenceKa}` : `/ ${cadenceEn}`}</span>
                  </div>
                  <p className="text-sm font-bold mt-1" style={{ color: ACCENT }}>
                    {perMonth}₾{ka ? '/თვე' : '/mo'}
                  </p>

                  {hasTrial && (
                    <p className="text-xs font-bold mt-3" style={{ color: `${INK}80` }}>
                      {ka ? `პირველი ${PROMO_TRIAL_DAYS} დღე უფასოა` : `First ${PROMO_TRIAL_DAYS} days free`}
                    </p>
                  )}
                  {promoStatus[interval]?.valid && <p className="text-xs font-bold mt-1" style={{ color: ACCENT }}>{promoStatus[interval]!.discount}% {ka ? 'ფასდაკლება' : 'off'}</p>}

                  <p className="text-[11px] italic mt-3 mb-5" style={{ color: `${INK}60` }}>
                    {hasTrial
                      ? (ka
                          ? `თანხა ჩამოგეჭრებათ მე-${PROMO_TRIAL_DAYS + 1} დღეს. გაუქმება შესაძლებელია სატესტო პერიოდშივე, სრულიად უფასოდ.`
                          : `You'll be charged on day ${PROMO_TRIAL_DAYS + 1}. Cancel anytime during the trial at no cost.`)
                      : (ka ? 'გადახდა ხდება გამოწერისთანავე.' : 'Charged immediately upon subscribing.')}
                  </p>

                  <div className="flex-1" />

                  <button
                    onClick={() => (promoOpen[interval] ? undefined : setPromoOpen(p => ({ ...p, [interval]: true })))}
                    className="text-xs font-semibold underline underline-offset-4 mb-4"
                    style={{ color: `${INK}70`, display: promoOpen[interval] ? 'none' : 'block' }}
                  >
                    {ka ? 'პრომოკოდი გაქვს?' : 'Have a promo code?'}
                  </button>
                  {promoOpen[interval] && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={promoInput[interval]}
                          onChange={e => { setPromoInput(p => ({ ...p, [interval]: e.target.value })); setPromoStatus(p => ({ ...p, [interval]: { discount: 0, valid: false, msg: '' } })); }}
                          onKeyDown={e => e.key === 'Enter' && validatePromo(interval)}
                          placeholder={ka ? 'პრომოკოდი' : 'Promo code'}
                          className="flex-1 min-w-0 px-3 py-2 border rounded-xl text-sm font-mono uppercase focus:outline-none bg-white"
                          style={{ borderColor: `${INK}20`, color: INK }}
                        />
                        <button onClick={() => validatePromo(interval)} disabled={promoLoading === interval || !promoInput[interval]}
                          className="w-full sm:w-auto px-4 py-2 border rounded-xl text-xs font-bold transition disabled:opacity-40"
                          style={{ borderColor: INK, color: INK }}>
                          {promoLoading === interval ? '...' : (ka ? 'გამოყენება' : 'Apply')}
                        </button>
                      </div>
                      {promoStatus[interval]?.msg && <p className="text-red-600 text-xs mt-1 font-semibold">{promoStatus[interval]!.msg}</p>}
                    </div>
                  )}

                  <button onClick={() => handleSubscribeBog(interval)} disabled={loadingPlan !== null || isActive}
                    className="w-full py-3.5 rounded-full font-bold transition disabled:opacity-60"
                    style={isRecommended ? { background: ACCENT, color: '#fff' } : { border: `2px solid ${INK}`, color: INK }}>
                    {isActive
                      ? (ka ? 'აქტიურია' : 'Active')
                      : loadingPlan === interval
                        ? (ka ? 'მუშავდება...' : 'Processing...')
                        : (ka ? 'შეძენა' : 'Subscribe')}
                  </button>
                  <p className="text-xs mt-3" style={{ color: `${INK}60` }}>
                    {ka ? `ავტომატურად განახლდება ${cadenceKa}. გაუქმება ნებისმიერ დროს.` : `Renews automatically every ${cadenceEn}. Cancel anytime.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative z-10 py-20 sm:py-32" style={{ background: INK }}>
        <div ref={refFinal} className="fade-up max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-9" style={{ color: CREAM, fontFamily: SERIF_KA }}>
            {ka
              ? 'ბავშვის კვების დაგეგმა სრულად ჩვენ მოგვანდე, შენი დრო კი გამოიყენე.'
              : 'Leave the meal planning to us. Use your time for what matters.'}
          </h2>
          <a href={`/register?lang=${locale}`}
            className="inline-block px-8 py-4 rounded-full font-bold shadow-md transition text-base hover:opacity-90"
            style={{ background: ACCENT, color: '#fff' }}>
            {ka ? 'Mommenu-ს დაწყება' : 'Start Mommenu'}
          </a>
        </div>
      </section>

      {intervalBlocked && (
        <IntervalSwitchBlockedModal
          ka={ka}
          currentInterval={intervalBlocked.currentInterval}
          renewsAt={intervalBlocked.renewsAt}
          onClose={() => setIntervalBlocked(null)}
          onGoCancel={() => router.push('/dashboard?tab=settings&focus=cancel')}
        />
      )}
    </main>
  );
}

const INTERVAL_LABEL_KA: Record<BillingInterval, string> = { 1: '1-თვიან', 3: '3-თვიან', 6: '6-თვიან' };
const INTERVAL_LABEL_EN: Record<BillingInterval, string> = { 1: '1-month', 3: '3-month', 6: '6-month' };

// Explains why the "დაიწყე უფასოდ" / "Start Free" click didn't go through: switching
// interval mid-period would otherwise charge immediately AND discard whatever paid days
// remain on the current plan (see the interval_switch_blocked branch in
// app/api/subscription/bog-checkout/route.ts). The way out is to cancel the current plan
// first — access still runs out the paid period, nothing is lost — then come back and pick
// the new interval once it's actually free. Same content/behavior as the identical modal in
// app/subscription/SubscriptionClient.tsx, just bilingual to match this page.
function IntervalSwitchBlockedModal({ ka, currentInterval, renewsAt, onClose, onGoCancel }: {
  ka: boolean;
  currentInterval: BillingInterval;
  renewsAt: string | null;
  onClose: () => void;
  onGoCancel: () => void;
}) {
  const renewsLabel = renewsAt ? new Date(renewsAt).toLocaleDateString(ka ? 'ka-GE' : 'en-GB') : null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F5F1E4] rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="font-black text-[#6F7A5C] text-lg mb-3">
            {ka ? 'ვერ შეგიცვლით პაკეტს სანამ გაქვთ აქტიური გამოწერა' : "You can't change plans while you have an active subscription"}
          </h3>
          {ka ? (
            <>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-3">
                თქვენ ამჟამად გაქვთ აქტიური {INTERVAL_LABEL_KA[currentInterval]} პაკეტი, რომელიც უკვე გადახდილია
                {renewsLabel ? <> და მოქმედია <span className="font-bold">{renewsLabel}</span>-მდე</> : ''}.
              </p>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-3">
                თუ ახლავე გადავრთავთ სხვა პაკეტზე, ახალი პაკეტის თანხა დაუყოვნებლივ ჩამოგეჭრებათ და დარჩენილი
                გადახდილი დღეები დაიკარგება — ეს არასამართლიანი იქნებოდა თქვენთვის, ამიტომ არ ვუშვებთ.
              </p>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-5">
                თუ ნამდვილად გსურთ სხვა პაკეტზე გადასვლა: გააუქმეთ მიმდინარე პაკეტი (წვდომას მაინც არ დაკარგავთ —
                დარჩება {renewsLabel ? `${renewsLabel}-მდე` : 'გადახდილი პერიოდის ბოლომდე'}), და მას შემდეგ რაც ეს
                პერიოდი ამოიწურება, თავისუფლად შეძლებთ ახალი პაკეტის შეძენას.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-3">
                You currently have an active {INTERVAL_LABEL_EN[currentInterval]} plan that's already paid
                {renewsLabel ? <> and runs through <span className="font-bold">{renewsLabel}</span></> : ''}.
              </p>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-3">
                Switching plans right now would charge you immediately for the new plan and discard whatever paid
                days remain on the current one — that wouldn't be fair to you, so we don't allow it.
              </p>
              <p className="text-sm text-[#6F7A5C]/80 leading-relaxed mb-5">
                If you'd still like to switch: cancel your current plan (you won't lose access — it stays through
                {renewsLabel ? ` ${renewsLabel}` : ' the end of the paid period'}), and once that period ends
                you'll be free to pick a new plan.
              </p>
            </>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={onGoCancel}
              className="w-full bg-[#6F7A5C] hover:bg-[#6F7A5C]/90 text-[#F5F1E4] px-5 py-3 rounded-full text-sm font-bold transition"
            >
              {ka ? 'მიმდინარე პაკეტის გაუქმება' : 'Cancel current plan'}
            </button>
            <button
              onClick={onClose}
              className="w-full text-[#6F7A5C]/60 hover:text-[#6F7A5C] px-5 py-2 rounded-full text-sm font-semibold transition"
            >
              {ka ? 'დახურვა' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
