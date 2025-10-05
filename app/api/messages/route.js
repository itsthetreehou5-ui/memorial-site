import { NextResponse } from "next/server";
import { MESSAGES, randToken } from "../_db";  // one level up from /messages

export async function GET() {
  const publicMsgs = MESSAGES.map(({ deleteToken, ...rest }) => rest);
  return NextResponse.json({ messages: publicMsgs });
}

export async function POST(req) {
  try {
    const { name, body } = await req.json();
    if (!body || !body.trim()) {
      return NextResponse.json({ error: "message body is required" }, { status: 400 });
    }
    const msg = {
      id: Date.now().toString(),
      name: name?.trim() || "Anonymous",
      body: body.trim(),
      imageUrl: null,
      deleteToken: randToken(),
      createdAt: new Date().toISOString(),
    };
    MESSAGES.unshift(msg);
    const { deleteToken, ...publicMsg } = msg;
    return NextResponse.json({ ok: true, message: publicMsg, deleteToken });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
