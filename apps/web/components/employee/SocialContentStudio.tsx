"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Draft = { id: string; title: string; status: string; campaignKey: string | null; createdAt: string; variants: { id: string; platform: string; caption: string; status: string; revision: number; scheduledAt: string | null }[] };
const platforms = ["facebook", "instagram", "tiktok", "linkedin"] as const;

export function SocialContentStudio() {
  const [items, setItems] = useState<Draft[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("facebook");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [planned, setPlanned] = useState<Record<string,string>>({});
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

  async function workflow(item: Draft, action: string) {
    const variant = item.variants[0];
    if (!variant) return;
    setBusy(true); setMessage("");
    try {
      const when = planned[variant.id];
      if (action === "plan" && !when) throw new Error("Choose a date");
      const res = await fetch("/api/employee/social/posts/" + encodeURIComponent(item.id) + "/workflow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, revision: variant.revision,
          action, scheduledAt: action === "plan" ? new Date(when).toISOString() : undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to update");
      setMessage("Workflow updated. Nothing published.");
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update workflow"); }
    finally { setBusy(false); }
  }

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
          <p className="koinonia-copy">Write and save platform-specific drafts. Review and proposed calendar dates are available. Automatic publishing is disabled.</p>
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
                  {item.variants[0] ? <p>Review: {item.variants[0].status} {item.variants[0].scheduledAt ? new Date(item.variants[0].scheduledAt).toLocaleString() : ""}</p> : null}
                  {item.variants[0]?.status === "draft" ? <button disabled={busy} type="button" onClick={() => workflow(item, "submit")}>Submit for review</button> : null}
                  {item.variants[0]?.status === "in_review" ? <>
                    <button disabled={busy} type="button" onClick={() => workflow(item, "approve")}>Approve (owner/admin)</button>
                    <button disabled={busy} type="button" onClick={() => workflow(item, "request_changes")}>Request changes</button>
                  </> : null}
                  {item.variants[0]?.status === "changes_requested" ? <button disabled={busy} type="button" onClick={() => workflow(item, "return_to_draft")}>Return to draft</button> : null}
                  {item.variants[0]?.status === "approved" ? <div>
                    <label>Proposed date <input type="datetime-local" value={planned[item.variants[0].id] ?? ""} onChange={e => setPlanned(prev => ({ ...prev, [item.variants[0].id]: e.target.value }))} /></label>
                    <button disabled={busy || !planned[item.variants[0].id]} type="button" onClick={() => workflow(item, "plan")}>Save proposed date</button>
                    {item.variants[0].scheduledAt ? <button disabled={busy} type="button" onClick={() => workflow(item, "clear_plan")}>Clear date</button> : null}
                  </div> : null}
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
