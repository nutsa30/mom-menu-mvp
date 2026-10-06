'use client';

import Link from 'next/link';
import Copy from '@/components/Copy';
import { useExperience } from '@/components/ExperienceProvider';
import { localizedField } from '@/lib/content';
import { ingredientQuantity } from '@/lib/measurements';
import MeasurementSwitcher from '@/components/MeasurementSwitcher';

const VITAMINS: { key: string; label: string; unit: string }[] = [
  { key: 'vitaminAmcg',   label: 'A ვიტამინი',  unit: 'mcg' },
  { key: 'vitaminCmg',    label: 'C ვიტამინი',  unit: 'მგ'  },
  { key: 'vitaminDmcg',   label: 'D ვიტამინი',  unit: 'mcg' },
  { key: 'vitaminEmg',    label: 'E ვიტამინი',  unit: 'მგ'  },
  { key: 'vitaminKmcg',   label: 'K ვიტამინი',  unit: 'mcg' },
  { key: 'vitaminB6mg',   label: 'B6 ვიტამინი', unit: 'მგ'  },
  { key: 'vitaminB12mcg', label: 'B12 ვიტამინი',unit: 'mcg' },
  { key: 'folateMcg',     label: 'ფოლატი',       unit: 'mcg' },
];

const MINERALS: { key: string; label: string; unit: string }[] = [
  { key: 'ironMg',        label: 'რკინა',        unit: 'მგ'  },
  { key: 'calciumMg',     label: 'კალციუმი',     unit: 'მგ'  },
  { key: 'zincMg',        label: 'თუთია',        unit: 'მგ'  },
  { key: 'potassiumMg',   label: 'კალიუმი',      unit: 'მგ'  },
  { key: 'magnesiumMg',   label: 'მაგნიუმი',     unit: 'მგ'  },
  { key: 'omega3Mg',      label: 'ომეგა-3',      unit: 'მგ'  },
  { key: 'fiberGrams',    label: 'ბოჭკო',        unit: 'გ'   },
];

export default function MealDetailClient({ dish, canViewRecipe }: { dish: any; canViewRecipe: boolean }) {
  const { locale, units } = useExperience();

  if (!canViewRecipe) {
    return (
      <main className="min-h-screen bg-[#6F7A5C] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="text-[#F5F1E4]/70 hover:text-[#F5F1E4] font-semibold transition"><Copy>{"← დაბრუნება"}</Copy></Link>
          <div className="mt-8 bg-[#F5F1E4] rounded-[40px] shadow-xl overflow-hidden">
            {dish.imageUrl && (
              <img src={dish.imageUrl} alt={localizedField(dish, 'title', locale)} className="w-full h-[420px] object-cover" />
            )}
            <div className="p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-[#6F7A5C] flex items-center justify-center text-5xl mx-auto mb-6"></div>
              <h1 className="text-4xl font-bold mb-4 text-[#6F7A5C]"><Copy>{"რეცეპტი დაბლოკილია"}</Copy></h1>
              <p className="text-[#6F7A5C]/80 text-lg mb-8 leading-8"><Copy>{"რეცეპტის სანახავად საჭიროა აქტიური პაკეტი."}</Copy></p>
              <Link href="/subscription" className="inline-flex items-center justify-center rounded-full bg-[#6F7A5C] px-8 py-4 font-semibold text-[#F5F1E4] shadow-lg hover:scale-105 transition"><Copy>{"პაკეტის შეძენა"}</Copy></Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const presentVitamins = VITAMINS.filter(v => dish[v.key] && dish[v.key] > 0);
  const presentMinerals = MINERALS.filter(m => dish[m.key] && dish[m.key] > 0);

  return (
    <main className="min-h-screen bg-[#6F7A5C] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-[#F5F1E4]/70 hover:text-[#F5F1E4] font-semibold transition"><Copy>{"← დაბრუნება"}</Copy></Link>

        <div className="mt-8 bg-[#F5F1E4] rounded-[40px] shadow-xl overflow-hidden">
          {dish.imageUrl && (
            <img src={dish.imageUrl} alt={localizedField(dish, 'title', locale)} className="w-full h-[420px] object-cover" />
          )}

          <div className="p-8 sm:p-10">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-1 text-[#6F7A5C]">{localizedField(dish, 'title', locale)}</h1>
            {locale === 'ka' && <p className="text-[#6F7A5C]/50 mb-8 text-sm">{dish.titleEn}</p>}

            {/* Description */}
            <div className={`grid ${locale === 'ka' ? 'md:grid-cols-2' : ''} gap-6 mb-10`}>
              {locale === 'ka' && <div>
                <h2 className="text-lg font-bold text-[#6F7A5C] mb-2"><Copy>{"აღწერა"}</Copy></h2>
                <p className="text-[#6F7A5C]/70 leading-7 text-sm">{dish.descriptionKa}</p>
              </div>}
              <div>
                <h2 className="text-lg font-bold text-[#6F7A5C] mb-2">Description</h2>
                <p className="text-[#6F7A5C]/70 leading-7 text-sm">{dish.descriptionEn}</p>
              </div>
            </div>

            {/* Macros */}
            {(dish.calories || dish.proteinGrams) && (
              <div className="grid grid-cols-3 gap-3 mb-10">
                {dish.calories && (
                  <div className="bg-[#6F7A5C]/8 rounded-2xl p-4 text-center border border-[#6F7A5C]/10">
                    <p className="text-xs text-[#6F7A5C]/50 mb-1"><Copy>{"კალორია"}</Copy></p>
                    <p className="text-2xl font-black text-[#6F7A5C]">{dish.calories}</p>
                    <p className="text-xs text-[#6F7A5C]/40"><Copy>{"კკალ"}</Copy></p>
                  </div>
                )}
                {dish.proteinGrams && (
                  <div className="bg-[#6F7A5C]/8 rounded-2xl p-4 text-center border border-[#6F7A5C]/10">
                    <p className="text-xs text-[#6F7A5C]/50 mb-1"><Copy>{"ცილა"}</Copy></p>
                    <p className="text-2xl font-black text-[#6F7A5C]">{dish.proteinGrams}</p>
                    <p className="text-xs text-[#6F7A5C]/40"><Copy>{"გ"}</Copy></p>
                  </div>
                )}
                {dish.carbsGrams && (
                  <div className="bg-[#6F7A5C]/8 rounded-2xl p-4 text-center border border-[#6F7A5C]/10">
                    <p className="text-xs text-[#6F7A5C]/50 mb-1"><Copy>{"ნახშირწყალი"}</Copy></p>
                    <p className="text-2xl font-black text-[#6F7A5C]">{dish.carbsGrams}</p>
                    <p className="text-xs text-[#6F7A5C]/40"><Copy>{"გ"}</Copy></p>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-4"><MeasurementSwitcher /></div>
            <div className={`grid ${locale === 'ka' ? 'md:grid-cols-2' : ''} gap-6 mb-10`}>
              {locale === 'ka' && <div>
                <h2 className="text-lg font-bold text-[#6F7A5C] mb-3"><Copy>{"ინგრედიენტები"}</Copy></h2>
                <ul className="space-y-1.5">
                  {dish.ingredientsKa?.map((item: string) => (
                    <li key={item} className="flex gap-2 text-sm text-[#6F7A5C]/80">
                      <span className="text-[#6F7A5C]/30 flex-shrink-0 mt-0.5">—</span>
                      {ingredientQuantity(item, units)}
                    </li>
                  ))}
                </ul>
              </div>}
              <div>
                <h2 className="text-lg font-bold text-[#6F7A5C] mb-3">Ingredients</h2>
                <ul className="space-y-1.5">
                  {dish.ingredientsEn?.map((item: string) => (
                    <li key={item} className="flex gap-2 text-sm text-[#6F7A5C]/80">
                      <span className="text-[#6F7A5C]/30 flex-shrink-0 mt-0.5">—</span>
                      {ingredientQuantity(item, units)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vitamins & Minerals */}
            {(presentVitamins.length > 0 || presentMinerals.length > 0) && (
              <div className="rounded-3xl bg-[#6F7A5C] p-6 sm:p-8">
                <h2 className="text-xl font-black text-[#F5F1E4] mb-1"><Copy>{"ვიტამინები და მინერალები"}</Copy></h2>
                <p className="text-[#F5F1E4]/50 text-xs mb-6"><Copy>{"ამ კერძის საკვები შემადგენლობა"}</Copy></p>

                {presentVitamins.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[#F5F1E4]/60 text-xs font-bold uppercase tracking-widest mb-3"><Copy>{"ვიტამინები"}</Copy></p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {presentVitamins.map(v => (
                        <div key={v.key} className="bg-[#F5F1E4]/10 rounded-2xl p-3">
                          <p className="text-[#F5F1E4] font-bold text-sm"><Copy>{v.label}</Copy></p>
                          <p className="text-[#F5F1E4]/80 text-xs font-mono mt-1">
                            {dish[v.key]} <Copy>{v.unit}</Copy>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {presentMinerals.length > 0 && (
                  <div>
                    <p className="text-[#F5F1E4]/60 text-xs font-bold uppercase tracking-widest mb-3"><Copy>{"მინერალები"}</Copy></p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {presentMinerals.map(m => (
                        <div key={m.key} className="bg-[#F5F1E4]/10 rounded-2xl p-3">
                          <p className="text-[#F5F1E4] font-bold text-sm"><Copy>{m.label}</Copy></p>
                          <p className="text-[#F5F1E4]/80 text-xs font-mono mt-1">
                            {dish[m.key]} <Copy>{m.unit}</Copy>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
