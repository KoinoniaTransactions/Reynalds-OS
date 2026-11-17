"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { buildKoinoniaMarketingReport } from "../../lib/koinonia-marketing-report";
import styles from "./SocialContentStudio.module.css";
type Overview = { report: ReturnType<typeof buildKoinoniaMarketingReport>; totalRecords: number; truncated: boolean; overdueFollowUps: number; livePublishingEnabled: boolean; asOf: string;
  jobs: { status: string; mode: string; _count: { _all: number } }[];
  channels: { platform: string; displayName: string; status: string; expiresAt: string | null; publishingEnabled: boolean }[];
  issues: { id: string; status: string; mode: string; lastErrorMessage: string | null }[] };
export function KoinoniaMarketingDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/employee/marketing/overview", { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Reporting unavailable"); setOverview(data);
    }).catch(problem => { if (!controller.signal.aborted) setError(problem instanceof Error ? problem.message : "Reporting unavailable"); });
    return () => controller.abort();
  }, []);
  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  return <main className={styles.studio}>
    <div className={styles.eyebrow}>Koinonia Transactions · Owner workspace</div><h1 className={styles.title}>Marketing and acquisition</h1>
    <nav className={styles.actions} aria-label="Marketing workspaces"><Link href="/employee/social">Content and publishing</Link><Link href="/crm">Relationships and follow-ups</Link><Link href="/employee/dashboard">Employee dashboard</Link></nav>
    {error ? <p className={styles.error} role="alert">{error}</p> : !overview ? <p role="status">Loading recorded business results…</p> : <>
      <p className={styles.meta}>All-time CRM records · Updated {new Date(overview.asOf).toLocaleString()} · Public publishing {overview.livePublishingEnabled ? "enabled subject to account and content gates" : "disabled"}</p>
      {overview.truncated && <p className={styles.notice}>The CRM contains {overview.totalRecords} records. Acquisition figures below cover the first 5,000 records; they are a partial report.</p>}
      <div className={styles.stats}>{[["Relationships", overview.report.relationships], ["Current qualified leads", overview.report.currentQualified], ["Consultation requests recorded", overview.report.consultationRequests], ["Current customer relationships", overview.report.customers], ["Overdue workspace tasks", overview.overdueFollowUps], ["Competitors excluded", overview.report.competitors], ["Unclassified relationships", overview.report.unclassified], ["Email opt-outs / DNC", overview.report.suppressed]].map(([label, value]) => <div className={styles.stat} key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      <section className={styles.panel}><h2>Campaign acquisition</h2><p className={styles.meta}>{overview.report.measurementNote}</p>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left", borderSpacing: "12px" }}><caption>Recorded CRM relationships by acquisition campaign</caption><thead><tr>{["Campaign", "Relationships", "Consultations", "Current customers", "Conversion-tagged", "Staff recorded", "Recorded revenue"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{overview.report.campaigns.map(row => <tr key={row.campaign}><th scope="row">{row.campaign}</th><td>{row.relationships}</td><td>{row.consultations}</td><td>{row.customers}</td><td>{row.tagged}</td><td>{row.staffRecorded}</td><td>{money(row.recordedRevenue)}</td></tr>)}</tbody></table></div>
        {!overview.report.campaigns.length && <p>No acquisition records available.</p>}
        <p className={styles.meta}>Website visits, landing-page conversion, advertising spend, provider impressions and email engagement are unavailable until their measurement connections are verified.</p>
      </section>
      <section className={styles.panel}><h2>Publishing operation</h2>{overview.jobs.length ? overview.jobs.map(row => <p key={row.mode + row.status}>{row.mode === "dry_run" ? "Simulation" : "Public publishing"} · {row.status}: {row._count._all}</p>) : <p>No publishing jobs recorded.</p>}
        <h3>Accounts</h3>{overview.channels.length ? overview.channels.map((channel, index) => <p key={channel.platform + index}>{channel.platform} · {channel.displayName} · {channel.expiresAt && new Date(channel.expiresAt) <= new Date() ? "expired" : channel.status} · Publishing {channel.publishingEnabled ? "permitted" : "disabled"}</p>) : <p>No authorized accounts recorded.</p>}
        <h3>Needs attention</h3>{overview.issues.length ? overview.issues.map(issue => <p key={issue.id}>{issue.mode === "dry_run" ? "Simulation" : "Public publishing"} · {issue.status}: {issue.lastErrorMessage ?? "Review job history."}</p>) : <p>No failed jobs recorded.</p>}
      </section>
    </>}
  </main>;
}
