"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Adjust the fetch URLs to match your existing API routes.
 * For example, if you already have /app/api/clip/route.js, use "/api/clip".
 * Below uses generic /api/clips and /api/messages for clarity.
 */

export default function MemorialSite() {
  // ---- Twitch Clips form state ----
  const [search, setSearch] = useState("");
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");

  // ---- Messages form state ----
  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  // ---- Admin token (keep if you use it) ----
  const [adminToken, setAdminToken] = useState("");
  const [busy, setBusy] = useState(false);

  // Helpers
  const toast = (m) => window.alert(m);

  const addClip = async () => {
    if (!clipTitle || !clipUrl) {
      toast("Please include both a title and a clip URL.");
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
          author: clipName || null,
          token: adminToken || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Clear fields on success
      setClipTitle("");
      setClipUrl("");
      setClipName("");
      toast("Clip added. 💜");
    } catch (e) {
      console.error(e);
      toast("Sorry—couldn’t add that clip.");
    } finally {
      setBusy(false);
    }
  };

  const postMessage = async () => {
    if (!memory.trim()) {
      toast("Please write a memory or message.");
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
          token: adminToken || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsgName("");
      setMemory("");
      toast("Message posted. 💜");
    } catch (e) {
      console.error(e);
      toast("Sorry—couldn’t post your message.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container">
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <h1>Alex — Afterman7</h1>
        <p>1990 – 2025</p>
        <p>
          A bright, kind, and creative soul whose presence touched countless
          lives.
        </p>

        <Link
          href="https://www.gofundme.com/manage/in-loving-memory-of-alex-afterman7-family-support"
          target="_blank"
          className="btn"
        >
          💜 Donate to the Family
        </Link>
      </header>

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

        <button
          className="btn"
          style={{ marginTop: 8 }}
          onClick={addClip}
          disabled={busy}
        >
          + Add
        </button>

        {/* Render your clips list here if you have one */}
        <div id="clips-list" style={{ marginTop: 16 }} />
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
          Post
        </button>
      </section>

      {/* Admin token (optional control) */}
      <section className="card" style={{ textAlign: "center" }}>
        <input
          placeholder="Admin token"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
        />
        <button className="btn btn--tonal" disabled>
          Enable
        </button>
      </section>

      <footer>Made with love • Take care of your heart 💜</footer>
    </main>
  );
}
