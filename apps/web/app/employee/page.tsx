import type { Metadata } from "next";
import { absoluteUrl, seoConfig } from "../../config/seo.config";
import { Footer, Header } from "../../components/site";

export const metadata: Metadata = {
  title: "Employee Portal",
  description:
    "Internal Koinonia employee portal entry for staff assignments, client ownership, and work tracking.",
  alternates: {
    canonical: absoluteUrl("/employee")
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "Employee Portal | Koinonia",
    description:
      "Internal staff portal preview for Koinonia client and work assignments.",
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: "Koinonia Employee Portal"
      }
    ],
    url: absoluteUrl("/employee")
  }
};

const employeePortalPreview = [
  {
    label: "Assignment Queue",
    value: "Needs owner",
    body: "Unassigned clients and work items are visible before they drift."
  },
  {
    label: "Staff Capacity",
    value: "Balanced",
    body: "Work can be assigned with current load, role, and availability in view."
  },
  {
    label: "Client Ownership",
    value: "Account owner",
    body: "Every Realtor client should have a primary staff owner and a backup."
  },
  {
    label: "Handoffs",
    value: "Tracked",
    body: "Internal notes, blockers, and escalations stay tied to the right work."
  }
] as const;

const portalPrinciples = [
  {
    title: "Assign Clients",
    body:
      "Client accounts should have an account owner, backup owner, package context, and next touch."
  },
  {
    title: "Assign Work",
    body:
      "Transactions, contracts, showings, and operations tasks should each have a responsible staff member."
  },
  {
    title: "Protect Access",
    body:
      "Staff only see the clients, work, documents, and instructions needed for their role."
  }
] as const;

export default function EmployeePortalPage() {
  return (
    <main className="koinonia-site koinonia-employee-portal">
      <Header />

      <section className="koinonia-section koinonia-employee-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-employee-portal-grid">
            <div className="koinonia-employee-portal-copy">
              <p className="koinonia-eyebrow">Employee Portal</p>

              <h1 className="koinonia-title">
                Internal workspace for assigning clients and work.
              </h1>

              <p className="koinonia-lead">
                Koinonia staff need one place to see who owns each Realtor
                relationship, who is assigned to active work, what is
                unassigned, and where handoffs or capacity risks need attention.
              </p>

              <div className="koinonia-actions">
                <a className="koinonia-button primary" href="/sign-in?return_to=%2Femployee%2Fdashboard">
                  Staff Login
                </a>

                <a className="koinonia-button secondary" href="/client/dashboard">
                  View Client Dashboard
                </a>

                <a className="koinonia-button secondary" href="/employee/documents">
                  View Document Workspace
                </a>

                <a className="koinonia-button secondary" href="/employee/billing">
                  View Billing Workspace
                </a>
              </div>
            </div>

            <aside
              className="koinonia-employee-portal-panel"
              aria-label="Employee portal status preview"
            >
              <div className="koinonia-employee-portal-panel-header">
                <span>Koinonia Staff</span>
                <strong>Internal assignment preview</strong>
              </div>

              <div className="koinonia-employee-status-list">
                {employeePortalPreview.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <p className="koinonia-eyebrow">Portal Foundation</p>

            <h2 className="koinonia-heading">
              Built for role-safe staff assignment.
            </h2>

            <p className="koinonia-copy">
              The first production version should connect to real
              authentication before exposing client files, staff notes, or
              internal handoff history.
            </p>
          </div>

          <div className="koinonia-grid three">
            {portalPrinciples.map((item) => (
              <article className="koinonia-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-employee-security-note">
            <p className="koinonia-eyebrow">Internal Boundary</p>

            <h2 className="koinonia-heading">
              Staff access should match responsibility.
            </h2>

            <p className="koinonia-copy">
              Showing providers should see assigned showing details. Contract
              support should see assigned drafting work. Operations leadership
              can rebalance work across staff. Client users should never see
              this internal portal.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
