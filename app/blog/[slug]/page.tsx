import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlogViewTracker from '@/components/BlogViewTracker';
import type { Metadata } from 'next';
import { Suspense } from 'react';

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
  const title = ka ? blog.titleKa : blog.titleEn;
  const content = ka ? blog.contentKa : blog.contentEn;
  const description = content.replace(/<[^>]*>/g, ' ').slice(0, 155).trimEnd() + '...';
  const slugPath = (blog as any).slug ?? blog.id;
  const ogImage = blog.imageUrl ?? `/og?title=${encodeURIComponent(title.slice(0, 60))}&sub=mom+menu+Blog`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slugPath}`,
      languages: { ka: `/blog/${slugPath}?lang=ka`, en: `/blog/${slugPath}?lang=en`, 'x-default': `/blog/${slugPath}` },
    },
    openGraph: {
      title, description, url: `/blog/${slugPath}`, type: 'article',
      publishedTime: blog.createdAt.toISOString(), modifiedTime: blog.updatedAt.toISOString(),
      authors: ['mom menu'], tags: ['კვება', 'ბავშვი', 'რეცეპტი', 'child nutrition'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
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

  const [blog, relatedRaw] = await Promise.all([
    prisma.blog.findUnique({ where: { slug: params.slug } })
      .then(b => b ?? prisma.blog.findUnique({ where: { id: params.slug } })),
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, slug: true, titleKa: true, titleEn: true, imageUrl: true, createdAt: true },
    }),
  ]);

  if (!blog || !blog.isPublished) notFound();

  const title   = ka ? blog.titleKa : blog.titleEn;
  const content = ka ? blog.contentKa : blog.contentEn;
  const plain   = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const slugPath = (blog as any).slug ?? blog.id;
  const related  = relatedRaw.filter(b => b.id !== blog.id).slice(0, 4);
  const images: string[] = (blog as any).images ?? [];
  // images[0] = detail cover (16:7), fallback to imageUrl
  const detailCover = images[0] || blog.imageUrl;
  const siteUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge';

  const KA_M = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
  const EN_M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const _d   = new Date(blog.createdAt);
  const date = `${_d.getDate()} ${ka ? KA_M[_d.getMonth()] : EN_M[_d.getMonth()]}, ${_d.getFullYear()}`;

  const articleJsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, description: plain.slice(0, 155),
    datePublished: blog.createdAt.toISOString(), dateModified: blog.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: 'MomMenu', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'MomMenu', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.png`, width: 1200, height: 630 } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${slugPath}` },
    url: `${siteUrl}/blog/${slugPath}`,
    image: blog.imageUrl ? { '@type': 'ImageObject', url: blog.imageUrl, alt: title } : `${siteUrl}/og-image.png`,
    inLanguage: locale, keywords: 'ბავშვის კვება, child nutrition, MomMenu',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ka ? 'მთავარი' : 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: ka ? 'ბლოგი' : 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl}/blog/${slugPath}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <BlogViewTracker title={title} />

      <main style={{ background: '#465940', minHeight: '100vh' }}>

        {/* Back button */}
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <a href={`/blog?lang=${locale}`}
            className="inline-flex items-center gap-2 text-[#FDFBF0]/70 hover:text-[#FDFBF0] font-semibold text-sm transition">
            ← {ka ? 'ბლოგები' : 'Blog'}
          </a>
        </div>

        {/* ── ARTICLE ── */}
        <div className="max-w-4xl mx-auto px-6 py-8 pb-20">

          {/* Cover image */}
          {detailCover && (
            <div className="rounded-3xl overflow-hidden mb-10" style={{ aspectRatio: '16/9' }}>
              <img src={detailCover} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs text-[#FDFBF0]/40 uppercase tracking-widest mb-4">{date}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#FDFBF0] leading-snug mb-6">{title}</h1>
            <div className="h-px bg-[#FDFBF0]/15" />
          </div>

          {/* Two-column: article + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Article */}
            <div className="lg:col-span-2">
              <article>
                {/<[a-z][\s\S]*>/i.test(content) ? (
                  <div className="prose-blog" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="space-y-5">
                    {plain.split(/\n+/).filter(Boolean).map((para, i) => {
                      const isNumbered = /^\d+\./.test(para);
                      if (isNumbered) return (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FDFBF0]/10 flex items-center justify-center text-xs font-black text-[#FDFBF0] mt-0.5">
                            {para.match(/^\d+/)?.[0]}
                          </span>
                          <p className="m-0 text-[#FDFBF0]/85 leading-relaxed">
                            {para.replace(/^\d+\.\s*/, '')}
                          </p>
                        </div>
                      );
                      return (
                        <p key={i} className={`m-0 leading-[1.9] ${i === 0 ? 'text-[#FDFBF0] text-lg font-medium' : 'text-[#FDFBF0]/80'}`}>
                          {para}
                        </p>
                      );
                    })}
                  </div>
                )}
              </article>

                {/* Gallery — skip images[0] (used as cover) */}
                {images.slice(1).length > 0 && (
                  <div style={{ marginTop: '2.5rem' }}>
                    <div className="columns-2 sm:columns-3 gap-3">
                      {images.slice(1).map((url, i) => (
                        <div key={i} style={{ marginBottom: '0.75rem', borderRadius: '20px', overflow: 'hidden' }} className="break-inside-avoid">
                          <img src={url} alt={`${title} — ${ka ? 'ფოტო' : 'photo'} ${i + 2}`} className="w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Back link */}
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(253,251,240,0.15)' }}>
                <a href={`/blog?lang=${locale}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#FDFBF0', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                  ← {ka ? 'სხვა სტატიები' : 'More articles'}
                </a>
              </div>

              </div>

              {/* ── RIGHT: Sidebar ── */}
              <div className="hidden lg:block">
                <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* Author Card */}
                  <div style={{ background: '#FDFBF0', borderRadius: '24px', padding: '1.75rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#465940', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#FDFBF0', fontWeight: 900, fontSize: '1.4rem' }}>
                      m
                    </div>
                    <div style={{ fontWeight: 900, color: '#465940', fontSize: '1rem' }}>mom menu</div>
                    <div style={{ color: '#465940', fontSize: '0.78rem', opacity: 0.6, marginTop: '4px', marginBottom: '0.9rem' }}>
                      {ka ? 'კვების ექსპერტი' : 'Nutrition Expert'}
                    </div>
                    <a href={`/how-it-works?lang=${locale}`}
                      style={{ display: 'inline-block', background: '#465940', color: '#FDFBF0', borderRadius: '999px', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                      {ka ? 'შესახებ' : 'About'}
                    </a>
                  </div>

                  {/* Newsletter */}
                  <div style={{ background: '#FDFBF0', borderRadius: '24px', padding: '1.75rem' }}>
                    <h3 style={{ fontWeight: 900, color: '#465940', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      {ka ? 'სიახლეები' : 'Newsletter'}
                    </h3>
                    <p style={{ color: '#465940', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '1rem', opacity: 0.7 }}>
                      {ka ? 'მიიღეთ სასარგებლო სტატიები პირდაპირ ელ. ფოსტაზე.' : 'Get useful articles directly to your inbox.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="email"
                        placeholder={ka ? 'ელ. ფოსტა' : 'Email'}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(70,89,64,0.2)', fontSize: '0.82rem', outline: 'none', background: '#fff', color: '#465940', boxSizing: 'border-box' }}
                      />
                      <button style={{ background: '#465940', color: '#FDFBF0', borderRadius: '12px', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                        {ka ? 'გამოწერა' : 'Subscribe'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        {/* ── Related Articles ── */}
        {related.length > 0 && (
          <section style={{ background: '#465940', borderTop: '1px solid rgba(253,251,240,0.1)' }}>
            <div className="max-w-4xl mx-auto px-6 py-12">
              <h2 style={{ fontWeight: 900, color: '#FDFBF0', fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                {ka ? 'მსგავსი სტატიები' : 'Related Articles'}
              </h2>
              <div className="no-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                {related.map((r) => {
                  const rTitle = ka ? r.titleKa : r.titleEn;
                  const rSlug = (r as any).slug ?? r.id;
                  const rDate = new Date(r.createdAt);
                  const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
                  const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const rDateStr = `${rDate.getDate()} ${ka ? KA_M[rDate.getMonth()] : EN_M[rDate.getMonth()]}, ${rDate.getFullYear()}`;
                  return (
                    <a
                      key={r.id}
                      href={`/blog/${rSlug}?lang=${locale}`}
                      style={{
                        minWidth: '180px', flex: '1 1 0',
                        background: 'rgba(253,251,240,0.07)', borderRadius: '18px',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        textDecoration: 'none', border: '1px solid rgba(253,251,240,0.12)',
                      }}
                    >
                      {r.imageUrl && (
                        <div style={{ aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
                          <img
                            src={r.imageUrl}
                            alt={rTitle}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '1rem', flex: 1 }}>
                        <p style={{ fontSize: '0.65rem', color: '#FDFBF0', opacity: 0.4, marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rDateStr}</p>
                        <p style={{ fontWeight: 800, color: '#FDFBF0', fontSize: '0.88rem', lineHeight: 1.45, opacity: 0.92 }}>{rTitle}</p>
                        <p style={{ color: '#ff7f50', fontSize: '0.75rem', marginTop: '0.6rem', fontWeight: 700 }}>
                          {ka ? 'წაიკითხე →' : 'Read →'}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}
