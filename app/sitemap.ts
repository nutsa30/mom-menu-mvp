import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://momeals.ge';

function alternates(path: string) {
  return {
    languages: {
      ka: `${SITE_URL}${path}?lang=ka`,
      en: `${SITE_URL}${path}?lang=en`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    select: { slug: true, id: true, updatedAt: true, titleEn: true },
    orderBy: { createdAt: 'desc' },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: alternates('/'),
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: alternates('/how-it-works'),
    },
    {
      url: `${SITE_URL}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: alternates('/recipes'),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alternates('/blog'),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: alternates('/about'),
    },
  ];

  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => {
    const path = `/blog/${b.slug ?? b.id}`;
    return {
      url: `${SITE_URL}${path}`,
      lastModified: b.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: alternates(path),
    };
  });

  return [...staticPages, ...blogPages];
}
