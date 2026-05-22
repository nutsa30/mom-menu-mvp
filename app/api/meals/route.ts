import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
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