import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = 'mommeals';
  const timestamp = Math.round(Date.now() / 1000).toString();

  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder });
}

