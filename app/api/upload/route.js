// app/api/upload/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // allows larger uploads than edge

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file"); // may be null

  // TODO: handle your file (store, validate, etc.)
  // For now, just echo back whether we received a file
  return NextResponse.json({
    ok: true,
    received: Boolean(file),
  });
}
