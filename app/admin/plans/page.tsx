import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import {
  PublishToggle,
  DeletePlanButton,
  SortItemButton,
  RemoveItemButton,
  AddItemForm,
} from '@/components/AdminPlanActions';

const mealTypeColor: Record<string, string> = {
  BREAKFAST: 'bg-[#FDFBF0]/10 text-[#465940]',
  LUNCH: 'bg-[#FDFBF0]/10 text-[#465940]',
  DINNER: 'bg-[#FDFBF0]/10 text-[#465940]',
  SNACK: 'bg-[#465940]/20 text-[#465940]',
};

export default async function AdminPlansPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];
  const withLang = (href: string) => locale === 'en' ? `${href}?lang=en` : href;

  const [plans, dishes] = await Promise.all([
    prisma.mealPlan.findMany({
      orderBy: [{ ageGroup: 'asc' }, { dayOffset: 'asc' }],
      include: {
        items: {
          include: { dish: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.dish.findMany({
      orderBy: { titleEn: 'asc' },
      select: { id: true, titleEn: true, titleKa: true, mealType: true },
    }),
  ]);

  const grouped = plans.reduce<Record<string, typeof plans>>((acc, plan) => {
    const key = plan.ageGroup;
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#465940]">{d.planEditorTitle}</h1>
          <p className="mt-1 text-sm text-[#465940]/60">{plans.length} {d.plansTotal}</p>
        </div>
        <Link
          href={withLang('/admin/plans/new')}
          className="rounded-full bg-[#465940] px-6 py-3 font-semibold text-[#FDFBF0] shadow-sm hover:-translate-y-0.5 transition"
        >
          {d.newPlan}
        </Link>
      </div>

      {Object.entries(grouped).map(([ageGroup, groupPlans]) => (
        <section key={ageGroup} className="mb-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#465940]">
            {ageGroup}
          </h2>
          <div className="space-y-4">
            {groupPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm border border-[#f0e4df]"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-bold text-[#465940]">
                      {locale === 'ka' ? plan.titleKa : plan.titleEn}
                    </h3>
                    <p className="text-sm text-[#465940]">
                      {locale === 'ka' ? plan.titleEn : plan.titleKa}
                    </p>
                    <p className="mt-1 text-xs text-[#bbb]">
                      {d.dayOffset}: {plan.dayOffset} · {plan.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PublishToggle planId={plan.id} isActive={plan.isActive} locale={locale} />
                    <DeletePlanButton planId={plan.id} locale={locale} />
                  </div>
                </div>

                {plan.items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {plan.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl bg-[#465940] px-4 py-2"
                      >
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${mealTypeColor[item.mealType] ?? 'bg-[#465940]/10 text-[#465940]/80'}`}
                        >
                          {item.mealType}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-[#465940]">
                          {locale === 'ka' ? (item.dish.titleKa || item.dish.titleEn) : (item.dish.titleEn || item.dish.titleKa)}
                        </span>
                        <div className="flex items-center gap-1">
                          <SortItemButton planId={plan.id} itemId={item.id} direction="up" />
                          <SortItemButton planId={plan.id} itemId={item.id} direction="down" />
                          <RemoveItemButton planId={plan.id} itemId={item.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <AddItemForm planId={plan.id} dishes={dishes} locale={locale} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {plans.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-[#dec0b6] bg-[#FDFBF0] p-12 text-center text-[#465940]">
          {d.noPlansYet}{' '}
          <Link href={withLang('/admin/plans/new')} className="font-semibold text-[#465940]">
            {d.createFirstPlan}
          </Link>
        </div>
      )}
    </div>
  );
}
