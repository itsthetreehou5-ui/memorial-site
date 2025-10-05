"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MemorialSite() {
  // lists
  const [clips, setClips] = useState([]);
  const [messages, setMessages] = useState([]);

  // filters
  const [qClips, setQClips] = useState("");
  const [qMsgs, setQMsgs] = useState("");

  // compact form toggles
  const [showClipForm, setShowClipForm] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);

  // clip form
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");

  // message form
  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  // admin
  const [adminToken, setAdminToken] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // init
  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([
          fetch("/api/clips").then(r => r.json()),
          fetch("/api/messages").then(r => r.json()),
        ]);
        setClips(c?.clips ?? []);
        setMessages(m?.messages ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // handlers
  const addClip = async () => {
    setError("");
    if (!clipTitle || !clipUrl) { setError("Title and URL required."); return; }
    try {
      setBusy(true);
      const res = await fetch("/api/clips", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          title: clipTitle,
          url: clipUrl,
          author: clipName || "Anonymous",
          token: adminToken || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setClips(p => [{...data.clip, _new:true}, ...p.map(x=>({...x, _new:false}))]);
      setClipTitle(""); setClipUrl(""); setClipName("");
      setShowClipForm(false); setQClips("");  // collapse + clear filter
    } catch (e) {
      setError(e.message || "Couldn’t add the clip.");
    } finally { setBusy(false); }
  };

  const postMessage = async () => {
    setError("");
    if (!memory.trim()) { setError("Please write a message."); return; }
    try {
      setBusy(true);
      const res = await fetch("/api/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          name: msgName || "Anonymous",
          body: memory.trim(),
          token: adminToken || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessages(p => [{...data.message, _new:true}, ...p.map(x=>({...x, _new:false}))]);
      setMsgName(""); setMemory("");
      setShowMsgForm(false); setQMsgs("");   // collapse + clear filter
    } catch (e) {
      setError(e.message || "Couldn’t post your message.");
    } finally { setBusy(false); }
  };

  // filters
  const clipList = clips.filter(c=>{
    const q = qClips.trim().toLowerCase();
    if(!q) return true;
    return [c.title, c.url, c.author].filter(Boolean).some(v=>String(v).toLowerCase().includes(q));
  });
  const msgList = messages.filter(m=>{
    const q = qMsgs.trim().toLowerCase();
    if(!q) return true;
    return [m.name, m.body].filter(Boolean).some(v=>String(v).toLowerCase().includes(q));
  });

  return (
    <main className="container">
      {/* header */}
      <div className="board-header">
        <div>
          <h1 className="board-title">Alex — Afterman7</h1>
          <div className="board-sub">1990 – 2025 · A bright, kind, and creative soul whose presence touched countless lives.</div>
        </div>
        <Link
          href="https://www.gofundme.com/manage/in-loving-memory-of-alex-afterman7-family-support"
          target="_blank"
          className="btn"
        >
          💜 Donate to the Family
        </Link>
      </div>

      {/* error */}
      {error && (
        <div className="card" style={{background:"#fde7f1", borderColor:"#f6c5d8"}}>
          <strong style={{color:"#7a1339"}}>Error:</strong>{" "}
          <span style={{color:"#7a1339"}}>{error}</span>
        </div>
      )}

      {/* Clips section */}
      <div className="section-head">
        <h2>Clips</h2>
        <div className="toolbar">
          <input className="input" style={{width:220}} placeholder="Search clips…" value={qClips} onChange={e=>setQClips(e.target.value)} />
          <button className="disclosure" onClick={()=>setShowClipForm(s=>!s)}>
            {showClipForm ? "Close" : "Add Clip"}
          </button>
        </div>
      </div>

      <div className={`form-compact ${showClipForm ? "open" : ""}`} role="region" aria-label="Add clip form">
        <input className="input" placeholder="Clip title" value={clipTitle} onChange={e=>setClipTitle(e.target.value)} />
        <input className="input" placeholder="Clip URL or slug" value={clipUrl} onChange={e=>setClipUrl(e.target.value)} />
        <input className="input full" placeholder="Your name (optional)" value={clipName} onChange={e=>setClipName(e.target.value)} />
        <div className="full" style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <button className="btn-tonal btn" onClick={()=>setShowClipForm(false)}>Cancel</button>
          <button className="btn" onClick={addClip} disabled={busy}>{busy ? "Adding…" : "Add Clip"}</button>
        </div>
      </div>

      {/* Clips grid */}
      <div className="grid" style={{marginTop: showClipForm ? "14px" : "0"}}>
        {clipList.length === 0 ? (
          <div className="card muted">No clips yet.</div>
        ) : clipList.map(c=>(
          <article className="card" key={c.id}>
            <h3 className="card-title">{c.title}</h3>
            <div className="card-meta">
              by {c.author || "Anonymous"} • {new Date(c.createdAt).toLocaleString()}
              {c._new && <span style={{marginLeft:8, padding:"2px 8px", borderRadius:999, background:"#EADDFF", color:"#21005D", fontSize:12}}>New</span>}
            </div>
            <a href={c.url} target="_blank" rel="noopener noreferrer">{c.url}</a>
          </article>
        ))}
      </div>

      {/* Messages section */}
      <div className="section-head" style={{marginTop:"34px"}}>
        <h2>Messages</h2>
        <div className="toolbar">
          <input className="input" style={{width:220}} placeholder="Search messages…" value={qMsgs} onChange={e=>setQMsgs(e.target.value)} />
          <button className="disclosure" onClick={()=>setShowMsgForm(s=>!s)}>
            {showMsgForm ? "Close" : "Post Message"}
          </button>
        </div>
      </div>

      <div className={`form-compact ${showMsgForm ? "open" : ""}`} role="region" aria-label="Post message form">
        <input className="input" placeholder="Your name (optional)" value={msgName} onChange={e=>setMsgName(e.target.value)} />
        <div className="full">
          <textarea className="textarea" placeholder="Share a memory…" value={memory} onChange={e=>setMemory(e.target.value)} />
        </div>
        <div className="full" style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <button className="btn-tonal btn" onClick={()=>setShowMsgForm(false)}>Cancel</button>
          <button className="btn" onClick={postMessage} disabled={busy}>{busy ? "Posting…" : "Post Message"}</button>
        </div>
      </div>

      {/* Messages grid */}
      <div className="grid" style={{marginTop: showMsgForm ? "14px" : "0"}}>
        {msgList.length === 0 ? (
          <div className="card muted">No messages yet.</div>
        ) : msgList.map(m=>(
          <article className="card" key={m.id}>
            <div className="card-title">{m.name || "Anonymous"}</div>
            <div className="card-meta">
              {new Date(m.createdAt).toLocaleString()}
              {m._new && <span style={{marginLeft:8, padding:"2px 8px", borderRadius:999, background:"#EADDFF", color:"#21005D", fontSize:12}}>New</span>}
            </div>
            <div>{m.body}</div>
          </article>
        ))}
      </div>

      {/* Admin tiny footer */}
      <div className="admin">
        <span className="muted">Admin</span>
        <input className="input" style={{maxWidth:220}} placeholder="Admin token (optional)" value={adminToken} onChange={e=>setAdminToken(e.target.value)} />
        <button className="btn-tonal btn" disabled>Enable</button>
      </div>
    </main>
  );
}
