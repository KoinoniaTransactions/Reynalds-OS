import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "../../../../config/seo.config";
import { Footer, Header } from "../../../../components/site";
import { isPortalDocumentR2Configured, isPortalDocumentR2UploadEnabled } from "../../../../lib/portal-document-r2";
import { prisma } from "../../../../lib/db";
import { requirePortalPermission } from "../../../../lib/portal-auth";
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
  title: "Client Work Detail",
  description:
    "Protected Koinonia client work detail for status, next action, documents, and work history.",
  alternates: {
    canonical: absoluteUrl("/client/work")
  },
  robots: {
    index: false,
    follow: false
  }
};

type Params = {
  params: Promise<{ id: string }>;
};

type ClientWorkWorkspaceView = {
  documents: PortalWorkspaceDocumentItem[];
  events: PortalWorkspaceEventItem[];
  notice?: string;
  summary: PortalWorkspaceSummary;
};

export default async function ClientWorkDetailPage({ params }: Params) {
  const actor = await requirePortalPermission("client-portal:work:view", "/client/dashboard");
  const { id } = await params;
  const workspace = await getClientWorkWorkspace(actor.workspaceId, actor.id, id);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="koinonia-site koinonia-workspace-detail koinonia-client-workspace-detail">
      <Header />

      <section className="koinonia-section koinonia-workspace-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">{workspace.summary.type}</p>
            <h1 className="koinonia-title">{workspace.summary.title}</h1>
            <p className="koinonia-lead">{workspace.summary.nextAction}</p>
          </div>

          {workspace.notice ? (
            <p className="koinonia-client-security-note">{workspace.notice}</p>
          ) : null}

          <div className="koinonia-workspace-summary-grid">
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
              <section className="koinonia-workspace-panel" aria-labelledby="client-work-overview">
                <div className="koinonia-workspace-panel-heading">
                  <p className="koinonia-eyebrow">Overview</p>
                  <h2 id="client-work-overview">Work Details</h2>
                </div>

                <div className="koinonia-workspace-meta-grid">
                  {workspace.summary.meta.map((item) => (
                    <article key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <WorkspaceDocuments documents={workspace.documents} isEmployee={false} />
              <WorkspaceTimeline events={workspace.events} isEmployee={false} />
            </div>

            <aside className="koinonia-workspace-side-panel" aria-label="Client work actions">
              <section className="koinonia-workspace-panel">
                <p className="koinonia-eyebrow">Next Step</p>
                <p>{workspace.summary.nextAction}</p>
                <a className="koinonia-document-link" href="/client/documents">
                  Open Document Center
                </a>
                <a className="koinonia-document-link" href="/client/billing">
                  Open Billing Center
                </a>
              </section>

              <section className="koinonia-workspace-panel koinonia-workspace-boundary-card">
                <p className="koinonia-eyebrow">Security Boundary</p>
                <p>
                  Keep passwords, access codes, card numbers, and private login
                  details out of portal notes. Use approved delegated access or
                  processor-hosted payment setup instead.
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

function WorkspaceDocuments({
  documents,
  isEmployee
}: {
  documents: PortalWorkspaceDocumentItem[];
  isEmployee: boolean;
}) {
  return (
    <section className="koinonia-workspace-panel" aria-labelledby="client-work-documents">
      <div className="koinonia-workspace-panel-heading">
        <p className="koinonia-eyebrow">Documents</p>
        <h2 id="client-work-documents">Attached Documents</h2>
      </div>

      <div className="koinonia-workspace-list">
        {documents.map((document) => (
          <article className="koinonia-workspace-list-item" key={document.id}>
            <div>
              <span>{document.status}</span>
              <h3>{document.title}</h3>
              <p>{document.detail}</p>
              <p>{document.fileInfo}</p>
              {document.downloadHref ? (
                <a
                  className={isEmployee ? "koinonia-document-link employee" : "koinonia-document-link"}
                  href={document.downloadHref}
                >
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

function WorkspaceTimeline({
  events,
  isEmployee
}: {
  events: PortalWorkspaceEventItem[];
  isEmployee: boolean;
}) {
  return (
    <section className="koinonia-workspace-panel" aria-labelledby="client-work-history">
      <div className="koinonia-workspace-panel-heading">
        <p className="koinonia-eyebrow">History</p>
        <h2 id="client-work-history">Work Timeline</h2>
      </div>

      <div className="koinonia-workspace-timeline">
        {events.map((event) => (
          <article className={isEmployee ? "employee" : undefined} key={event.id}>
            <span>{event.label}</span>
            <strong>{event.summary}</strong>
            <p>{event.time}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

async function getClientWorkWorkspace(
  workspaceId: string,
  userId: string,
  workItemId: string
): Promise<ClientWorkWorkspaceView | null> {
  try {
    const workItem = await prisma.rosObject.findFirst({
      where: {
        id: workItemId,
        workspaceId,
        objectType: {
          in: [...clientPortalWorkObjectTypes]
        },
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      }
    });

    if (!workItem) {
      return null;
    }

    const [documents, events] = await Promise.all([
      prisma.document.findMany({
        where: {
          workspaceId,
          relatedObjectId: workItem.id,
          archivedAt: null,
          accessLevel: {
            in: ["client", "client_and_staff"]
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 25
      }),
      prisma.timelineEvent.findMany({
        where: {
          workspaceId,
          objectId: workItem.id
        },
        orderBy: { createdAt: "desc" },
        take: 30
      })
    ]);

    return {
      documents: withWorkspaceDocuments(
        buildPortalWorkspaceDocuments(documents, {
          downloadBasePath: "/api/portal/documents",
          storageReady: isDocumentStorageConfigured()
        })
      ),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      summary: buildPortalWorkspaceSummary(workItem)
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      documents: buildEmptyPortalWorkspaceDocuments(),
      events: buildEmptyPortalWorkspaceTimeline(),
      notice:
        "Work detail storage is not reachable in this preview, so live status, documents, and history cannot be shown yet.",
      summary: buildUnavailableWorkspaceSummary(workItemId)
    };
  }
}

function withWorkspaceDocuments(
  documents: PortalWorkspaceDocumentItem[]
): PortalWorkspaceDocumentItem[] {
  return documents.length ? documents : buildEmptyPortalWorkspaceDocuments();
}

function withWorkspaceEvents(events: PortalWorkspaceEventItem[]): PortalWorkspaceEventItem[] {
  return events.length ? events : buildEmptyPortalWorkspaceTimeline();
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
    nextAction: "Connect production database storage before using live work detail pages.",
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
