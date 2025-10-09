// app/api/upload/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // allows larger uploads than 'edge'

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // TODO: persist the file somewhere durable (see notes below)
    // Example placeholder: read bytes (in Node runtime this is supported)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Do something with `buffer` (e.g., upload to Vercel Blob / S3 / etc.)
    // For now just return success
    return NextResponse.json({ ok: true, name: file.name, size: buffer.length });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
