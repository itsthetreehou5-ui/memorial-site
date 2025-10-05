import { NextResponse } from "next/server";

let MESSAGES = []; // in-memory

function randToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2,"0")).join("");
}

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
      deleteToken: randToken(),
      createdAt: new Date().toISOString(),
    };
    MESSAGES.unshift(msg);
    const { deleteToken, ...publicMsg } = msg;
    return NextResponse.json({ ok:true, message: publicMsg, deleteToken });
  } catch {
    return NextResponse.json({ error:"Invalid request body" }, { status:400 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = req.headers.get("x-delete-token") || searchParams.get("token");
  if (!id || !token) return NextResponse.json({ error:"id and token are required" }, { status:400 });

  const idx = MESSAGES.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error:"not found" }, { status:404 });
  if (MESSAGES[idx].deleteToken !== token) return NextResponse.json({ error:"forbidden" }, { status:403 });

  MESSAGES.splice(idx, 1);
  return NextResponse.json({ ok:true });
}
