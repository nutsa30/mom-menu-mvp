import Link from "next/link";
import { prisma } from "@/lib/prisma";

const nutrients = [
  { key: "ironMg", label: "Iron / რკინა", unit: "mg" },
  { key: "calciumMg", label: "Calcium / კალციუმი", unit: "mg" },
  { key: "vitaminCmg", label: "Vitamin C / C ვიტამინი", unit: "mg" },
  { key: "vitaminAmcg", label: "Vitamin A / A ვიტამინი", unit: "mcg" },
  { key: "fiberGrams", label: "Fiber / ბოჭკო", unit: "g" },
  { key: "fatGrams", label: "Fat / ცხიმი", unit: "g" },
  { key: "carbsGrams", label: "Carbs / ნახშირწყლები", unit: "g" },
];

export default async function ViewMealPage({
  params,
}: {
  params: { id: string };
}) {
  const dish = await prisma.dish.findUnique({
    where: { id: params.id },
  });

  if (!dish) {
    return <div className="p-10">Meal not found</div>;
  }

  const visibleNutrients = nutrients.filter((nutrient) => {
    const value = dish[nutrient.key as keyof typeof dish];
    return value !== null && value !== undefined && Number(value) > 0;
  });

  return (
    <div>
      <div className="mx-auto max-w-4xl rounded-[32px] bg-[#FDFBF0] p-8 shadow-soft">
        {dish.imageUrl && (
          <img
            src={dish.imageUrl}
            alt={dish.titleEn}
            className="mb-8 h-80 w-full rounded-[32px] object-cover"
          />
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">
              {dish.ageGroups.join(", ")} · {dish.mealType}
            </p>
            <h1 className="text-3xl font-bold">{dish.titleEn}</h1>
            <h2 className="mt-2 text-xl text-on-surface-variant">
              {dish.titleKa}
            </h2>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-outline-variant px-5 py-2 font-semibold"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl bg-background p-6">
            <h3 className="mb-3 font-bold">English description</h3>
            <p className="leading-7 text-on-surface-variant">
              {dish.descriptionEn}
            </p>
          </section>

          <section className="rounded-3xl bg-background p-6">
            <h3 className="mb-3 font-bold">ქართული აღწერა</h3>
            <p className="leading-7 text-on-surface-variant">
              {dish.descriptionKa}
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-background p-6">
          <h3 className="mb-4 font-bold">Nutrients / ვიტამინები და მინერალები</h3>

          {visibleNutrients.length === 0 ? (
            <p className="text-on-surface-variant">
              ვიტამინები ჯერ დამატებული არ არის.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleNutrients.map((nutrient) => {
                const value = dish[nutrient.key as keyof typeof dish];

                return (
                  <div
                    key={nutrient.key}
                    className="flex items-center justify-between rounded-2xl bg-[#FDFBF0] p-4"
                  >
                    <span className="font-semibold">{nutrient.label}</span>
                    <span className="text-on-surface-variant">
                      {Number(value)} {nutrient.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl bg-background p-6">
            <h3 className="mb-3 font-bold">Ingredients (EN)</h3>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              {dish.ingredientsEn.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl bg-background p-6">
            <h3 className="mb-3 font-bold">ინგრედიენტები (KA)</h3>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              {dish.ingredientsKa.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/admin/meals/${dish.id}`}
            className="rounded-full bg-primary-container px-6 py-3 font-semibold text-[#FDFBF0]"
          >
            Edit
          </Link>

          <Link
            href="/admin"
            className="rounded-full border border-outline-variant px-6 py-3 font-semibold"
          >
            Back to admin
          </Link>
        </div>
      </div>
    </div>
  );
}