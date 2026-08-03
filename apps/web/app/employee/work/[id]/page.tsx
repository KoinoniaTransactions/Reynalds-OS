import type { AuthUser } from "@reynalds-os/auth";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PortalWorkAssignmentForm,
  type PortalWorkAssignmentStaffOption
} from "../../../../components/employee/PortalWorkAssignmentForm";
import { PortalDocumentUploadForm } from "../../../../components/client/PortalDocumentUploadForm";
import { ShowingRequestStatusForm } from "../../../../components/employee/ShowingRequestStatusForm";
import { Footer, Header } from "../../../../components/site";
import { absoluteUrl } from "../../../../config/seo.config";
import { isPortalDocumentR2Configured, isPortalDocumentR2UploadEnabled } from "../../../../lib/portal-document-r2";
import { prisma } from "../../../../lib/db";
import {
  getKoinoniaStaffServiceCuesForWork,
  type KoinoniaStaffServiceCues
} from "../../../../lib/koinonia-service-templates";
import { requirePortalPermission } from "../../../../lib/portal-auth";
import {
  buildDeadlineActions,
  getTransactionDeadlines
} from "../../../../lib/portal-deadlines";
import {
  calculatePortalTransactionHealth,
  type PortalTransactionHealth
} from "../../../../lib/portal-transaction-health";
import {
  buildEmptyPortalWorkspaceDocuments,
  buildEmptyPortalWorkspaceTimeline,
  buildPortalWorkspaceDocuments,
  buildPortalWorkspaceSummary,
  buildPortalWorkspaceTimeline,
  type PortalWorkspaceDocumentItem,
  type PortalWorkspaceEventItem,
  type PortalWorkspaceSummary
} from "../../../../lib/portal-workspace";
import { clientPortalWorkObjectTypes } from "../../../../lib/portal-work-items";
import { showingRequestObjectType } from "../../../../lib/showing-requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Work Detail",
  description:
    "Protected Koinonia employee work detail for assignment, status, documents, and work history.",
  alternates: {
    canonical: absoluteUrl("/employee/work")
  },
  robots: {
    index: false,
    follow: false
  }
};

type Params = {
  params: Promise<{ id: string }>;
};

type ShowingRequestDetails = {
  assignedProvider: string;
  confirmedWindow: string;
  feedbackSummary: string;
  lastStatusNote: string;
  statusUpdatedAt: string;
  statusUpdatedByEmail: string;
};

type EmployeeWorkspaceAction = {
  detail: string;
  href: string;
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
};

type EmployeeWorkWorkspaceView = {
  actionQueue: EmployeeWorkspaceAction[];
  activeDocumentCount: number;
  assignedStaffLabel: string;
  assignedStaffUserId?: string | null;
  backupStaffLabel: string;
  backupStaffUserId?: string | null;
  canAssign: boolean;
  canUpdateShowing: boolean;
  documentUploadReady: boolean;
  documents: PortalWorkspaceDocumentItem[];
  events: PortalWorkspaceEventItem[];
  outstandingDocumentActionCount: number;
  recentActivityCount: number;
  isShowingRequest: boolean;
  notice?: string;
  serviceCues: KoinoniaStaffServiceCues | null;
  showingDetails: ShowingRequestDetails;
  staffOptions: PortalWorkAssignmentStaffOption[];
  summary: PortalWorkspaceSummary;
  transactionHealth: PortalTransactionHealth | null;
};

export default async function EmployeeWorkDetailPage({ params }: Params) {
  const actor = await requirePortalPermission("employee-portal:assigned-work:view", "/employee/dashboard");
  const { id } = await params;
  const workspace = await getEmployeeWorkWorkspace(actor, id);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="koinonia-site koinonia-workspace-detail koinonia-employee-workspace-detail">
      <Header
        canAccessClientPortal={actor.permissions.includes("client-portal:view")}
        canAccessEmployeePortal={actor.permissions.includes("employee-portal:view")}
      />

      <section className="koinonia-section koinonia-workspace-hero employee">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">{workspace.summary.type}</p>
            <h1 className="koinonia-title">{workspace.summary.title}</h1>
            <p className="koinonia-lead">{workspace.summary.nextAction}</p>
          </div>

          {workspace.notice ? (
            <p className="koinonia-employee-security-note">{workspace.notice}</p>
          ) : null}

          <div className="koinonia-workspace-summary-grid employee">
            <article>
              <span>Status</span>
              <strong>{workspace.summary.status}</strong>
              <p>{workspace.summary.health}</p>
            </article>
            <article>
              <span>Due</span>
              <strong>{workspace.summary.due}</strong>
              <p>Next timing on file</p>
            </article>
            <article>
              <span>Updated</span>
              <strong>{workspace.summary.updated}</strong>
              <p>Latest portal activity</p>
            </article>
            <article>
              <span>Opened</span>
              <strong>{workspace.summary.created}</strong>
              <p>Work item created</p>
            </article>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-workspace-layout">
            <div className="koinonia-workspace-main-stack">
              <section
                className="koinonia-workspace-panel employee"
                aria-labelledby="employee-action-center"
              >
                <div className="koinonia-workspace-panel-heading">
                  <p className="koinonia-eyebrow">Action Required</p>
                  <h2 id="employee-action-center">Action Center</h2>
                </div>

                <div className="koinonia-workspace-meta-grid employee">
                  <article>
                    <span>Status</span>
                    <strong>{workspace.summary.status}</strong>
                  </article>

                  <article>
                    <span>Health</span>
                    <strong>{workspace.summary.health}</strong>
                  </article>

                  <article>
                    <span>Due</span>
                    <strong>{workspace.summary.due}</strong>
                  </article>

                  <article>
                    <span>Next Action</span>
                    <strong>{workspace.summary.nextAction}</strong>
                  </article>
                </div>

                <div className="koinonia-workspace-list">
                  {workspace.actionQueue.length ? (
                    workspace.actionQueue.map((action) => (
                      <article
                        className="koinonia-workspace-list-item employee"
                        key={action.id}
                      >
                        <div>
                          <span>{getActionPriorityLabel(action.priority)}</span>
                          <h3>{action.label}</h3>
                          <p>{action.detail}</p>
                          <a
                            className="koinonia-document-link employee"
                            href={action.href}
                          >
                            Open Action
                          </a>
                        </div>
                        <strong>{action.priority}</strong>
                      </article>
                    ))
                  ) : (
                    <p className="koinonia-employee-security-note">
                      No immediate transaction actions are currently identified.
                    </p>
                  )}
                </div>

                {workspace.isShowingRequest ? (
                  <>
                    <ShowingRequestStatusForm
                      currentStatus={workspace.summary.status}
                      disabled={!workspace.canUpdateShowing}
                      initialAssignedProvider={workspace.showingDetails.assignedProvider}
                      initialConfirmedWindow={workspace.showingDetails.confirmedWindow}
                      initialFeedbackSummary={workspace.showingDetails.feedbackSummary}
                      initialNotes={workspace.showingDetails.lastStatusNote}
                      requestId={workspace.summary.id}
                    />

                    <div className="koinonia-workspace-meta-grid employee">
                    <article>
                      <span>Assigned Provider</span>
                      <strong>
                        {workspace.showingDetails.assignedProvider || "Not assigned"}
                      </strong>
                    </article>

                    <article>
                      <span>Confirmed Window</span>
                      <strong>
                        {workspace.showingDetails.confirmedWindow || "Not confirmed"}
                      </strong>
                    </article>

                    <article>
                      <span>Latest Staff Note</span>
                      <strong>
                        {workspace.showingDetails.lastStatusNote || "No staff note recorded"}
                      </strong>
                    </article>

                    <article>
                      <span>Latest Feedback</span>
                      <strong>
                        {workspace.showingDetails.feedbackSummary || "No feedback recorded"}
                      </strong>
                    </article>

                    <article>
                      <span>Last Updated By</span>
                      <strong>
                        {workspace.showingDetails.statusUpdatedByEmail || "Not updated yet"}
                      </strong>
                    </article>

                      <article>
                        <span>Last Updated</span>
                        <strong>
                          {workspace.showingDetails.statusUpdatedAt || "Not updated yet"}
                        </strong>
                      </article>
                    </div>
                  </>
                ) : null}
              </section>

              <section
                className="koinonia-workspace-panel employee"
                aria-labelledby="employee-team-assignment"
              >
                <div className="koinonia-workspace-panel-heading">
                  <p className="koinonia-eyebrow">Ownership</p>
                  <h2 id="employee-team-assignment">Team Assignment</h2>
                </div>

                <PortalWorkAssignmentForm
                  backupStaffUserId={workspace.backupStaffUserId}
                  canAssign={workspace.canAssign}
                  primaryStaffUserId={workspace.assignedStaffUserId}
                  staffOptions={workspace.staffOptions}
                  workItemId={workspace.summary.id}
                />
              </section>

              <section
                className="koinonia-workspace-panel employee"
                aria-labelledby="employee-work-overview"
              >
                <div className="koinonia-workspace-panel-heading">
                  <p className="koinonia-eyebrow">Overview</p>
                  <h2 id="employee-work-overview">Transaction Overview</h2>
                </div>

                {workspace.transactionHealth ? (
                  <div className="koinonia-workspace-meta-grid employee">
                    <article>
                      <span>Health Score</span>
                      <strong>{workspace.transactionHealth.score}%</strong>
                      <p>{workspace.transactionHealth.statusLabel}</p>
                    </article>

                    <article>
                      <span>Health Status</span>
                      <strong>
                        {workspace.transactionHealth.statusLabel}
                      </strong>
                      <p>
                        {getTransactionHealthSummary(
                          workspace.transactionHealth.status
                        )}
                      </p>
                    </article>
                  </div>
                ) : (
                  <p className="koinonia-employee-security-note">
                    Transaction health is unavailable until live workspace data
                    can be loaded.
                  </p>
                )}

                {workspace.transactionHealth ? (
                  <div className="koinonia-workspace-list">
                    {getTransactionHealthAttentionFactors(
                      workspace.transactionHealth
                    ).length ? (
                      getTransactionHealthAttentionFactors(
                        workspace.transactionHealth
                      ).map((factor) => (
                        <article
                          className="koinonia-workspace-list-item employee"
                          key={factor.key}
                        >
                          <div>
                            <span>
                              {getTransactionHealthFactorLabel(factor.state)}
                            </span>
                            <h3>{factor.label}</h3>
                            <p>{factor.detail}</p>
                          </div>
                          <strong>-{factor.penalty}</strong>
                        </article>
                      ))
                    ) : (
                      <p className="koinonia-employee-security-note">
                        No material transaction-health risks are currently
                        identified.
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="koinonia-workspace-meta-grid employee">
                  <article>
                    <span>Active Documents</span>
                    <strong>{workspace.activeDocumentCount}</strong>
                  </article>

                  <article>
                    <span>Document Actions</span>
                    <strong>{workspace.outstandingDocumentActionCount}</strong>
                  </article>

                  <article>
                    <span>Recent Activity</span>
                    <strong>{workspace.recentActivityCount}</strong>
                  </article>

                  <article>
                    <span>Primary Staff</span>
                    <strong>{workspace.assignedStaffLabel}</strong>
                  </article>

                  <article>
                    <span>Backup Staff</span>
                    <strong>{workspace.backupStaffLabel}</strong>
                  </article>

                  {workspace.summary.meta.map((item) => (
                    <article key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <PortalDocumentUploadForm
                relatedObjectId={workspace.summary.id}
                storageReady={workspace.documentUploadReady}
              />

              <WorkspaceDocuments documents={workspace.documents} />
              <WorkspaceTimeline events={workspace.events} />
            </div>

            <aside className="koinonia-workspace-side-panel" aria-label="Employee work actions">
              <section className="koinonia-workspace-panel employee">
                <p className="koinonia-eyebrow">Quick Actions</p>
                <p>
                  Move directly to the staff workspaces most likely to support
                  the next action on this item.
                </p>
                <a className="koinonia-document-link employee" href="/employee/documents">
                  Open Documents
                </a>
                <a className="koinonia-document-link employee" href="/employee/billing">
                  Open Billing
                </a>
                <a className="koinonia-document-link employee" href="/employee/dashboard">
                  Return to Dashboard
                </a>
              </section>

              <StaffServiceCuePanel serviceCues={workspace.serviceCues} />

              <section className="koinonia-workspace-panel employee koinonia-workspace-boundary-card">
                <p className="koinonia-eyebrow">Staff Boundary</p>
                <p>
                  Staff can record status, assignment, document, and handoff
                  history here. Credentials, card data, bank details, access
                  codes, and private login details stay out of portal notes.
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

function StaffServiceCuePanel({
  serviceCues
}: {
  serviceCues: KoinoniaStaffServiceCues | null;
}) {
  if (!serviceCues) {
    return (
      <section className="koinonia-workspace-panel employee">
        <p className="koinonia-eyebrow">Service Playbook</p>
        <p>
          No service template matched this work item yet. Confirm the service
          package, billing model, expected documents, and next action before
          assigning staff.
        </p>
      </section>
    );
  }

  return (
    <section className="koinonia-workspace-panel employee" aria-labelledby="employee-service-cues">
      <p className="koinonia-eyebrow">Service Playbook</p>
      <strong className="koinonia-workspace-service-title" id="employee-service-cues">
        {serviceCues.serviceName}
      </strong>
      <p>{serviceCues.staffNextAction}</p>

      <div className="koinonia-workspace-meta-grid employee">
        <article>
          <span>Billing</span>
          <strong>{serviceCues.billingModelLabel}</strong>
        </article>
        <article>
          <span>Showing Request</span>
          <strong>{serviceCues.showingRequestRequired ? "Required" : "Not Required"}</strong>
        </article>
      </div>

      <StaffCueList title="Staff Roles" items={serviceCues.requiredStaffRoles} />
      <StaffCueList title="Expected Documents" items={serviceCues.documentRequests} />
      <StaffCueList title="Queues" items={serviceCues.employeePortalQueues} />
      <StaffCueList title="Risk Notes" items={serviceCues.riskNotes} />
    </section>
  );
}

function StaffCueList({ items, title }: { items: readonly string[]; title: string }) {
  return (
    <div className="koinonia-workspace-cue-list">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getTransactionHealthSummary(
  status: PortalTransactionHealth["status"]
): string {
  switch (status) {
    case "healthy":
      return "The transaction is operating within expected controls.";
    case "watch":
      return "One or more workflow signals need staff attention.";
    default:
      return "Material transaction risks require prompt review.";
  }
}

function getTransactionHealthAttentionFactors(
  health: PortalTransactionHealth
): PortalTransactionHealth["factors"] {
  return health.factors
    .filter((factor) => factor.state !== "positive")
    .sort((left, right) => right.penalty - left.penalty)
    .slice(0, 5);
}

function getTransactionHealthFactorLabel(
  state: PortalTransactionHealth["factors"][number]["state"]
): string {
  switch (state) {
    case "critical":
      return "Critical";
    case "warning":
      return "Needs Attention";
    default:
      return "Healthy";
  }
}

function getActionPriorityLabel(
  priority: EmployeeWorkspaceAction["priority"]
): string {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Needs Attention";
    default:
      return "Follow Up";
  }
}

function WorkspaceDocuments({ documents }: { documents: PortalWorkspaceDocumentItem[] }) {
  return (
    <section className="koinonia-workspace-panel employee" aria-labelledby="employee-work-documents">
      <div className="koinonia-workspace-panel-heading">
        <p className="koinonia-eyebrow">Documents</p>
        <h2 id="employee-work-documents">Attached Documents</h2>
      </div>

      <div className="koinonia-workspace-list">
        {documents.map((document) => (
          <article className="koinonia-workspace-list-item employee" key={document.id}>
            <div>
              <span>{document.status}</span>
              <h3>{document.title}</h3>
              <p>{document.detail}</p>
              <p>{document.fileInfo}</p>
              {!document.id.startsWith("sample-") ? (
                <a
                  className="koinonia-document-link employee"
                  href={`/employee/documents/${document.id}`}
                >
                  Review Document
                </a>
              ) : null}

              {document.downloadHref ? (
                <a className="koinonia-document-link employee" href={document.downloadHref}>
                  Download
                </a>
              ) : null}
            </div>
            <strong>{document.submitted}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkspaceTimeline({ events }: { events: PortalWorkspaceEventItem[] }) {
  return (
    <section className="koinonia-workspace-panel employee" aria-labelledby="employee-work-history">
      <div className="koinonia-workspace-panel-heading">
        <p className="koinonia-eyebrow">Activity</p>
        <h2 id="employee-work-history">Activity Timeline</h2>
      </div>

      <div className="koinonia-workspace-timeline">
        {events.map((event) => (
          <article className="employee" key={event.id}>
            <span>{event.label}</span>
            <strong>{event.summary}</strong>
            <p>{event.time}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

async function getEmployeeWorkWorkspace(
  actor: AuthUser,
  workItemId: string
): Promise<EmployeeWorkWorkspaceView | null> {
  try {
    const workItem = await prisma.rosObject.findFirst({
      where: {
        id: workItemId,
        workspaceId: actor.workspaceId,
        objectType: {
          in: [...clientPortalWorkObjectTypes]
        },
        archivedAt: null,
        ...(canViewWorkspaceWork(actor)
          ? {}
          : {
              OR: [{ assignedStaffUserId: actor.id }, { backupStaffUserId: actor.id }]
            })
      }
    });

    if (!workItem) {
      return null;
    }

    const [documents, events, staffUsers] = await Promise.all([
      prisma.document.findMany({
        where: {
          workspaceId: actor.workspaceId,
          relatedObjectId: workItem.id,
          archivedAt: null
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 30
      }),
      prisma.timelineEvent.findMany({
        where: {
          workspaceId: actor.workspaceId,
          objectId: workItem.id
        },
        orderBy: { createdAt: "desc" },
        take: 40
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
    const assignedStaffLabel =
      staffOptions.find((staffUser) => staffUser.id === workItem.assignedStaffUserId)
        ?.name ?? "Unassigned";
    const backupStaffLabel =
      staffOptions.find((staffUser) => staffUser.id === workItem.backupStaffUserId)
        ?.name ?? "Not assigned";
    const activeDocuments = documents.filter(
      (document) =>
        document.archivedAt === null &&
        document.removedAt === null &&
        document.lifecycleState === "active"
    );
    const documentsNeedingAction = activeDocuments.filter(
      (document) =>
        Boolean(document.requestedAction?.trim()) ||
        ["Uploaded", "In Review", "Revision Requested"].includes(document.status)
    );
    const outstandingDocumentActionCount = documentsNeedingAction.length;
    const serviceCues = getKoinoniaStaffServiceCuesForWork({
      data: workItem.data,
      name: workItem.name,
      objectType: workItem.objectType
    });
    const transactionDeadlines = getTransactionDeadlines(workItem.data);
    const missingExpectedDocumentCount =
      getMissingExpectedDocumentCount(documents, serviceCues);
    const transactionHealth = calculatePortalTransactionHealth({
      activeDocumentCount: activeDocuments.length,
      assignedStaffUserId: workItem.assignedStaffUserId,
      backupStaffUserId: workItem.backupStaffUserId,
      deadlines: transactionDeadlines,
      missingExpectedDocumentCount,
      outstandingDocumentActionCount,
      recentActivityCount: events.length
    });
    const actionQueue = buildEmployeeWorkspaceActions({
      assignedStaffUserId: workItem.assignedStaffUserId,
      backupStaffUserId: workItem.backupStaffUserId,
      data: workItem.data,
      documents,
      documentsNeedingAction,
      events,
      serviceCues,
      workItemId: workItem.id
    });

    return {
      actionQueue,
      activeDocumentCount: activeDocuments.length,
      assignedStaffLabel,
      assignedStaffUserId: workItem.assignedStaffUserId,
      backupStaffLabel,
      backupStaffUserId: workItem.backupStaffUserId,
      canAssign: actor.permissions.includes("employee-portal:assignments:update"),
      canUpdateShowing: actor.permissions.includes("employee-portal:assigned-work:update"),
      documentUploadReady:
        actor.permissions.includes("document-workspace:drafts:create") &&
        isDocumentStorageConfigured(),
      documents: withWorkspaceDocuments(
        buildPortalWorkspaceDocuments(documents, {
          downloadBasePath: "/api/portal/documents",
          storageReady: isDocumentStorageConfigured()
        })
      ),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      outstandingDocumentActionCount,
      recentActivityCount: events.length,
      isShowingRequest: workItem.objectType === showingRequestObjectType,
      serviceCues,
      showingDetails: buildShowingRequestDetails(workItem.data),
      staffOptions,
      summary: buildPortalWorkspaceSummary(workItem),
      transactionHealth
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      actionQueue: [],
      activeDocumentCount: 0,
      assignedStaffLabel: "Unavailable",
      backupStaffLabel: "Unavailable",
      canAssign: false,
      canUpdateShowing: false,
      documentUploadReady: false,
      documents: buildEmptyPortalWorkspaceDocuments(),
      events: buildEmptyPortalWorkspaceTimeline(),
      outstandingDocumentActionCount: 0,
      recentActivityCount: 0,
      isShowingRequest: false,
      notice:
        "Work detail storage is not reachable in this preview, so live status, documents, assignment options, and history cannot be shown yet.",
      serviceCues: null,
      showingDetails: buildShowingRequestDetails(null),
      staffOptions: [],
      summary: buildUnavailableWorkspaceSummary(workItemId),
      transactionHealth: null
    };
  }
}

function getMissingExpectedDocumentCount(
  documents: Array<{
    documentType: string;
    lifecycleState: string;
    removedAt: Date | null;
  }>,
  serviceCues: KoinoniaStaffServiceCues | null
): number {
  if (!serviceCues?.documentRequests.length) {
    return 0;
  }

  const activeDocumentTypes = new Set(
    documents
      .filter(
        (document) =>
          document.lifecycleState === "active" &&
          document.removedAt === null
      )
      .map((document) => document.documentType.trim().toLowerCase())
  );

  return serviceCues.documentRequests.filter(
    (expectedDocument) =>
      !activeDocumentTypes.has(expectedDocument.trim().toLowerCase())
  ).length;
}

function buildEmployeeWorkspaceActions({
  assignedStaffUserId,
  backupStaffUserId,
  data,
  documents,
  documentsNeedingAction,
  events,
  serviceCues,
  workItemId
}: {
  assignedStaffUserId: string | null;
  backupStaffUserId: string | null;
  data: unknown;
  documents: Array<{
    documentType: string;
    id: string;
    lifecycleState: string;
    removedAt: Date | null;
  }>;
  documentsNeedingAction: Array<{
    documentType: string;
    id: string;
    requestedAction: string | null;
    status: string;
  }>;
  events: Array<{
    createdAt: Date;
  }>;
  serviceCues: KoinoniaStaffServiceCues | null;
  workItemId: string;
}): EmployeeWorkspaceAction[] {
  const actions: EmployeeWorkspaceAction[] = [];
  const deadlineActions = buildDeadlineActions(
    getTransactionDeadlines(data)
  ).map<EmployeeWorkspaceAction>((action) => ({
    detail: action.detail,
    href: "#employee-action-center",
    id: action.id,
    label: action.label,
    priority: action.priority
  }));

  actions.push(...deadlineActions);

  if (!assignedStaffUserId) {
    actions.push({
      detail: "Assign a primary staff owner before advancing this transaction.",
      href: `#employee-team-assignment`,
      id: "assign-primary-staff",
      label: "Primary staff is not assigned",
      priority: "high"
    });
  }

  if (!backupStaffUserId) {
    actions.push({
      detail: "Add backup coverage so the file is not dependent on one team member.",
      href: `#employee-team-assignment`,
      id: "assign-backup-staff",
      label: "Backup staff is not assigned",
      priority: "medium"
    });
  }

  for (const document of documentsNeedingAction.slice(0, 5)) {
    actions.push({
      detail:
        document.requestedAction?.trim() ||
        `Review the ${document.documentType} currently marked ${document.status}.`,
      href: `/employee/documents/${document.id}`,
      id: `document-${document.id}`,
      label: `${document.documentType} needs attention`,
      priority:
        document.status === "Revision Requested" ? "high" : "medium"
    });
  }

  if (serviceCues?.documentRequests.length) {
    const activeDocumentTypes = new Set(
      documents
        .filter(
          (document) =>
            document.lifecycleState === "active" &&
            document.removedAt === null
        )
        .map((document) => document.documentType.trim().toLowerCase())
    );

    for (const expectedDocument of serviceCues.documentRequests) {
      if (!activeDocumentTypes.has(expectedDocument.trim().toLowerCase())) {
        actions.push({
          detail: `The service playbook expects ${expectedDocument}, but no active matching document is attached.`,
          href: `#employee-work-documents`,
          id: `missing-document-${expectedDocument
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`,
          label: `Missing expected document: ${expectedDocument}`,
          priority: "medium"
        });
      }
    }
  }

  const latestEvent = events[0]?.createdAt;
  const staleThreshold = Date.now() - 3 * 24 * 60 * 60 * 1000;

  if (!latestEvent || latestEvent.getTime() < staleThreshold) {
    actions.push({
      detail:
        "No recent transaction activity has been recorded in the last three days.",
      href: `#employee-work-history`,
      id: `stale-work-${workItemId}`,
      label: "Transaction activity may be stale",
      priority: "low"
    });
  }

  return actions
    .sort(
      (left, right) =>
        getActionPriorityWeight(left.priority) -
        getActionPriorityWeight(right.priority)
    )
    .slice(0, 10);
}

function getActionPriorityWeight(
  priority: EmployeeWorkspaceAction["priority"]
): number {
  switch (priority) {
    case "high":
      return 0;
    case "medium":
      return 1;
    default:
      return 2;
  }
}

function buildShowingRequestDetails(data: unknown): ShowingRequestDetails {
  const record =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};

  return {
    assignedProvider: getShowingDetail(record.assignedProvider),
    confirmedWindow: getShowingDetail(record.confirmedWindow),
    feedbackSummary: getShowingDetail(record.feedbackSummary),
    lastStatusNote: getShowingDetail(record.lastStatusNote),
    statusUpdatedAt: formatShowingUpdatedAt(record.statusUpdatedAt),
    statusUpdatedByEmail: getShowingDetail(record.statusUpdatedByEmail)
  };
}

function getShowingDetail(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatShowingUpdatedAt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function canViewWorkspaceWork(actor: AuthUser): boolean {
  return (
    actor.permissions.includes("employee-portal:assignments:update") ||
    actor.permissions.includes("employee-portal:clients:view")
  );
}

function withWorkspaceDocuments(
  documents: PortalWorkspaceDocumentItem[]
): PortalWorkspaceDocumentItem[] {
  return documents.length ? documents : buildEmptyPortalWorkspaceDocuments();
}

function withWorkspaceEvents(events: PortalWorkspaceEventItem[]): PortalWorkspaceEventItem[] {
  return events.length ? events : buildEmptyPortalWorkspaceTimeline();
}

function isAssignableStaffRole(roleName: string | null | undefined): boolean {
  return Boolean(roleName && roleName !== "Client" && roleName !== "Viewer");
}

function isDocumentStorageConfigured(): boolean {
  return isPortalDocumentR2Configured();
}

function buildUnavailableWorkspaceSummary(workItemId: string): PortalWorkspaceSummary {
  return {
    created: "Storage unavailable",
    due: "Storage unavailable",
    health: "Unavailable",
    id: workItemId,
    meta: [{ label: "Storage", value: "Work detail unavailable" }],
    nextAction: "Connect production database storage before using live staff work detail pages.",
    status: "Storage Unavailable",
    title: "Work detail temporarily unavailable",
    type: "Portal Work",
    updated: "Storage unavailable"
  };
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
