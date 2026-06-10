import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge';

export const metadata: Metadata = {
  title: 'mom menu — პერსონალური კვების გეგმა ბავშვისთვის',
  description: 'შექმენი შენი ბავშვის ასაკის და გემოვნების მიხედვით მარგებული კვების გეგმა. ასობით რეცეპტი, ალერგენების გათვალისწინება და ავტომატური საყიდლების სია.',
  alternates: {
    canonical: '/',
    languages: {
      'ka': '/?lang=ka',
      'en': '/?lang=en',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'mom menu — პერსონალური კვების გეგმა ბავშვისთვის',
    description: 'შექმენი შენი ბავშვის ასაკის და გემოვნების მიხედვით მარგებული კვების გეგმა.',
    url: '/',
    images: [{
      url: `/og?title=Personal+Meal+Plans+for+Your+Child&sub=Hundreds+of+recipes%2C+allergy-aware+%26+personalized`,
      width: 1200, height: 630,
      alt: 'mom menu — ბავშვის კვების გეგმა',
    }],
  },
};

export default async function Home() {
  const [raw, breakfast, lunch, snack, dinner, dishCount, recentBlogs] = await Promise.all([
    prisma.homePageSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    }),
    prisma.dish.findFirst({ where: { mealType: 'BREAKFAST' }, orderBy: { createdAt: 'desc' }, select: { titleKa: true, titleEn: true, imageUrl: true } }),
    prisma.dish.findFirst({ where: { mealType: 'LUNCH' },     orderBy: { createdAt: 'desc' }, select: { titleKa: true, titleEn: true, imageUrl: true } }),
    prisma.dish.findFirst({ where: { mealType: 'SNACK' },     orderBy: { createdAt: 'desc' }, select: { titleKa: true, titleEn: true, imageUrl: true } }),
    prisma.dish.findFirst({ where: { mealType: 'DINNER' },    orderBy: { createdAt: 'desc' }, select: { titleKa: true, titleEn: true, imageUrl: true } }),
    prisma.dish.count(),
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, slug: true, titleKa: true, titleEn: true, imageUrl: true, createdAt: true, contentKa: true, contentEn: true },
    }),
  ]);

  const { updatedAt, id, ...s } = raw;

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'mom menu',
    url: SITE_URL,
    description: 'პერსონალური ყოველდღიური კვების გეგმა ბავშვებისთვის',
    inLanguage: ['ka', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/recipes?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'mom menu',
    url: SITE_URL,
    logo: `${SITE_URL}/og?title=mom+menu`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Georgian', 'English'],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <HomeClient s={s as any} dishes={{ breakfast, lunch, snack, dinner }} dishCount={dishCount} recentBlogs={recentBlogs} />
    </>
  );
}
