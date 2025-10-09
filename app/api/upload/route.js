export const runtime = 'nodejs'; // allows larger uploads than edge

export async function POST(req) {
  const form = await req.formData();
  const file = form.get('file');

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // TODO: Put your storage logic here (e.g. S3, Vercel Blob, etc.)
  // For now, just echo back the name and size so it builds.
  const result = { name: file.name || 'upload', size: file.size ?? null };

  return new Response(JSON.stringify({ ok: true, file: result }), {
    headers: { 'content-type': 'application/json' },
  });
}
