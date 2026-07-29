import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Dashboard Preview",
  description:
    "Preview of the Koinonia employee dashboard for client assignment, staff workload, handoffs, and active work.",
  alternates: {
    canonical: absoluteUrl("/employee/dashboard")
  },
  robots: {
    index: false,
    follow: false
  }
};

const assignmentSummary = [
  {
    label: "Unassigned Clients",
    value: "2",
    body: "New Realtor relationships need an account owner and backup."
  },
  {
    label: "Unassigned Work",
    value: "3",
    body: "Active requests need a staff owner before client updates continue."
  },
  {
    label: "Capacity Watch",
    value: "78%",
    body: "Current staff load is workable, with rush showings adding pressure."
  },
  {
    label: "Handoffs Needed",
    value: "4",
    body: "Work items need internal notes before another staff member can pick them up."
  }
] as const;

const staffMembers = [
  {
    name: "Jeremiah Reynalds",
    role: "Owner / Operations",
    capacity: "82%",
    clients: "6",
    work: "11",
    status: "Escalations and approvals",
    focus: "Brokerage boundaries, client onboarding, final review"
  },
  {
    name: "Maya Torres",
    role: "Transaction Coordinator",
    capacity: "64%",
    clients: "4",
    work: "7",
    status: "Available",
    focus: "Contract-to-close files and deadline tracking"
  },
  {
    name: "Luis Carter",
    role: "Contract Support",
    capacity: "72%",
    clients: "3",
    work: "5",
    status: "One rush draft open",
    focus: "Offer packages and document-prep requests"
  },
  {
    name: "Tasha Reed",
    role: "Showing Provider",
    capacity: "40%",
    clients: "0",
    work: "3",
    status: "Field coverage",
    focus: "Assigned showings, access notes, feedback"
  },
  {
    name: "Erin Blake",
    role: "Customer Success",
    capacity: "55%",
    clients: "5",
    work: "4",
    status: "Follow-up block",
    focus: "Check-ins, reviews, referrals, onboarding touchpoints"
  }
] as const;

const assignmentQueue = [
  {
    client: "Bright Homes Team",
    work: "Smith Contract-to-Close",
    service: "Transaction Coordination Plus",
    status: "New Intake",
    priority: "High",
    recommended: "Maya Torres",
    reason: "Transaction file with deadline tracking and title coordination."
  },
  {
    client: "Wilson Realty Group",
    work: "Buyer Offer Package",
    service: "Contract & Document Support",
    status: "Ready for Staff",
    priority: "High",
    recommended: "Luis Carter",
    reason: "Drafting support is needed from Realtor instructions."
  },
  {
    client: "Northgate Partners",
    work: "West Ridge Showing Coverage",
    service: "Licensed Showing Coverage",
    status: "Waiting on Access",
    priority: "Rush",
    recommended: "Tasha Reed",
    reason: "Same-day showing request needs licensed coverage and access notes."
  },
  {
    client: "Summit Line Realty",
    work: "Monthly CRM Cleanup",
    service: "Monthly Operations Partnership",
    status: "Scope Needed",
    priority: "Normal",
    recommended: "Erin Blake",
    reason: "Client relationship follow-up and recurring operations support."
  }
] as const;

const assignedClients = [
  {
    client: "Bright Homes Team",
    packageName: "Transaction Coordination Plus",
    owner: "Maya Torres",
    backup: "Jeremiah Reynalds",
    activeWork: "2 files",
    nextTouch: "Today"
  },
  {
    client: "Wilson Realty Group",
    packageName: "Realtor Support Plus",
    owner: "Jeremiah Reynalds",
    backup: "Erin Blake",
    activeWork: "4 requests",
    nextTouch: "Tomorrow"
  },
  {
    client: "Northgate Partners",
    packageName: "Licensed Showing Coverage",
    owner: "Erin Blake",
    backup: "Tasha Reed",
    activeWork: "3 showings",
    nextTouch: "After feedback"
  },
  {
    client: "Summit Line Realty",
    packageName: "Monthly Operations Partnership",
    owner: "Erin Blake",
    backup: "Maya Torres",
    activeWork: "1 monthly block",
    nextTouch: "Friday"
  }
] as const;

const handoffs = [
  {
    title: "Showing coverage handoff",
    owner: "Tasha Reed",
    status: "Access pending",
    body: "West Ridge needs lockbox instructions and safety notes before confirmation."
  },
  {
    title: "Offer draft final review",
    owner: "Luis Carter",
    status: "Realtor approval needed",
    body: "Wilson offer package cannot move to final until terms are confirmed."
  },
  {
    title: "Pay-at-closing billing watch",
    owner: "Jeremiah Reynalds",
    status: "Finance visible",
    body: "Closing outcome will determine invoice timing and closeout notes."
  }
] as const;

const assignmentRules = [
  "Every client has an account owner and backup owner.",
  "Every work item has a staff assignee before Koinonia promises a client update.",
  "Operations can reassign work; staff update only the work assigned to them.",
  "Showing providers see assigned showing details, not unrelated client files.",
  "Client credentials are never stored in the portal."
] as const;

export default async function EmployeeDashboardPreviewPage() {
  await requirePortalPermission("employee-portal:view", "/employee/dashboard");

  return (
    <main className="koinonia-site koinonia-employee-dashboard">
      <Header />

      <section className="koinonia-section koinonia-employee-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Employee Dashboard Preview</p>

            <h1 className="koinonia-title">
              One operating view for staff, clients, and assigned work.
            </h1>

            <p className="koinonia-lead">
              This preview uses sample data only. Real employee access should
              wait for production authentication, role checks, audit logging,
              and staff-specific visibility rules.
            </p>
          </div>

          <div className="koinonia-employee-summary-grid">
            {assignmentSummary.map((card) => (
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
                aria-labelledby="employee-assignment-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Assignments</p>
                  <h2 id="employee-assignment-title">Assignment Queue</h2>
                </div>

                <div className="koinonia-employee-assignment-list">
                  {assignmentQueue.map((item) => (
                    <article className="koinonia-employee-assignment-item" key={item.work}>
                      <div>
                        <span>{item.service}</span>
                        <h3>{item.work}</h3>
                        <p>{item.reason}</p>
                        <dl className="koinonia-employee-assignment-meta">
                          <div>
                            <dt>Client</dt>
                            <dd>{item.client}</dd>
                          </div>
                          <div>
                            <dt>Recommended</dt>
                            <dd>{item.recommended}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="koinonia-employee-work-meta">
                        <strong>{item.priority}</strong>
                        <span>{item.status}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className="koinonia-employee-work-panel"
                aria-labelledby="employee-clients-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Clients</p>
                  <h2 id="employee-clients-title">Assigned Clients</h2>
                </div>

                <div className="koinonia-employee-table-wrap">
                  <table className="koinonia-employee-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Package</th>
                        <th>Owner</th>
                        <th>Backup</th>
                        <th>Work</th>
                        <th>Next Touch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedClients.map((client) => (
                        <tr key={client.client}>
                          <td>{client.client}</td>
                          <td>{client.packageName}</td>
                          <td>{client.owner}</td>
                          <td>{client.backup}</td>
                          <td>{client.activeWork}</td>
                          <td>{client.nextTouch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="koinonia-employee-side-panel" aria-label="Staff workload">
              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Staff Load</p>
                <div className="koinonia-employee-staff-list">
                  {staffMembers.map((member) => (
                    <article key={member.name}>
                      <div>
                        <span>{member.role}</span>
                        <strong>{member.name}</strong>
                        <p>{member.focus}</p>
                      </div>
                      <div className="koinonia-employee-capacity">
                        <b>{member.capacity}</b>
                        <span>{member.status}</span>
                        <small>
                          {member.clients} clients / {member.work} work
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Handoff Needed</p>
                <div className="koinonia-employee-handoff-list">
                  {handoffs.map((handoff) => (
                    <article key={handoff.title}>
                      <span>{handoff.status}</span>
                      <strong>{handoff.title}</strong>
                      <p>{handoff.body}</p>
                      <small>{handoff.owner}</small>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Billing Readiness</p>
                <p>
                  Staff should see payment setup needs, prepaid blocks,
                  pay-at-closing triggers, and ready-to-process invoices before
                  work moves too far ahead.
                </p>
                <a className="koinonia-billing-link employee" href="/employee/billing">
                  Open Billing Workspace
                </a>
              </section>

              <section className="koinonia-employee-request-card koinonia-employee-boundary-card">
                <p className="koinonia-eyebrow">Assignment Rules</p>
                <ul>
                  {assignmentRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <a className="koinonia-document-link employee" href="/employee/documents">
                  Open Document Workspace
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
