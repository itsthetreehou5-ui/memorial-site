"use client";

import { useState } from "react";

export default function VideoUpload({ onAdd }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, author }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add clip");

      if (onAdd) onAdd(data.clip);
      setTitle("");
      setUrl("");
      setAuthor("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., Alex’s Speech"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Video URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="https://…"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Contributor (optional)</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Your name"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Add clip"}
      </button>
    </form>
  );
}
