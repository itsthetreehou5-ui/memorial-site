"use client";
import React from "react";

export default function MemorialSite() {
  /* ---------- Config ---------- */
  const person = {
    name: "Alex — Afterman7",
    dates: "1990 – 2025",
    avatar:
      "https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=800&auto=format&fit=crop",
    tagline:
      "A bright, kind, and creative soul whose presence touched countless lives.",
    gofundme: "https://gofund.me/5ac54ab96",
  };

  /* ---------- State ---------- */
  const [clips, setClips] = React.useState([]);
  const [messages, setMessages] = React.useState([]);

  const [clipForm, setClipForm] = React.useState({ title: "", url: "", name: "" });
  const [msgForm, setMsgForm] = React.useState({ name: "", text: "" });

  const [filter, setFilter] = React.useState("");

  // stable per-browser id (used to allow self-delete)
  const [clientId, setClientId] = React.useState("");
  const clientReady = Boolean(clientId);

  // moderator
  const [modEnabled, setModEnabled] = React.useState(false);
  const [modToken, setModToken] = React.useState("");

  /* ---------- Effects ---------- */
  React.useEffect(() => {
    // generate / read a stable browser id
    const key = "memorial-client-id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    setClientId(id);

    // initial data load
    (async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch("/api/clips", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
        ]);
        const cJson = await cRes.json().catch(() => ({ clips: [] }));
        const mJson = await mRes.json().catch(() => ({ messages: [] }));
        setClips(cJson.clips ?? []);
        setMessages(mJson.messages ?? []);
      } catch {
        setClips([]);
        setMessages([]);
      }
    })();
  }, []);

  /* ---------- Helpers ---------- */
  const parent =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  const parseSlug = (input) => {
    if (!input) return null;
    const m = String(input).match(
      /(?:clips\.twitch\.tv\/|twitch\.tv\/clip\/)?([A-Za-z0-9_-]+)$/
    );
    return m ? m[1] : null;
  };

  const twitchURL = (slugOrUrl) => {
    const slug = parseSlug(slugOrUrl);
    if (!slug) return null;
    return `https://clips.twitch.tv/embed?clip=${slug}&parent=${parent}&autoplay=false&muted=true`;
  };

  const isoToReadable = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const canRemove = (item) => modEnabled || item.addedById === clientId;

  /* ---------- Handlers ---------- */
  async function addClip(e) {
    e.preventDefault();
    if (!clientReady) return alert("Getting your session ready — try again in a second.");

    const title = (clipForm.title || "").trim();
    const raw = (clipForm.url || "").trim();
    if (!title || !raw) return;

    const slug = parseSlug(raw);
    if (!slug) return alert("That doesn’t look like a valid Twitch clip URL or slug.");

    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url: slug, // store slug only
          addedBy: clipForm.name || "Anonymous",
          addedById: clientId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const { entry } = await res.json();
      setClips((prev) => [entry, ...prev]);
      setClipForm({ title: "", url: "", name: "" });
    } catch (err) {
      alert("Could not add clip: " + err.message);
    }
  }

  async function addMsg(e) {
    e.preventDefault();
    if (!clientReady) return alert("Getting your session ready — try again in a second.");

    const text = (msgForm.text || "").trim();
    const name = (msgForm.name || "").trim() || "Anonymous";
    if (!text) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, addedById: clientId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const { entry } = await res.json();
      setMessages((prev) => [entry, ...prev]);
      setMsgForm({ name: "", text: "" });
    } catch (err) {
      alert("Could not post message: " + err.message);
    }
  }

  async function removeItem(kind, id) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (modEnabled && modToken) headers["Authorization"] = `Bearer ${modToken}`;

      const res = await fetch(`/api/${kind}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ addedById: clientId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      if (kind === "clips") setClips((p) => p.filter((x) => x.id !== id));
      if (kind === "messages") setMessages((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert("Remove failed: " + err.message);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0
          bg-[radial-gradient(120%_80%_at_0%_0%,rgba(178,148,255,0.22),transparent_50%),radial-gradient(120%_80%_at_100%_100%,rgba(110,75,219,0.18),transparent_45%)]
          "
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 flex flex-col md:flex-row gap-8 items-center">
          <img
            src={person.avatar}
            alt=""
            className="h-32 w-32 rounded-full object-cover shadow-md border border-outline-variant"
          />
          <div>
            <h1 className="text-4xl font-bold">{person.name}</h1>
            <p className="text-on-surface-variant mt-1">{person.dates}</p>
            <p className="mt-4 text-lg max-w-prose">{person.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={person.gofundme}
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-on-primary px-4 py-2 rounded-full shadow hover:bg-primary/90 transition"
              >
                💚 Donate to the Family
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-14">
        {/* CLIPS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="text-2xl font-semibold">Twitch Clips</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search clips…"
              className="md:w-72 rounded-full border border-outline-variant bg-surface-container px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--md-sys-color-primary]"
            />
          </div>

          <form
            onSubmit={addClip}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant"
          >
            <input
              required
              className="input"
              placeholder="Clip title"
              value={clipForm.title}
              onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
            />
            <input
              required
              className="input"
              placeholder="Clip URL or slug"
              value={clipForm.url}
              onChange={(e) => setClipForm({ ...clipForm, url: e.target.value })}
            />
            <input
              className="input"
              placeholder="Your name (optional)"
              value={clipForm.name}
              onChange={(e) => setClipForm({ ...clipForm, name: e.target.value })}
            />
            <button
              type="submit"
              disabled={!clientReady}
              className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add
            </button>
          </form>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {clips
              .filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()))
              .map((c) => {
                const src = twitchURL(c.url);
                return (
                  <article
                    key={c.id}
                    className="bg-surface-container rounded-xl shadow border border-outline-variant overflow-hidden"
                  >
                    <div className="aspect-video bg-black">
                      {src ? (
                        <iframe
                          src={src}
                          allowFullScreen
                          className="w-full h-full"
                          title={c.title}
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-on-surface-variant text-sm">
                          Invalid Twitch clip
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-on-surface-variant">{c.addedBy}</div>
                      </div>
                      {canRemove(c) && (
                        <button
                          onClick={() => removeItem("clips", c.id)}
                          className="text-on-surface-variant hover:text-error transition text-xs"
                          title="Remove clip"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        {/* MESSAGES */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Messages</h2>

          <form
            onSubmit={addMsg}
            className="grid gap-3 sm:grid-cols-[180px_1fr_auto] bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant"
          >
            <input
              className="input"
              placeholder="Your name (optional)"
              value={msgForm.name}
              onChange={(e) => setMsgForm({ ...msgForm, name: e.target.value })}
            />
            <textarea
              required
              className="input min-h-[80px]"
              placeholder="Share a memory…"
              value={msgForm.text}
              onChange={(e) => setMsgForm({ ...msgForm, text: e.target.value })}
            />
            <button
              type="submit"
              disabled={!clientReady}
              className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </form>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mt-6">
            {messages.map((m) => (
              <div key={m.id} className="break-inside-avoid mb-6">
                <div className="bg-surface-container border border-outline-variant rounded-xl p-4 shadow-sm relative">
                  {canRemove(m) && (
                    <button
                      onClick={() => removeItem("messages", m.id)}
                      className="absolute right-3 top-3 text-on-surface-variant hover:text-error text-xs"
                      title="Remove message"
                    >
                      ✕
                    </button>
                  )}
                  <div className="text-xs text-on-surface-variant">
                    {isoToReadable(m.timestamp)}
                  </div>
                  <div className="mt-1 leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </div>
                  <div className="mt-2 text-sm font-medium">— {m.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER: Minimal Moderator Mode */}
      <footer className="border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-on-surface-variant">
          {!modEnabled ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!modToken.trim()) return;
                setModEnabled(true);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="password"
                placeholder="Admin token"
                value={modToken}
                onChange={(e) => setModToken(e.target.value)}
                className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--md-sys-color-primary]"
              />
              <button className="bg-primary text-on-primary rounded-full px-3 py-1 hover:bg-primary/90">
                Enable
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setModEnabled(false);
                setModToken("");
              }}
              className="px-3 py-1 rounded-full border border-outline-variant hover:bg-surface-variant/40"
            >
              Disable Moderator Mode
            </button>
          )}

          <p className="text-xs sm:text-end flex-1">
            Made with love · Material 3 style · Take care of your heart 💜
          </p>
        </div>
      </footer>
    </div>
  );
}
