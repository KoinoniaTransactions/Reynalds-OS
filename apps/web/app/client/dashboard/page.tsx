import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";

export const metadata: Metadata = {
  title: "Client Dashboard Preview",
  description:
    "Preview of the Koinonia client dashboard for active, pending, waiting, and completed work.",
  alternates: {
    canonical: absoluteUrl("/client/dashboard")
  },
  robots: {
    index: false,
    follow: false
  }
};

const summaryCards = [
  {
    label: "Waiting on You",
    value: "2",
    body: "Items that need instructions, files, approval, or access."
  },
  {
    label: "Active Work",
    value: "3",
    body: "Support currently in progress with Koinonia."
  },
  {
    label: "Ready for Review",
    value: "1",
    body: "Drafts or next steps waiting for Realtor review."
  },
  {
    label: "Completed",
    value: "8",
    body: "Recently completed work and closed-out support."
  }
] as const;

const workItems = [
  {
    title: "Buyer Offer Package",
    type: "Contract & Document Support",
    status: "Waiting on You",
    nextAction: "Confirm offer instructions and preferred closing timeline.",
    due: "Today"
  },
  {
    title: "Smith Contract-to-Close",
    type: "Transaction Support",
    status: "Active",
    nextAction: "Koinonia is tracking inspection and earnest money deadlines.",
    due: "Jul 31"
  },
  {
    title: "Monthly Operations Cleanup",
    type: "Monthly Operations Partnership",
    status: "Active",
    nextAction: "CRM follow-up groups are being organized for review.",
    due: "This week"
  },
  {
    title: "Northgate Showing Coverage",
    type: "Licensed Showing Coverage",
    status: "Completed",
    nextAction: "Showing notes and feedback are available in the work history.",
    due: "Complete"
  }
] as const;

const showingRequests = [
  {
    title: "Schedule Northgate Buyer Tour",
    status: "Scheduling Requested",
    nextAction: "Koinonia is checking requested showing windows and buyer availability.",
    timing: "Thu afternoon",
    notes: ["Client contact authorized", "Friday morning is the backup window"]
  },
  {
    title: "West Ridge Showing Coverage",
    status: "Waiting on Client",
    nextAction: "Access instructions and safety notes are needed before coverage can be confirmed.",
    timing: "Same-day request",
    notes: ["Rush review needed", "Access details pending"]
  },
  {
    title: "Northgate Showing Follow-Up",
    status: "Feedback Sent",
    nextAction: "Showing notes were delivered. Follow-up remains open if the Realtor requests it.",
    timing: "Complete",
    notes: ["Buyer feedback delivered", "No immediate issue flagged"]
  }
] as const;

const documentRequests = [
  "Executed listing agreement",
  "Seller property disclosure",
  "Inspection objection instructions",
  "Showing access notes for West Ridge"
] as const;

const accessRequests = [
  {
    platform: "Transaction platform",
    status: "Waiting on Client",
    body: "Grant broker-approved transaction coordinator access or send an approved secure sharing link."
  },
  {
    platform: "Forms workspace",
    status: "Needed",
    body: "Koinonia needs delegated document-preparation access before drafting forms."
  }
] as const;

export default function ClientDashboardPreviewPage() {
  return (
    <main className="koinonia-site koinonia-client-dashboard">
      <Header />

      <section className="koinonia-section koinonia-client-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Dashboard Preview</p>

            <h1 className="koinonia-title">
              One place for active work, pending items, and completed support.
            </h1>

            <p className="koinonia-lead">
              This preview uses sample data only. Real client dashboard access
              must wait for production authentication, document storage, and
              audit logging.
            </p>
          </div>

          <div className="koinonia-client-summary-grid">
            {summaryCards.map((card) => (
              <article className="koinonia-client-summary-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-client-dashboard-layout">
            <div className="koinonia-client-main-stack">
              <section className="koinonia-client-work-panel" aria-labelledby="client-work-title">
                <div className="koinonia-client-panel-heading">
                  <p className="koinonia-eyebrow">Work</p>
                  <h2 id="client-work-title">Current Support</h2>
                </div>

                <div className="koinonia-client-work-list">
                  {workItems.map((item) => (
                    <article className="koinonia-client-work-item" key={item.title}>
                      <div>
                        <span>{item.type}</span>
                        <h3>{item.title}</h3>
                        <p>{item.nextAction}</p>
                      </div>

                      <div className="koinonia-client-work-meta">
                        <strong>{item.status}</strong>
                        <span>{item.due}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-client-work-panel" aria-labelledby="client-showings-title">
                <div className="koinonia-client-panel-heading">
                  <p className="koinonia-eyebrow">Showings</p>
                  <h2 id="client-showings-title">Showing Requests</h2>
                </div>

                <div className="koinonia-client-work-list">
                  {showingRequests.map((request) => (
                    <article className="koinonia-client-work-item" key={request.title}>
                      <div>
                        <span>Request Showing Coverage</span>
                        <h3>{request.title}</h3>
                        <p>{request.nextAction}</p>
                        <ul className="koinonia-client-showing-notes">
                          {request.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="koinonia-client-work-meta">
                        <strong>{request.status}</strong>
                        <span>{request.timing}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="koinonia-client-side-panel" aria-label="Client requests">
              <section className="koinonia-client-request-card">
                <p className="koinonia-eyebrow">Documents Needed</p>
                <ul>
                  {documentRequests.map((request) => (
                    <li key={request}>{request}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-client-request-card">
                <p className="koinonia-eyebrow">Access Needed</p>
                <div className="koinonia-client-access-list">
                  {accessRequests.map((request) => (
                    <article key={request.platform}>
                      <span>{request.status}</span>
                      <strong>{request.platform}</strong>
                      <p>{request.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-client-request-card koinonia-client-boundary-card">
                <p className="koinonia-eyebrow">Security Boundary</p>
                <p>
                  Do not paste passwords into the portal. Access should be
                  granted through approved delegated permissions or an approved
                  encrypted sharing workflow.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
