"use client";
import Link from "next/link";
import { useState } from "react";

export default function MemorialSite() {
  // (Keep your state/handlers here if you had them)
  const [adminToken, setAdminToken] = useState("");

  return (
    <main className="container">
      {/* App bar / header */}
      <header style={{ marginBottom: "32px" }}>
        <h1>Alex — Afterman7</h1>
        <p>1990 – 2025</p>
        <p>A bright, kind, and creative soul whose presence touched countless lives.</p>
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

        <input placeholder="Search clips…" />
        <input placeholder="Clip title" />
        <input placeholder="Clip URL or slug" />
        <input placeholder="Your name (optional)" />

        <button style={{ marginTop: 8 }} className="btn">+ Add</button>

        {/* If you have a clips list, render it below */}
        <div id="clips-list" style={{ marginTop: 16 }} />
      </section>

      {/* Messages */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Messages</h2>

        <input placeholder="Your name (optional)" />
        <textarea placeholder="Share a memory…" rows={5} />

        <button className="btn">Post</button>
      </section>

      {/* Admin token (kept, but styled) */}
      <section className="card" style={{ textAlign: "center" }}>
        <input
          placeholder="Admin token"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
        />
        <button className="btn" style={{ margin: "4px auto 0" }}>Enable</button>
      </section>

      <footer>Made with love · Take care of your heart 💜</footer>
    </main>
  );
}
