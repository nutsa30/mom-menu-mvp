import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { dict } from '@/lib/i18n';
import RecipesClient from '@/components/RecipesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'რეცეპტები — ბავშვის კვება ასაკის მიხედვით',
  description: 'ასობით ჯანსაღი რეცეპტი ბავშვებისთვის — ჩვილებისთვის, მოზარდებისთვის და სკოლამდელი ასაკის ბავშვებისთვის. ყველა რეცეპტი ალერგენების გათვალისწინებით.',
  alternates: {
    canonical: '/recipes',
    languages: { 'ka': '/recipes?lang=ka', 'en': '/recipes?lang=en', 'x-default': '/recipes' },
  },
  openGraph: {
    title: 'რეცეპტები — ბავშვის კვება ასაკის მიხედვით',
    description: 'ასობით ჯანსაღი რეცეპტი ბავშვებისთვის ალერგენების გათვალისწინებით.',
    url: '/recipes',
    images: [{ url: `/og?title=Recipes+for+Children&sub=Hundreds+of+age-appropriate%2C+allergy-aware+meals`, width: 1200, height: 630, alt: 'moMeals Recipes' }],
  },
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const d = dict[locale];

  const session = await getSession();
  let subscriptionStatus = 'FREE';
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { subscriptionStatus: true },
    });
    subscriptionStatus = user?.subscriptionStatus ?? 'FREE';
  }

  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titleKa: true,
      titleEn: true,
      descriptionKa: true,
      descriptionEn: true,
      imageUrl: true,
      mealType: true,
      ageGroups: true,
      allergens: true,
      ingredientsKa: true,
      ingredientsEn: true,
      calories: true,
      proteinGrams: true,
      carbsGrams: true,
      fatGrams: true,
      fiberGrams: true,
      ironMg: true,
      calciumMg: true,
      zincMg: true,
      potassiumMg: true,
      magnesiumMg: true,
      phosphorusMg: true,
      sodiumMg: true,
      vitaminAmcg: true,
      vitaminCmg: true,
      vitaminDmcg: true,
      vitaminEmg: true,
      vitaminKmcg: true,
      vitaminB6mg: true,
      vitaminB12mcg: true,
      folateMcg: true,
      omega3Mg: true,
    },
  });

  const canRead = subscriptionStatus === 'RECIPE_PLAN' || subscriptionStatus === 'FULL_PLAN';

  return (
    <RecipesClient
      dishes={dishes}
      locale={locale}
      canRead={canRead}
      isLoggedIn={!!session}
    />
  );
}
