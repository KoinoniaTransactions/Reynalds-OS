"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Draft = { id: string; title: string; status: string; campaignKey: string | null; createdAt: string; variants: { id: string; platform: string; caption: string; status: string; revision: number }[] };
const platforms = ["facebook", "instagram", "tiktok", "linkedin"] as const;

export function SocialContentStudio() {
  const [items, setItems] = useState<Draft[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("facebook");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<{ postId: string; variantId: string; revision: number } | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/employee/social/posts", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Unable to load drafts");
      setItems(payload.posts ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load drafts"); }
  }
  useEffect(() => { void refresh(); }, []);

  function beginEdit(item: Draft) {
    const variant = item.variants[0];
    if (!variant || variant.status !== "draft") return;
    setEditing({ postId: item.id, variantId: variant.id, revision: variant.revision });
    setTitle(item.title); setCaption(variant.caption);
    setPlatform(variant.platform as typeof platform);
  }

  async function createDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(editing ? `/api/employee/social/posts/${encodeURIComponent(editing.postId)}` : "/api/employee/social/posts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, caption, platform, variantId: editing?.variantId, revision: editing?.revision })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Unable to save draft");
      setTitle(""); setCaption(""); setEditing(null); setMessage("Draft saved. Nothing has been published or scheduled.");
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save draft"); }
    finally { setBusy(false); }
  }

  return (
    <main className="koinonia-site">
      <section className="koinonia-section">
        <div className="koinonia-container">
          <p className="koinonia-eyebrow">Staff workspace · development preview</p>
          <h1 className="koinonia-heading">Social Content Studio</h1>
          <p className="koinonia-copy">Write and save platform-specific drafts. Connections, approval, scheduling and automatic publishing are not enabled.</p>
          <p><Link href="/employee/dashboard">← Employee dashboard</Link></p>
          <div className="koinonia-grid two">
            <section className="koinonia-card">
              <h2>{editing ? "Edit draft" : "Create draft"}</h2>
              <form onSubmit={createDraft}>
                <label htmlFor="social-title">Post title</label>
                <input id="social-title" className="koinonia-input" required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} />
                <label htmlFor="social-platform">Platform</label>
                <select id="social-platform" disabled={Boolean(editing)} className="koinonia-input" value={platform} onChange={e => setPlatform(e.target.value as typeof platform)}>
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <label htmlFor="social-caption">Caption</label>
                <textarea id="social-caption" className="koinonia-input" required maxLength={5000} rows={7} value={caption} onChange={e => setCaption(e.target.value)} />
                <p><button className="koinonia-button primary" disabled={busy} type="submit">{busy ? "Saving…" : editing ? "Save changes" : "Save draft"}</button> {editing ? <button type="button" onClick={() => { setEditing(null); setTitle(""); setCaption(""); }}>Cancel edit</button> : null}</p>
              </form>
            </section>
            <section className="koinonia-card">
              <h2>Draft library</h2>
              {!items.length ? <p>No drafts saved in this workspace yet.</p> : items.map(item =>
                <article key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "12px 0" }}>
                  <strong>{item.title}</strong>
                  <p>{item.variants.map(v => v.platform).join(", ")} · {item.status}</p>
                  <p>{item.variants[0]?.caption ?? ""}</p>
                  {item.status === "draft" && item.variants[0]?.status === "draft" ? <button type="button" onClick={() => beginEdit(item)}>Edit draft</button> : null}
                </article>
              )}
            </section>
          </div>
          {message ? <p role="status">{message}</p> : null}
          <p className="koinonia-copy">Publishing is disabled by default. Saved drafts are private to this staff workspace.</p>
        </div>
      </section>
    </main>
  );
}
