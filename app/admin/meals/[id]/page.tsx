import { prisma } from "@/lib/prisma";
import EditMealForm from "@/components/EditMealForm";

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const dish = await prisma.dish.findUnique({
    where: { id: params.id },
  });

  if (!dish) return <div>Not found</div>;

  return <EditMealForm dish={dish} />;
}