import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Document Workspace Preview",
  description:
    "Preview of the Koinonia employee document workspace for drafting, versioning, approvals, send packages, and archive.",
  alternates: {
    canonical: absoluteUrl("/employee/documents")
  },
  robots: {
    index: false,
    follow: false
  }
};

const workspaceSummary = [
  {
    label: "Draft Queue",
    value: "6",
    body: "Documents being prepared, reviewed, revised, or waiting on Realtor instructions."
  },
  {
    label: "Missing Terms",
    value: "5",
    body: "Required inputs that must be confirmed before drafting or sending continues."
  },
  {
    label: "Approved to Send",
    value: "2",
    body: "Packages with Realtor approval recorded and ready for delivery or signature routing."
  },
  {
    label: "Audit Events",
    value: "18",
    body: "Recent upload, version, approval, send, signature, and archive activity."
  }
] as const;

const draftQueue = [
  {
    title: "Buyer Offer Package v2",
    transaction: "Wilson Realty Group",
    status: "Internal Review",
    owner: "Luis Carter",
    nextAction: "Check concessions, financing terms, and closing date before Realtor review."
  },
  {
    title: "Inspection Resolution Draft v1",
    transaction: "Smith Contract-to-Close",
    status: "Missing Terms",
    owner: "Maya Torres",
    nextAction: "Waiting on requested repairs or credit amount from Realtor."
  },
  {
    title: "Counterproposal Addendum v3",
    transaction: "Bright Homes Team",
    status: "Ready for Realtor Review",
    owner: "Luis Carter",
    nextAction: "Send review request with version notes and approval prompt."
  },
  {
    title: "Closing File Checklist",
    transaction: "Pay-at-Closing Coordination",
    status: "Archive Prep",
    owner: "Jeremiah Reynalds",
    nextAction: "Confirm signed settlement statement and final disclosure set."
  }
] as const;

const toolSuite = [
  {
    title: "Template Library",
    body: "Approved form sources, standard cover messages, checklist templates, and service-specific delivery notes."
  },
  {
    title: "Terms Checklist",
    body: "Price, dates, deadlines, concessions, inclusions, exclusions, possession, addenda, and special instructions."
  },
  {
    title: "Version Control",
    body: "Version number, revision reason, superseded state, approval state, creator, timestamp, and archive link."
  },
  {
    title: "Quality Review",
    body: "Correct form, parties, property, blanks, missing signatures, attachments, and approval warning before delivery."
  },
  {
    title: "Send Package",
    body: "Recipient list, approved attachments, send purpose, delivery channel, signature status, and delivery history."
  },
  {
    title: "Audit Trail",
    body: "Upload, draft, revise, approve, send, sign, deliver, archive, and permission-sensitive activity."
  }
] as const;

const sendPackages = [
  {
    name: "Buyer Offer Signature Package",
    status: "Waiting on Realtor Approval",
    gate: "Approval required",
    detail: "Prepared but blocked from sending until final Realtor approval is recorded."
  },
  {
    name: "Counterproposal Addendum",
    status: "Approved to Send",
    gate: "Ready",
    detail: "Version notes complete; approved recipient list is attached."
  },
  {
    name: "Inspection Resolution",
    status: "Sent for Signature",
    gate: "Monitor",
    detail: "Signature package is pending completion and follow-up."
  }
] as const;

const missingTerms = [
  "Confirm earnest money deadline for Wilson offer.",
  "Choose inspection objection path for Smith file.",
  "Confirm seller concession amount on counterproposal.",
  "Attach signed source disclosure before archive.",
  "Confirm brokerage-required addenda for mountain property."
] as const;

const workflowSteps = [
  "Request received",
  "Terms collected",
  "Draft prepared",
  "Internal review",
  "Realtor review",
  "Approved to send",
  "Sent / signature",
  "Archived"
] as const;

export default async function EmployeeDocumentWorkspacePreviewPage() {
  await requirePortalPermission("document-workspace:view", "/employee/documents");

  return (
    <main className="koinonia-site koinonia-document-center koinonia-employee-documents">
      <Header />

      <section className="koinonia-section koinonia-document-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Employee Document Workspace Preview</p>

            <h1 className="koinonia-title">
              Draft, review, send, and archive transaction documents with a clear approval trail.
            </h1>

            <p className="koinonia-lead">
              This preview uses sample data only. Real document editing and
              sending must wait for production authentication, storage,
              permissions, audit logging, and approved delivery integrations.
            </p>
          </div>

          <div className="koinonia-document-summary-grid">
            {workspaceSummary.map((card) => (
              <article className="koinonia-document-summary-card employee" key={card.label}>
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
          <div className="koinonia-document-layout">
            <div className="koinonia-document-main-stack">
              <section className="koinonia-document-panel employee" aria-labelledby="draft-queue-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Drafting</p>
                  <h2 id="draft-queue-title">Draft Queue</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {draftQueue.map((item) => (
                    <article className="koinonia-document-work-item employee" key={item.title}>
                      <div>
                        <span>{item.transaction}</span>
                        <h3>{item.title}</h3>
                        <p>{item.nextAction}</p>
                      </div>

                      <div className="koinonia-document-work-meta employee">
                        <strong>{item.status}</strong>
                        <span>{item.owner}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-document-panel employee" aria-labelledby="tool-suite-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Tools</p>
                  <h2 id="tool-suite-title">Document Tool Suite</h2>
                </div>

                <div className="koinonia-document-tool-grid">
                  {toolSuite.map((tool) => (
                    <article key={tool.title}>
                      <h3>{tool.title}</h3>
                      <p>{tool.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-document-panel employee" aria-labelledby="send-packages-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Sending</p>
                  <h2 id="send-packages-title">Send Packages</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {sendPackages.map((item) => (
                    <article className="koinonia-document-work-item employee" key={item.name}>
                      <div>
                        <span>{item.gate}</span>
                        <h3>{item.name}</h3>
                        <p>{item.detail}</p>
                      </div>

                      <div className="koinonia-document-work-meta employee">
                        <strong>{item.status}</strong>
                        <span>Send gate</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="koinonia-document-side-panel" aria-label="Document workspace support">
              <section className="koinonia-document-panel employee">
                <p className="koinonia-eyebrow">Workflow</p>
                <ol className="koinonia-document-step-list">
                  {workflowSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="koinonia-document-panel employee">
                <p className="koinonia-eyebrow">Missing Terms</p>
                <ul className="koinonia-document-tool-list">
                  {missingTerms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-document-panel employee koinonia-document-boundary-card">
                <p className="koinonia-eyebrow">Send Boundary</p>
                <p>
                  Final document sending requires recorded Realtor approval or
                  a documented approved workflow. Do not store MLS, brokerage,
                  forms, or e-signature passwords in the portal.
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
