import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import Link from 'next/link';
import DeleteIngredientButton from '@/components/DeleteIngredientButton';

const TYPE_COLOR: Record<string, string> = {
  FRUIT: 'bg-orange-100 text-orange-700',
  VEGETABLE: 'bg-green-100 text-green-700',
};

const SEASON_ICON: Record<string, string> = {
  SPRING: '🌸', SUMMER: '☀️', AUTUMN: '🍂', WINTER: '❄️',
};

export default async function IngredientsPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];
  const withLang = (href: string) => locale === 'en' ? `${href}?lang=en` : href;

  const items = await prisma.ingredient.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{d.ingredientsTitle}</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} {d.ingredientsDesc}</p>
        </div>
        <Link href={withLang('/admin/ingredients/new')}
          className="bg-[#ff7f50] hover:bg-[#e86e40] text-white px-5 py-2.5 rounded-full font-bold text-sm transition">
          {d.addIngredient}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-[#fdf6f3]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.ingredientName}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.ingredientType}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.seasons}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.ageGroups}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">🍎</div>}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{locale === 'ka' ? item.titleKa : item.titleEn}</p>
                      <p className="text-xs text-gray-400">{locale === 'ka' ? item.titleEn : item.titleKa}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLOR[item.type]}`}>
                    {item.type === 'FRUIT' ? d.fruit : d.vegetable}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {item.seasons.map((s) => SEASON_ICON[s]).join(' ') || '—'}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  {item.ageGroups.map((g) => g.replace('FROM_', '') + 'თვ+').join(', ')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Link href={withLang(`/admin/ingredients/${item.id}`)} className="text-gray-400 hover:text-[#ff7f50] transition">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Link>
                    <DeleteIngredientButton id={item.id} />
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                {d.noIngredients}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
