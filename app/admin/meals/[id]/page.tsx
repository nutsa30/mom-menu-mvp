import { prisma } from "@/lib/prisma";
import EditMealForm from "@/components/EditMealForm";

export default async function EditPage({ params }: { params: { id: string } }) {
  const dish = await prisma.dish.findUnique({
    where: { id: params.id },
  });

  if (!dish) return <div>Not found</div>;

  return <EditMealForm dish={dish} />;
}