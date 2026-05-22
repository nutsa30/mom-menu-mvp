import { prisma } from '@/lib/prisma';
import BlogsAdminClient from './BlogsAdminClient';

export default async function AdminBlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titleKa: true,
      titleEn: true,
      isPublished: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-black text-gray-900">ბლოგები</h1>
          <p className="text-gray-400 text-sm mt-1">{blogs.length} პოსტი სულ</p>
        </div>
        <a
          href="/admin/blogs/new"
          className="bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
        >
          + ახალი პოსტი
        </a>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">ბლოგ პოსტი ჯერ არ არის</h2>
          <p className="text-gray-400 text-sm mb-6">შექმენი პირველი ბლოგ პოსტი მომხმარებლებისთვის.</p>
          <a
            href="/admin/blogs/new"
            className="inline-block bg-[#ff7f50] hover:bg-[#e86e40] text-white px-6 py-3 rounded-full font-bold text-sm transition"
          >
            პირველი პოსტის შექმნა
          </a>
        </div>
      ) : (
        <BlogsAdminClient blogs={blogs} />
      )}
    </div>
  );
}
