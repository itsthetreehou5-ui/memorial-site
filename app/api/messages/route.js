import { kv } from "@vercel/kv";

const LIST_KEY = "memorial:messages"; // stores JSON strings of messages

// remove one JSON string from a list (count=1); includes safe fallback
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
  const messages = items.map((s) => JSON.parse(s));
  return new Response(JSON.stringify({ messages }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const name = (body.name || "Anonymous").toString().trim().slice(0, 80);
  const text = (body.text || "").toString().trim().slice(0, 2000);
  const addedById = (body.addedById || "").toString().trim().slice(0, 64);

  if (!text || !addedById) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const entry = {
    id: "msg-" + Math.random().toString(36).slice(2),
    name,
    text,
    addedById, // browser/client id for self-delete
    timestamp: new Date().toISOString(),
  };

  await kv.lpush(LIST_KEY, JSON.stringify(entry));
  await kv.ltrim(LIST_KEY, 0, 1999); // keep latest 2000

  return new Response(JSON.stringify({ ok: true, entry }), {
    headers: { "Content-Type": "application/json" },
  });
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

  // Admin check via Authorization: Bearer <ADMIN_TOKEN>
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const isAdmin = token && token === process.env.ADMIN_TOKEN;

  // Find the message
  const items = (await kv.lrange(LIST_KEY, 0, -1)) ?? [];
  const foundJson = items.find((s) => {
    try { return JSON.parse(s).id === id; } catch { return false; }
  });
  if (!foundJson) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
  const msg = JSON.parse(foundJson);

  // Permission: admin OR same addedById as the message
  if (!isAdmin && requesterId !== msg.addedById) {
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
