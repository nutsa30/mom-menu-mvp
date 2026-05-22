'use client';

import { useRouter } from 'next/navigation';
import { togglePublished, deleteBlog } from './actions';

export type BlogItem = {
  id: string;
  titleKa: string;
  titleEn: string;
  isPublished: boolean;
  imageUrl: string | null;
  createdAt: Date;
};

export default function BlogsAdminClient({ blogs }: { blogs: BlogItem[] }) {
  const router = useRouter();

  const handleToggle = async (id: string, current: boolean) => {
    await togglePublished(id, !current);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`წაიშლება "${title}"?`)) return;
    await deleteBlog(id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[540px]">
        <thead className="bg-[#fdf6f3]">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">სურათი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">სათაური</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">სტატუსი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">თარიღი</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">მოქმედება</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {blogs.map((blog) => (
            <tr key={blog.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.titleKa}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">
                    📝
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-gray-900 text-sm">{blog.titleKa}</p>
                <p className="text-xs text-gray-400 mt-0.5">{blog.titleEn}</p>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => handleToggle(blog.id, blog.isPublished)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                    blog.isPublished
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      blog.isPublished ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {blog.isPublished ? 'გამოქვეყნებული' : 'დრაფტი'}
                </button>
              </td>
              <td className="px-4 py-4 text-sm text-gray-400">
                {(() => { const d = new Date(blog.createdAt); return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <a
                    href={`/admin/blogs/${blog.id}/edit`}
                    className="text-xs text-[#ff7f50] hover:text-[#e86e40] font-semibold transition"
                  >
                    რედაქტირება
                  </a>
                  <button
                    onClick={() => handleDelete(blog.id, blog.titleKa)}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition"
                  >
                    წაშლა
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
