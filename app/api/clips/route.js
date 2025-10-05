import { kv } from "@vercel/kv";

const LIST_KEY = "memorial:clips";

// Safe remove function for one JSON string from list
async function lremOne(key, jsonString) {
  try {
    const removed = await kv.lrem(key, 1, jsonString);
    if (typeof removed === "number" && removed > 0) return true;
  } catch (_) {
    const all = await kv.lrange(key, 0, -1);
    const idx = all.indexOf(jsonString);
    if (idx === -1) return false;
    const rebuilt = all.filter((_, i) => i !== idx);
    await kv.del(key);
    if (rebuilt.length) await kv.rpush(key, ...rebuilt);
    return true;
  }
  return false;
}

export async function GET() {
  const items = (await kv.lrange(LIST_KEY, 0, -1)) ?? [];
  const clips = items.map((s) => JSON.parse(s));
  return new Response(JSON.stringify({ clips }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  try {
    let body = {};
    try { body = await req.json(); } catch {}
    const title = (body.title || "").toString().trim().slice(0, 120);
    const url = (body.url || "").toString().trim().slice(0, 500);
    const addedBy = (body.addedBy || "Anonymous").toString().trim().slice(0, 80);
    const addedById = (body.addedById || "").toString().trim().slice(0, 64);

    if (!title || !url || !addedById) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const entry = {
      id: "clip-" + Math.random().toString(36).slice(2),
      title, url, addedBy, addedById,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush(LIST_KEY, JSON.stringify(entry));
    await kv.ltrim(LIST_KEY, 0, 999);

    return new Response(JSON.stringify({ ok: true, entry }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("KV POST /clips failed:", err);
    return new Response(JSON.stringify({ error: "KV write failed (check KV_* env vars locally)" }), { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  let body = {};
  try { body = await req.json(); } catch {}
  const requesterId = (body.addedById || "").toString().trim().slice(0, 64);

  if (!id) {
    return new Response(JSON.stringify({ error: "id required" }), { status: 400 });
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const isAdmin = token && token === process.env.ADMIN_TOKEN;

  const items = (await kv.lrange(LIST_KEY, 0, -1)) ?? [];
  const foundJson = items.find((s) => {
    try { return JSON.parse(s).id === id; } catch { return false; }
  });
  if (!foundJson) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
  const clip = JSON.parse(foundJson);

  if (!isAdmin && requesterId !== clip.addedById) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const ok = await lremOne(LIST_KEY, foundJson);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Delete failed" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
