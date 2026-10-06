import { prisma } from './prisma';
import { randomUUID } from 'node:crypto';

export async function oncePerLocalDay(userId: string, kind: string, localDate: string, send: () => Promise<void>) {
  const id = randomUUID();
  const claim = await prisma.communicationDelivery.createMany({
    data: [{ id, userId, kind, localDate }], skipDuplicates: true,
  });
  if (!claim.count) return false;
  try { await send(); return true; }
  catch (error) { await prisma.communicationDelivery.delete({ where: { id } }); throw error; }
}
