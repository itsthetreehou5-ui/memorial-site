import { NextResponse } from "next/server";

let CLIPS = []; // in-memory for now

export async function GET() {
  return NextResponse.json({ clips: CLIPS });
}

export async function POST(req) {
  try {
    const { title, url, author } = await req.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: "title and url are required" },
        { status: 400 }
      );
    }

    const clip = {
      id: Date.now().toString(),
      title,
      url,
      author: author || "Anonymous",
      createdAt: new Date().toISOString(),
    };
    CLIPS.unshift(clip);

    return NextResponse.json({ ok: true, clip });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
