import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import IngredientForm from '@/components/IngredientForm';

export default async function EditIngredientPage({ params }: { params: { id: string } }) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!ingredient) notFound();
  return <IngredientForm ingredient={ingredient} />;
}
