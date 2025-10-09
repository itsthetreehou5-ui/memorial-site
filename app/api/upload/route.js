export const runtime = 'nodejs'; // allows larger uploads than edge

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: 'Missing file' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // In a real app, store the file somewhere (e.g., Vercel Blob, S3) and return its URL.
    // Here we just echo back metadata.
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    return new Response(
      JSON.stringify({
        name: file.name || 'upload',
        size: bytes.length,
        type: file.type || 'application/octet-stream',
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Upload failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
