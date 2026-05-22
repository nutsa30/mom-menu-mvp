import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = 'mommeals';
  const timestamp = Math.round(Date.now() / 1000).toString();

  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const upload = new FormData();
  upload.append('file', file);
  upload.append('api_key', apiKey);
  upload.append('timestamp', timestamp);
  upload.append('signature', signature);
  upload.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: upload,
  });

  const data = await res.json();
  if (!data.secure_url) {
    console.error('Cloudinary error:', data);
    return NextResponse.json({ error: data.error?.message ?? 'Upload failed' }, { status: 500 });
  }

  return NextResponse.json({ url: data.secure_url });
}
