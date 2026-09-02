import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "../../../../config/seo.config";
import { ClientDocumentReviewCard } from "../../../../components/client/ClientDocumentReviewCard";
import { ClientTransactionAttentionCard } from "../../../../components/client/ClientTransactionAttentionCard";
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
  alternates: { canonical: absoluteUrl("/client/work") },
  robots: { index: false, follow: false }
};

type Params = { params: Promise<{ id: string }> };

type ClientReviewDocument = {
  id: string;
  documentType: string;
  fileName: string;
  versionNumber: number;
  versionLabel?: string | null;
  requestedAction?: string | null;
};

type ClientTransactionAttention = {
  transactionId: string;
  title: string;
  reason: string;
  documentType?: string | null;
  fileName?: string | null;
  kind: "document_mismatch" | "general";
};

type ClientWorkWorkspaceView = {
  attention: ClientTransactionAttention | null;
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

  if (!workspace) notFound();

  const displayTitle = getCompactTransactionTitle(workspace.summary.title);
  const needsAttention = Boolean(workspace.attention || workspace.reviewDocuments.length);

  return (
    <main className="koinonia-site koinonia-workspace-detail koinonia-client-workspace-detail">
      <Header />

      <section className="koinonia-section koinonia-workspace-hero koinonia-client-transaction-hero">
        <div className="koinonia-container">
          <div className="koinonia-client-transaction-toolbar">
            <a className="koinonia-client-back-link" href="/client/dashboard">← Transactions</a>

            <div className="koinonia-client-transaction-actions">
              <a className="koinonia-client-primary-action" href="/client/documents">＋ Send document</a>
              <details className="koinonia-client-more-menu">
                <summary aria-label="More transaction options">•••</summary>
                <div className="koinonia-client-more-menu-popover">
                  <a href="#overview">Overview</a>
                  {needsAttention ? <a href="#attention">Needs your attention</a> : null}
                  <a href="#documents">Files</a>
                  <a href="#timeline">Activity</a>
                  <a href="/client/documents">Document Center</a>
                </div>
              </details>
            </div>
          </div>

          <div className="koinonia-client-transaction-heading">
            <div>
              <p className="koinonia-client-transaction-kicker">Transaction</p>
              <h1 className="koinonia-client-transaction-title">{displayTitle}</h1>
              <div className="koinonia-client-transaction-context" aria-label="Transaction status">
                <span>{workspace.summary.status}</span>
                <span aria-hidden="true">·</span>
                <strong>{workspace.summary.health}</strong>
                {workspace.summary.due ? <><span aria-hidden="true">·</span><span>{workspace.summary.due}</span></> : null}
              </div>
            </div>

            {needsAttention ? (
              <a className="koinonia-client-review-indicator" href="#attention">
                <span>!</span>
                needs you
              </a>
            ) : (
              <span className="koinonia-client-on-track-indicator">✓ Koinonia has it</span>
            )}
          </div>

          {workspace.notice ? <p className="koinonia-client-security-note">{workspace.notice}</p> : null}
        </div>
      </section>

      <section className="koinonia-section koinonia-client-workspace-body">
        <div className="koinonia-container">
          <div className="koinonia-workspace-main-stack">
            <section id="overview" className="koinonia-client-overview-compact" aria-labelledby="client-work-overview">
              <div className="koinonia-client-overview-copy">
                <span className="koinonia-client-section-label">Koinonia overview</span>
                <h2 id="client-work-overview">
                  {needsAttention ? "We need one thing from you" : "Everything is moving forward"}
                </h2>
                <p>
                  {workspace.attention
                    ? workspace.attention.title
                    : workspace.reviewDocuments.length
                      ? `${workspace.reviewDocuments.length} ${workspace.reviewDocuments.length === 1 ? "document needs" : "documents need"} your accuracy review. Koinonia will handle the next step after you respond.`
                      : "Nothing is needed from you right now. Koinonia is managing the file."}
                </p>
              </div>
              <span className="koinonia-client-updated">Updated {workspace.summary.updated}</span>

              <div className="koinonia-client-facts-row">
                {workspace.summary.meta.slice(0, 3).map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {workspace.attention ? (
              <div id="attention">
                <ClientTransactionAttentionCard attention={workspace.attention} />
              </div>
            ) : null}

            {workspace.reviewDocuments.length ? (
              <section id={workspace.attention ? "review" : "attention"} className="koinonia-client-focus-section" aria-labelledby="client-document-review">
                <div className="koinonia-client-section-heading">
                  <div>
                    <span className="koinonia-client-section-label">Needs your review</span>
                    <h2 id="client-document-review">A quick accuracy check</h2>
                  </div>
                  <p>Koinonia continues as soon as you respond.</p>
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function WorkspaceDocuments({ documents }: { documents: PortalWorkspaceDocumentItem[] }) {
  const recentDocuments = documents.slice(0, 5);
  const olderDocuments = documents.slice(5);

  return (
    <section id="documents" className="koinonia-client-secondary-section" aria-labelledby="client-work-documents">
      <div className="koinonia-client-section-heading">
        <div>
          <span className="koinonia-client-section-label">Files</span>
          <h2 id="client-work-documents">Koinonia has these</h2>
        </div>
        <a className="koinonia-client-text-action" href="/client/documents">Send another</a>
      </div>

      <div className="koinonia-client-file-list">
        {recentDocuments.map((document) => <DocumentRow document={document} key={document.id} />)}
      </div>

      {olderDocuments.length ? (
        <details className="koinonia-client-expandable-list">
          <summary>View {olderDocuments.length} more {olderDocuments.length === 1 ? "file" : "files"}</summary>
          <div className="koinonia-client-file-list">
            {olderDocuments.map((document) => <DocumentRow document={document} key={document.id} />)}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function DocumentRow({ document }: { document: PortalWorkspaceDocumentItem }) {
  return (
    <article className="koinonia-client-file-row">
      <div>
        <h3>{document.title}</h3>
        <p>{document.fileInfo || document.detail}</p>
      </div>
      <div className="koinonia-client-file-row-meta">
        <span>{document.status}</span>
        <small>{document.submitted}</small>
        {document.downloadHref ? <a href={document.downloadHref}>View</a> : null}
      </div>
    </article>
  );
}

function WorkspaceTimeline({ events }: { events: PortalWorkspaceEventItem[] }) {
  return (
    <details id="timeline" className="koinonia-client-collapsed-section">
      <summary>
        <span>
          <strong>Activity</strong>
          <small>{events.length} recent {events.length === 1 ? "update" : "updates"}</small>
        </span>
        <span aria-hidden="true">＋</span>
      </summary>
      <div className="koinonia-client-activity-list">
        {events.map((event) => (
          <article key={event.id}>
            <div>
              <strong>{event.summary}</strong>
              <span>{event.label}</span>
            </div>
            <time>{event.time}</time>
          </article>
        ))}
      </div>
    </details>
  );
}

async function getClientWorkWorkspace(workspaceId: string, userId: string, workItemId: string): Promise<ClientWorkWorkspaceView | null> {
  try {
    const workItem = await prisma.rosObject.findFirst({
      where: {
        id: workItemId,
        workspaceId,
        objectType: { in: [...clientPortalWorkObjectTypes] },
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      }
    });

    if (!workItem) return null;

    const [documents, events] = await Promise.all([
      prisma.document.findMany({
        where: {
          workspaceId,
          relatedObjectId: workItem.id,
          archivedAt: null,
          accessLevel: { in: ["client", "client_and_staff"] }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 50
      }),
      prisma.timelineEvent.findMany({
        where: { workspaceId, objectId: workItem.id },
        orderBy: { createdAt: "desc" },
        take: 30
      })
    ]);

    const activeDocuments = documents.filter(
      (document) => !document.removedAt && getPortalDocumentLifecycleState(document) === "active"
    );
    const versionGroups = groupPortalDocumentVersions(
      activeDocuments.map((document) => ({ ...document, lifecycleState: getPortalDocumentLifecycleState(document) }))
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
      attention: buildTransactionAttention(workItem, documents),
      documents: withWorkspaceDocuments(buildPortalWorkspaceDocuments(documents, {
        downloadBasePath: "/api/portal/documents",
        storageReady: isDocumentStorageConfigured()
      })),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      reviewDocuments,
      summary: buildPortalWorkspaceSummary(workItem),
      transactionId: workItem.id
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) throw error;
    return {
      attention: null,
      documents: buildEmptyPortalWorkspaceDocuments(),
      events: buildEmptyPortalWorkspaceTimeline(),
      notice: "Work detail storage is not reachable in this preview, so live status, documents, and history cannot be shown yet.",
      reviewDocuments: [],
      summary: buildUnavailableWorkspaceSummary(workItemId),
      transactionId: workItemId
    };
  }
}

function buildTransactionAttention(
  workItem: { id: string; health: string; nextAction: string | null; data: unknown },
  documents: Array<{ id: string; fileName: string; documentType: string; removedAt: Date | null }>
): ClientTransactionAttention | null {
  if (workItem.health !== "Attention") return null;

  const data = asRecord(workItem.data) ?? {};
  const extraction = asRecord(data.extraction);
  const proposal = asRecord(extraction?.proposal);
  const documentMatch = proposal?.documentMatch;
  const sourceDocumentId = typeof proposal?.sourceDocumentId === "string" ? proposal.sourceDocumentId : null;
  const sourceDocument = sourceDocumentId
    ? documents.find((document) => document.id === sourceDocumentId && !document.removedAt)
    : undefined;

  if (documentMatch === "mismatch") {
    const reason = typeof proposal?.documentMatchReason === "string" && proposal.documentMatchReason.trim()
      ? proposal.documentMatchReason.trim()
      : "Koinonia found information in this upload that does not appear to match the transaction.";
    const identifiedDocumentType = typeof proposal?.identifiedDocumentType === "string"
      ? proposal.identifiedDocumentType
      : sourceDocument?.documentType;

    return {
      transactionId: workItem.id,
      kind: "document_mismatch",
      title: "Koinonia is not sure this document belongs to this transaction.",
      reason,
      documentType: identifiedDocumentType ?? null,
      fileName: sourceDocument?.fileName ?? null
    };
  }

  return {
    transactionId: workItem.id,
    kind: "general",
    title: "Koinonia needs a quick answer before continuing.",
    reason: workItem.nextAction?.trim() || "Open the requested item below and tell Koinonia how to proceed."
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getCompactTransactionTitle(title: string): string {
  const compact = title
    .replace(/\s+[—-]\s+Transaction Intake$/i, "")
    .replace(/\s+[—-]\s+Transaction$/i, "")
    .replace(/^Transaction\s+[—-]\s+/i, "")
    .trim();
  return compact || "Transaction";
}

function withWorkspaceDocuments(documents: PortalWorkspaceDocumentItem[]): PortalWorkspaceDocumentItem[] {
  return documents.length ? documents : buildEmptyPortalWorkspaceDocuments();
}

function withWorkspaceEvents(events: PortalWorkspaceEventItem[]): PortalWorkspaceEventItem[] {
  return events.length ? events : buildEmptyPortalWorkspaceTimeline();
}

function isDocumentStorageConfigured(): boolean { return isPortalDocumentR2Configured(); }

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
  return error instanceof Error && (
    error.name === "PrismaClientInitializationError" ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("ECONNREFUSED")
  );
}
