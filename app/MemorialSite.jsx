"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* -------- delete-token vault (per-browser ownership) -------- */
const TOKEN_KEY = "memorial-delete-tokens";
function loadTokens() {
  if (typeof window === "undefined") return { clips: {}, messages: {} };
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) ?? { clips: {}, messages: {} };
  } catch {
    return { clips: {}, messages: {} };
  }
}
function saveTokens(next) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(next));
}

/* -------- component -------- */
export default function MemorialSite() {
  // data
  const [clips, setClips] = useState([]);
  const [messages, setMessages] = useState([]);

  // composers
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");
  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  // ui
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thumbs, setThumbs] = useState({});
  const [playing, setPlaying] = useState({});
  const [tokens, setTokens] = useState({ clips: {}, messages: {} });

  useEffect(() => {
    setTokens(loadTokens());
  }, []);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([
          fetch("/api/clips").then((r) => r.json()).catch(() => ({ clips: [] })),
          fetch("/api/messages").then((r) => r.json()).catch(() => ({ messages: [] })),
        ]);
        setClips(c?.clips ?? []);
        setMessages(m?.messages ?? []);
      } catch {}
    })();
  }, []);

  // mixed feed
  const feed = useMemo(() => {
    const tagged = [
      ...clips.map((c) => ({ type: "clip", ...c })),
      ...messages.map((m) => ({ type: "message", ...m })),
    ];
    return tagged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [clips, messages]);

  /* ---- Twitch helpers ---- */
  const getTwitchSlug = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      const parts = u.pathname.split("/").filter(Boolean);
      const slug = parts[parts.length - 1];
      return slug && slug.length > 10 ? slug : null;
    } catch {
      return null;
    }
  };

  const fetchThumb = async (clipUrl) => {
    // Try oEmbed
    try {
      const r = await fetch(`https://clips.twitch.tv/oembed?url=${encodeURIComponent(clipUrl)}`);
      if (r.ok) {
        const j = await r.json();
        if (j?.thumbnail_url) return j.thumbnail_url;
      }
    } catch {}
    // Fallback pattern
    const slug = getTwitchSlug(clipUrl);
    if (slug)
      return `https://clips-media-assets2.twitch.tv/${encodeURIComponent(slug)}-preview-480x272.jpg`;
    return null;
  };

  useEffect(() => {
    (async () => {
      const needs = clips.filter((c) => !thumbs[c.id]);
      if (!needs.length) return;
      const pairs = await Promise.all(needs.map(async (c) => [c.id, await fetchThumb(c.url)]));
      setThumbs((prev) => Object.fromEntries([...Object.entries(prev), ...pairs]));
    })();
  }, [clips, thumbs]);

  const embedSrcFor = (clip) => {
    const slug = getTwitchSlug(clip.url);
    if (!slug) return null;
    const parent =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(
      slug
    )}&parent=${encodeURIComponent(parent)}&autoplay=false`;
  };

  /* ---- actions ---- */
  const addClip = async () => {
    setError("");
    if (!clipTitle || !clipUrl) return setError("Please include a title and URL.");
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

      // store delete token locally
      setTokens((prev) => {
        const next = { ...prev, clips: { ...prev.clips, [data.clip.id]: data.deleteToken } };
        saveTokens(next);
        return next;
      });

      // prefetch thumb
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
    if (!memory.trim()) return setError("Please write a message.");
    try {
      setBusy(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: msgName || "Anonymous", body: memory.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessages((p) => [{ ...data.message }, ...p]);
      setMsgName("");
      setMemory("");

      // store delete token
      setTokens((prev) => {
        const next = {
          ...prev,
          messages: { ...prev.messages, [data.message.id]: data.deleteToken },
        };
        saveTokens(next);
        return next;
      });
    } catch (e) {
      setError(e.message || "Couldn’t post your message.");
    } finally {
      setBusy(false);
    }
  };

  const deleteClip = async (id) => {
    const token = tokens.clips[id];
    if (!token) return alert("This post can only be removed by its creator.");
    if (!confirm("Delete this clip?")) return;
    const res = await fetch(`/api/clips?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-delete-token": token },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return alert(body?.error || "Could not delete.");
    setClips((p) => p.filter((c) => c.id !== id));
    setTokens((prev) => {
      const next = { ...prev, clips: { ...prev.clips } };
      delete next.clips[id];
      saveTokens(next);
      return next;
    });
  };

  const deleteMessage = async (id) => {
    const token = tokens.messages[id];
    if (!token) return alert("This post can only be removed by its creator.");
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-delete-token": token },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return alert(body?.error || "Could not delete.");
    setMessages((p) => p.filter((m) => m.id !== id));
    setTokens((prev) => {
      const next = { ...prev, messages: { ...prev.messages } };
      delete next.messages[id];
      saveTokens(next);
      return next;
    });
  };

  /* ---- render ---- */
  return (
    <main className="container">
      {/* Header with avatar and wrapped title */}
      <div className="board-header">
        <div className="title-row">
          <img className="avatar" src="/avatar.jpg" alt="Profile" />
          <div className="title-text">
            <h1 className="board-title">Alex — Afterman7</h1>
            <div className="board-sub">
              1990 – 2025 · A bright, kind, and creative soul whose presence
              touched countless lives.
            </div>
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
        <div
          className="section"
          style={{ background: "#FFF2F4", borderColor: "#F6C7D1" }}
        >
          <strong style={{ color: "#7a1339" }}>Error:</strong>{" "}
          <span style={{ color: "#7a1339" }}>{error}</span>
        </div>
      )}

      {/* Equal-height, always-visible composers */}
      <div className="composer">
        {/* Clip composer */}
        <section className="section">
          <h2 style={{ margin: 0 }}>Add a Clip</h2>
          <div className="fields">
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
              className="input full"
              placeholder="Your name (optional)"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn" onClick={addClip} disabled={busy}>
              {busy ? "Adding…" : "Add Clip"}
            </button>
          </div>
        </section>

        {/* Message composer */}
        <section className="section">
          <h2 style={{ margin: 0 }}>Post a Message</h2>
          <div className="fields">
            <input
              className="input"
              placeholder="Your name (optional)"
              value={msgName}
              onChange={(e) => setMsgName(e.target.value)}
            />
            <div className="full">
              <textarea
                className="textarea textarea--compact"
                placeholder="Share a memory…"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
            </div>
          </div>
          <div className="actions">
            <button className="btn" onClick={postMessage} disabled={busy}>
              {busy ? "Posting…" : "Post Message"}
            </button>
          </div>
        </section>
      </div>

      {/* Mixed feed */}
      <div className="feed">
        {feed.length === 0 ? (
          <div className="section muted">No posts yet.</div>
        ) : (
          feed.map((item) =>
            item.type === "clip" ? (
              <article className="card" key={`c-${item.id}`}>
                <h3 className="card-title" style={{ marginTop: 0 }}>
                  {item.title}
                </h3>

                <div className="meta-row">
                  <span className="chip">
                    by {item.author?.trim() || "Anonymous"}
                  </span>
                  <span className="chip">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {playing[item.id] ? (
                  (() => {
                    const src = embedSrcFor(item);
                    return src ? (
                      <div className="embed rounded" style={{ aspectRatio: "16/9" }}>
                        <iframe
                          src={src}
                          allowFullScreen
                          scrolling="no"
                          frameBorder="0"
                          width="100%"
                          height="100%"
                          title={item.title}
                        />
                      </div>
                    ) : (
                      <a
                        className="link-btn"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open on Twitch ↗
                      </a>
                    );
                  })()
                ) : (
                  <div className="embed rounded" style={{ aspectRatio: "16/9" }}>
                    {thumbs[item.id] ? (
                      <img src={thumbs[item.id]} alt={item.title} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color: "#fff",
                        }}
                      >
                        Preview unavailable
                      </div>
                    )}
                    <div
                      className="play"
                      onClick={() =>
                        setPlaying((p) => ({ ...p, [item.id]: true }))
                      }
                    >
                      <span className="btn">▶︎ Play</span>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                    gap: 8,
                  }}
                >
                  <a
                    className="link-btn"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on Twitch ↗
                  </a>
                  {tokens.clips[item.id] && (
                    <button
                      className="btn-tonal btn"
                      onClick={() => deleteClip(item.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ) : (
              <article className="card" key={`m-${item.id}`}>
                <div className="card-title" style={{ marginTop: 0 }}>
                  {item.name || "Anonymous"}
                </div>
                <div className="card-meta">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
                <div>{item.body}</div>
                {tokens.messages[item.id] && (
                  <div
                    style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
                  >
                    <button
                      className="btn-tonal btn"
                      onClick={() => deleteMessage(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            )
          )
        )}
      </div>

      <p className="muted" style={{ marginTop: 18 }}>
        Made with love · Take care of your heart 💜
      </p>
    </main>
  );
}
