import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "../../../../config/seo.config";
import { ClientDocumentReviewCard } from "../../../../components/client/ClientDocumentReviewCard";
import { Footer, Header } from "../../../../components/site";
import { prisma } from "../../../../lib/db";
import { isPortalDocumentR2Configured } from "../../../../lib/portal-document-r2";
import { groupPortalDocumentVersions } from "../../../../lib/portal-documents";
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
  title: "Transaction",
  description: "Protected Koinonia transaction status, documents, review requests, and activity.",
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

type ClientReviewDocument = {
  id: string;
  documentType: string;
  fileName: string;
  versionNumber: number;
  versionLabel?: string | null;
  requestedAction?: string | null;
};

type ClientWorkWorkspaceView = {
  documents: PortalWorkspaceDocumentItem[];
  events: PortalWorkspaceEventItem[];
  notice?: string;
  reviewDocuments: ClientReviewDocument[];
  summary: PortalWorkspaceSummary;
  transactionId: string;
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
          <a className="koinonia-document-link" href="/client/dashboard">
            ← Back to Dashboard
          </a>

          <div className="koinonia-workspace-transaction-header">
            <div className="koinonia-section-header">
              <p className="koinonia-eyebrow">Koinonia Transaction</p>
              <h1 className="koinonia-title">{workspace.summary.title}</h1>
              <p className="koinonia-lead">{workspace.summary.nextAction}</p>
            </div>

            <div className="koinonia-workspace-health-strip" aria-label="Transaction status">
              <span>{workspace.summary.status}</span>
              <strong>{workspace.summary.health}</strong>
              <span>{workspace.summary.due}</span>
            </div>
          </div>

          {workspace.notice ? (
            <p className="koinonia-client-security-note">{workspace.notice}</p>
          ) : null}

          <nav className="koinonia-workspace-tabs" aria-label="Transaction workspace sections">
            <a href="#overview">Overview</a>
            {workspace.reviewDocuments.length ? <a href="#review">Needs Your Review</a> : null}
            <a href="#documents">Files</a>
            <a href="#timeline">Activity</a>
          </nav>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-workspace-main-stack">
            <section
              id="overview"
              className="koinonia-workspace-panel koinonia-workspace-overview-panel"
              aria-labelledby="client-work-overview"
            >
              <div className="koinonia-workspace-panel-heading">
                <div>
                  <p className="koinonia-eyebrow">Koinonia Overview</p>
                  <h2 id="client-work-overview">
                    {workspace.reviewDocuments.length
                      ? "We need a quick review from you"
                      : "Koinonia has the transaction from here"}
                  </h2>
                </div>
                <p>Updated {workspace.summary.updated}</p>
              </div>

              <div className="koinonia-workspace-next-action">
                <span>{workspace.reviewDocuments.length ? "Needed from you" : "Right now"}</span>
                <strong>
                  {workspace.reviewDocuments.length
                    ? `${workspace.reviewDocuments.length} ${workspace.reviewDocuments.length === 1 ? "document needs" : "documents need"} your accuracy review.`
                    : "Nothing is needed from you right now. Koinonia is managing the file."}
                </strong>
              </div>

              <div className="koinonia-workspace-meta-grid">
                {workspace.summary.meta.slice(0, 4).map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </section>

            {workspace.reviewDocuments.length ? (
              <section
                id="review"
                className="koinonia-workspace-panel"
                aria-labelledby="client-document-review"
              >
                <div className="koinonia-workspace-panel-heading">
                  <div>
                    <p className="koinonia-eyebrow">Needs Your Review</p>
                    <h2 id="client-document-review">A quick accuracy check</h2>
                  </div>
                  <p>Koinonia will handle the next step after you respond.</p>
                </div>

                <div className="koinonia-client-review-stack">
                  {workspace.reviewDocuments.map((document) => (
                    <ClientDocumentReviewCard document={document} key={document.id} />
                  ))}
                </div>
              </section>
            ) : null}

            <WorkspaceDocuments documents={workspace.documents} />
            <WorkspaceTimeline events={workspace.events} />

            <section className="koinonia-workspace-panel koinonia-workspace-boundary-card">
              <p className="koinonia-eyebrow">Send us what you have</p>
              <p>
                You do not need to organize the transaction file for Koinonia. Upload or send documents as you receive them and we will review, classify, and manage the file. If we need something specific from you, we will ask.
              </p>
              <a className="koinonia-document-link" href="/client/documents">
                Send / Upload Documents
              </a>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function WorkspaceDocuments({ documents }: { documents: PortalWorkspaceDocumentItem[] }) {
  return (
    <section id="documents" className="koinonia-workspace-panel" aria-labelledby="client-work-documents">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">Files Koinonia Has</p>
          <h2 id="client-work-documents">Received and filed</h2>
        </div>
        <a className="koinonia-document-link" href="/client/documents">
          Send / Upload Documents
        </a>
      </div>

      <p className="koinonia-client-security-note">
        This is a receipt of what Koinonia has on the file—not a homework list. We will contact you if something else is actually needed.
      </p>

      <div className="koinonia-workspace-list">
        {documents.map((document) => (
          <article className="koinonia-workspace-list-item" key={document.id}>
            <div>
              <span>{document.status}</span>
              <h3>{document.title}</h3>
              <p>{document.detail}</p>
              <p>{document.fileInfo}</p>
              {document.downloadHref ? (
                <a className="koinonia-document-link" href={document.downloadHref}>
                  View file
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
    <section id="timeline" className="koinonia-workspace-panel" aria-labelledby="client-work-history">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">Activity</p>
          <h2 id="client-work-history">What Koinonia has handled</h2>
        </div>
      </div>

      <div className="koinonia-workspace-timeline">
        {events.map((event) => (
          <article key={event.id}>
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
          removedAt: null,
          accessLevel: {
            in: ["client", "client_and_staff"]
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 80
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

    const versionGroups = groupPortalDocumentVersions(documents);
    const currentDocuments = versionGroups
      .map((group) => group.current)
      .filter((document) => document.lifecycleState === "active" && !document.supersededByDocumentId);
    const reviewDocuments = currentDocuments
      .filter((document) => document.status === "Ready for Client Review")
      .map((document) => ({
        id: document.id,
        documentType: document.documentType,
        fileName: document.fileName,
        versionNumber: document.versionNumber,
        versionLabel: document.versionLabel,
        requestedAction: document.requestedAction
      }));

    return {
      documents: withWorkspaceDocuments(
        buildPortalWorkspaceDocuments(currentDocuments, {
          downloadBasePath: "/api/portal/documents",
          storageReady: isDocumentStorageConfigured()
        })
      ),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      reviewDocuments,
      summary: buildPortalWorkspaceSummary(workItem),
      transactionId: workItem.id
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
      reviewDocuments: [],
      summary: buildUnavailableWorkspaceSummary(workItemId),
      transactionId: workItemId
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
    nextAction: "Koinonia will resume transaction management when storage reconnects.",
    status: "Storage Unavailable",
    title: "Transaction temporarily unavailable",
    type: "Transaction",
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
