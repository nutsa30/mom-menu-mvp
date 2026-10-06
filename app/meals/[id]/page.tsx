import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MealDetailClient from './MealDetailClient';
import { getSession } from '@/lib/auth';
import { hasPaidAccess } from '@/lib/paid-access';

export default async function MealDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const dish = await prisma.dish.findUnique({
    where: { id: params.id },
  });

  if (!dish) notFound();
  const session = await getSession();
  const account = session && await prisma.user.findUnique({ where: { id: session.id }, select: { subscriptionStatus: true, isBlocked: true, role: true, paymentFailedAt: true, subscriptionRenewsAt: true } });
  const canViewRecipe = hasPaidAccess(account);
  const visibleDish = canViewRecipe ? dish : { id: dish.id, titleKa: dish.titleKa, titleEn: dish.titleEn, imageUrl: dish.imageUrl };
  return <MealDetailClient dish={visibleDish} canViewRecipe={canViewRecipe} />;
}
