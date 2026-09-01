import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "../../../../config/seo.config";
import { ClientDocumentReviewCard } from "../../../../components/client/ClientDocumentReviewCard";
import { Footer, Header } from "../../../../components/site";
import { prisma } from "../../../../lib/db";
import { isPortalDocumentR2Configured } from "../../../../lib/portal-document-r2";
import {
  getPortalDocumentLifecycleState,
  groupPortalDocumentVersions
} from "../../../../lib/portal-documents";
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

  const displayTitle = getCompactTransactionTitle(workspace.summary.title);

  return (
    <main className="koinonia-site koinonia-workspace-detail koinonia-client-workspace-detail">
      <Header />

      <section className="koinonia-section koinonia-workspace-hero koinonia-client-transaction-hero">
        <div className="koinonia-container">
          <div className="koinonia-client-transaction-toolbar">
            <a className="koinonia-client-back-link" href="/client/dashboard">
              ← Transactions
            </a>

            <div className="koinonia-client-transaction-actions">
              <a className="koinonia-button primary koinonia-client-send-document" href="/client/documents">
                Send document
              </a>
              <details className="koinonia-client-more-menu">
                <summary aria-label="More transaction options">More</summary>
                <div className="koinonia-client-more-menu-popover">
                  <a href="#overview">Overview</a>
                  {workspace.reviewDocuments.length ? <a href="#review">Needs your review</a> : null}
                  <a href="#documents">Files Koinonia has</a>
                  <a href="#timeline">Activity</a>
                  <a href="/client/documents">Document Center</a>
                </div>
              </details>
            </div>
          </div>

          <div className="koinonia-client-transaction-heading">
            <div>
              <p className="koinonia-client-transaction-kicker">Koinonia Transaction</p>
              <h1 className="koinonia-client-transaction-title">{displayTitle}</h1>
              <div className="koinonia-client-transaction-context" aria-label="Transaction status">
                <span>{workspace.summary.status}</span>
                <span aria-hidden="true">·</span>
                <strong>{workspace.summary.health}</strong>
                {workspace.summary.due ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{workspace.summary.due}</span>
                  </>
                ) : null}
              </div>
            </div>

            {workspace.reviewDocuments.length ? (
              <a className="koinonia-client-review-indicator" href="#review">
                <span>{workspace.reviewDocuments.length}</span>
                {workspace.reviewDocuments.length === 1 ? "review needed" : "reviews needed"}
              </a>
            ) : (
              <span className="koinonia-client-on-track-indicator">Koinonia has it</span>
            )}
          </div>

          {workspace.notice ? (
            <p className="koinonia-client-security-note">{workspace.notice}</p>
          ) : null}
        </div>
      </section>

      <section className="koinonia-section koinonia-client-workspace-body">
        <div className="koinonia-container">
          <div className="koinonia-workspace-main-stack">
            <section
              id="overview"
              className="koinonia-workspace-panel koinonia-workspace-overview-panel koinonia-client-overview-panel"
              aria-labelledby="client-work-overview"
            >
              <div className="koinonia-workspace-panel-heading">
                <div>
                  <p className="koinonia-eyebrow">Koinonia Overview</p>
                  <h2 id="client-work-overview">
                    {workspace.reviewDocuments.length
                      ? "We need a quick review from you"
                      : "Everything is moving forward"}
                  </h2>
                </div>
                <p>Updated {workspace.summary.updated}</p>
              </div>

              <div className="koinonia-workspace-next-action koinonia-client-status-message">
                <span>{workspace.reviewDocuments.length ? "Needed from you" : "Right now"}</span>
                <strong>
                  {workspace.reviewDocuments.length
                    ? `${workspace.reviewDocuments.length} ${workspace.reviewDocuments.length === 1 ? "document needs" : "documents need"} your accuracy review.`
                    : "Nothing is needed from you right now. Koinonia is managing the file."}
                </strong>
              </div>

              <div className="koinonia-workspace-meta-grid koinonia-client-meta-grid">
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
          Send another
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
          accessLevel: {
            in: ["client", "client_and_staff"]
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 50
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

    const activeDocuments = documents.filter(
      (document) => !document.removedAt && getPortalDocumentLifecycleState(document) === "active"
    );
    const versionGroups = groupPortalDocumentVersions(
      activeDocuments.map((document) => ({
        ...document,
        lifecycleState: getPortalDocumentLifecycleState(document)
      }))
    );
    const reviewDocuments = versionGroups
      .map((group) => group.current)
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
        buildPortalWorkspaceDocuments(documents, {
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

function getCompactTransactionTitle(title: string): string {
  const compact = title
    .replace(/\s+[—-]\s+Transaction Intake$/i, "")
    .replace(/\s+[—-]\s+Transaction$/i, "")
    .replace(/^Transaction\s+[—-]\s+/i, "")
    .trim();

  return compact || "Transaction";
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
