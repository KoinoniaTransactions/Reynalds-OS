"use client";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./SocialContentStudio.module.css";
type ApprovedVersion = { id: string; revision: number; title: string; platform: string };
type Account = { id: string; platform: string; displayName: string; status: string };
type Job = { id: string; status: string; mode: string; scheduledAt: string; timeZone: string; attemptsCount: number; externalPostId: string | null; lastErrorCode: string | null; lastErrorMessage: string | null;
  variant: { platform: string; post: { title: string } }; attempts: { id: string; attempt: number; status: string; createdAt: string }[] };
export function SocialPublishingJobs({ versions, accounts, onChanged }: { versions: ApprovedVersion[]; accounts: Account[]; onChanged: () => Promise<void> }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [owner, setOwner] = useState(false);
  const [canSimulate, setCanSimulate] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [variantId, setVariantId] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [mode, setMode] = useState("dry_run");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = versions.find(v => v.id === variantId);
  const queueMode = canSimulate ? mode : "live";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  async function load() {
    const response = await fetch("/api/employee/social/jobs", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Job history unavailable");
    setJobs(data.jobs); setOwner(data.ownerCanManage); setCanSimulate(data.previewSimulationsEnabled); setLiveEnabled(data.livePublishingEnabled);
  }
  useEffect(() => { let active = true;
    void fetch("/api/employee/social/jobs", { cache: "no-store" }).then(async response => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Job history unavailable");
      if (active) { setJobs(data.jobs); setOwner(data.ownerCanManage); setCanSimulate(data.previewSimulationsEnabled); setLiveEnabled(data.livePublishingEnabled); }
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : "Job history unavailable"); });
    return () => { active = false; };
  }, []);
  async function perform(path: string, body?: unknown) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Action failed");
      await load(); await onChanged();
      setMessage(path.endsWith("run-preview") ? "Due simulations processed. No provider requests or public posts were made." : "Job updated. Check its status below.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Action failed"); }
    finally { setBusy(false); }
  }
  function queue(event: FormEvent) {
    event.preventDefault(); if (!selected || !date) return;
    const instant = new Date(date);
    if (!Number.isFinite(instant.getTime())) { setMessage("Choose a valid future time."); return; }
    // Reject a local time normalized across the spring-forward gap.
    const local = new Date(instant.getTime() - instant.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    if (local !== date) { setMessage("That local time does not exist because the clocks change. Choose another time."); return; }
    void perform("/api/employee/social/jobs", { variantId: selected.id, revision: selected.revision, mode: queueMode, scheduledAt: instant.toISOString(), timeZone, connectionId: queueMode === "live" ? connectionId : null });
  }
  return <section className={styles.panel}>
    <h2>Publishing jobs and activity</h2>
    <p className={styles.meta}>Simulations exercise the saved queue without contacting social platforms. Public publishing requires separate owner activation and verified accounts.</p>
    {message && <p role="status">{message}</p>}
    {owner && (canSimulate || liveEnabled) && <form onSubmit={queue}>
      <label className={styles.field} htmlFor="queue-version">Approved version</label>
      <select className={styles.input} id="queue-version" value={variantId} required onChange={event => { setVariantId(event.target.value); setConnectionId(""); }}>
        <option value="">Choose approved content</option>{versions.map(v => <option key={v.id} value={v.id}>{v.title} · {v.platform} · revision {v.revision}</option>)}
      </select>
      <label className={styles.field} htmlFor="queue-mode">Execution</label>
      <select className={styles.input} id="queue-mode" value={queueMode} onChange={event => setMode(event.target.value)}>
        {canSimulate && <option value="dry_run">Simulation — no public post</option>}{liveEnabled && <option value="live">Public publishing</option>}
      </select>
      {queueMode === "live" && <><label className={styles.field} htmlFor="queue-account">Publishing account</label><select className={styles.input} id="queue-account" value={connectionId} required onChange={event => setConnectionId(event.target.value)}>
        <option value="">Choose account</option>{accounts.filter(a => a.platform === selected?.platform && a.status === "connected").map(a => <option key={a.id} value={a.id}>{a.displayName}</option>)}
      </select></>}
      <label className={styles.field} htmlFor="queue-time">Scheduled time · {timeZone}</label>
      <input className={styles.input} id="queue-time" type="datetime-local" value={date} required onChange={event => setDate(event.target.value)} />
      {date && Number.isFinite(new Date(date).getTime()) && <p className={styles.meta}>Scheduled instant: {new Date(date).toISOString()}. Times use this device’s timezone.</p>}
      <button className={styles.secondary} type="submit" disabled={busy || !selected}>{queueMode === "live" ? "Schedule approved post" : "Queue simulation"}</button>
    </form>}
    <div className={styles.actions}>
      <button type="button" className={styles.secondary} disabled={busy} onClick={() => { void load().catch(error => setMessage(error instanceof Error ? error.message : "Unable to refresh")); }}>Refresh history</button>
      {owner && canSimulate && <button type="button" className={styles.secondary} disabled={busy} onClick={() => void perform("/api/employee/social/jobs/run-preview")}>Run due simulations</button>}
    </div>
    <div className={styles.items}>{jobs.length ? jobs.map(job => <article className={styles.post} key={job.id}>
      <h3>{job.variant.post.title} · {job.variant.platform}</h3>
      <p>{job.mode === "dry_run" ? "Simulation" : "Public publishing"} · {job.status} · {new Date(job.scheduledAt).toLocaleString(undefined, { timeZone: job.timeZone })} ({job.timeZone})</p>
      {job.externalPostId && <p>Provider post ID: {job.externalPostId}</p>}
      {job.lastErrorMessage && <p>{job.lastErrorMessage}</p>}
      {job.status === "needs_reconciliation" && <p>Do not create a replacement post until the provider outcome is confirmed.</p>}
      {owner && ["scheduled", "preparing", "retry_wait", "failed", "needs_reauthorization"].includes(job.status) && !job.externalPostId && <div className={styles.actions}>
        <button type="button" className={styles.secondary} disabled={busy} onClick={() => void perform("/api/employee/social/jobs/" + encodeURIComponent(job.id), { action: "cancel" })}>Cancel and return to draft</button>
        {["failed", "needs_reauthorization"].includes(job.status) && job.lastErrorCode?.startsWith("retryable_") && <button type="button" className={styles.secondary} disabled={busy} onClick={() => void perform("/api/employee/social/jobs/" + encodeURIComponent(job.id), { action: "retry" })}>Retry same job</button>}
      </div>}
      <details><summary>{job.attemptsCount} execution attempts</summary>{job.attempts.map(attempt => <p key={attempt.id}>Attempt {attempt.attempt} · {attempt.status} · {new Date(attempt.createdAt).toLocaleString()}</p>)}</details>
    </article>) : <p className={styles.empty}>No publishing jobs have been queued.</p>}</div>
  </section>;
}
