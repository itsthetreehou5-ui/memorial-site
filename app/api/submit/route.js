// app/api/submit/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID(); // built-in in Node 18+/Edge

    // Echo back (or persist to your DB/KV here)
    return NextResponse.json({ ok: true, id, body });
  } catch (err) {
    const message = (err && err.message) ? err.message : 'submit failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
