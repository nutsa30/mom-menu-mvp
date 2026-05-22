import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MealDetailClient from './MealDetailClient';

export default async function MealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const dish = await prisma.dish.findUnique({
    where: { id: params.id },
  });

  if (!dish) notFound();

  return <MealDetailClient dish={dish} />;
}