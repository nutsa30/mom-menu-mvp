import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import DishesAdminList from '@/components/DishesAdminList';

export default async function MealManager({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];

  const ageLabel: Record<string, string> = locale === 'ka'
    ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }
    : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' };

  const dishes = await prisma.dish.findMany({ orderBy: { createdAt: 'desc' } });
  const newHref = locale === 'en' ? '/admin/meals/new?lang=en' : '/admin/meals/new';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{d.mealManagerTitle}</h1>
          <p className="text-gray-400 text-sm mt-1">{dishes.length} {d.recipesInDb}</p>
        </div>
        <a href={newHref}
          className="bg-[#ff7f50] hover:bg-[#e86e40] text-white px-5 py-2.5 rounded-full font-bold text-sm transition">
          {d.addRecipe}
        </a>
      </div>

      <DishesAdminList
        dishes={dishes}
        locale={locale}
        labels={{ view: d.view, meal: d.meal, type: d.type, ageGroups: d.ageGroups, actions: d.actions }}
        ageLabel={ageLabel}
      />
    </div>
  );
}
