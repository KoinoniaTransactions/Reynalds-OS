import type { Metadata } from "next";
import type { Document as PortalDocumentRecord } from "@reynalds-os/database";
import { notFound } from "next/navigation";
import { PortalDocumentReplacementForm } from "../../../../components/employee/PortalDocumentReplacementForm";
import { PortalDocumentStatusForm } from "../../../../components/employee/PortalDocumentStatusForm";
import { Footer, Header } from "../../../../components/site";
import { absoluteUrl } from "../../../../config/seo.config";
import { prisma } from "../../../../lib/db";
import { isPortalDocumentR2Configured } from "../../../../lib/portal-document-r2";
import { requirePortalPermission } from "../../../../lib/portal-auth";
import {
  formatDocumentFileSize,
  getDocumentSubmittedLabel,
  getHumanDocumentStatus,
  getNextPortalDocumentVersionNumber,
  getPortalDocumentVersionLabel,
  groupPortalDocumentVersions,
  type PortalDocumentLifecycleState
} from "../../../../lib/portal-documents";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Document Review",
  description:
    "Protected Koinonia employee document review workspace with version history and workflow controls.",
  alternates: {
    canonical: absoluteUrl("/employee/documents")
  },
  robots: {
    index: false,
    follow: false
  }
};

type Params = {
  params: Promise<{ id: string }>;
};

type ReviewDocumentItem = {
  createdAt: Date | string;
  detail: string;
  documentType: string;
  downloadHref?: string;
  fileInfo: string;
  id: string;
  lifecycleState: PortalDocumentLifecycleState;
  previousDocumentId?: string | null;
  removalReason?: string | null;
  removedAt?: Date | string | null;
  requestedAction?: string | null;
  replacementReady: boolean;
  status: string;
  submitted: string;
  supersededByDocumentId?: string | null;
  title: string;
  versionLabel: string;
  versionNumber: number;
  workflowStatus: string;
};

type DocumentReviewView = {
  current: ReviewDocumentItem;
  isLiveData: boolean;
  notice?: string;
  versions: ReviewDocumentItem[];
};

export default async function EmployeeDocumentReviewPage({ params }: Params) {
  const actor = await requirePortalPermission(
    "document-workspace:view",
    "/employee/documents"
  );
  const { id } = await params;
  const review = await getDocumentReview(actor.workspaceId, id);

  if (!review) {
    notFound();
  }

  const current = review.current;
  const historicalVersions = review.versions.filter(
    (version) => version.id !== current.id
  );
  const isCurrentActive =
    current.lifecycleState === "active" &&
    !current.supersededByDocumentId;

  return (
    <main className="koinonia-site koinonia-document-center koinonia-employee-documents">
      <Header
        canAccessClientPortal={actor.permissions.includes("client-portal:view")}
        canAccessEmployeePortal={actor.permissions.includes("employee-portal:view")}
      />

      <section className="koinonia-section koinonia-document-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Employee Document Review</p>
            <h1 className="koinonia-title">{current.title}</h1>
            <p className="koinonia-lead">
              Review the current document, workflow status, and preserved version history.
            </p>
          </div>

          {review.notice ? (
            <p className="koinonia-document-security-note employee">
              {review.notice}
            </p>
          ) : null}

          <div className="koinonia-document-summary-grid">
            <article className="koinonia-document-summary-card employee">
              <span>Current Version</span>
              <strong>{current.versionLabel}</strong>
              <p>{current.fileInfo}</p>
            </article>

            <article className="koinonia-document-summary-card employee">
              <span>Workflow Status</span>
              <strong>
                {current.lifecycleState === "removed"
                  ? "Removed"
                  : current.status}
              </strong>
              <p>{current.detail}</p>
            </article>

            <article className="koinonia-document-summary-card employee">
              <span>Submitted</span>
              <strong>{current.submitted}</strong>
              <p>{historicalVersions.length} prior version(s)</p>
            </article>

            <article className="koinonia-document-summary-card employee">
              <span>Lifecycle</span>
              <strong>{current.lifecycleState}</strong>
              <p>
                {current.removalReason ??
                  "Document remains in the active workflow."}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-document-layout">
            <div className="koinonia-document-main-stack">
              <section className="koinonia-document-panel employee">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Current File</p>
                  <h2>{current.title} {current.versionLabel}</h2>
                </div>

                <article className="koinonia-document-work-item employee">
                  <div>
                    <span>{current.fileInfo}</span>
                    <h3>{current.status}</h3>
                    <p>{current.detail}</p>

                    {current.removalReason ? (
                      <p>Removal reason: {current.removalReason}</p>
                    ) : null}

                    {current.downloadHref ? (
                      <a
                        className="koinonia-document-link employee"
                        href={current.downloadHref}
                      >
                        Download Current Version
                      </a>
                    ) : null}
                  </div>

                  <div className="koinonia-document-work-meta employee">
                    <strong>
                      {current.lifecycleState === "removed"
                        ? "Removed"
                        : current.status}
                    </strong>
                    <span>{current.submitted}</span>
                  </div>
                </article>
              </section>

              <section className="koinonia-document-panel employee">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">History</p>
                  <h2>Version History</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {review.versions.map((version) => (
                    <article
                      className="koinonia-document-work-item employee"
                      key={version.id}
                    >
                      <div>
                        <span>{version.fileInfo}</span>
                        <h3>
                          {version.versionLabel}
                          {version.id === current.id ? " — Current" : ""}
                        </h3>
                        <p>
                          {version.lifecycleState === "superseded"
                            ? "Superseded version"
                            : version.lifecycleState === "removed"
                              ? "Removed from client portal"
                              : version.detail}
                        </p>

                        {version.removalReason ? (
                          <p>Removal reason: {version.removalReason}</p>
                        ) : null}

                        {version.downloadHref ? (
                          <a
                            className="koinonia-document-link employee"
                            href={version.downloadHref}
                          >
                            Download Version
                          </a>
                        ) : null}
                      </div>

                      <div className="koinonia-document-work-meta employee">
                        <strong>{version.status}</strong>
                        <span>{version.submitted}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside
              className="koinonia-document-side-panel"
              aria-label="Document review actions"
            >
              <section className="koinonia-document-panel employee">
                <p className="koinonia-eyebrow">Navigation</p>
                <a
                  className="koinonia-document-link employee"
                  href="/employee/documents"
                >
                  Back to Document Workspace
                </a>
              </section>

              {isCurrentActive ? (
                <>
                  <section className="koinonia-document-panel employee">
                    <p className="koinonia-eyebrow">Workflow</p>
                    <PortalDocumentStatusForm
                      currentRequestedAction={
                        current.requestedAction ?? current.detail
                      }
                      currentStatus={current.workflowStatus}
                      disabled={!review.isLiveData}
                      documentId={current.id}
                    />
                  </section>

                  <section className="koinonia-document-panel employee">
                    <p className="koinonia-eyebrow">Replacement</p>
                    <PortalDocumentReplacementForm
                      disabled={
                        !review.isLiveData ||
                        !current.replacementReady
                      }
                      documentId={current.id}
                      nextVersionLabel={`v${getNextPortalDocumentVersionNumber(
                        current.versionNumber
                      )}`}
                    />
                  </section>
                </>
              ) : (
                <section className="koinonia-document-panel employee">
                  <p className="koinonia-eyebrow">Read Only</p>
                  <p>
                    Workflow and replacement controls are unavailable because
                    this document is {current.lifecycleState}.
                  </p>
                </section>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

async function getDocumentReview(
  workspaceId: string,
  documentId: string
): Promise<DocumentReviewView | null> {
  const selected = await prisma.document.findFirst({
    where: {
      id: documentId,
      workspaceId
    }
  });

  if (!selected) {
    return null;
  }

  const documents = await prisma.document.findMany({
    where: {
      workspaceId,
      ownerId: selected.ownerId,
      documentType: selected.documentType
    },
    orderBy: [{ versionNumber: "desc" }, { createdAt: "desc" }],
    take: 100
  });

  const mapped = documents.map(mapDocumentRecord);
  const groups = groupPortalDocumentVersions(mapped);
  const selectedGroup = groups.find((group) =>
    group.versions.some((version) => version.id === selected.id)
  );

  if (!selectedGroup) {
    return null;
  }

  return {
    current: selectedGroup.current,
    isLiveData: true,
    versions: selectedGroup.versions
  };
}

function mapDocumentRecord(document: PortalDocumentRecord): ReviewDocumentItem {
  const storageReady = isPortalDocumentR2Configured();

  return {
    createdAt: document.createdAt,
    detail:
      document.requestedAction ??
      "Review this document and record the next approved workflow step.",
    documentType: document.documentType,
    downloadHref:
      storageReady && document.storageKey
        ? `/api/portal/documents/${document.id}/download`
        : undefined,
    fileInfo: `${document.fileName} - ${formatDocumentFileSize(
      document.fileSizeBytes
    )}`,
    id: document.id,
    lifecycleState:
      document.lifecycleState as PortalDocumentLifecycleState,
    previousDocumentId: document.previousDocumentId,
    removalReason: document.removalReason,
    removedAt: document.removedAt,
    requestedAction: document.requestedAction,
    replacementReady:
      document.lifecycleState === "active" &&
      !document.supersededByDocumentId &&
      document.status !== "Superseded" &&
      document.status !== "Archived",
    status: getHumanDocumentStatus(document.status),
    submitted: getDocumentSubmittedLabel(document.createdAt),
    supersededByDocumentId: document.supersededByDocumentId,
    title: document.documentType,
    versionLabel: getPortalDocumentVersionLabel(
      document.versionNumber,
      document.versionLabel
    ),
    versionNumber: document.versionNumber,
    workflowStatus: document.status
  };
}
