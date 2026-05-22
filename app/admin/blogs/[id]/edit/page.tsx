import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlogForm from '../../BlogForm';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({ where: { id: params.id } });
  if (!blog) notFound();

  const initialData = {
    titleKa: blog.titleKa,
    titleEn: blog.titleEn,
    contentKa: blog.contentKa,
    contentEn: blog.contentEn,
    imageUrl: blog.imageUrl ?? '',
    images: blog.images ?? [],
    slug: (blog as any).slug ?? '',
    isPublished: blog.isPublished,
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <a
          href="/admin/blogs"
          className="text-sm text-gray-400 hover:text-[#ff7f50] transition font-semibold"
        >
          ← ბლოგები
        </a>
        <span className="text-gray-300">/</span>
        <h1 className="text-3xl font-black text-gray-900">პოსტის რედაქტირება</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <BlogForm initialData={initialData} blogId={blog.id} />
      </div>
    </div>
  );
}
