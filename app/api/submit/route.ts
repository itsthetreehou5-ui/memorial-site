// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: persist somewhere (Vercel KV / Upstash / Postgres). For now, echo back.
    const id = crypto.randomUUID();
    return NextResponse.json({ ok: true, id, body });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "submit failed" }, { status: 500 });
  }
}
