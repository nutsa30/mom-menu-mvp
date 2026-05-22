import { prisma } from '@/lib/prisma';

export default async function NewMealPlanPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-[#fff8f6] px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-xl p-10">
        <h1 className="text-3xl font-bold mb-6">Create meal plan</h1>

        <form className="space-y-5">
          <input
            name="titleKa"
            placeholder="გეგმის სათაური ქართულად"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="titleEn"
            placeholder="Plan title in English"
            className="w-full border p-3 rounded-xl"
          />

          <select name="ageGroup" className="w-full border p-3 rounded-xl">
            <option value="FROM_6">6 თვიდან</option>
            <option value="FROM_9">9 თვიდან</option>
            <option value="FROM_12">12 თვიდან</option>
            <option value="FROM_24">24 თვიდან</option>
          </select>

          <input
            name="dayOffset"
            type="number"
            placeholder="Day number, e.g. 1"
            className="w-full border p-3 rounded-xl"
          />

          {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((type) => (
            <div key={type}>
              <label className="block font-semibold mb-2">{type}</label>
              <select name={type} className="w-full border p-3 rounded-xl">
                <option value="">Select dish</option>
                {dishes.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.titleKa || dish.titleEn}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button className="w-full bg-[#ff7f50] text-white py-3 rounded-full font-semibold">
            Save meal plan
          </button>
        </form>
      </div>
    </main>
  );
}