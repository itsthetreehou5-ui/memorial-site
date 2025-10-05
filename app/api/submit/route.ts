import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const body = await req.json();
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

  await redis.set(`submission:${id}`, submission);
  await redis.lpush('submissions', id);

  return Response.json({ ok: true, id });
}
