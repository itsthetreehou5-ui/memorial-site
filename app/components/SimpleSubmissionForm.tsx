'use client';
import { useState } from 'react';
import VideoUpload from './VideoUpload';

export default function SimpleSubmissionForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ name, message, videoUrl }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      setStatus('Error saving submission');
      return;
    }
    setStatus('Saved!');
    setName('');
    setMessage('');
  }

  return (
    <div className="space-y-6">
      <VideoUpload onUploaded={(url) => setVideoUrl(url)} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="border p-2 rounded w-full"
          required
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Your message"
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="border px-4 py-2 rounded">Submit</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
