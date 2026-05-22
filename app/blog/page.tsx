import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ბლოგი — კვება და ჯანმრთელობა ბავშვებისთვის',
  description: 'სტატიები ბავშვის კვების შესახებ: დამატებითი კვება, ალერგიები, ჯანსაღი ჩვევები, რეცეპტები და რჩევები მშობლებისთვის.',
  alternates: {
    canonical: '/blog',
    languages: { 'ka': '/blog?lang=ka', 'en': '/blog?lang=en', 'x-default': '/blog' },
  },
  openGraph: {
    title: 'ბლოგი — კვება და ჯანმრთელობა ბავშვებისთვის',
    description: 'სტატიები ბავშვის კვების შესახებ: დამატებითი კვება, ალერგიები, ჯანსაღი ჩვევები და რჩევები მშობლებისთვის.',
    url: '/blog',
    images: [{ url: `/og?title=Blog+-+Child+Nutrition+%26+Health&sub=Advice+%26+recipes+for+healthy+children`, width: 1200, height: 630, alt: 'moMeals Blog' }],
  },
};

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      titleKa: true,
      titleEn: true,
      contentKa: true,
      contentEn: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#fff8f6]">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {ka ? 'ბლოგი' : 'Blog'}
          </h1>
          <p className="text-gray-400 text-sm">
            {blogs.length} {ka ? 'სტატია' : 'articles'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {blogs.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📝</div>
            <p className="font-semibold">{ka ? 'სტატია ჯერ არ არის' : 'No articles yet'}</p>
            <p className="text-sm mt-1">{ka ? 'მალე დაემატება.' : 'Coming soon.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map((blog) => {
              const title = ka ? blog.titleKa : blog.titleEn;
              const content = ka ? blog.contentKa : blog.contentEn;
              const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              const excerpt = plain.length > 120 ? plain.slice(0, 120).trimEnd() + '...' : plain;
              const d = new Date(blog.createdAt);
              const KA_M = ['იანვ','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
              const EN_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const date = `${d.getDate()} ${ka ? KA_M[d.getMonth()] : EN_M[d.getMonth()]}, ${d.getFullYear()}`;

              return (
                <a
                  key={blog.id}
                  href={`/blog/${blog.slug ?? blog.id}?lang=${locale}`}
                  className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group block"
                >
                  {/* Cover image */}
                  <div className="relative h-44 bg-[#fdf0ea] overflow-hidden">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📝</div>
                    )}
                    {/* Date badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-600">
                      {date}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-[#7c3a1e] text-sm leading-snug mb-2 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {excerpt}
                    </p>
                    <p className="mt-3 text-xs font-bold text-[#ff7f50] group-hover:underline">
                      {ka ? 'წაიკითხე →' : 'Read more →'}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-orange-100 bg-white py-6 text-center text-xs text-gray-400">
        © 2026 moMeals. {ka ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
      </div>
    </main>
  );
}
