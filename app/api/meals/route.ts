import { paidApiError } from '@/lib/api-access';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const accessError = await paidApiError();
  if (accessError) return accessError;
  try {
    const dishes = await prisma.dish.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(dishes);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to fetch dishes' },
      { status: 500 }
    );
  }
}
