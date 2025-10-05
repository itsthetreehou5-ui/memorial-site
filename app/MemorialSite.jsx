"use client";
import React from "react";

export default function MemorialSite() {
  // --------- Config ---------
  const person = {
    name: "Alex — Afterman7",
    dates: "1990–2025",
    avatar:
      "https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1200&auto=format&fit=crop",
    gofundme: "https://gofund.me/5ac54ab96",
    tagline:
      "A bright, kind, and creative soul whose presence touched countless lives.",
  };

  const service = {
    date: "Sunday, Oct 5, 2025",
    time: "3:00 PM MT",
    location: "Online Memorial Stream",
    streamUrl: "https://twitch.tv/dthoma5",
  };

  // --------- “Kudoboard” style helpers ---------
  const noteThemes = [
    { wrap: "rotate-[0.4deg]",   card: "bg-amber-50 border-amber-200",     pin: "📌" },
    { wrap: "-rotate-[0.6deg]",  card: "bg-rose-50 border-rose-200",       pin: "📎" },
    { wrap: "rotate-[0.3deg]",   card: "bg-sky-50 border-sky-200",         pin: "🧷" },
    { wrap: "-rotate-[0.2deg]",  card: "bg-lime-50 border-lime-200",       pin: "📍" },
    { wrap: "rotate-[0.2deg]",   card: "bg-violet-50 border-violet-200",   pin: "⭐"  },
  ];
  const themeFor = (i) => noteThemes[i % noteThemes.length];

  // --------- State ---------
  const [clips, setClips] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [msgForm, setMsgForm] = React.useState({ name: "", text: "" });
  const [clipForm, setClipForm] = React.useState({ title: "", url: "", name: "" });
  const [filter, setFilter] = React.useState("");

  const [modEnabled, setModEnabled] = React.useState(false);
  const [modInput, setModInput] = React.useState("");
  const [adminToken, setAdminToken] = React.useState("");

  // stable per-browser id for self-delete permissions
  const [clientId, setClientId] = React.useState("");
  React.useEffect(() => {
    const key = "memorial-client-id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    setClientId(id);
  }, []);

  // --------- Load from KV ---------
  React.useEffect(() => {
    (async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch("/api/clips", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
        ]);
        const cJson = await cRes.json();
        const mJson = await mRes.json();
        setClips(cJson.clips ?? []);
        setMessages(mJson.messages ?? []);
      } catch {
        setClips([]);
        setMessages([]);
      }
    })();
  }, []);

  // --------- Helpers ---------
  function isoToReadable(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
  }

  function parseTwitchSlug(input) {
    if (!input) return null;
    // allow letters, numbers, hyphens, underscores; accept full URLs or slug
    const m = String(input).match(/(?:clips\.twitch\.tv\/|twitch\.tv\/clip\/)?([A-Za-z0-9_-]+)$/);
    return m ? m[1] : null;
  }

  function twitchEmbedUrl(input) {
    const slug = parseTwitchSlug(input);
    if (!slug) return null;
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://clips.twitch.tv/embed?clip=${slug}&parent=${parent}&autoplay=false&muted=true`;
  }

  // --------- Clips: create & delete ---------
  async function handleClipSubmit(e) {
    e.preventDefault();
    const title = clipForm.title.trim();
    const url = clipForm.url.trim();
    const addedBy = clipForm.name.trim() || "Anonymous";
    if (!title || !url) return;

    const res = await fetch("/api/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, addedBy, addedById: clientId }),
    });

    if (res.ok) {
      const { entry } = await res.json();
      setClips((prev) => [entry, ...prev]);
      setClipForm({ title: "", url: "", name: "" });
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Could not add clip. Please try again.");
    }
  }

  async function handleDeleteClip(id) {
    const opts = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addedById: clientId }),
    };
    if (modEnabled && adminToken) {
      opts.headers = { ...opts.headers, Authorization: "Bearer " + adminToken };
    }
    const res = await fetch(`/api/clips?id=${encodeURIComponent(id)}`, opts);
    if (res.ok) {
      setClips((prev) => prev.filter((c) => c.id !== id));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Delete failed");
    }
  }

  function canRemoveClip(clip) {
    return (modEnabled && adminToken) || clip.addedById === clientId;
  }

  // --------- Messages: create & delete ---------
  async function handleMsgSubmit(e) {
    e.preventDefault();
    const name = msgForm.name?.trim() || "Anonymous";
    const text = msgForm.text?.trim();
    if (!text) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text, addedById: clientId }),
    });

    if (res.ok) {
      const { entry } = await res.json();
      setMessages((prev) => [entry, ...prev]);
      setMsgForm({ name: "", text: "" });
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Could not post message. Please try again.");
    }
  }

  async function handleDeleteMsg(id) {
    const opts = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addedById: clientId }),
    };
    if (modEnabled && adminToken) {
      opts.headers = { ...opts.headers, Authorization: "Bearer " + adminToken };
    }
    const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, opts);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Delete failed");
    }
  }

  function canRemoveMsg(m) {
    return (modEnabled && adminToken) || m.addedById === clientId;
  }

  // --------- UI ---------
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header / Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-emerald-50" />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[120px_1fr]">
            <img
              src={person.avatar}
              alt={`${person.name} portrait`}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                In Loving Memory of {person.name}
              </h1>
              <p className="mt-1 text-neutral-600">{person.dates}</p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-neutral-700">
                {person.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {person.gofundme && (
                  <a
                    href={person.gofundme}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  >
                    💚 Donate to the Family
                  </a>
                )}
                {service?.streamUrl && (
                  <a
                    href={service.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-neutral-800 shadow hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-neutral-200"
                  >
                    🎥 Watch the Memorial Stream
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Moderator Mode */}
          <div className="mt-6 max-w-xl rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Moderator Mode</span>
              {modEnabled ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  Enabled
                </span>
              ) : (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  Disabled
                </span>
              )}
            </div>
            {!modEnabled ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (modInput) {
                    setAdminToken(modInput);
                    setModEnabled(true);
                  }
                  setModInput("");
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  value={modInput}
                  onChange={(e) => setModInput(e.target.value)}
                  placeholder="Paste admin token to enable"
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
                />
                <button
                  className="rounded-xl bg-neutral-800 px-3 py-2 text-sm text-white shadow hover:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-200"
                  type="submit"
                >
                  Enable
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setModEnabled(false);
                  setAdminToken("");
                }}
                className="mt-3 rounded-xl bg-neutral-200 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-300"
              >
                Disable Moderator Mode
              </button>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              With the admin token you can remove any clip or message. Without it,
              users can remove only items they posted from this browser.
            </p>
          </div>
        </div>
      </header>

      {/* Service Info */}
      {service?.date && (
        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-700">
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1">🗓️ {service.date}</span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1">⏰ {service.time}</span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1">📍 {service.location}</span>
            </div>
          </div>
        </section>
      )}

      {/* Clips & Messages */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Clips */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">Twitch Clips</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search clips by title..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200 sm:w-72"
            />
          </div>

          <form
            onSubmit={handleClipSubmit}
            className="mb-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_200px_auto]"
          >
            <input
              value={clipForm.title}
              onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
              placeholder="Clip title (e.g., Alex being Alex)"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
              required
            />
            <input
              value={clipForm.url}
              onChange={(e) => setClipForm({ ...clipForm, url: e.target.value })}
              placeholder="Clip URL or slug (e.g., AgreeablePrettiestKathy…)"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
              required
            />
            <input
              value={clipForm.name}
              onChange={(e) => setClipForm({ ...clipForm, name: e.target.value })}
              placeholder="Your name (optional)"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              + Add Clip
            </button>
            <p className="sm:col-span-4 text-xs text-neutral-500">
              Clips are saved to Vercel KV. Remove your own, or use the admin token to remove any.
            </p>
          </form>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clips
              .filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()))
              .map((c) => {
                const src = twitchEmbedUrl(c.url);
                return (
                  <article key={c.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="relative">
                      <div className="aspect-video w-full bg-black">
                        {src ? (
                          <iframe title={c.title} src={src} allowFullScreen scrolling="no" height="100%" width="100%" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">Invalid clip URL/slug</div>
                        )}
                      </div>
                      {canRemoveClip(c) && (
                        <button
                          onClick={() => {
                            if (confirm("Remove this clip from the site?")) handleDeleteClip(c.id);
                          }}
                          className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-neutral-700 shadow hover:bg-white"
                          title="Remove clip"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 text-sm">
                      <div className="font-medium">{c.title}</div>
                      {c.addedBy && <div className="text-neutral-500">by {c.addedBy}</div>}
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        {/* Messages — Kudoboard look (now PERSISTENT + deletable) */}
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Messages</h2>

          <form
            onSubmit={handleMsgSubmit}
            className="mb-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[200px_1fr_auto]"
          >
            <input
              value={msgForm.name}
              onChange={(e) => setMsgForm({ ...msgForm, name: e.target.value })}
              placeholder="Your name (optional)"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
            />
            <textarea
              value={msgForm.text}
              onChange={(e) => setMsgForm({ ...msgForm, text: e.target.value })}
              placeholder="Share a memory, message, or words for the family…"
              rows={3}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-emerald-200"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              Post
            </button>
            <p className="sm:col-span-3 text-xs text-neutral-500">
              Messages are saved to Vercel KV. You can remove your own; with the admin token you can remove any.
            </p>
          </form>

          {/* Masonry (Kudoboard) layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {messages.map((m, idx) => {
              const theme = themeFor(idx);
              return (
                <div key={m.id} className="mb-6 break-inside-avoid">
                  <div className={`relative rounded-2xl border ${theme.card} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${theme.wrap}`}>
                    <div className="absolute left-3 top-2 text-lg opacity-70 select-none">{theme.pin}</div>

                    {/* Remove button (self or admin) */}
                    {canRemoveMsg(m) && (
                      <button
                        onClick={() => {
                          if (confirm("Remove this message?")) handleDeleteMsg(m.id);
                        }}
                        className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-neutral-700 shadow hover:bg-white"
                        title="Remove message"
                      >
                        Remove
                      </button>
                    )}

                    <div className="mt-4 text-sm text-neutral-500">{isoToReadable(m.timestamp)}</div>
                    <div className="mt-1 text-neutral-800 whitespace-pre-wrap leading-relaxed">{m.text}</div>
                    <div className="mt-3 text-sm font-medium text-neutral-700">— {m.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-neutral-500">
          Made with love by friends &amp; community • If you need support, please take care of yourself and reach out. 💚
        </div>
      </footer>
    </div>
  );
}
