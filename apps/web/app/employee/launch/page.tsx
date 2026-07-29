import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";
import {
  buildPortalLaunchChecklistReport,
  type PortalLaunchChecklistItemStatus,
  type PortalLaunchChecklistStatus
} from "../../../lib/portal-launch-checklist";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { buildCurrentPortalReadinessReport } from "../../../lib/portal-readiness-runtime";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Launch Checklist",
  description:
    "Staff-only Koinonia launch checklist for production login, client workflows, documents, billing, social login, AI review, and final validation.",
  alternates: {
    canonical: absoluteUrl("/employee/launch")
  },
  robots: {
    index: false,
    follow: false
  }
};

export default async function EmployeePortalLaunchPage() {
  await requirePortalPermission("employee-portal:view", "/employee/launch");

  const readinessReport = await buildCurrentPortalReadinessReport();
  const launchReport = buildPortalLaunchChecklistReport(readinessReport);

  return (
    <main className="koinonia-site koinonia-readiness koinonia-launch">
      <Header />

      <section className="koinonia-section koinonia-readiness-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Portal Launch</p>

            <h1 className="koinonia-title">Koinonia portal launch checklist</h1>

            <p className="koinonia-lead">
              A staff-only runbook for deciding when client login, document
              exchange, service requests, billing setup, social login, and AI
              review are ready for real client activity.
            </p>
          </div>

          <div className="koinonia-actions">
            <a className="koinonia-button primary" href="/employee/readiness">
              Live Readiness
            </a>
            <a className="koinonia-button secondary" href="/employee/review">
              Staff Review
            </a>
            <a className="koinonia-button secondary" href="/employee/access">
              Access Workspace
            </a>
          </div>

          <div className="koinonia-readiness-status-row">
            <LaunchStatusBadge label="Launch" status={launchReport.overallStatus} />
            <span>Workspace: {launchReport.workspaceId}</span>
            <span>Updated: {formatDateTime(launchReport.generatedAt)}</span>
          </div>

          <div className="koinonia-readiness-summary-grid">
            {launchReport.summary.map((card) => (
              <article className="koinonia-readiness-summary-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-launch-note" role="note">
            <p className="koinonia-eyebrow">Launch Rule</p>
            <p>
              Do not accept real client files, billing setup, staff assignments,
              internal notes, or access requests until every required check has
              evidence and the live readiness page passes against production.
            </p>
          </div>

          <div className="koinonia-readiness-grid koinonia-launch-grid">
            {launchReport.phases.map((phase) => (
              <section className="koinonia-readiness-panel" key={phase.id}>
                <div className="koinonia-readiness-panel-heading">
                  <p className="koinonia-eyebrow">{phase.title}</p>
                  <span className="koinonia-launch-count">{phase.items.length} checks</span>
                </div>

                <div className="koinonia-readiness-list">
                  {phase.items.map((item) => (
                    <LaunchChecklistItem item={item} key={item.id} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function LaunchChecklistItem({ item }: { item: PortalLaunchChecklistItemStatus }) {
  return (
    <article className={`koinonia-launch-item ${item.status}`}>
      <div className="koinonia-launch-item-heading">
        <h2>{item.title}</h2>
        <div className="koinonia-launch-badge-stack">
          <LaunchStatusBadge status={item.status} />
          <span className={`koinonia-launch-badge ${item.required ? "required" : "optional"}`}>
            {item.required ? "Required" : "Optional"}
          </span>
        </div>
      </div>

      <p>{item.detail}</p>

      <dl className="koinonia-launch-meta">
        <div>
          <dt>Owner</dt>
          <dd>{item.owner}</dd>
        </div>
        <div>
          <dt>Gate</dt>
          <dd>{item.readinessGate}</dd>
        </div>
      </dl>

      <div className="koinonia-launch-proof">
        <span>{item.status === "manual" ? "Proof Needed" : "Current Signal"}</span>
        <p>{item.proof}</p>
        <strong>{item.statusDetail}</strong>
      </div>

      {item.link ? (
        <a className="koinonia-document-link employee" href={item.link.href}>
          {item.link.label}
        </a>
      ) : null}
    </article>
  );
}

function LaunchStatusBadge({
  label,
  status
}: {
  label?: string;
  status: PortalLaunchChecklistStatus;
}) {
  return (
    <span className={`koinonia-readiness-badge ${status}`}>
      {label ? `${label}: ` : ""}
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status: PortalLaunchChecklistStatus): string {
  switch (status) {
    case "blocked":
      return "Blocked";
    case "attention":
      return "Needs Attention";
    case "manual":
      return "Manual Proof Needed";
    case "ready":
      return "Ready";
  }
}

function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}
