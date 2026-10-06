import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import IngredientForm from '@/components/IngredientForm';

export default async function EditIngredientPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ingredient = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!ingredient) notFound();
  return <IngredientForm ingredient={ingredient} />;
}
