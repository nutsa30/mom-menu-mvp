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
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <a
          href="/admin/blogs"
          className="text-sm text-[#465940]/60 hover:text-[#FDFBF0] transition font-semibold"
        >
          ← ბლოგები
        </a>
        <span className="text-[#465940]/40">/</span>
        <h1 className="text-3xl font-black text-[#465940]">პოსტის რედაქტირება</h1>
      </div>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8">
        <BlogForm initialData={initialData} blogId={blog.id} />
      </div>
    </div>
  );
}
