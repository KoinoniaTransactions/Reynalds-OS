import type { Metadata } from "next";
import { absoluteUrl, seoConfig } from "../../config/seo.config";
import { Footer, Header } from "../../components/site";

export const metadata: Metadata = {
  title: "Client Portal",
  description:
    "Secure Koinonia client portal entry for Realtor work tracking, document exchange, and access coordination.",
  alternates: {
    canonical: absoluteUrl("/client")
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "Client Portal | Koinonia",
    description:
      "Secure client portal entry for Koinonia Realtor support work.",
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: "Koinonia Client Portal"
      }
    ],
    url: absoluteUrl("/client")
  }
};

const portalPreview = [
  {
    label: "Waiting on Client",
    value: "Docs needed",
    body: "Requests that need files, instructions, approval, or access from the Realtor."
  },
  {
    label: "Active",
    value: "In progress",
    body: "Transaction, contract, showing, and operations work currently moving forward."
  },
  {
    label: "Ready for Review",
    value: "Your turn",
    body: "Prepared documents, drafts, or next steps waiting for Realtor review and approval."
  },
  {
    label: "Completed",
    value: "Closed out",
    body: "Finished work, uploaded files, notes, and completion history kept together."
  }
] as const;

const portalPrinciples = [
  {
    title: "Work Dashboard",
    body:
      "Clients will be able to see pending, active, ready-for-review, and completed work in one place."
  },
  {
    title: "Document Exchange",
    body:
      "The portal will support secure upload and download workflows after production authentication and file controls are in place."
  },
  {
    title: "Access Coordination",
    body:
      "Koinonia will track access needs and approvals without asking clients to paste passwords into the website."
  }
] as const;

export default function ClientPortalPage() {
  return (
    <main className="koinonia-site koinonia-client-portal">
      <Header />

      <section className="koinonia-section koinonia-client-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-client-portal-grid">
            <div className="koinonia-client-portal-copy">
              <p className="koinonia-eyebrow">Client Portal</p>

              <h1 className="koinonia-title">
                A secure workspace for the work behind the transaction.
              </h1>

              <p className="koinonia-lead">
                Koinonia is preparing a secure portal for Realtor clients to
                exchange documents, track active support work, review next
                steps, and coordinate approved access without relying on
                scattered email threads.
              </p>

              <div className="koinonia-actions">
                <a className="koinonia-button primary" href="/contact#schedule-consultation">
                  Request Portal Access
                </a>

                <a className="koinonia-button secondary" href="/contact">
                  Contact Koinonia
                </a>

                <a className="koinonia-button secondary" href="/client/dashboard">
                  View Dashboard Preview
                </a>

                <a className="koinonia-button secondary" href="/client/documents">
                  View Document Center
                </a>

                <a className="koinonia-button secondary" href="/client/billing">
                  View Billing Center
                </a>
              </div>
            </div>

            <aside
              className="koinonia-client-portal-panel"
              aria-label="Client portal status preview"
            >
              <div className="koinonia-client-portal-panel-header">
                <span>Koinonia Portal</span>
                <strong>Secure entry coming online</strong>
              </div>

              <div className="koinonia-client-status-list">
                {portalPreview.map((item) => (
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
              Built for documents, work status, and approved access.
            </h2>

            <p className="koinonia-copy">
              The first production version should connect to real
              authentication before accepting client documents or access
              requests.
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
          <div className="koinonia-client-security-note">
            <p className="koinonia-eyebrow">Access Boundary</p>

            <h2 className="koinonia-heading">
              Client passwords do not belong in a website form.
            </h2>

            <p className="koinonia-copy">
              When Koinonia needs platform access, the portal should track the
              request and the approval status. Access itself should use
              broker-approved delegated access, team permissions, transaction
              coordinator access, or an approved encrypted sharing workflow.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
