import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ბლოგი — იდეები და გამოცდილება ბავშვის კვებაზე',
  description: 'სტატიები ბავშვის კვების შესახებ, საჯარო წყაროებზე დაყრდნობით — დამატებითი კვება, რეცეპტები და იდეები მშობლებისთვის. ინფორმაციული ხასიათისაა და არ ცვლის ექიმის კონსულტაციას.',
  alternates: {
    canonical: '/blog',
    languages: { 'ka': '/blog?lang=ka', 'en': '/blog?lang=en', 'x-default': '/blog' },
  },
  openGraph: {
    title: 'ბლოგი — იდეები და გამოცდილება ბავშვის კვებაზე',
    description: 'სტატიები ბავშვის კვების შესახებ, საჯარო წყაროებზე დაყრდნობით — დამატებითი კვება, რეცეპტები და იდეები მშობლებისთვის.',
    url: '/blog',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MomMenu ბლოგი — ბავშვის კვება' }],
  },
};

const POSTS_PER_PAGE = 6;

export default async function BlogListPage({ searchParams }: { searchParams: { lang?: string; page?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      select: {
        id: true, slug: true,
        titleKa: true, titleEn: true,
        contentKa: true, contentEn: true,
        imageUrl: true, createdAt: true,
      },
    }),
    prisma.blog.count({ where: { isPublished: true } }),
  ]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
  const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const fmtDate = (d: Date) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${ka ? KA_M[dt.getMonth()] : EN_M[dt.getMonth()]}, ${dt.getFullYear()}`;
  };

  const getExcerpt = (b: typeof blogs[0], max = 155) => {
    const raw = ka ? b.contentKa : b.contentEn;
    const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length > max ? plain.slice(0, max).trimEnd() + '…' : plain;
  };

  return (
    <main style={{ background: '#465940' }} className="min-h-screen">

      {/* ── Hero ── */}
      <section className="pt-16 pb-12 px-6" style={{ background: '#465940' }}>
        <div className="max-w-3xl mx-auto">

          {/* title */}
          <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-5">
            {ka ? (
              <>
                <span style={{ color: '#FDFBF0' }}>ბ</span>
                <span style={{ color: '#FDFBF0' }}>ლ</span>
                <span style={{ color: '#d8e8c8' }}>ო</span>
                <span style={{ color: '#c0d8a8' }}>გ</span>
                <span style={{ color: '#a8c49a' }}>ი</span>
              </>
            ) : (
              <>
                <span style={{ color: '#FDFBF0' }}>B</span>
                <span style={{ color: '#d8e8c8' }}>l</span>
                <span style={{ color: '#c0d8a8' }}>o</span>
                <span style={{ color: '#a8c49a' }}>g</span>
              </>
            )}
          </h1>

          {/* divider + subtitle */}
          <div className="flex items-center gap-4 max-w-lg">
            <div className="w-8 h-px bg-[#FDFBF0]/30 flex-shrink-0" />
            <p className="text-[#FDFBF0]/65 text-sm leading-relaxed">
              {ka
                ? 'სასარგებლო იდეები, რეცეპტები და ინფორმაცია დედების გამოცდილებიდან და საჯარო წყაროებიდან.'
                : 'Useful ideas, recipes, and information drawn from moms’ experience and publicly available sources.'}
            </p>
          </div>

          <p className="text-[#FDFBF0]/40 text-xs leading-relaxed mt-6 max-w-lg">
            {ka
              ? 'ℹ️ ბლოგის სტატიები ინფორმაციული ხასიათისაა და არ წარმოადგენს სამედიცინო რჩევას. კონკრეტული საკითხებისთვის მიმართეთ ბავშვის ექიმს.'
              : 'ℹ️ Blog articles are informational and do not constitute medical advice. For specific concerns, consult your child’s doctor.'}
          </p>

        </div>
      </section>

      {/* ── Card grid ── */}
      <div style={{ position: 'relative' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14" style={{ position: 'relative', zIndex: 1 }}>

          {blogs.length === 0 ? (
            <div className="bg-[#FDFBF0] rounded-3xl p-20 text-center shadow-sm">
              <div className="text-6xl mb-5"></div>
              <p className="font-black text-xl text-[#465940] mb-2">{ka ? 'სტატია ჯერ არ არის' : 'No articles yet'}</p>
              <p className="text-sm text-[#465940]/60">{ka ? 'მალე დაემატება.' : 'Coming soon.'}</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto divide-y divide-[#FDFBF0]/10">
              {blogs.map((blog) => {
                const title = ka ? blog.titleKa : blog.titleEn;
                const excerpt = getExcerpt(blog);
                const date = fmtDate(blog.createdAt);
                const href = `/blog/${blog.slug ?? blog.id}?lang=${locale}`;

                return (
                  <a
                    key={blog.id}
                    href={href}
                    className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-14"
                  >
                    {/* Left: text */}
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[#FDFBF0]/50 uppercase tracking-widest">{date}</p>
                      <h2 className="font-black text-[#FDFBF0] text-2xl sm:text-3xl leading-snug">
                        {title}
                      </h2>
                      {excerpt && (
                        <p className="text-sm text-[#FDFBF0]/70 leading-relaxed">
                          {excerpt}
                        </p>
                      )}
                      <span className="text-sm font-bold text-[#FDFBF0]/70 group-hover:text-[#FDFBF0] transition-colors mt-2">
                        {ka ? 'წაიკითხე მეტი →' : 'Read more →'}
                      </span>
                    </div>

                    {/* Right: image */}
                    <div className="rounded-3xl overflow-hidden aspect-[4/3] relative">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: '#3a4d35' }}></div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', paddingTop: '3rem', paddingBottom: '2rem' }}>
              {page > 1 && (
                <a
                  href={`/blog?lang=${locale}&page=${page - 1}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FDFBF0', color: '#465940', borderRadius: '999px', padding: '10px 22px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}
                >
                  ← {ka ? 'წინა' : 'Previous'}
                </a>
              )}
              <span style={{ color: '#FDFBF0', fontSize: '0.85rem', opacity: 0.6 }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/blog?lang=${locale}&page=${page + 1}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FDFBF0', color: '#465940', borderRadius: '999px', padding: '10px 22px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}
                >
                  {ka ? 'შემდეგი' : 'Next'} →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
