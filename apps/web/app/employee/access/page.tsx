import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { PortalAccessActionButton } from "../../../components/employee/PortalAccessActionButton";
import { PortalInvitationForm } from "../../../components/employee/PortalInvitationForm";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";
import {
  getHumanAuditAction,
  portalAuditActionPrefix
} from "../../../lib/portal-audit";
import { canRevokeInvitationStatus } from "../../../lib/portal-invitations";
import {
  buildAccessSummaryCards,
  getAccessSummaryCounts,
  getHumanInvitationStatus,
  getHumanPortalAccessStatus,
  getMfaLabel,
  getServiceContextText,
  isStaffPortalUser,
  type AccessSummaryCard
} from "../../../lib/portal-access-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Access Workspace",
  description:
    "Koinonia employee access workspace for staff invites, client portal readiness, role status, and security guardrails.",
  alternates: {
    canonical: absoluteUrl("/employee/access")
  },
  robots: {
    index: false,
    follow: false
  }
};

type InvitationQueueItem = {
  canRevoke: boolean;
  client: string;
  email: string;
  id: string;
  nextAction: string;
  owner: string;
  person: string;
  role: string;
  service: string;
  status: string;
};

type StaffAccessItem = {
  access: string;
  canDeactivate: boolean;
  id: string;
  mfa: string;
  name: string;
  role: string;
  scope: string;
};

type ClientReadinessItem = {
  accessStatus: string;
  accountOwner: string;
  billingStatus: string;
  client: string;
  id: string;
  packageName: string;
};

type AccessAuditItem = {
  action: string;
  actor: string;
  id: string;
  summary: string;
  time: string;
};

type AccessWorkspaceView = {
  auditEvents: AccessAuditItem[];
  clientReadiness: ClientReadinessItem[];
  invitationQueue: InvitationQueueItem[];
  isLiveData: boolean;
  notice?: string;
  staffAccess: StaffAccessItem[];
  summaryCards: AccessSummaryCard[];
};

const sampleInvitationQueue: InvitationQueueItem[] = [
  {
    id: "sample-alyssa",
    canRevoke: false,
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
    id: "sample-daniel",
    canRevoke: false,
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
    id: "sample-tasha",
    canRevoke: false,
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
    id: "sample-erin",
    canRevoke: false,
    person: "Erin Blake",
    email: "erin@koinonia.example",
    role: "Customer Success",
    client: "Client relationship follow-up",
    service: "Monthly Operations Partnership",
    owner: "Jeremiah Reynalds",
    status: "Ready",
    nextAction: "Grant staff access after owner approval."
  }
];

const sampleStaffAccess: StaffAccessItem[] = [
  {
    id: "sample-jeremiah",
    canDeactivate: false,
    name: "Jeremiah Reynalds",
    role: "Owner",
    mfa: "Required",
    access: "Active",
    scope: "All client files, staff assignments, billing, and audit history"
  },
  {
    id: "sample-maya",
    canDeactivate: false,
    name: "Maya Torres",
    role: "Transaction Coordinator",
    mfa: "Required",
    access: "Active",
    scope: "Assigned clients, transaction files, document review, and deadlines"
  },
  {
    id: "sample-luis",
    canDeactivate: false,
    name: "Luis Carter",
    role: "Contract Support",
    mfa: "Required",
    access: "Active",
    scope: "Assigned drafting work, document versions, and approval requests"
  },
  {
    id: "sample-tasha-staff",
    canDeactivate: false,
    name: "Tasha Reed",
    role: "Showing Provider",
    mfa: "Required",
    access: "Pending",
    scope: "Assigned showing details, access notes, and feedback only"
  }
];

const sampleClientReadiness: ClientReadinessItem[] = [
  {
    id: "sample-bright-homes",
    client: "Bright Homes Team",
    packageName: "Transaction Coordination Plus",
    accountOwner: "Maya Torres",
    accessStatus: "Invite Pending",
    billingStatus: "Prepay Due"
  },
  {
    id: "sample-wilson",
    client: "Wilson Realty Group",
    packageName: "Realtor Support Plus",
    accountOwner: "Jeremiah Reynalds",
    accessStatus: "Scope Hold",
    billingStatus: "Setup Needed"
  },
  {
    id: "sample-northgate",
    client: "Northgate Partners",
    packageName: "Pay-at-Closing Coordination",
    accountOwner: "Erin Blake",
    accessStatus: "Active",
    billingStatus: "Card Ready"
  },
  {
    id: "sample-summit",
    client: "Summit Line Realty",
    packageName: "Licensed Showing Coverage",
    accountOwner: "Erin Blake",
    accessStatus: "Active",
    billingStatus: "Per Showing"
  }
];

const sampleAuditEvents: AccessAuditItem[] = [
  {
    id: "sample-audit-created",
    action: "Invitation Created",
    actor: "Jeremiah Reynalds",
    summary: "Portal invitation created for a new client account.",
    time: "Preview data"
  },
  {
    id: "sample-audit-sent",
    action: "Provider Invite Sent",
    actor: "Koinonia",
    summary: "Managed login invite sent after owner approval.",
    time: "Preview data"
  }
];

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

export default async function EmployeeAccessWorkspacePage() {
  const actor = await requirePortalPermission("employee-portal:assignments:update", "/employee/access");
  const accessWorkspace = await getAccessWorkspaceView(actor.workspaceId, actor.id);

  return (
    <main className="koinonia-site koinonia-employee-dashboard koinonia-employee-access">
      <Header />

      <section className="koinonia-section koinonia-employee-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">
              {accessWorkspace.isLiveData ? "Employee Access Workspace" : "Employee Access Workspace Preview"}
            </p>

            <h1 className="koinonia-title">
              One place to manage who can enter the client and employee portal.
            </h1>

            <p className="koinonia-lead">
              {accessWorkspace.isLiveData
                ? "Live portal records are connected to Koinonia users, invitations, roles, staff MFA requirements, and client readiness."
                : "This workspace is ready for live portal records, but it is showing sample data until production storage is reachable."}
            </p>
          </div>

          {accessWorkspace.notice ? (
            <p className="koinonia-employee-security-note">{accessWorkspace.notice}</p>
          ) : null}

          <div className="koinonia-employee-summary-grid">
            {accessWorkspace.summaryCards.map((card) => (
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
                  {accessWorkspace.invitationQueue.map((invite) => (
                    <article className="koinonia-employee-assignment-item" key={invite.id}>
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
                        {invite.canRevoke ? (
                          <PortalAccessActionButton
                            confirmation={`Revoke access invitation for ${invite.email}?`}
                            endpoint={`/api/portal/invitations/${invite.id}/revoke`}
                            label="Revoke"
                            successMessage="Invitation revoked."
                          />
                        ) : null}
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessWorkspace.staffAccess.map((staff) => (
                        <tr key={staff.id}>
                          <td>{staff.name}</td>
                          <td>{staff.role}</td>
                          <td>{staff.mfa}</td>
                          <td>{staff.access}</td>
                          <td>{staff.scope}</td>
                          <td>
                            {staff.canDeactivate ? (
                              <PortalAccessActionButton
                                confirmation={`Deactivate portal access for ${staff.name}?`}
                                endpoint={`/api/portal/users/${staff.id}/deactivate`}
                                label="Deactivate"
                                successMessage="Access deactivated."
                              />
                            ) : (
                              "No action"
                            )}
                          </td>
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
                      {accessWorkspace.clientReadiness.map((client) => (
                        <tr key={client.id}>
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
              <PortalInvitationForm storageReady={accessWorkspace.isLiveData} />

              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Recent Access History</p>
                <div className="koinonia-employee-handoff-list">
                  {accessWorkspace.auditEvents.map((event) => (
                    <article key={event.id}>
                      <span>{event.action}</span>
                      <strong>{event.summary}</strong>
                      <p>{event.actor} - {event.time}</p>
                    </article>
                  ))}
                </div>
              </section>

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

async function getAccessWorkspaceView(workspaceId: string, actorId: string): Promise<AccessWorkspaceView> {
  try {
    const [users, invitations, auditEvents] = await Promise.all([
      prisma.user.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          portalAccessStatus: true,
          mfaRequired: true,
          role: {
            select: {
              name: true
            }
          }
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
        take: 100
      }),
      prisma.portalInvitation.findMany({
        where: { workspaceId },
        select: {
          id: true,
          email: true,
          name: true,
          roleName: true,
          status: true,
          clientObjectId: true,
          serviceContext: true,
          invitedBy: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.auditEvent.findMany({
        where: {
          workspaceId,
          action: {
            startsWith: portalAuditActionPrefix
          }
        },
        select: {
          id: true,
          action: true,
          actorEmail: true,
          createdAt: true,
          summary: true
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    const clientObjectNames = await getClientObjectNames(
      workspaceId,
      invitations.map((invitation) => invitation.clientObjectId)
    );

    return {
      auditEvents: withEmptyAuditEvents(
        auditEvents.map((event) => ({
          id: event.id,
          action: getHumanAuditAction(event.action),
          actor: event.actorEmail ?? "System",
          summary: event.summary,
          time: formatAuditTime(event.createdAt)
        }))
      ),
      clientReadiness: withEmptyClientReadiness(
        buildClientReadinessItems(users, invitations, clientObjectNames)
      ),
      invitationQueue: withEmptyInvitations(
        invitations
          .filter((invitation) => invitation.status !== "accepted" && invitation.status !== "revoked")
          .slice(0, 8)
          .map((invitation) => ({
            id: invitation.id,
            canRevoke: canRevokeInvitationStatus(invitation.status),
            person: invitation.name ?? invitation.email,
            email: invitation.email,
            role: invitation.roleName,
            client: getInvitationClientLabel(invitation, clientObjectNames),
            service: getServiceContextText(invitation.serviceContext, ["packageName", "package", "service", "serviceName"], "Access setup"),
            owner: invitation.invitedBy?.name ?? "Owner approval needed",
            status: getHumanInvitationStatus(invitation.status),
            nextAction: getInvitationNextAction(invitation.status)
          }))
      ),
      isLiveData: true,
      staffAccess: withEmptyStaffAccess(
        users
          .filter((user) =>
            isStaffPortalUser({
              mfaRequired: user.mfaRequired,
              portalAccessStatus: user.portalAccessStatus,
              roleName: user.role?.name,
              status: user.status
            })
          )
          .map((user) => ({
            id: user.id,
            canDeactivate:
              user.id !== actorId && user.status === "active" && user.portalAccessStatus === "active",
            name: user.name,
            role: user.role?.name ?? "Viewer",
            mfa: getMfaLabel({
              mfaRequired: user.mfaRequired,
              portalAccessStatus: user.portalAccessStatus,
              roleName: user.role?.name,
              status: user.status
            }),
            access: getHumanPortalAccessStatus(user.status, user.portalAccessStatus),
            scope: getRoleScope(user.role?.name)
          }))
      ),
      summaryCards: buildAccessSummaryCards(
        getAccessSummaryCounts(
          users.map((user) => ({
            mfaRequired: user.mfaRequired,
            portalAccessStatus: user.portalAccessStatus,
            roleName: user.role?.name,
            status: user.status
          })),
          invitations.map((invitation) => ({ status: invitation.status }))
        )
      )
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      auditEvents: sampleAuditEvents,
      clientReadiness: sampleClientReadiness,
      invitationQueue: sampleInvitationQueue,
      isLiveData: false,
      notice: "Production storage is not reachable in this preview, so sample access records are shown. Real client and staff access should wait until the database and Clerk environment pass verification.",
      staffAccess: sampleStaffAccess,
      summaryCards: buildAccessSummaryCards({
        activeAccess: 12,
        blockedAccess: 2,
        mfaRequired: 4,
        pendingInvitations: 5
      })
    };
  }
}

function formatAuditTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

async function getClientObjectNames(workspaceId: string, clientObjectIds: Array<string | null>): Promise<Map<string, string>> {
  const uniqueClientObjectIds = Array.from(
    new Set(clientObjectIds.filter((clientObjectId): clientObjectId is string => Boolean(clientObjectId)))
  );

  if (uniqueClientObjectIds.length === 0) {
    return new Map();
  }

  const clientObjects = await prisma.rosObject.findMany({
    where: {
      workspaceId,
      id: { in: uniqueClientObjectIds },
      archivedAt: null
    },
    select: {
      id: true,
      name: true
    }
  });

  return new Map(clientObjects.map((clientObject) => [clientObject.id, clientObject.name]));
}

function buildClientReadinessItems(
  users: Array<{
    email: string;
    id: string;
    name: string;
    portalAccessStatus: string;
    role: { name: string } | null;
    status: string;
  }>,
  invitations: Array<{
    clientObjectId: string | null;
    email: string;
    id: string;
    name: string | null;
    roleName: string;
    serviceContext: unknown;
    status: string;
    invitedBy: { name: string } | null;
  }>,
  clientObjectNames: Map<string, string>
): ClientReadinessItem[] {
  const clientUsers = users
    .filter((user) => user.role?.name === "Client")
    .map((user) => ({
      id: `user-${user.id}`,
      client: user.name || user.email,
      packageName: "Service profile needed",
      accountOwner: "Assigned owner needed",
      accessStatus: getHumanPortalAccessStatus(user.status, user.portalAccessStatus),
      billingStatus: "Billing profile needed"
    }));

  const pendingClientInvitations = invitations
    .filter((invitation) => invitation.roleName === "Client" && invitation.status !== "accepted")
    .map((invitation) => ({
      id: `invitation-${invitation.id}`,
      client: getInvitationClientLabel(invitation, clientObjectNames),
      packageName: getServiceContextText(invitation.serviceContext, ["packageName", "package", "service", "serviceName"], "Package selection needed"),
      accountOwner: invitation.invitedBy?.name ?? "Owner approval needed",
      accessStatus: getHumanInvitationStatus(invitation.status),
      billingStatus: getServiceContextText(invitation.serviceContext, ["billingStatus", "billing", "paymentStatus"], "Billing setup needed")
    }));

  return [...clientUsers, ...pendingClientInvitations].slice(0, 12);
}

function getInvitationClientLabel(
  invitation: {
    clientObjectId: string | null;
    email: string;
    name: string | null;
    roleName: string;
    serviceContext: unknown;
  },
  clientObjectNames: Map<string, string>
): string {
  if (invitation.clientObjectId) {
    const clientObjectName = clientObjectNames.get(invitation.clientObjectId);

    if (clientObjectName) {
      return clientObjectName;
    }
  }

  return getServiceContextText(
    invitation.serviceContext,
    ["clientName", "client", "accountName", "company"],
    invitation.roleName === "Client" ? invitation.name ?? invitation.email : "Staff account"
  );
}

function getInvitationNextAction(status: string): string {
  switch (status) {
    case "pending":
      return "Review the account details, then send the managed login invitation.";
    case "provider_pending":
      return "Wait for the user to accept the managed login invitation.";
    case "provider_error":
      return "Review the provider error, then retry or revoke the invitation.";
    case "expired":
      return "Create a fresh invitation if this person still needs portal access.";
    default:
      return "Confirm the access request still matches the approved service scope.";
  }
}

function getRoleScope(roleName: string | null | undefined): string {
  switch (roleName) {
    case "Owner":
      return "All client files, staff assignments, billing, and audit history";
    case "Operations":
      return "Client setup, staff assignments, document workflow, billing readiness, and access review";
    case "Transaction Coordinator":
      return "Assigned clients, transaction files, document review, and deadlines";
    case "Contract Support":
      return "Assigned drafting work, document versions, approvals, and send packages";
    case "Showing Provider":
      return "Assigned showing details, access notes, and showing feedback only";
    case "Customer Success":
      return "Assigned client follow-up, onboarding, service check-ins, and account notes";
    case "Finance":
      return "Billing profiles, invoices, payment readiness, and pay-at-closing triggers";
    default:
      return "Limited review access only";
  }
}

function withEmptyInvitations(invitations: InvitationQueueItem[]): InvitationQueueItem[] {
  if (invitations.length > 0) {
    return invitations;
  }

  return [
    {
      id: "empty-invitations",
      canRevoke: false,
      person: "No pending invitations",
      email: "Invite queue is clear",
      role: "Access",
      client: "No active queue",
      service: "Ready for next approved invite",
      owner: "Koinonia",
      status: "Clear",
      nextAction: "Create a portal invitation when a client or staff member is ready."
    }
  ];
}

function withEmptyStaffAccess(staffAccess: StaffAccessItem[]): StaffAccessItem[] {
  if (staffAccess.length > 0) {
    return staffAccess;
  }

  return [
    {
      id: "empty-staff-access",
      canDeactivate: false,
      name: "No staff users found",
      role: "Setup Needed",
      mfa: "Needs Review",
      access: "Pending",
      scope: "Invite Koinonia staff before exposing employee portal tools."
    }
  ];
}

function withEmptyClientReadiness(clientReadiness: ClientReadinessItem[]): ClientReadinessItem[] {
  if (clientReadiness.length > 0) {
    return clientReadiness;
  }

  return [
    {
      id: "empty-client-readiness",
      client: "No client portal users yet",
      packageName: "Package selection needed",
      accountOwner: "Owner approval needed",
      accessStatus: "Pending",
      billingStatus: "Billing setup needed"
    }
  ];
}

function withEmptyAuditEvents(auditEvents: AccessAuditItem[]): AccessAuditItem[] {
  if (auditEvents.length > 0) {
    return auditEvents;
  }

  return [
    {
      id: "empty-access-audit",
      action: "No Access Events",
      actor: "Koinonia",
      summary: "Access history will appear after invitations, accepts, revokes, or deactivations.",
      time: "Ready"
    }
  ];
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
