import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'დეშბორდი — moMeals',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { children: { orderBy: { createdAt: 'asc' } } },
  });

  if (!user) return null;

  return <DashboardClient user={user} />;
}
