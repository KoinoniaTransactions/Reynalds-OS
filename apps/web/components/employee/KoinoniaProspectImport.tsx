"use client";
import { useState } from "react";
import styles from "./SocialContentStudio.module.css";
type Review = { plan: { row: number; name: string; audienceType: string; action: string }[]; committed: boolean; created: number; skipped: number; ready: number };
export function KoinoniaProspectImport() {
  const [csv, setCsv] = useState(""); const [review, setReview] = useState<Review | null>(null); const [reviewed, setReviewed] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(action: "preview" | "commit") {
    setBusy(true); setError("");
    try { const response = await fetch("/api/employee/marketing/prospects/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, csv, reviewed }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Import unavailable"); setReview(result); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Import unavailable"); } finally { setBusy(false); }
  }
  return <section className={styles.panel}><h2>Review a prospect CSV</h2>
    <p>Preview owner access only. Import creates CRM relationships and skips matching existing or repeated email, phone, license or source ID. Existing records, including archived records and opt-outs, are preserved. Imported records have unknown email permission; this action sends no messages.</p>
    <p className={styles.meta}>Up to 1,000 rows / 1 MiB. Required: name, sourceUrl (HTTPS), sourceCheckedAt (YYYY-MM-DD), and at least one email, phone, licenseNumber or externalId. Optional: brokerage, role, market, audienceType (unreviewed, prospect, partner, competitor). Review transaction-coordination providers as competitors.</p>
    <label>Prospect CSV file <input type="file" accept=".csv,text/csv" disabled={busy} onChange={event => { const file = event.target.files?.[0]; setCsv(""); setReview(null); setReviewed(false); setError(""); if (!file) return; if (file.size > 1024 * 1024) { setError("CSV must be at most 1 MiB"); return; } void file.text().then(setCsv).catch(() => setError("Unable to read CSV")); }} /></label>
    <details><summary>Template header and synthetic example</summary><pre style={{ whiteSpace: "pre-wrap" }}>name,email,phone,brokerage,role,market,licenseNumber,externalId,sourceUrl,sourceCheckedAt,audienceType{"\n"}Example Agent,agent@example.invalid,,Example Brokerage,Agent,Denver,EXAMPLE-001,,https://example.invalid/source,2026-11-01,unreviewed</pre></details>
    <button type="button" disabled={busy || !csv} onClick={() => void submit("preview")}>Review duplicates and audience</button>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {review && <><p role="status">{review.committed ? `Created ${review.created} relationships.` : `${review.ready} new relationships ready.`} {review.skipped} duplicates skipped.</p>
      <div style={{ maxHeight: "24rem", overflow: "auto" }}><table style={{ textAlign: "left", borderSpacing: "12px" }}><caption>Import review</caption><thead><tr><th scope="col">CSV row</th><th scope="col">Name</th><th scope="col">Audience</th><th scope="col">Action</th></tr></thead><tbody>{review.plan.map(row => <tr key={row.row}><td>{row.row}</td><th scope="row">{row.name}</th><td>{row.audienceType}</td><td>{row.action}</td></tr>)}</tbody></table></div>
      {!review.committed && <><label><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} disabled={busy} /> I reviewed source accuracy, audience classification and duplicate results. Public source data does not establish marketing consent.</label><button type="button" disabled={busy || !reviewed || !review.ready} onClick={() => void submit("commit")}>{busy ? "Processing…" : "Import reviewed relationships into Preview"}</button></>}
    </>}
  </section>;
}
