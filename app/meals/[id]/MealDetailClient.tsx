'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const nutrients = [
  { key: 'ironMg', label: 'Iron / რკინა' },
  { key: 'calciumMg', label: 'Calcium / კალციუმი' },
  { key: 'vitaminCmg', label: 'Vitamin C / C ვიტამინი' },
  { key: 'vitaminAmcg', label: 'Vitamin A / A ვიტამინი' },
  { key: 'fiberGrams', label: 'Fiber / ბოჭკო' },
  { key: 'fatGrams', label: 'Fat / ცხიმი' },
  { key: 'carbsGrams', label: 'Carbs / ნახშირწყლები' },
];

function getLevel(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value >= 2) return 'good';
  return 'some';
}

export default function MealDetailClient({ dish }: { dish: any }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {});
  }, []);

  const canViewRecipe =
    user?.subscriptionStatus === 'RECIPE_PLAN' ||
    user?.subscriptionStatus === 'FULL_PLAN';

  if (!canViewRecipe) {
    return (
      <main className="min-h-screen bg-[#465940] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="text-[#FDFBF0]/70 hover:text-[#FDFBF0] font-semibold transition">
            ← დაბრუნება
          </Link>
          <div className="mt-8 bg-[#FDFBF0] rounded-[40px] shadow-xl overflow-hidden">
            {dish.imageUrl && (
              <img src={dish.imageUrl} alt={dish.titleEn || dish.titleKa} className="w-full h-[420px] object-cover" />
            )}
            <div className="p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-[#465940] flex items-center justify-center text-5xl mx-auto mb-6">
                🔒
              </div>
              <h1 className="text-4xl font-bold mb-4 text-[#465940]">რეცეპტი დაბლოკილია</h1>
              <p className="text-[#465940]/80 text-lg mb-8 leading-8">
                რეცეპტის სანახავად საჭიროა 15₾ ან 30₾ პაკეტი.
              </p>
              <Link
                href="/subscription"
                className="inline-flex items-center justify-center rounded-full bg-[#465940] px-8 py-4 font-semibold text-[#FDFBF0] shadow-lg hover:scale-105 transition"
              >
                პაკეტის შეძენა
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#465940] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-[#FDFBF0]/70 hover:text-[#FDFBF0] font-semibold transition">
          ← დაბრუნება
        </Link>
        <div className="mt-8 bg-[#FDFBF0] rounded-[40px] shadow-xl overflow-hidden">
          {dish.imageUrl && (
            <img src={dish.imageUrl} alt={dish.titleEn || dish.titleKa} className="w-full h-[420px] object-cover" />
          )}
          <div className="p-10">
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-[#465940] text-[#a43c12] font-semibold">
              {dish.mealType}
            </span>
            <h1 className="text-4xl font-bold mb-2">{dish.titleKa}</h1>
            <p className="text-[#465940]/70 mb-8">{dish.titleEn}</p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-bold mb-3">აღწერა</h2>
                <p className="text-[#465940] leading-7">{dish.descriptionKa}</p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-[#465940] leading-7">{dish.descriptionEn}</p>
              </div>
            </div>

            <section className="mb-10 rounded-3xl bg-[#465940] p-6">
              <h2 className="mb-4 text-xl font-bold">ვიტამინები და მინერალები</h2>
              <div className="flex flex-wrap gap-3">
                {nutrients.map((nutrient) => {
                  const value = dish[nutrient.key];
                  const level = getLevel(value);
                  if (!level) return null;
                  return (
                    <span key={nutrient.key} className="inline-flex items-center gap-2 rounded-full bg-[#FDFBF0] px-4 py-2 text-sm font-semibold text-[#465940]">
                      <span className={`h-4 w-4 rounded-full ${level === 'good' ? 'bg-[#465940]' : 'bg-[#FDFBF0]/10'}`} />
                      {nutrient.label}
                    </span>
                  );
                })}
              </div>
            </section>

            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#465940] p-5 rounded-2xl">
                <p className="text-sm text-[#465940]/70">Calories</p>
                <p className="text-2xl font-bold">{dish.calories || '-'} kcal</p>
              </div>
              <div className="bg-[#465940] p-5 rounded-2xl">
                <p className="text-sm text-[#465940]/70">Protein</p>
                <p className="text-2xl font-bold">{dish.proteinGrams || '-'} g</p>
              </div>
              <div className="bg-[#465940] p-5 rounded-2xl">
                <p className="text-sm text-[#465940]/70">Age groups</p>
                <p className="text-lg font-bold">{dish.ageGroups?.join(', ')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-3">ინგრედიენტები</h2>
                <ul className="list-disc pl-5 space-y-2 text-[#465940]">
                  {dish.ingredientsKa?.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Ingredients</h2>
                <ul className="list-disc pl-5 space-y-2 text-[#465940]">
                  {dish.ingredientsEn?.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
