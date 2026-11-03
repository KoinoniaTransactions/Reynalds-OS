"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./SocialContentStudio.module.css";

const platformNames = ["facebook", "instagram", "tiktok", "linkedin"] as const;
type Platform = (typeof platformNames)[number];
type Variant = { id: string; platform: string; caption: string; status: string; revision: number; scheduledAt: string | null };
type Draft = { id: string; title: string; status: string; campaignKey: string | null; createdAt: string; variants: Variant[] };
type Page = "drafts" | "review" | "calendar" | "accounts";

export function SocialContentStudio() {
  const [items, setItems] = useState<Draft[]>([]);
  const [page, setPage] = useState<Page>("drafts");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["facebook"]);
  const [editing, setEditing] = useState<{ postId: string; variantId: string; revision: number; platform: Platform } | null>(null);
  const [query, setQuery] = useState("");
  const [planned, setPlanned] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ownerApprovalAcknowledged, setOwnerApprovalAcknowledged] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const [connections, setConnections] = useState<{ platform: string; displayName: string; status: string; expiresAt: string | null }[]>([]);

  async function refresh() {
    try {
      const [postResponse, accountResponse] = await Promise.all([
        fetch("/api/employee/social/posts", { cache: "no-store" }),
        fetch("/api/employee/social/channels", { cache: "no-store" })
      ]);
      const postsData = await postResponse.json();
      if (!postResponse.ok) throw new Error(postsData.error ?? "Unable to load drafts");
      setItems(postsData.posts ?? []);
      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        setConnections(accountData.channels ?? []);
      }
    } catch (e) {
      setFeedback({ message: e instanceof Error ? e.message : "Unable to load Content Studio", error: true });
    }
  }
  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => items.filter(item =>
    (item.title + " " + item.variants.map(v => v.caption + " " + v.platform).join(" ")).toLowerCase().includes(query.toLowerCase())
  ), [items, query]);
  const allVariants = items.flatMap(post => post.variants.map(variant => ({ ...variant, title: post.title, postId: post.id })));
  const plannedEvents = allVariants.filter(v => v.scheduledAt).sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
  const reviewCount = allVariants.filter(v => v.status === "in_review").length;
  const approvedCount = allVariants.filter(v => v.status === "approved").length;

  function resetEditor() {
    setEditing(null); setTitle(""); setCaption(""); setPlatforms(["facebook"]);
  }
  function beginEdit(post: Draft, variant: Variant) {
    if (variant.status !== "draft" || post.status !== "draft") return;
    setEditing({ postId: post.id, variantId: variant.id, revision: variant.revision, platform: variant.platform as Platform });
    setTitle(post.title); setCaption(variant.caption); setPlatforms([variant.platform as Platform]);
    setPage("drafts"); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function togglePlatform(p: Platform) {
    if (editing) return;
    setPlatforms(previous => previous.includes(p) ? previous.filter(x => x !== p) : [...previous, p]);
  }
  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing && platforms.length === 0) {
      setFeedback({ message: "Select at least one platform.", error: true }); return;
    }
    setBusy(true); setFeedback(null);
    try {
      const response = await fetch(editing ? "/api/employee/social/posts/" + encodeURIComponent(editing.postId) : "/api/employee/social/posts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, caption, platforms, platform: platforms[0],
          variantId: editing?.variantId, revision: editing?.revision })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save draft");
      resetEditor();
      await refresh();
      setFeedback({ message: "Draft saved to Preview. No social post was published or queued.", error: false });
    } catch (e) {
      setFeedback({ message: e instanceof Error ? e.message : "Unable to save draft", error: true });
    } finally { setBusy(false); }
  }
  async function action(post: Draft, variant: Variant, name: string) {
    setBusy(true); setFeedback(null);
    try {
      const date = planned[variant.id];
      if (name === "plan" && !date) throw new Error("Choose a proposed date first.");
      const response = await fetch("/api/employee/social/posts/" + encodeURIComponent(post.id) + "/workflow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, revision: variant.revision, action: name, ownerSelfApprovalAcknowledged: name === "approve" && ownerApprovalAcknowledged[variant.id] === true,
          scheduledAt: name === "plan" ? new Date(date).toISOString() : undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === "self_approval" ? "The creator of a post cannot approve it. A different authorized reviewer is required." : data.error ?? "Action failed");
      await refresh();
      setFeedback({ message: "Review updated. Automatic publishing remains disabled.", error: false });
    } catch (e) {
      setFeedback({ message: e instanceof Error ? e.message : "Review action failed", error: true });
    } finally { setBusy(false); }
  }
  function variantCard(post: Draft, variant: Variant) {
    return <div key={variant.id} className={styles.variant}>
      <div className={styles.posthead}>
        <span className={styles.pill}>{variant.platform}</span>
        <span className={styles.pill}>{variant.status.replaceAll("_", " ")}</span>
      </div>
      <p>{variant.caption}</p>
      <p className={styles.meta}>Revision {variant.revision}{variant.scheduledAt ? " · Proposed: " + new Date(variant.scheduledAt).toLocaleString() : ""}</p>
      <div className={styles.actions}>
        {variant.status === "draft" && <>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => beginEdit(post, variant)}>Edit</button>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "submit")}>Submit for review</button>
        </>}
        {variant.status === "in_review" && <>
          <label className={styles.choice} style={{ width: "100%" }}><input type="checkbox" checked={ownerApprovalAcknowledged[variant.id] === true} onChange={e => setOwnerApprovalAcknowledged(current => ({...current,[variant.id]:e.target.checked}))} />I approve this version as owner, including my own content</label>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "approve")}>Approve</button>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "request_changes")}>Request changes</button>
        </>}
        {variant.status === "changes_requested" &&
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "return_to_draft")}>Return to draft</button>}
      </div>
      {variant.status === "approved" && <div>
        <label className={styles.field} htmlFor={"date-" + variant.id}>Proposed publishing date (planning only)</label>
        <div className={styles.controls}>
          <input className={styles.input} id={"date-" + variant.id} type="datetime-local" value={planned[variant.id] ?? ""} onChange={e => setPlanned(current => ({ ...current, [variant.id]: e.target.value }))}/>
          <button type="button" disabled={busy || !planned[variant.id]} className={styles.secondary} onClick={() => action(post, variant, "plan")}>Save date</button>
          {variant.scheduledAt && <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "clear_plan")}>Clear</button>}
        </div>
      </div>}
    </div>;
  }

  return <main className={styles.studio}>
    <div className={styles.top}>
      <div>
        <div className={styles.eyebrow}>Koinonia · Staff workspace · Preview</div>
        <h1 className={styles.title}>Social Content Studio</h1>
        <p className={styles.subtitle}>Prepare content for each platform, manage draft approvals, and plan your calendar in one workspace.</p>
        <Link href="/employee/dashboard">← Employee dashboard</Link>
      </div>
      <div><span className={styles.pill}>Publishing disabled</span></div>
    </div>
    <div className={styles.notice}>This workspace saves drafts and proposed dates only. No connections, scheduled jobs, advertising, or public posts are activated.</div>
    <div className={styles.stats}>
      <div className={styles.stat}><strong>{items.length}</strong><span>Content items</span></div>
      <div className={styles.stat}><strong>{reviewCount}</strong><span>Awaiting review</span></div>
      <div className={styles.stat}><strong>{approvedCount}</strong><span>Approved versions</span></div>
      <div className={styles.stat}><strong>{plannedEvents.length}</strong><span>Planned dates</span></div>
    </div>
    <nav className={styles.nav} aria-label="Social Content Studio">
      {(["drafts", "review", "calendar", "accounts"] as const).map(tab =>
        <button key={tab} type="button" className={styles.tab + (page === tab ? " " + styles.active : "")} aria-current={page === tab ? "page" : undefined} onClick={() => setPage(tab)}>
          {tab === "drafts" ? "Content library" : tab === "review" ? "Approvals" : tab === "calendar" ? "Calendar" : "Accounts"}
        </button>)}
    </nav>
    {feedback && <div role="status" className={feedback.error ? styles.error : styles.success}>{feedback.message}</div>}
    {page === "drafts" && <div className={styles.layout}>
      <section className={styles.panel}>
        <h2>{editing ? "Edit " + editing.platform + " version" : "Create content"}</h2>
        <form onSubmit={saveDraft}>
          <label className={styles.field} htmlFor="social-title">Internal post title</label>
          <input className={styles.input} id="social-title" value={title} maxLength={160} required onChange={e => setTitle(e.target.value)} placeholder="e.g. 3 ways to reclaim your Friday"/>
          <div className={styles.field}>Target platforms</div>
          <div className={styles.platforms}>
            {platformNames.map(p => <label className={styles.choice} key={p}>
              <input type="checkbox" checked={platforms.includes(p)} disabled={Boolean(editing)} onChange={() => togglePlatform(p)}/>{p}
            </label>)}
          </div>
          <p className={styles.meta}>Each platform receives its own editable draft and approval status.</p>
          <label className={styles.field} htmlFor="social-caption">Caption</label>
          <textarea className={styles.input} id="social-caption" value={caption} onChange={e => setCaption(e.target.value)} maxLength={5000} rows={8} required placeholder="Write your caption here..."/>
          <p className={styles.meta}>{caption.length} / 5000 characters</p>
          <div className={styles.actions}>
            <button disabled={busy || !platforms.length} type="submit" className={styles.primary}>{busy ? "Saving..." : editing ? "Save edits" : "Save drafts"}</button>
            {editing && <button type="button" className={styles.secondary} onClick={resetEditor}>Cancel edit</button>}
          </div>
          <p className={styles.meta}>Media uploads will be enabled after secure storage validation. No files are uploaded in this version.</p>
        </form>
      </section>
      <section className={styles.panel}>
        <h2>Content library</h2>
        <label className={styles.field} htmlFor="social-search">Search drafts</label>
        <input className={styles.input} id="social-search" type="search" placeholder="Search title, caption or platform" value={query} onChange={e => setQuery(e.target.value)}/>
        <div className={styles.items}>{filtered.length ? filtered.map(post =>
          <article className={styles.post} key={post.id}>
            <div className={styles.posthead}><h3>{post.title}</h3><span className={styles.meta}>{new Date(post.createdAt).toLocaleDateString()}</span></div>
            {post.variants.map(variant => variantCard(post, variant))}
          </article>) : <div className={styles.empty}>{items.length ? "No matching content." : "No drafts yet. Create your first content item."}</div>}</div>
      </section>
    </div>}
    {page === "review" && <section className={styles.panel}><h2>Approval queue</h2><p className={styles.meta}>Owners may explicitly approve their own work with acknowledgment. Admins can approve other creators’ submissions, but not their own.</p>
      <div className={styles.items}>{items.flatMap(post => post.variants.filter(v => ["in_review", "changes_requested"].includes(v.status)).map(v =>
        <article className={styles.post} key={v.id}><h3>{post.title}</h3>{variantCard(post,v)}</article>
      )).length ? items.flatMap(post => post.variants.filter(v => ["in_review", "changes_requested"].includes(v.status)).map(v =>
        <article className={styles.post} key={v.id}><h3>{post.title}</h3>{variantCard(post,v)}</article>
      )) : <div className={styles.empty}>Nothing is awaiting review.</div>}</div>
    </section>}
    {page === "calendar" && <section className={styles.panel}><h2>Planned content calendar</h2><p className={styles.meta}>Proposed dates only. The scheduler does not publish or create jobs.</p>
      <div className={styles.calendar}>{plannedEvents.length ? plannedEvents.map(e =>
        <div className={styles.event} key={e.id}><span className={styles.date}>{new Date(e.scheduledAt!).toLocaleString()}</span>
          <div><strong>{e.title}</strong><div className={styles.meta}>{e.platform} · {e.status}</div></div></div>
      ) : <div className={styles.empty}>Approved content with proposed dates will appear here.</div>}</div>
    </section>}
    {page === "accounts" && <section className={styles.panel}><h2>Social accounts</h2>
      <p className={styles.meta}>Read-only connection status. No OAuth credentials or posting permissions are configured through this screen.</p>
      <div className={styles.items}>{platformNames.map(p => {
        const entries = connections.filter(c => c.platform === p);
        return <div key={p} className={styles.post}><div className={styles.posthead}>
          <strong style={{ textTransform: "capitalize" }}>{p}</strong><span className={styles.pill}>{entries.length ? entries[0].status : "Not connected"}</span>
        </div>{entries.map(c => <p className={styles.meta} key={c.displayName}>{c.displayName}{c.expiresAt ? " · Expires " + new Date(c.expiresAt).toLocaleDateString() : ""}</p>)}</div>;
      })}</div>
    </section>}
  </main>;
}
