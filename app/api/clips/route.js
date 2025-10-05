import { NextResponse } from "next/server";

let CLIPS = []; // in-memory

function randToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2,"0")).join("");
}

export async function GET() {
  const publicClips = CLIPS.map(({ deleteToken, ...rest }) => rest);
  return NextResponse.json({ clips: publicClips });
}

export async function POST(req) {
  try {
    const { title, url, author } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ error: "title and url are required" }, { status: 400 });
    }
    const clip = {
      id: Date.now().toString(),
      title, url,
      author: author || "Anonymous",
      deleteToken: randToken(),
      createdAt: new Date().toISOString(),
    };
    CLIPS.unshift(clip);
    const { deleteToken, ...publicClip } = clip;
    return NextResponse.json({ ok:true, clip: publicClip, deleteToken });
  } catch {
    return NextResponse.json({ error:"Invalid request body" }, { status:400 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = req.headers.get("x-delete-token") || searchParams.get("token");
  if (!id || !token) return NextResponse.json({ error:"id and token are required" }, { status:400 });

  const idx = CLIPS.findIndex(c => c.id === id);
  if (idx === -1) return NextResponse.json({ error:"not found" }, { status:404 });
  if (CLIPS[idx].deleteToken !== token) return NextResponse.json({ error:"forbidden" }, { status:403 });

  CLIPS.splice(idx, 1);
  return NextResponse.json({ ok:true });
}
