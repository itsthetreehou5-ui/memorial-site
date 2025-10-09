// app/api/upload/route.js
export const runtime = 'nodejs'; // keep if you need larger uploads than edge

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file'); // may be null

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    // If you need file bytes:
    // const bytes = await file.arrayBuffer();
    // const buffer = Buffer.from(bytes);
    // NOTE: On Vercel serverless you can only write to /tmp and it’s ephemeral.

    return new Response(
      JSON.stringify({
        ok: true,
        name: file.name || null,
        type: file.type || null,
        size: typeof file.size === 'number' ? file.size : null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upload failed', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
