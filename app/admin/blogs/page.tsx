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
          <h1 className="text-3xl font-black text-[#465940]">ბლოგები</h1>
          <p className="text-[#465940]/60 text-sm mt-1">{blogs.length} პოსტი სულ</p>
        </div>
        <a
          href="/admin/blogs/new"
          className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] font-bold px-5 py-2.5 rounded-full text-sm transition"
        >
          + ახალი პოსტი
        </a>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-bold text-[#465940] mb-2">ბლოგ პოსტი ჯერ არ არის</h2>
          <p className="text-[#465940]/60 text-sm mb-6">შექმენი პირველი ბლოგ პოსტი მომხმარებლებისთვის.</p>
          <a
            href="/admin/blogs/new"
            className="inline-block bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-6 py-3 rounded-full font-bold text-sm transition"
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
