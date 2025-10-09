// app/api/submit/route.ts vercel redeploy
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs"; // Allows larger uploads & full access

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();

    // Save entry in Redis under a unique key
    await redis.hset(`memorial:entry:${id}`, {
      id,
      name: body.name ?? "Anonymous",
      message: body.message ?? "",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("Submit error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Submit failed" }, { status: 500 });
  }
}
