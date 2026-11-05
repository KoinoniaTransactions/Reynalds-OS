"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./SocialContentStudio.module.css";

const platformNames = ["facebook", "instagram", "tiktok", "linkedin"] as const;
type Platform = (typeof platformNames)[number];
type Media = { key: string; type: string; size: number; name: string };
type Variant = { id: string; platform: string; caption: string; status: string; revision: number; scheduledAt: string | null; media?: Media[] | null };
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
  const [uploadPercent, setUploadPercent] = useState<Record<string, number>>({});
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
    if (!["draft", "changes_requested"].includes(variant.status) || post.status !== "draft") return;
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
  async function uploadImage(post: Draft, variant: Variant, file?: File) {
    if (!file) return;
    setBusy(true); setFeedback(null);
    try {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) throw new Error("Choose a JPG, PNG or WebP under 3 MB.");
      const form = new FormData();
      form.append("variantId", variant.id);
      form.append("revision", String(variant.revision));
      form.append("file", file);
      const response = await fetch("/api/employee/social/posts/" + encodeURIComponent(post.id) + "/media", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      await refresh();
      setFeedback({ message: "Image saved to Preview; previous approval invalidated.", error: false });
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Upload failed", error: true });
    } finally { setBusy(false); }
  }
  async function uploadVideo(post: Draft, variant: Variant, file?: File) {
    if (!file) return;
    if (!["video/mp4", "video/webm"].includes(file.type) || file.size > 512 * 1024 * 1024) {
      setFeedback({ message: "Select an MP4 or WebM video under 512 MiB.", error: true }); return;
    }
    setBusy(true); setFeedback(null);
    let authToken: string | null = null;
    const endpoint = "/api/employee/social/posts/" + encodeURIComponent(post.id) + "/video";
    try {
      const begin = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, revision: variant.revision, size: file.size, type: file.type, name: file.name }) });
      const session = await begin.json();
      if (!begin.ok) throw new Error(session.error ?? "Unable to prepare video upload");
      authToken = session.token;
      const partSize: number = session.partSize;
      const urls: { number: number; url: string }[] = session.parts;
      if (!authToken || !Number.isInteger(partSize) || !Array.isArray(urls) || urls.length === 0) throw new Error("Invalid upload session");
      const uploaded: { number: number; etag: string }[] = [];
      let next = 0;
      async function worker() {
        while (next < urls.length) {
          const entry = urls[next++];
          if (!entry) return;
          const start = (entry.number - 1) * partSize;
          const chunk = file.slice(start, Math.min(file.size, start + partSize), "");
          let url = entry.url;
          let etag = "";
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const response = await fetch(url, { method: "PUT", body: chunk, cache: "no-store" });
              if (response.ok) {
                etag = response.headers.get("ETag") ?? "";
                if (!etag) throw new Error("R2 CORS must expose the ETag header");
                break;
              }
              if (response.status === 403) {
                const renewed = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: authToken, parts: [entry.number] }) });
                const data = await renewed.json();
                if (renewed.ok && data.parts?.[0]?.url) url = data.parts[0].url;
              }
              if (attempt === 2) throw new Error("R2 rejected video part " + entry.number + " (" + response.status + ")");
            } catch (error) {
              if (attempt === 2) throw error;
            }
          }
          if (!etag) throw new Error("Video part " + entry.number + " did not return an ETag");
          uploaded.push({ number: entry.number, etag });
          setUploadPercent(current => ({ ...current, [variant.id]: Math.round(uploaded.length / urls.length * 100) }));
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, urls.length) }, () => worker()));
      uploaded.sort((a, b) => a.number - b.number);
      const done = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: authToken, parts: uploaded, name: file.name }) });
      const data = await done.json();
      if (!done.ok) throw new Error(data.error ?? "Video could not be verified");
      authToken = null;
      await refresh();
      setFeedback({ message: "Video attached to this draft. Previous approvals are invalidated.", error: false });
    } catch (error) {
      if (authToken) await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: authToken }) }).catch(() => {});
      setFeedback({ message: error instanceof Error ? error.message : "Video upload failed", error: true });
    } finally {
      setBusy(false);
      setUploadPercent(current => { const copy = { ...current }; delete copy[variant.id]; return copy; });
    }
  }
  async function removeImage(post: Draft, variant: Variant, media: Media) {
    if (!window.confirm("Remove this image from the " + variant.platform + " draft?")) return;
    setBusy(true); setFeedback(null);
    try {
      const response = await fetch("/api/employee/social/posts/" + encodeURIComponent(post.id) + "/media", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, revision: variant.revision, key: media.key })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to remove image");
      await refresh();
      setFeedback({ message: data.storageCleanupPending ? "Attachment removed; storage cleanup has been flagged for follow-up." : "Image removed from this draft. Revision updated.", error: Boolean(data.storageCleanupPending) });
    } catch (error) { setFeedback({ message: error instanceof Error ? error.message : "Unable to remove image", error: true }); }
    finally { setBusy(false); }
  }
  function imageUrl(post: Draft, variant: Variant, media: Media) {
    return "/api/employee/social/posts/" + encodeURIComponent(post.id) + "/media?variantId=" + encodeURIComponent(variant.id) + "&key=" + encodeURIComponent(media.key);
  }
  function variantCard(post: Draft, variant: Variant) {
    return <div key={variant.id} className={styles.variant}>
      <div className={styles.posthead}>
        <span className={styles.pill}>{variant.platform}</span>
        <span className={styles.pill}>{variant.status.replaceAll("_", " ")}</span>
      </div>
      <p>{variant.caption}</p>
      {Array.isArray(variant.media) && variant.media.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
        {variant.media.map(image => <div key={image.key} style={{ maxWidth: 118 }}>
          {/* Media can only be fetched through our authenticated workspace-specific endpoint. */}
          {image.type.startsWith("video/") ? <video src={imageUrl(post, variant, image)} controls preload="metadata" style={{ width: 170, maxWidth: "100%", borderRadius: 8 }} /> :
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(post, variant, image)} alt={image.name || "Draft media"} loading="lazy" style={{ width: 112, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}/>} 
          <p className={styles.meta} style={{ overflowWrap: "anywhere" }}>{image.name}</p>
          {["draft", "changes_requested"].includes(variant.status) && <button type="button" className={styles.secondary} disabled={busy} onClick={() => removeImage(post, variant, image)}>Remove media</button>}
        </div>)}
      </div>}
      {["draft", "changes_requested"].includes(variant.status) && (!Array.isArray(variant.media) || variant.media.length < 4) && <label className={styles.choice} style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "start" }}>Add image (JPG, PNG or WebP, max 3 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { void uploadImage(post, variant, e.target.files?.[0]); e.target.value = ""; }} />
      </label>}
      {["draft", "changes_requested"].includes(variant.status) && !(variant.media ?? []).some(m => m.type.startsWith("video/")) && <label className={styles.choice} style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "start" }}>Add video (MP4 or WebM, up to 512 MiB)
        <input type="file" accept="video/mp4,video/webm" disabled={busy} onChange={e => { void uploadVideo(post, variant, e.target.files?.[0]); e.target.value = ""; }} />
      </label>}
      {typeof uploadPercent[variant.id] === "number" && <p className={styles.meta} role="status">Uploading video: {uploadPercent[variant.id]}%</p>}
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
        {variant.status === "changes_requested" && <>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => beginEdit(post, variant)}>Edit requested changes</button>
          <button type="button" disabled={busy} className={styles.secondary} onClick={() => action(post, variant, "return_to_draft")}>Return to draft</button>
        </>}
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
          <p className={styles.meta}>Save a draft first, then attach images or videos to an individual platform version. Media changes invalidate prior approvals.</p>
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
