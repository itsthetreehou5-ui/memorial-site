"use client";
import React from "react";

export default function MemorialSite() {
  // ---------- Data ----------
  const person = {
    name: "Alex — Afterman7",
    dates: "1990 – 2025",
    avatar:
      "https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=800&auto=format&fit=crop",
    tagline:
      "A bright, kind, and creative soul whose presence touched countless lives.",
    gofundme: "https://gofund.me/5ac54ab96",
  };

  // ---------- Layout helpers ----------
  const [clips, setClips] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [msgForm, setMsgForm] = React.useState({ name: "", text: "" });
  const [clipForm, setClipForm] = React.useState({ title: "", url: "", name: "" });
  const [clientId, setClientId] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [modEnabled, setModEnabled] = React.useState(false);
  const [modToken, setModToken] = React.useState("");

  React.useEffect(() => {
    const id = localStorage.getItem("memorial-id") || crypto.randomUUID();
    localStorage.setItem("memorial-id", id);
    setClientId(id);
    Promise.all([
      fetch("/api/clips", { cache: "no-store" }).then(r => r.json()).catch(() => ({clips:[]})),
      fetch("/api/messages", { cache: "no-store" }).then(r => r.json()).catch(() => ({messages:[]})),
    ]).then(([c,m]) => {
      setClips(c.clips ?? []);
      setMessages(m.messages ?? []);
    });
  }, []);

  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const twitchURL = slug =>
    `https://clips.twitch.tv/embed?clip=${slug}&parent=${parent}&autoplay=false&muted=true`;

  const parseSlug = input => {
    const m = input.match(/(?:clips\.twitch\.tv\/|twitch\.tv\/clip\/)?([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  };

  // ---------- POST + DELETE ----------
  async function addClip(e) {
    e.preventDefault();
    const slug = parseSlug(clipForm.url);
    if (!slug) return alert("Invalid clip URL");
    const res = await fetch("/api/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: clipForm.title.trim(),
        url: slug,
        addedBy: clipForm.name || "Anonymous",
        addedById: clientId,
      }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setClips(prev => [entry, ...prev]);
      setClipForm({ title: "", url: "", name: "" });
    }
  }

  async function addMsg(e) {
    e.preventDefault();
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: msgForm.name || "Anonymous",
        text: msgForm.text,
        addedById: clientId,
      }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setMessages(prev => [entry, ...prev]);
      setMsgForm({ name: "", text: "" });
    }
  }

  async function removeItem(type, id) {
    const body = JSON.stringify({ addedById: clientId });
    const headers = {
      "Content-Type": "application/json",
      ...(modEnabled && modToken && { Authorization: `Bearer ${modToken}` }),
    };
    const res = await fetch(`/api/${type}?id=${id}`, { method: "DELETE", headers, body });
    if (res.ok) {
      if (type === "clips") setClips(p => p.filter(x => x.id !== id));
      if (type === "messages") setMessages(p => p.filter(x => x.id !== id));
    }
  }

  const canRemove = x => modEnabled || x.addedById === clientId;
  const formatTime = iso => new Date(iso).toLocaleString();

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* ---- Hero ---- */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary-container to-surface-variant/40">
        <div className="relative mx-auto max-w-5xl px-6 py-20 flex flex-col md:flex-row gap-8 items-center">
          <img src={person.avatar} alt="" className="h-32 w-32 rounded-full object-cover shadow-md border border-outline-variant"/>
          <div>
            <h1 className="text-4xl font-bold text-on-primary-container">{person.name}</h1>
            <p className="text-on-surface-variant mt-1">{person.dates}</p>
            <p className="mt-4 text-lg text-on-surface max-w-prose">{person.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={person.gofundme} target="_blank" rel="noreferrer"
                 className="bg-primary text-on-primary px-4 py-2 rounded-full shadow hover:bg-primary/90 transition">
                 💚 Donate to the Family
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Clips ---- */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-14">
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="text-2xl font-semibold">Twitch Clips</h2>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search clips…"
              className="md:w-72 rounded-full border border-outline-variant bg-surface-container px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
          </div>

          <form onSubmit={addClip} className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant">
            <input className="input" placeholder="Clip title" value={clipForm.title} onChange={e=>setClipForm({...clipForm,title:e.target.value})}/>
            <input className="input" placeholder="Clip URL or slug" value={clipForm.url} onChange={e=>setClipForm({...clipForm,url:e.target.value})}/>
            <input className="input" placeholder="Your name (optional)" value={clipForm.name} onChange={e=>setClipForm({...clipForm,name:e.target.value})}/>
            <button type="submit" className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/90">+ Add</button>
          </form>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {clips.filter(c=>c.title.toLowerCase().includes(filter.toLowerCase())).map(c=>(
              <article key={c.id} className="bg-surface-container rounded-xl shadow border border-outline-variant overflow-hidden">
                <div className="aspect-video bg-black">
                  <iframe src={twitchURL(c.url)} allowFullScreen className="w-full h-full"/>
                </div>
                <div className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-medium text-on-surface">{c.title}</div>
                    <div className="text-on-surface-variant">{c.addedBy}</div>
                  </div>
                  {canRemove(c) && (
                    <button onClick={()=>removeItem("clips",c.id)} className="text-on-surface-variant hover:text-error transition text-xs">✕</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---- Messages ---- */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Messages</h2>
          <form onSubmit={addMsg} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant">
            <input className="input" placeholder="Your name (optional)" value={msgForm.name} onChange={e=>setMsgForm({...msgForm,name:e.target.value})}/>
            <textarea className="input min-h-[80px]" placeholder="Share a memory…" value={msgForm.text} onChange={e=>setMsgForm({...msgForm,text:e.target.value})}/>
            <button className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/90">Post</button>
          </form>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mt-6">
            {messages.map(m=>(
              <div key={m.id} className="break-inside-avoid mb-6">
                <div className="bg-surface-container border border-outline-variant rounded-xl p-4 shadow-sm relative">
                  {canRemove(m) && (
                    <button onClick={()=>removeItem("messages",m.id)} className="absolute right-3 top-3 text-on-surface-variant hover:text-error text-xs">✕</button>
                  )}
                  <div className="text-xs text-on-surface-variant">{formatTime(m.timestamp)}</div>
                  <div className="mt-1 text-on-surface leading-relaxed whitespace-pre-wrap">{m.text}</div>
                  <div className="mt-2 text-sm font-medium text-on-surface">— {m.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ---- Minimal Moderator Mode (bottom bar) ---- */}
      <footer className="border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-on-surface-variant">
          {!modEnabled ? (
            <form onSubmit={e=>{e.preventDefault();setModEnabled(true);}}>
              <input
                type="password"
                placeholder="Admin token"
                value={modToken}
                onChange={e=>setModToken(e.target.value)}
                className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary"
              />
              <button className="ml-2 bg-primary text-on-primary rounded-full px-3 py-1 hover:bg-primary/90">Enable</button>
            </form>
          ) : (
            <button onClick={()=>{setModEnabled(false);setModToken("");}} className="px-3 py-1 rounded-full border border-outline-variant hover:bg-surface-variant/40">Disable Moderator Mode</button>
          )}
          <p className="text-xs text-right flex-1 sm:text-end">
            Made with love · Material 3 style · Take care of your heart 💚
          </p>
        </div>
      </footer>
    </div>
  );
}
