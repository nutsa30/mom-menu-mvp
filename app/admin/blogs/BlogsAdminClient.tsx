'use client';

import { useState } from 'react';
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
  const [emailSending, setEmailSending] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    await togglePublished(id, !current);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`წაიშლება "${title}"?`)) return;
    await deleteBlog(id);
    router.refresh();
  };

  const handleSendEmail = async (blog: BlogItem) => {
    if (!confirm(`გაიგზავნოს "${blog.titleKa}" — ყველა მომხმარებელს?`)) return;
    setEmailSending(blog.id);
    try {
      const res = await fetch('/api/admin/blog-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: blog.id }),
      });
      const data = await res.json();
      if (res.ok) alert(`✅ გაიგზავნა ${data.sent}/${data.total} მიმღებზე.`);
      else alert(`❌ შეცდომა: ${data.error}`);
    } catch {
      alert('❌ სერვერის შეცდომა.');
    } finally {
      setEmailSending(null);
    }
  };

  return (
    <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[540px]">
        <thead className="bg-[#465940]">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/70 uppercase tracking-wide">სურათი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/70 uppercase tracking-wide">სათაური</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/70 uppercase tracking-wide">სტატუსი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/70 uppercase tracking-wide">თარიღი</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/70 uppercase tracking-wide">მოქმედება</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#465940]/5">
          {blogs.map((blog) => (
            <tr key={blog.id} className="hover:bg-[#465940]/5 transition">
              <td className="px-6 py-4">
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.titleKa}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#465940]/10 flex items-center justify-center text-[#465940]/40 text-lg">
                    📝
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-[#465940] text-sm">{blog.titleKa}</p>
                <p className="text-xs text-[#465940]/60 mt-0.5">{blog.titleEn}</p>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => handleToggle(blog.id, blog.isPublished)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                    blog.isPublished
                      ? 'bg-[#465940]/20 text-[#465940] hover:bg-[#465940]/30'
                      : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      blog.isPublished ? 'bg-[#465940]' : 'bg-[#FDFBF0]/40'
                    }`}
                  />
                  {blog.isPublished ? 'გამოქვეყნებული' : 'დრაფტი'}
                </button>
              </td>
              <td className="px-4 py-4 text-sm text-[#465940]/60">
                {(() => { const d = new Date(blog.createdAt); return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  {blog.isPublished && (
                    <button
                      onClick={() => handleSendEmail(blog)}
                      disabled={emailSending === blog.id}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#465940]/10 text-[#465940] hover:bg-[#465940]/20 transition disabled:opacity-50"
                    >
                      {emailSending === blog.id ? '...' : '📧 Email'}
                    </button>
                  )}
                  <a
                    href={`/admin/blogs/${blog.id}/edit`}
                    className="text-xs text-[#465940] hover:text-[#465940] font-semibold transition"
                  >
                    რედაქტირება
                  </a>
                  <button
                    onClick={() => handleDelete(blog.id, blog.titleKa)}
                    className="text-xs text-[#FDFBF0]/70 hover:text-[#FDFBF0] font-semibold transition"
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
