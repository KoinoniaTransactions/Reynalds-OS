import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import {
  PortalWorkAssignmentForm,
  type PortalWorkAssignmentStaffOption
} from "../../../components/employee/PortalWorkAssignmentForm";
import { ShowingRequestStatusForm } from "../../../components/employee/ShowingRequestStatusForm";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";
import {
  buildPortalWorkSummaryCounts,
  clientPortalWorkObjectTypes,
  getPortalWorkDueLabel,
  getPortalWorkItemTypeLabel,
  getPortalWorkStatusBucket
} from "../../../lib/portal-work-items";
import {
  getHumanShowingStatus,
  getShowingNoteLabels,
  getShowingTimingLabel,
  showingRequestObjectType
} from "../../../lib/showing-requests";

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

type EmployeeSummaryCard = {
  body: string;
  label: string;
  value: string;
};

type EmployeeAssignmentQueueItem = {
  backupStaff: string;
  backupStaffUserId?: string | null;
  client: string;
  detailHref?: string;
  due: string;
  id: string;
  isAssignable: boolean;
  primaryStaff: string;
  primaryStaffUserId?: string | null;
  priority: string;
  reason: string;
  service: string;
  status: string;
  work: string;
};

type EmployeeAssignmentView = {
  canAssign: boolean;
  isLiveData: boolean;
  notice?: string;
  queue: EmployeeAssignmentQueueItem[];
  staffOptions: PortalWorkAssignmentStaffOption[];
  summaryCards: EmployeeSummaryCard[];
};

const sampleAssignmentSummary: EmployeeSummaryCard[] = [
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
];

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
];

const sampleAssignmentQueue: EmployeeAssignmentQueueItem[] = [
  {
    backupStaff: "Jeremiah Reynalds",
    client: "Bright Homes Team",
    due: "Today",
    id: "sample-smith-contract-to-close",
    isAssignable: false,
    primaryStaff: "Unassigned",
    work: "Smith Contract-to-Close",
    service: "Transaction Coordination Plus",
    status: "New Intake",
    priority: "High",
    reason: "Transaction file with deadline tracking and title coordination."
  },
  {
    backupStaff: "Erin Blake",
    client: "Wilson Realty Group",
    due: "Today",
    id: "sample-buyer-offer-package",
    isAssignable: false,
    primaryStaff: "Unassigned",
    work: "Buyer Offer Package",
    service: "Contract & Document Support",
    status: "Ready for Staff",
    priority: "High",
    reason: "Drafting support is needed from Realtor instructions."
  },
  {
    backupStaff: "No backup",
    client: "Northgate Partners",
    due: "Same-day request",
    id: "sample-west-ridge-showing",
    isAssignable: false,
    primaryStaff: "Unassigned",
    work: "West Ridge Showing Coverage",
    service: "Licensed Showing Coverage",
    status: "Waiting on Access",
    priority: "Rush",
    reason: "Same-day showing request needs licensed coverage and access notes."
  },
  {
    backupStaff: "Maya Torres",
    client: "Summit Line Realty",
    due: "Friday",
    id: "sample-monthly-crm-cleanup",
    isAssignable: false,
    primaryStaff: "Erin Blake",
    work: "Monthly CRM Cleanup",
    service: "Monthly Operations Partnership",
    status: "Scope Needed",
    priority: "Normal",
    reason: "Client relationship follow-up and recurring operations support."
  }
];

type EmployeeShowingRequestItem = {
  id: string;
  nextAction: string;
  notes: string[];
  requestedBy: string;
  status: string;
  timing: string;
  title: string;
};

type EmployeeShowingRequestView = {
  isLiveData: boolean;
  notice?: string;
  requests: EmployeeShowingRequestItem[];
};

const sampleEmployeeShowingRequests: EmployeeShowingRequestItem[] = [
  {
    id: "sample-employee-west-ridge",
    title: "West Ridge Showing Coverage",
    requestedBy: "Northgate Partners",
    status: "Needs Follow-up",
    nextAction: "Access instructions and safety notes are needed before coverage can be confirmed.",
    timing: "Same-day request",
    notes: ["Rush review needed", "Access details pending"]
  },
  {
    id: "sample-employee-northgate",
    title: "Schedule Northgate Buyer Tour",
    requestedBy: "Bright Homes Team",
    status: "Scheduling",
    nextAction: "Check requested showing windows and buyer availability.",
    timing: "Thu afternoon",
    notes: ["Client contact authorized", "Friday morning backup"]
  }
];

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
  const actor = await requirePortalPermission("employee-portal:view", "/employee/dashboard");
  const assignmentView = await getEmployeeAssignmentView(actor);
  const showingRequestView = await getEmployeeShowingRequestView(actor);

  return (
    <main className="koinonia-site koinonia-employee-dashboard">
      <Header />

      <section className="koinonia-section koinonia-employee-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">
              {assignmentView.isLiveData ? "Employee Dashboard" : "Employee Dashboard Preview"}
            </p>

            <h1 className="koinonia-title">
              One operating view for staff, clients, and assigned work.
            </h1>

            <p className="koinonia-lead">
              {assignmentView.isLiveData
                ? "Live work items can now be assigned to primary and backup staff with audit history."
                : "This workspace is ready for live assignments, but it is showing sample data until production storage is reachable."}
            </p>
          </div>

          {assignmentView.notice ? (
            <p className="koinonia-employee-security-note">{assignmentView.notice}</p>
          ) : null}

          <div className="koinonia-employee-summary-grid">
            {assignmentView.summaryCards.map((card) => (
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
                  {assignmentView.queue.map((item) => (
                    <article className="koinonia-employee-assignment-item" key={item.id}>
                      <div>
                        <span>{item.service}</span>
                        <h3>{item.work}</h3>
                        <p>{item.reason}</p>
                        {item.detailHref ? (
                          <a className="koinonia-document-link employee" href={item.detailHref}>
                            Open Work
                          </a>
                        ) : null}
                        <dl className="koinonia-employee-assignment-meta">
                          <div>
                            <dt>Client</dt>
                            <dd>{item.client}</dd>
                          </div>
                          <div>
                            <dt>Primary</dt>
                            <dd>{item.primaryStaff}</dd>
                          </div>
                          <div>
                            <dt>Backup</dt>
                            <dd>{item.backupStaff}</dd>
                          </div>
                          <div>
                            <dt>Due</dt>
                            <dd>{item.due}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="koinonia-employee-work-meta">
                        <strong>{item.priority}</strong>
                        <span>{item.status}</span>
                        {assignmentView.isLiveData && item.isAssignable ? (
                          <PortalWorkAssignmentForm
                            backupStaffUserId={item.backupStaffUserId}
                            canAssign={assignmentView.canAssign}
                            primaryStaffUserId={item.primaryStaffUserId}
                            staffOptions={assignmentView.staffOptions}
                            workItemId={item.id}
                          />
                        ) : null}
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

              <section
                className="koinonia-employee-work-panel"
                aria-labelledby="employee-showings-title"
              >
                <div className="koinonia-employee-panel-heading">
                  <p className="koinonia-eyebrow">Showings</p>
                  <h2 id="employee-showings-title">Showing Request Queue</h2>
                </div>

                <div className="koinonia-employee-assignment-list">
                  {showingRequestView.notice ? (
                    <p className="koinonia-employee-security-note">{showingRequestView.notice}</p>
                  ) : null}

                  {showingRequestView.requests.map((request) => (
                    <article className="koinonia-employee-assignment-item" key={request.id}>
                      <div>
                        <span>{request.requestedBy}</span>
                        <h3>{request.title}</h3>
                        <p>{request.nextAction}</p>
                        <dl className="koinonia-employee-assignment-meta">
                          <div>
                            <dt>Timing</dt>
                            <dd>{request.timing}</dd>
                          </div>
                          <div>
                            <dt>Notes</dt>
                            <dd>{request.notes.join(", ")}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="koinonia-employee-work-meta">
                        <strong>{request.status}</strong>
                        <span>Showing request</span>
                        <ShowingRequestStatusForm
                          currentStatus={request.status}
                          disabled={!showingRequestView.isLiveData}
                          requestId={request.id}
                        />
                      </div>
                    </article>
                  ))}
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
                <p className="koinonia-eyebrow">Staff Review</p>
                <p>
                  Review missing assignments, open document approvals, billing
                  setup gaps, access blockers, and showing authorization before
                  staff work continues.
                </p>
                <a className="koinonia-document-link employee" href="/employee/review">
                  Open Staff Review
                </a>
              </section>

              <section className="koinonia-employee-request-card">
                <p className="koinonia-eyebrow">Launch Checklist</p>
                <p>
                  Track the provider, database, service-workflow, document,
                  billing, optional AI, optional social-login, and final
                  dry-run proof needed before real client activity starts.
                </p>
                <a className="koinonia-document-link employee" href="/employee/launch">
                  Open Launch Checklist
                </a>
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
                <a className="koinonia-document-link employee" href="/employee/access">
                  Open Access Workspace
                </a>
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

async function getEmployeeAssignmentView(actor: {
  permissions: string[];
  workspaceId: string;
}): Promise<EmployeeAssignmentView> {
  if (!actor.permissions.includes("employee-portal:assigned-work:view")) {
    return {
      canAssign: false,
      isLiveData: false,
      notice: "Assignment queue requires assigned-work access.",
      queue: [
        {
          backupStaff: "Restricted",
          client: "Koinonia",
          due: "Access limited",
          id: "restricted-employee-assignment-queue",
          isAssignable: false,
          primaryStaff: "Restricted",
          priority: "Restricted",
          reason: "Ask an Owner or Operations user to review work assignments.",
          service: "Assignment Queue",
          status: "Restricted",
          work: "Assignment queue restricted"
        }
      ],
      staffOptions: [],
      summaryCards: [
        {
          label: "Assignments",
          value: "Restricted",
          body: "This role cannot view staff assignment queues."
        }
      ]
    };
  }

  try {
    const [workItems, staffUsers] = await Promise.all([
      prisma.rosObject.findMany({
        where: {
          workspaceId: actor.workspaceId,
          objectType: {
            in: [...clientPortalWorkObjectTypes]
          },
          archivedAt: null
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 25
      }),
      prisma.user.findMany({
        where: {
          workspaceId: actor.workspaceId,
          status: "active",
          portalAccessStatus: "active"
        },
        include: {
          role: true
        },
        orderBy: [{ name: "asc" }],
        take: 100
      })
    ]);
    const staffOptions = staffUsers
      .filter((staffUser) => isAssignableStaffRole(staffUser.role?.name))
      .map((staffUser) => ({
        id: staffUser.id,
        name: staffUser.name,
        role: staffUser.role?.name ?? "Staff"
      }));
    const staffNameById = new Map(staffOptions.map((staff) => [staff.id, staff.name]));

    return {
      canAssign: actor.permissions.includes("employee-portal:assignments:update"),
      isLiveData: true,
      queue: withEmptyEmployeeAssignmentQueue(
        workItems.map((workItem) => ({
          backupStaff: getStaffName(staffNameById, workItem.backupStaffUserId, "No backup"),
          backupStaffUserId: workItem.backupStaffUserId,
          client: getWorkClientLabel(workItem.data, workItem.clientUserId, workItem.clientObjectId),
          detailHref: `/employee/work/${workItem.id}`,
          due: getPortalWorkDueLabel(workItem.data),
          id: workItem.id,
          isAssignable: true,
          primaryStaff: getStaffName(staffNameById, workItem.assignedStaffUserId, "Unassigned"),
          primaryStaffUserId: workItem.assignedStaffUserId,
          priority: getWorkPriorityLabel(workItem.health, workItem.data),
          reason: workItem.nextAction ?? "Assign staff and record the next client update.",
          service: getPortalWorkItemTypeLabel(workItem.objectType),
          status: workItem.status,
          work: workItem.name
        }))
      ),
      staffOptions,
      summaryCards: buildEmployeeAssignmentSummaryCards(workItems, staffOptions.length)
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      canAssign: false,
      isLiveData: false,
      notice:
        "Employee assignment storage is not reachable in this preview, so sample assignment data is shown.",
      queue: sampleAssignmentQueue,
      staffOptions: [],
      summaryCards: sampleAssignmentSummary
    };
  }
}

function buildEmployeeAssignmentSummaryCards(
  workItems: Array<{
    assignedStaffUserId?: string | null;
    backupStaffUserId?: string | null;
    status: string;
  }>,
  staffOptionCount: number
): EmployeeSummaryCard[] {
  const summaryCounts = buildPortalWorkSummaryCounts(workItems);
  const openWorkItems = workItems.filter(
    (workItem) => getPortalWorkStatusBucket(workItem.status) !== "completed"
  );
  const unassignedCount = openWorkItems.filter((workItem) => !workItem.assignedStaffUserId).length;
  const backupNeededCount = openWorkItems.filter(
    (workItem) => workItem.assignedStaffUserId && !workItem.backupStaffUserId
  ).length;

  return [
    {
      label: "Unassigned Work",
      value: String(unassignedCount),
      body: "Open work that still needs a primary staff owner."
    },
    {
      label: "Active Work",
      value: String(summaryCounts.active),
      body: "Work currently moving through Koinonia operations."
    },
    {
      label: "Waiting/Blocked",
      value: String(summaryCounts.waiting),
      body: "Items that need client input, access, payment setup, or escalation."
    },
    {
      label: "Backup Needed",
      value: String(backupNeededCount),
      body: `${staffOptionCount} active staff users are available for primary or backup assignment.`
    }
  ];
}

function withEmptyEmployeeAssignmentQueue(
  queue: EmployeeAssignmentQueueItem[]
): EmployeeAssignmentQueueItem[] {
  if (queue.length > 0) {
    return queue;
  }

  return [
    {
      backupStaff: "No backup needed",
      client: "Koinonia",
      due: "No active due date",
      id: "empty-employee-assignment-queue",
      isAssignable: false,
      primaryStaff: "No owner needed",
      priority: "Ready",
      reason: "New work items will appear here when clients or staff create portal work.",
      service: "Assignment Queue",
      status: "Clear",
      work: "No work items in queue"
    }
  ];
}

function getStaffName(
  staffNameById: Map<string, string>,
  staffUserId: string | null,
  fallback: string
): string {
  if (!staffUserId) {
    return fallback;
  }

  return staffNameById.get(staffUserId) ?? "Staff user unavailable";
}

function getWorkClientLabel(
  data: unknown,
  clientUserId?: string | null,
  clientObjectId?: string | null
): string {
  const value = toRecord(data);

  for (const key of ["clientName", "customerName", "requestedByEmail", "clientEmail"]) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (clientUserId) {
    return "Linked client user";
  }

  if (clientObjectId) {
    return "Linked client file";
  }

  return "Client link needed";
}

function getWorkPriorityLabel(health: string, data: unknown): string {
  const value = toRecord(data);
  const priority = value.priority;

  if (typeof priority === "string" && priority.trim()) {
    return priority.trim();
  }

  if (/critical|blocked/i.test(health)) {
    return "High";
  }

  if (/attention|watch/i.test(health)) {
    return "Watch";
  }

  return "Normal";
}

function isAssignableStaffRole(roleName: string | null | undefined): boolean {
  return Boolean(roleName && roleName !== "Client" && roleName !== "Viewer");
}

async function getEmployeeShowingRequestView(actor: {
  permissions: string[];
  workspaceId: string;
}): Promise<EmployeeShowingRequestView> {
  if (!actor.permissions.includes("employee-portal:assigned-work:view")) {
    return {
      isLiveData: false,
      notice: "Showing request queue requires assigned-work access.",
      requests: [
        {
          id: "restricted-employee-showing-requests",
          title: "Showing queue restricted",
          requestedBy: "Koinonia",
          status: "Restricted",
          nextAction: "Ask an Owner or Operations user to review showing assignments.",
          timing: "Access limited",
          notes: ["Assigned-work permission required"]
        }
      ]
    };
  }

  try {
    const showingRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: showingRequestObjectType,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12
    });

    return {
      isLiveData: true,
      requests: withEmptyEmployeeShowingRequests(
        showingRequests.map((request) => ({
          id: request.id,
          title: request.name,
          requestedBy: getRequestedByLabel(request.data),
          status: getHumanShowingStatus(request.status),
          nextAction: request.nextAction ?? "Review this showing request and assign coverage.",
          timing: getShowingTimingLabel(request.data),
          notes: getShowingNoteLabels(request.data)
        }))
      )
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      isLiveData: false,
      notice:
        "Showing request storage is not reachable in this preview, so sample requests are shown.",
      requests: sampleEmployeeShowingRequests
    };
  }
}

function withEmptyEmployeeShowingRequests(
  requests: EmployeeShowingRequestItem[]
): EmployeeShowingRequestItem[] {
  if (requests.length > 0) {
    return requests;
  }

  return [
    {
      id: "empty-employee-showing-requests",
      title: "No showing requests in queue",
      requestedBy: "Koinonia",
      status: "Clear",
      nextAction: "New client showing requests will appear here for assignment and follow-up.",
      timing: "No active request",
      notes: ["Queue ready"]
    }
  ];
}

function getRequestedByLabel(data: unknown): string {
  const value = toRecord(data);

  for (const key of ["clientName", "requestedByEmail"]) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "Client request";
}

function toRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
