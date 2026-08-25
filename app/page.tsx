import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';
import { PLAN_AMOUNTS_BY_INTERVAL } from '@/lib/bog';
import { getSession } from '@/lib/auth';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge';

export const metadata: Metadata = {
  title: 'MomMenu - ჯანსაღი მენიუები ბავშვებისთვის',
  description: 'ასაკზე მორგებული მენიუები, რეცეპტები და კვების გეგმები ბავშვებისთვის. მარტივი დაგეგმვა მშობლებისთვის და დაბალანსებული კვება პატარებისთვის.',
  alternates: {
    canonical: '/',
    languages: {
      'ka': '/?lang=ka',
      'en': '/?lang=en',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'MomMenu - ჯანსაღი მენიუები ბავშვებისთვის',
    description: 'ასაკზე მორგებული მენიუები, რეცეპტები და კვების გეგმები ბავშვებისთვის. მარტივი დაგეგმვა მშობლებისთვის და დაბალანსებული კვება პატარებისთვის.',
    url: '/',
    images: [{
      url: '/og-image.png',
      width: 1200, height: 630,
      alt: 'MomMenu - ჯანსაღი მენიუები ბავშვებისთვის',
    }],
  },
};

export default async function Home() {
  const session = await getSession();

  const [raw, breakfast, lunch, snack, dinner, dishCount, recentBlogs, testimonials, ownTestimonial] = await Promise.all([
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
    prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, authorName: true, content: true },
    }),
    session ? prisma.testimonial.findFirst({ where: { userId: session.id }, select: { id: true } }) : null,
  ]);

  const { updatedAt, id, ...s } = raw;

  const planAmounts = {
    1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
    3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
    6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
  };

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
      email: 'info@mommenu.ge',
      contactType: 'customer service',
      availableLanguage: ['Georgian', 'English'],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <HomeClient s={s as any} dishes={{ breakfast, lunch, snack, dinner }} dishCount={dishCount} recentBlogs={recentBlogs} planAmounts={planAmounts}
        testimonials={testimonials} canLeaveTestimonial={!!session && !ownTestimonial} />
    </>
  );
}
