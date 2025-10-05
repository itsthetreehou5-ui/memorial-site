"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MemorialSite() {
  // ---- Twitch Clips form ----
  const [search, setSearch] = useState("");
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");

  // ---- Messages form ----
  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  // ---- Lists ----
  const [clips, setClips] = useState([]);
  const [messages, setMessages] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load existing items
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch("/api/clips"),
          fetch("/api/messages"),
        ]);
        const c = await cRes.json();
        const m = await mRes.json();
        setClips(Array.isArray(c.clips) ? c.clips : []);
        setMessages(Array.isArray(m.messages) ? m.messages : []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const addClip = async () => {
    setError("");
    if (!clipTitle || !clipUrl) {
      setError("Please include both a title and a clip URL.");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: clipTitle,
          url: clipUrl,
          author: clipName || "Anonymous",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setClips((prev) => [data.clip, ...prev]);
      setClipTitle("");
      setClipUrl("");
      setClipName("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Couldn’t add the clip.");
    } finally {
      setBusy(false);
    }
  };

  const postMessage = async () => {
    setError("");
    if (!memory.trim()) {
      setError("Please write a memory or message.");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: msgName || "Anonymous",
          body: memory.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessages((prev) => [data.message, ...prev]);
      setMsgName("");
      setMemory("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Couldn’t post your message.");
    } finally {
      setBusy(false);
    }
  };

  // Filtered clips (by title/url/author)
  const filteredClips = clips.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.url.toLowerCase().includes(q) ||
      (c.author || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="container">
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <h1>Alex — Afterman7</h1>
        <p>1990 – 2025</p>
        <p>
          A bright, kind, and creative soul whose presence touched countless lives.
        </p>
        <Link
          href="https://www.gofundme.com/manage/in-loving-memory-of-alex-afterman7-family-support"
          target="_blank"
          className="btn"
        >
          💜 Donate to the Family
        </Link>
      </header>

      {/* Error */}
      {error && (
        <div className="card" style={{ background: "#fde7e9", borderColor: "#f7c2c9" }}>
          <strong style={{ color: "#7a1320" }}>Error:</strong>{" "}
          <span style={{ color: "#7a1320" }}>{error}</span>
        </div>
      )}

      {/* Twitch Clips */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Twitch Clips</h2>

        <input
          placeholder="Search clips…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Clip title"
          value={clipTitle}
          onChange={(e) => setClipTitle(e.target.value)}
        />
        <input
          placeholder="Clip URL or slug"
          value={clipUrl}
          onChange={(e) => setClipUrl(e.target.value)}
        />
        <input
          placeholder="Your name (optional)"
          value={clipName}
          onChange={(e) => setClipName(e.target.value)}
        />

        <button className="btn" style={{ marginTop: 8 }} onClick={addClip} disabled={busy}>
          {busy ? "Adding…" : "+ Add"}
        </button>

        {/* List */}
        <div id="clips-list" style={{ marginTop: 16 }}>
          {filteredClips.length === 0 ? (
            <p style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              No clips yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {filteredClips.map((c) => (
                <li
                  key={c.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "white",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.url}
                  </a>
                  <div style={{ fontSize: 13, color: "var(--md-sys-color-on-surface-variant)" }}>
                    by {c.author || "Anonymous"} • {new Date(c.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Messages */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Messages</h2>

        <input
          placeholder="Your name (optional)"
          value={msgName}
          onChange={(e) => setMsgName(e.target.value)}
        />
        <textarea
          placeholder="Share a memory…"
          rows={5}
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
        />

        <button className="btn" onClick={postMessage} disabled={busy}>
          {busy ? "Posting…" : "Post"}
        </button>

        {/* List */}
        <div style={{ marginTop: 16 }}>
          {messages.length === 0 ? (
            <p style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              No messages yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {messages.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "white",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {m.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>• {new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div>{m.body}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer>Made with love • Take care of your heart 💜</footer>
    </main>
  );
}
