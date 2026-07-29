import type { AuthUser } from "@reynalds-os/auth";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PortalWorkAssignmentForm,
  type PortalWorkAssignmentStaffOption
} from "../../../../components/employee/PortalWorkAssignmentForm";
import { Footer, Header } from "../../../../components/site";
import { absoluteUrl } from "../../../../config/seo.config";
import { prisma } from "../../../../lib/db";
import { requirePortalPermission } from "../../../../lib/portal-auth";
import { validatePortalDocumentUploadRoot } from "../../../../lib/portal-documents";
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

type EmployeeWorkWorkspaceView = {
  assignedStaffUserId?: string | null;
  backupStaffUserId?: string | null;
  canAssign: boolean;
  documents: PortalWorkspaceDocumentItem[];
  events: PortalWorkspaceEventItem[];
  notice?: string;
  staffOptions: PortalWorkAssignmentStaffOption[];
  summary: PortalWorkspaceSummary;
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
      <Header />

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
              <section className="koinonia-workspace-panel employee" aria-labelledby="employee-work-overview">
                <div className="koinonia-workspace-panel-heading">
                  <p className="koinonia-eyebrow">Overview</p>
                  <h2 id="employee-work-overview">Work Details</h2>
                </div>

                <div className="koinonia-workspace-meta-grid employee">
                  {workspace.summary.meta.map((item) => (
                    <article key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <WorkspaceDocuments documents={workspace.documents} />
              <WorkspaceTimeline events={workspace.events} />
            </div>

            <aside className="koinonia-workspace-side-panel" aria-label="Employee work actions">
              <section className="koinonia-workspace-panel employee">
                <p className="koinonia-eyebrow">Assignment</p>
                <PortalWorkAssignmentForm
                  backupStaffUserId={workspace.backupStaffUserId}
                  canAssign={workspace.canAssign}
                  primaryStaffUserId={workspace.assignedStaffUserId}
                  staffOptions={workspace.staffOptions}
                  workItemId={workspace.summary.id}
                />
              </section>

              <section className="koinonia-workspace-panel employee">
                <p className="koinonia-eyebrow">Next Step</p>
                <p>{workspace.summary.nextAction}</p>
                <a className="koinonia-document-link employee" href="/employee/dashboard">
                  Back to Dashboard
                </a>
                <a className="koinonia-document-link employee" href="/employee/documents">
                  Open Document Workspace
                </a>
              </section>

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
        <p className="koinonia-eyebrow">History</p>
        <h2 id="employee-work-history">Work Timeline</h2>
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

    return {
      assignedStaffUserId: workItem.assignedStaffUserId,
      backupStaffUserId: workItem.backupStaffUserId,
      canAssign: actor.permissions.includes("employee-portal:assignments:update"),
      documents: withWorkspaceDocuments(
        buildPortalWorkspaceDocuments(documents, {
          downloadBasePath: "/api/portal/documents",
          storageReady: isDocumentStorageConfigured()
        })
      ),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      staffOptions,
      summary: buildPortalWorkspaceSummary(workItem)
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      canAssign: false,
      documents: buildEmptyPortalWorkspaceDocuments(),
      events: buildEmptyPortalWorkspaceTimeline(),
      notice:
        "Work detail storage is not reachable in this preview, so live status, documents, assignment options, and history cannot be shown yet.",
      staffOptions: [],
      summary: buildUnavailableWorkspaceSummary(workItemId)
    };
  }
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
  try {
    validatePortalDocumentUploadRoot(process.env.PORTAL_DOCUMENT_UPLOAD_DIR);
    return true;
  } catch {
    return false;
  }
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
