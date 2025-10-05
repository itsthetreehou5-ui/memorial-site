// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // allows larger uploads than edge

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) return new Response('Missing file', { status: 400 });

  if (!file.type.startsWith('video/')) {
    return new Response('Only video files allowed', { status: 415 });
  }

  const key = `videos/${Date.now()}-${file.name}`;

  const blob = await put(key, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  });

  return Response.json({ url: blob.url, pathname: blob.pathname });
}
