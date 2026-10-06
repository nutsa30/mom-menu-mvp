import { localizedMetadata } from '@/lib/metadata';
import { hasPaidAccess } from '@/lib/paid-access';
﻿import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { dict } from '@/lib/i18n';
import RecipesClient from '@/components/RecipesClient';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
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
    images: [{ url: `/og?title=Recipes+for+Children&sub=Hundreds+of+age-appropriate%2C+allergy-aware+meals`, width: 1200, height: 630, alt: 'mom menu Recipes' }],
  },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Recipes for babies and children", "Explore age-appropriate recipes and ingredient guides for your child.", "/recipes"); }

export default async function RecipesPage(
  props: {
    searchParams: Promise<{ lang?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const d = dict[locale];

  const session = await getSession();
  let canRead = false;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { subscriptionStatus: true, role: true, isBlocked: true, paymentFailedAt: true, subscriptionRenewsAt: true },
    });
    canRead = hasPaidAccess(user);
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
      tags: true,
      blwNoteKa: true,
      prepTimeMinutes: true,
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


  return (
    <RecipesClient
      dishes={canRead ? dishes : dishes.map(dish => ({ ...dish,
        descriptionKa: dish.descriptionKa.slice(0, 160), descriptionEn: dish.descriptionEn.slice(0, 160),
        ingredientsKa: [], ingredientsEn: [], blwNoteKa: null,
      }))}
      locale={locale}
      canRead={canRead}
      isLoggedIn={!!session}
    />
  );
}
