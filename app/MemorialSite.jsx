"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Always-visible, side-by-side composers.
 * Mixed feed below (clips + messages) newest first.
 * Twitch clips: shows thumbnail first; click swaps to embedded player.
 */

export default function MemorialSite() {
  // Lists
  const [clips, setClips] = useState([]);
  const [messages, setMessages] = useState([]);

  // Composer: clip
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");

  // Composer: message
  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  // UI
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load initial content
  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([
          fetch("/api/clips").then((r) => r.json()).catch(() => ({ clips: [] })),
          fetch("/api/messages").then((r) => r.json()).catch(() => ({ messages: [] })),
        ]);
        setClips(c?.clips ?? []);
        setMessages(m?.messages ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Merge into a single feed (newest first)
  const feed = useMemo(() => {
    const tagged = [
      ...clips.map((c) => ({ type: "clip", ...c })),
      ...messages.map((m) => ({ type: "message", ...m })),
    ];
    return tagged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [clips, messages]);

  // Parse twitch clip slug from various URLs
  const getTwitchSlug = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      // common forms:
      // https://clips.twitch.tv/FunnySlug
      // https://www.twitch.tv/SomeChannel/clip/FunnySlug
      // https://www.twitch.tv/clip/FunnySlug
      const parts = u.pathname.split("/").filter(Boolean);
      // prefer last segment as slug if looks sluggy
      const candidate = parts[parts.length - 1] || parts[0];
      return candidate && candidate.length >= 6 ? candidate : null;
    } catch {
      return null;
    }
  };

  // Fetch oEmbed thumbnail for a Twitch clip (best-effort, CORS-friendly)
  const fetchThumb = async (clipUrl) => {
    try {
      const r = await fetch(
        `https://clips.twitch.tv/oembed?url=${encodeURIComponent(clipUrl)}`
      );
      const j = await r.json();
      return j?.thumbnail_url || null;
    } catch {
      return null;
    }
  };

  // Local cache of thumbnails we’ve looked up
  const [thumbs, setThumbs] = useState({});
  useEffect(() => {
    // look up thumbnails for any clips we don't have yet
    (async () => {
      const needs = clips.filter((c) => !thumbs[c.id]);
      if (!needs.length) return;
      const results = await Promise.all(
        needs.map(async (c) => {
          const t = await fetchThumb(c.url);
          return [c.id, t];
        })
      );
      setThumbs((prev) => {
        const next = { ...prev };
        for (const [id, t] of results) next[id] = t || null;
        return next;
      });
    })();
  }, [clips, thumbs]);

  // Track which clip cards are in "playing" mode
  const [playing, setPlaying] = useState({}); // id -> true/false

  // Actions
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
      setClips((p) => [{ ...data.clip }, ...p]);
      setClipTitle("");
      setClipUrl("");
      setClipName("");
      // prefetch thumb for this one
      const t = await fetchThumb(data.clip.url);
      setThumbs((prev) => ({ ...prev, [data.clip.id]: t || null }));
    } catch (e) {
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
      setMessages((p) => [{ ...data.message }, ...p]);
      setMsgName("");
      setMemory("");
    } catch (e) {
      setError(e.message || "Couldn’t post your message.");
    } finally {
      setBusy(false);
    }
  };

  // Build embed src when playing
  const embedSrcFor = (clip) => {
    const slug = getTwitchSlug(clip.url);
    if (!slug) return null;
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(
      slug
    )}&parent=${encodeURIComponent(parent)}&autoplay=false`;
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="board-header">
        <div>
          <h1 className="board-title">Alex — Afterman7</h1>
          <div className="board-sub">
            1990 – 2025 · A bright, kind, and creative soul whose presence
            touched countless lives.
          </div>
        </div>
        <Link
          href="https://www.gofundme.com/manage/in-loving-memory-of-alex-afterman7-family-support"
          target="_blank"
          className="btn"
        >
          💜 Donate to the Family
        </Link>
      </div>

      {error && (
        <div className="section" style={{ background: "#FFF2F4", borderColor: "#F6C7D1" }}>
          <strong style={{ color: "#7a1339" }}>Error:</strong>{" "}
          <span style={{ color: "#7a1339" }}>{error}</span>
        </div>
      )}

      {/* Always-visible composers, side-by-side */}
      <div className="composer">
        {/* Clip composer */}
        <section className="section">
          <h2 style={{ marginTop: 0 }}>Add a Clip</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="input"
              placeholder="Clip title"
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
            />
            <input
              className="input"
              placeholder="Clip URL or slug"
              value={clipUrl}
              onChange={(e) => setClipUrl(e.target.value)}
            />
            <input
