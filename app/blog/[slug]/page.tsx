import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lang?: string };
}): Promise<Metadata> {
  const blog =
    (await prisma.blog.findUnique({ where: { slug: params.slug } })) ??
    (await prisma.blog.findUnique({ where: { id: params.slug } }));
  if (!blog || !blog.isPublished) return {};

  const ka = searchParams.lang !== 'en';
  const titleKa = blog.titleKa;
  const titleEn = blog.titleEn;
  const title = ka ? titleKa : titleEn;
  const content = ka ? blog.contentKa : blog.contentEn;
  const description = content.slice(0, 155).trimEnd() + (content.length > 155 ? '...' : '');
  const slugPath = (blog as any).slug ?? blog.id;
  const ogImage = blog.imageUrl
    ? blog.imageUrl
    : `/og?title=${encodeURIComponent(titleEn.slice(0, 60))}&sub=moMeals+Blog`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slugPath}`,
      languages: {
        'ka': `/blog/${slugPath}?lang=ka`,
        'en': `/blog/${slugPath}?lang=en`,
        'x-default': `/blog/${slugPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/blog/${slugPath}`,
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: ['moMeals'],
      tags: ['კვება', 'ბავშვი', 'რეცეპტი', 'child nutrition'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lang?: string };
}) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  // Support slug lookup with id fallback for legacy links
  const blog =
    (await prisma.blog.findUnique({ where: { slug: params.slug } })) ??
    (await prisma.blog.findUnique({ where: { id: params.slug } }));
  if (!blog || !blog.isPublished) notFound();

  const title = ka ? blog.titleKa : blog.titleEn;
  const content = ka ? blog.contentKa : blog.contentEn;
  const _d = new Date(blog.createdAt);
  const KA_M = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
  const EN_M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const date = `${_d.getDate()} ${ka ? KA_M[_d.getMonth()] : EN_M[_d.getMonth()]}, ${_d.getFullYear()}`;

  const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);
  const images: string[] = (blog as any).images ?? [];
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://momeals.ge';

  const slugPath = (blog as any).slug ?? blog.id;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: content.slice(0, 155),
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: 'moMeals', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'moMeals',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/og?title=moMeals` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${slugPath}` },
    url: `${siteUrl}/blog/${slugPath}`,
    image: blog.imageUrl || `${siteUrl}/og?title=${encodeURIComponent(blog.titleEn)}`,
    inLanguage: locale,
    keywords: 'ბავშვის კვება, child nutrition, moMeals',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'მთავარი', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'ბლოგი', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl}/blog/${slugPath}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <main className="min-h-screen bg-[#fff8f6]">

      {/* Hero cover image */}
      {blog.imageUrl && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={blog.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <a
          href={`/blog?lang=${locale}`}
          className="inline-block text-sm font-bold text-[#ff7f50] hover:text-[#e86e40] transition mb-8"
        >
          {ka ? '← ბლოგი' : '← Blog'}
        </a>

        <p className="text-xs font-bold text-[#ff7f50] uppercase tracking-wide mb-3">{date}</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
          {title}
        </h1>

        {/* Body text — HTML (TipTap) or legacy plain text */}
        <article>
          {/<[a-z][\s\S]*>/i.test(content) ? (
            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            paragraphs.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-5 text-base">{para}</p>
            ))
          )}
        </article>

        {/* Gallery images */}
        {images.length > 0 && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((url, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
                <img
                  src={url}
                  alt={`${title} — ფოტო ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <a
            href={`/blog?lang=${locale}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#ff7f50] hover:text-[#e86e40] transition"
          >
            {ka ? '← სხვა სტატიები' : '← More articles'}
          </a>
        </div>
      </div>

      <div className="border-t border-orange-100 bg-white py-6 text-center text-xs text-gray-400">
        © 2026 moMeals. {ka ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
      </div>
    </main>
    </>
  );
}
