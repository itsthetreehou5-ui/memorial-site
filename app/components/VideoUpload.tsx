'use client';
import { useState } from 'react';

export default function VideoUpload({
  onUploaded,
  maxBytes = 500 * 1024 * 1024, // 500MB
}: {
  onUploaded?: (url: string) => void;
  maxBytes?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxBytes) {
      setError('File too large (max ~500MB).');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setVideoUrl(data.url);
      onUploaded?.(data.url);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="video/*" onChange={handleChange} />
      {uploading && <p>Uploading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {videoUrl && <video controls src={videoUrl} className="w-full max-w-2xl rounded-xl" />}
    </div>
  );
}

