import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const body = await req.json();
  await redis.lpush('submissions', JSON.stringify(body));
  return NextResponse.json({ ok: true });
}
