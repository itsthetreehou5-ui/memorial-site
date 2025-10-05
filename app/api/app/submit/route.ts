// app/api/submit/route.ts
import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json(); // { name, message, videoUrl }
  const { name, message, videoUrl } = body ?? {};

  if (!name || !message) {
    return new Response('Missing name or message', { status: 400 });
  }

  const id = crypto.randomUUID();
  const submission = {
    id,
    name,
    message,
    videoUrl: videoUrl ?? null,
    createdAt: Date.now(),
  };

  await kv.json.set(`submission:${id}`, '$', submission);
  await kv.lpush('submissions', id);

  return Response.json({ ok: true, id });
}

