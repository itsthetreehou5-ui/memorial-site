import { NextResponse } from "next/server";

let MESSAGES = []; // in-memory for now

export async function GET() {
  return NextResponse.json({ messages: MESSAGES });
}

export async function POST(req) {
  try {
    const { name, body } = await req.json();

    if (!body || !body.trim()) {
      return NextResponse.json(
        { error: "message body is required" },
        { status: 400 }
      );
    }

    const msg = {
      id: Date.now().toString(),
      name: name && name.trim() ? name.trim() : "Anonymous",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    MESSAGES.unshift(msg);

    return NextResponse.json({ ok: true, message: msg });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
