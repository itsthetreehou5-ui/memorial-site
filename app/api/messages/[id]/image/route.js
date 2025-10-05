import { NextResponse } from "next/server";
import { MESSAGES } from "../../../_db";  // <-- three dots, not two


// POST /api/messages/:id/image
// Headers: x-delete-token: <creator's token>
// Body: multipart/form-data with field "file"
export async function POST(req, { params }) {
  const id = params.id;
  const token = req.headers.get("x-delete-token");

  if (!id || !token) {
    return NextResponse.json({ error: "id and x-delete-token required" }, { status: 400 });
  }

  const idx = MESSAGES.findIndex((m) => m.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

  const msg = MESSAGES[idx];
  if (msg.deleteToken !== token) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  // Convert to data URL (demo). For prod: upload to S3 / Vercel Blob.
  const arrayBuf = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString("base64");
  const dataUrl = `data:${file.type};base64,${b64}`;

  msg.imageUrl = dataUrl;

  // Return public version (no deleteToken)
  const { deleteToken, ...publicMsg } = msg;
  return NextResponse.json({ ok: true, message: publicMsg });
}
