import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ბლოგი — კვება და ჯანმრთელობა ბავშვებისთვის',
  description: 'სტატიები ბავშვის კვების შესახებ: დამატებითი კვება, ალერგენები, ჯანსაღი ჩვევები, რეცეპტები და რჩევები მშობლებისთვის.',
  alternates: {
    canonical: '/blog',
    languages: { 'ka': '/blog?lang=ka', 'en': '/blog?lang=en', 'x-default': '/blog' },
  },
  openGraph: {
    title: 'ბლოგი — კვება და ჯანმრთელობა ბავშვებისთვის',
    description: 'სტატიები ბავშვის კვების შესახებ: დამატებითი კვება, ალერგენები, ჯანსაღი ჩვევები, რეცეპტები.',
    url: '/blog',
    images: [{ url: `/og?title=Blog&sub=Child+Nutrition+%26+Health`, width: 1200, height: 630, alt: 'mom menu Blog' }],
  },
};

// WatercolorBlob is referenced but not defined in the original — keeping as no-op
function WatercolorBlob({ color, opacity, size, style }: any) {
  return null;
}

export default async function BlogListPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true,
      titleKa: true, titleEn: true,
      contentKa: true, contentEn: true,
      imageUrl: true, createdAt: true,
    },
  });

  const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
  const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const fmtDate = (d: Date) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${ka ? KA_M[dt.getMonth()] : EN_M[dt.getMonth()]}, ${dt.getFullYear()}`;
  };

  const getExcerpt = (b: typeof blogs[0], max = 100) => {
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
          <h1 className="text-5xl sm:text-7xl font-black text-[#FDFBF0] leading-none tracking-tight mb-5">
            {ka ? 'ბლო' : 'Bl'}
            <span style={{ color: '#a8c49a' }}>{ka ? 'გი' : 'og'}</span>
          </h1>

          {/* divider + subtitle */}
          <div className="flex items-center gap-4 max-w-lg">
            <div className="w-8 h-px bg-[#FDFBF0]/30 flex-shrink-0" />
            <p className="text-[#FDFBF0]/65 text-sm leading-relaxed">
              {ka
                ? 'სასარგებლო რჩევები, რეცეპტები და ინფორმაცია ბავშვის ჯანსაღი და დაბალანსებული კვებისთვის.'
                : 'Useful tips, recipes, and information for healthy and balanced child nutrition.'}
            </p>
          </div>

        </div>
      </section>

      {/* ── Card grid ── */}
      <div style={{ position: 'relative' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14" style={{ position: 'relative', zIndex: 1 }}>

          {blogs.length === 0 ? (
            <div className="bg-[#FDFBF0] rounded-3xl p-20 text-center shadow-sm">
              <div className="text-6xl mb-5">✏️</div>
              <p className="font-black text-xl text-[#465940] mb-2">{ka ? 'სტატია ჯერ არ არის' : 'No articles yet'}</p>
              <p className="text-sm text-[#465940]/60">{ka ? 'მალე დაემატება.' : 'Coming soon.'}</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto divide-y divide-[#FDFBF0]/10">
              {blogs.map((blog) => {
                const title = ka ? blog.titleKa : blog.titleEn;
                const excerpt = getExcerpt(blog, 180);
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
                        <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: '#3a4d35' }}>🥗</div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
