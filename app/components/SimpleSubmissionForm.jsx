"use client";

import { useState } from "react";

export default function SimpleSubmissionForm({ onAdd }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!body.trim()) {
      setError("Please enter a message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");

      // Optionally let parent update its list
      if (onAdd) onAdd(data.message);
      setBody("");
      setName("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Your name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Anonymous"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded border px-3 py-2 min-h-[120px]"
          placeholder="Share a memory or tribute…"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
