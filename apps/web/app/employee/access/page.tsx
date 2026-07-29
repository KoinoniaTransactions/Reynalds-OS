import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Access Workspace Preview",
  description:
    "Preview of the Koinonia employee access workspace for staff invites, client portal readiness, role status, and security guardrails.",
  alternates: {
    canonical: absoluteUrl("/employee/access")
  },
  robots: {
    index: false,
    follow: false
  }
};

const accessSummary = [
  {
    label: "Pending Invites",
    value: "5",
    body: "Client and staff users waiting on invitation, acceptance, or profile setup."
  },
  {
    label: "MFA Required",
    value: "4",
    body: "Internal staff accounts that must keep stronger sign-in protection enabled."
  },
  {
    label: "Active Access",
    value: "12",
    body: "Users mapped to Koinonia roles, workspace access, and current service ownership."
  },
  {
    label: "Blocked",
    value: "2",
    body: "Access records held until ownership, billing, or security questions are resolved."
  }
] as const;

const invitationQueue = [
  {
    person: "Alyssa Morgan",
    email: "alyssa@brighthomesteam.example",
    role: "Client",
    client: "Bright Homes Team",
    service: "Transaction Coordination Plus",
    owner: "Maya Torres",
    status: "Pending Send",
    nextAction: "Confirm billing contact and send portal invite."
  },
  {
    person: "Daniel Price",
    email: "daniel@wilsonrealty.example",
    role: "Client",
    client: "Wilson Realty Group",
    service: "Contract & Document Support",
    owner: "Luis Carter",
    status: "Awaiting Scope",
    nextAction: "Confirm package selection before access is granted."
  },
  {
    person: "Tasha Reed",
    email: "tasha@koinonia.example",
    role: "Showing Provider",
    client: "Assigned showings only",
    service: "Licensed Showing Coverage",
    owner: "Jeremiah Reynalds",
    status: "MFA Needed",
    nextAction: "Require staff MFA before field assignments are visible."
  },
  {
    person: "Erin Blake",
    email: "erin@koinonia.example",
    role: "Customer Success",
    client: "Client relationship follow-up",
    service: "Monthly Operations Partnership",
    owner: "Jeremiah Reynalds",
    status: "Ready",
    nextAction: "Grant staff access after owner approval."
  }
] as const;

const staffAccess = [
  {
    name: "Jeremiah Reynalds",
    role: "Owner",
    mfa: "Required",
    access: "Active",
    scope: "All client files, staff assignments, billing, and audit history"
  },
  {
    name: "Maya Torres",
    role: "Transaction Coordinator",
    mfa: "Required",
    access: "Active",
    scope: "Assigned clients, transaction files, document review, and deadlines"
  },
  {
    name: "Luis Carter",
    role: "Contract Support",
    mfa: "Required",
    access: "Active",
    scope: "Assigned drafting work, document versions, and approval requests"
  },
  {
    name: "Tasha Reed",
    role: "Showing Provider",
    mfa: "Required",
    access: "Pending",
    scope: "Assigned showing details, access notes, and feedback only"
  }
] as const;

const clientReadiness = [
  {
    client: "Bright Homes Team",
    packageName: "Transaction Coordination Plus",
    accountOwner: "Maya Torres",
    accessStatus: "Invite Pending",
    billingStatus: "Prepay Due"
  },
  {
    client: "Wilson Realty Group",
    packageName: "Realtor Support Plus",
    accountOwner: "Jeremiah Reynalds",
    accessStatus: "Scope Hold",
    billingStatus: "Setup Needed"
  },
  {
    client: "Northgate Partners",
    packageName: "Pay-at-Closing Coordination",
    accountOwner: "Erin Blake",
    accessStatus: "Active",
    billingStatus: "Card Ready"
  },
  {
    client: "Summit Line Realty",
    packageName: "Licensed Showing Coverage",
    accountOwner: "Erin Blake",
    accessStatus: "Active",
    billingStatus: "Per Showing"
  }
] as const;

const accessRules = [
  "Only Owner and Operations roles can create or change portal invitations.",
  "Koinonia database roles control portal permissions after a user signs in.",
  "Staff access requires MFA before real client files or internal notes are exposed.",
  "Client users see their own work, documents, billing setup, and approvals only.",
  "Brokerage passwords, MLS passwords, raw card numbers, and CVV values stay out of portal fields."
] as const;

const setupChecklist = [
  {
    label: "Invite Record",
    body: "Create the Koinonia invitation record with role, workspace, client, and staff owner."
  },
  {
    label: "Provider Invite",
    body: "Send the managed sign-in invitation after the internal record is approved."
  },
  {
    label: "Role Mapping",
    body: "Match the provider user back to the active Koinonia database user."
  },
  {
    label: "Audit Trail",
    body: "Record invite creation, acceptance, role changes, access changes, and deactivation."
  }
] as const;

export default async function EmployeeAccessWorkspacePreviewPage() {
  await requirePortalPermission("employee-portal:assignments:update", "/employee/access");

  return (
    <main className="koinonia-site koinonia-employee-dashboard koinonia-employee-access">
      <Header />

      <section className="koinonia-section koinonia-employee-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Employee Access Workspace Preview</p>

            <h1 className="koinonia-title">
              One place to manage who can enter the client and employee portal.
            </h1>

            <p className="koinonia-lead">
              This preview uses sample data only. Real access changes must wait
              for production authentication, invitation email delivery, staff
              MFA, database-backed users, and audit logging.
            </p>
          </div>

          <div className="koinonia-employee-summary-grid">
            {accessSummary.map((card) => (
              <article className="koinonia-employee-summary-card" key={card.label}>
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
          <div className="koinonia-employee-dashboard-layout">
            <div className="koinonia-employee-main-stack">
              <section
                className="koinonia-employee-work-panel"
                aria-labelledby="portal-invitation-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Invitations</p>
                  <h2 id="portal-invitation-title">Access Queue</h2>
                </div>

                <div className="koinonia-employee-assignment-list">
                  {invitationQueue.map((invite) => (
                    <article className="koinonia-employee-assignment-item" key={invite.email}>
                      <div>
                        <span>{invite.role}</span>
                        <h3>{invite.person}</h3>
                        <p>{invite.nextAction}</p>
                        <dl className="koinonia-employee-assignment-meta">
                          <div>
                            <dt>Email</dt>
                            <dd>{invite.email}</dd>
                          </div>
                          <div>
                            <dt>Owner</dt>
                            <dd>{invite.owner}</dd>
                          </div>
                          <div>
                            <dt>Client</dt>
                            <dd>{invite.client}</dd>
                          </div>
                          <div>
                            <dt>Service</dt>
                            <dd>{invite.service}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="koinonia-employee-work-meta">
                        <strong>{invite.status}</strong>
                        <span>Access status</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className="koinonia-employee-work-panel"
                aria-labelledby="staff-readiness-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Staff</p>
                  <h2 id="staff-readiness-title">Staff Access Readiness</h2>
                </div>

                <div className="koinonia-employee-table-wrap">
                  <table className="koinonia-employee-table">
                    <thead>
                      <tr>
                        <th>Staff</th>
                        <th>Role</th>
                        <th>MFA</th>
                        <th>Access</th>
                        <th>Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffAccess.map((staff) => (
                        <tr key={staff.name}>
                          <td>{staff.name}</td>
                          <td>{staff.role}</td>
                          <td>{staff.mfa}</td>
                          <td>{staff.access}</td>
                          <td>{staff.scope}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section
                className="koinonia-employee-work-panel"
                aria-labelledby="client-readiness-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Clients</p>
                  <h2 id="client-readiness-title">Client Portal Readiness</h2>
                </div>

                <div className="koinonia-employee-table-wrap">
                  <table className="koinonia-employee-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Package</th>
                        <th>Owner</th>
                        <th>Access</th>
                        <th>Billing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientReadiness.map((client) => (
                        <tr key={client.client}>
                          <td>{client.client}</td>
                          <td>{client.packageName}</td>
                          <td>{client.accountOwner}</td>
                          <td>{client.accessStatus}</td>
                          <td>{client.billingStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="koinonia-employee-side-panel" aria-label="Access guardrails">
              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Setup Flow</p>
                <div className="koinonia-employee-handoff-list">
                  {setupChecklist.map((item) => (
                    <article key={item.label}>
                      <span>Required</span>
                      <strong>{item.label}</strong>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-employee-request-card koinonia-employee-boundary-card">
                <p className="koinonia-eyebrow">Access Rules</p>
                <ul>
                  {accessRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Connected Workspaces</p>
                <p>
                  Access decisions should stay connected to staff assignment,
                  document, and billing readiness so no client is invited into a
                  half-prepared file.
                </p>
                <a className="koinonia-document-link employee" href="/employee/dashboard">
                  Open Staff Dashboard
                </a>
                <a className="koinonia-document-link employee" href="/employee/documents">
                  Open Documents
                </a>
                <a className="koinonia-billing-link employee" href="/employee/billing">
                  Open Billing
                </a>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
