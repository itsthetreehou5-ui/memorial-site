import Link from "next/link";

export default function Page() {
  return (
    <main className="container">
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

      <section className="card">
        <h2>Twitch Clips</h2>
        <input placeholder="Search clips…" />
        <input placeholder="Clip title" />
        <input placeholder="Clip URL or slug" />
        <input placeholder="Your name (optional)" />
        <button className="btn" style={{ marginTop: 8 }}>+ Add</button>
      </section>

      <section className="card">
        <h2>Messages</h2>
        <input placeholder="Your name (optional)" />
        <textarea placeholder="Share a memory…" rows={5}></textarea>
        <button className="btn">Post</button>
      </section>

      <footer>Made with love • Take care of your heart 💜</footer>
    </main>
  );
}
