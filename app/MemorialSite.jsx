"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MemorialSite() {
  // data
  const [clips, setClips] = useState([]);
  const [messages, setMessages] = useState([]);

  // ui
  const [qClips, setQClips] = useState("");
  const [qMsgs, setQMsgs] = useState("");
  const [showClipForm, setShowClipForm] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // forms
  const [clipTitle, setClipTitle] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [clipName, setClipName] = useState("");

  const [msgName, setMsgName] = useState("");
  const [memory, setMemory] = useState("");

  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    (async () => {
      const [c, m] = await Promise.all([
        fetch("/api/clips").then(r => r.json()).catch(()=>({clips:[]})),
        fetch("/api/messages").then(r => r.json()).catch(()=>({messages:[]})),
      ]);
      setClips(c.clips ?? []);
      setMessages(m.messages ?? []);
    })();
  }, []);

  const addClip = async () => {
    setError("");
    if (!clipTitle || !clipUrl) { setError("Title and URL required."); return; }
    try {
      setBusy(true);
      const res = await fetch("/api/clips", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ title: clipTitle, url: clipUrl, author: clipName || "Anonymous", token: adminToken || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setClips(p => [{...data.clip, _new:true}, ...p.map(x=>({...x, _new:false}))]);
      setClipTitle(""); setClipUrl(""); setClipName(""); setQClips(""); setShowClipForm(false);
    } catch(e){ setError(e.message); } finally { setBusy(false); }
  };

  const postMessage = async () => {
    setError("");
    if (!memory.trim()) { setError("Please write a message."); return; }
    try {
      setBusy(true);
      const res = await fetch("/api/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name: msgName || "Anonymous", body: memory.trim(), token: adminToken || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessages(p => [{...data.message, _new:true}, ...p.map(x=>({...x, _new:false}))]);
      setMsgName(""); setMemory(""); setQMsgs(""); setShowMsgForm(false);
    } catch(e){ setError(e.message); } finally { setBusy(false); }
  };

  const clipList = clips.filter(c=>{
    const q = qClips.trim().toLowerCase(); if(!q) return true;
    return [c.title,c.url,c.author].filter(Boolean).some(v=>String(v).toLowerCase().includes(q));
  });

  const msgList = messages.filter(m=>{
    const q = qMsgs.trim().toLowerCase(); if(!q) return true;
    return [m.name,m.body].filter(Boolean).some(v=>String(v).toLowerCase().includes(q));
  });

  return (
    <main className="container">
      {/* Header */}
      <div className="board-header">
        <div>
          <h1 className="board-title">Alex — Afterman7</h1>
          <div className="board-sub">1990 – 2025 · A bright, kind, and creative soul whose presence touched countless lives.</div>
        </div>
        <Link href="https://www.gofundme.com/manage/in-loving-memory-of-alex-afterman7-family-support" target="_blank" className="btn">
          💜 Donate to the Family
        </Link>
      </div>

      {/* Error notice */}
      {error && (
        <div className="section" style={{background:"#FFF2F4", borderColor:"#F6C7D1"}}>
          <strong style={{color:"#7a1339"}}>Error:</strong> <span style={{color:"#7a1339"}}>{error}</span>
        </div>
      )}

      {/* CLIPS */}
      <section className="section">
        <h2>Clips</h2>
        <div className="toolbar">
          <input className="input" style={{width:240}} placeholder="Search clips…" value={qClips} onChange={e=>setQClips(e.target.value)} />
          <button className="disclosure" onClick={()=>setShowClipForm(s=>!s)}>{showClipForm ? "Close" : "Add Clip"}</button>
        </div>

        <div className={`form-compact ${showClipForm ? "open" : ""}`}>
          <input className="input" placeholder="Clip title" value={clipTitle} onChange={e=>setClipTitle(e.target.value)} />
          <input className="input" placeholder="Clip URL or slug" value={clipUrl} onChange={e=>setClipUrl(e.target.value)} />
          <input className="input full" placeholder="Your name (optional)" value={clipName} onChange={e=>setClipName(e.target.value)} />
          <div className="full" style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
            <button className="btn-tonal btn" onClick={()=>setShowClipForm(false)}>Cancel</button>
            <button className="btn" onClick={addClip} disabled={busy}>{busy ? "Adding…" : "Add Clip"}</button>
          </div>
        </div>

        <div className="grid">
          {clipList.length === 0 ? (
            <div className="card muted">No clips yet.</div>
          ) : clipList.map(c=>(
            <article className="card" key={c.id}>
              <h3 className="card-title">{c.title}</h3>
              <div className="card-meta">
                by {c.author || "Anonymous"} • {new Date(c.createdAt).toLocaleString()}
                {c._new && <span style={{marginLeft:8, padding:"2px 8px", borderRadius:999, background:"#E9E2FF", color:"#2A1E6F", fontSize:12}}>New</span>}
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer">{c.url}</a>
            </article>
          ))}
        </div>
      </section>

      {/* MESSAGES */}
      <section className="section">
        <h2>Messages</h2>
        <div className="toolbar">
          <input className="input" style={{width:240}} placeholder="Search messages…" value={qMsgs} onChange={e=>setQMsgs(e.target.value)} />
          <button className="disclosure" onClick={()=>setShowMsgForm(s=>!s)}>{showMsgForm ? "Close" : "Post Message"}</button>
        </div>

        <div className={`form-compact ${showMsgForm ? "open" : ""}`}>
          <input className="input" placeholder="Your name (optional)" value={msgName} onChange={e=>setMsgName(e.target.value)} />
          <div className="full"><textarea className="textarea" placeholder="Share a memory…" value={memory} onChange={e=>setMemory(e.target.value)} /></div>
          <div className="full" style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
            <button className="btn-tonal btn" onClick={()=>setShowMsgForm(false)}>Cancel</button>
            <button className="btn" onClick={postMessage} disabled={busy}>{busy ? "Posting…" : "Post Message"}</button>
          </div>
        </div>

        <div className="grid">
          {msgList.length === 0 ? (
            <div className="card muted">No messages yet.</div>
          ) : msgList.map(m=>(
            <article className="card" key={m.id}>
              <div className="card-title">{m.name || "Anonymous"}</div>
              <div className="card-meta">
                {new Date(m.createdAt).toLocaleString()}
                {m._new && <span style={{marginLeft:8, padding:"2px 8px", borderRadius:999, background:"#E9E2FF", color:"#2A1E6F", fontSize:12}}>New</span>}
              </div>
              <div>{m.body}</div>
            </article>
          ))}
        </div>
      </section>

      {/* Admin mini footer */}
      <div className="admin">
        <span className="muted">Admin</span>
        <input className="input" style={{maxWidth:220}} placeholder="Admin token (optional)" value={adminToken} onChange={e=>setAdminToken(e.target.value)} />
        <button className="btn-tonal btn" disabled>Enable</button>
      </div>

      <p className="muted" style={{textAlign:"left", marginTop:12}}>Made with love · Take care of your heart 💜</p>
    </main>
  );
}
