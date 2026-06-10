import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import Link from 'next/link';
import DeleteIngredientButton from '@/components/DeleteIngredientButton';

const TYPE_COLOR: Record<string, string> = {
  FRUIT: 'bg-[#465940]/20 text-[#465940]',
  VEGETABLE: 'bg-[#465940]/20 text-[#465940]',
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
          <h1 className="text-3xl font-black text-[#465940]">{d.ingredientsTitle}</h1>
          <p className="text-[#465940]/60 text-sm mt-1">{items.length} {d.ingredientsDesc}</p>
        </div>
        <Link href={withLang('/admin/ingredients/new')}
          className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-5 py-2.5 rounded-full font-bold text-sm transition">
          {d.addIngredient}
        </Link>
      </div>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-[#465940]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{d.ingredientName}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{d.ingredientType}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{d.seasons}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{d.ageGroups}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{d.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#465940]/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#465940]/5 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-xl bg-[#465940]/10 flex items-center justify-center text-lg flex-shrink-0">🍎</div>}
                    <div>
                      <p className="text-sm font-semibold text-[#465940]">{locale === 'ka' ? item.titleKa : item.titleEn}</p>
                      <p className="text-xs text-[#465940]/60">{locale === 'ka' ? item.titleEn : item.titleKa}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLOR[item.type]}`}>
                    {item.type === 'FRUIT' ? d.fruit : d.vegetable}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-[#465940]/70">
                  {item.seasons.map((s) => SEASON_ICON[s]).join(' ') || '—'}
                </td>
                <td className="px-4 py-4 text-xs text-[#465940]/70">
                  {item.ageGroups.map((g) => g.replace('FROM_', '') + 'თვ+').join(', ')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Link href={withLang(`/admin/ingredients/${item.id}`)} className="text-[#465940]/60 hover:text-[#FDFBF0] transition">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Link>
                    <DeleteIngredientButton id={item.id} />
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[#465940]/60 text-sm">
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
