import { requireAdmin } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen bg-[#465940]">
      <AdminNav />
      <div className="flex-1 overflow-auto pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0">{children}</div>
    </div>
  );
}
