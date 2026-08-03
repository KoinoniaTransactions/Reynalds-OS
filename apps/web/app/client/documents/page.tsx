import type { Metadata } from "next";
import type { Document as PortalDocumentRecord } from "@reynalds-os/database";
import { absoluteUrl } from "../../../config/seo.config";
import { PortalDocumentApprovalForm } from "../../../components/client/PortalDocumentApprovalForm";
import { PortalDocumentRemoveForm } from "../../../components/client/PortalDocumentRemoveForm";
import { PortalDocumentUploadForm } from "../../../components/client/PortalDocumentUploadForm";
import { Footer, Header } from "../../../components/site";
import { isPortalDocumentR2Configured, isPortalDocumentR2UploadEnabled } from "../../../lib/portal-document-r2";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";
import {
  formatDocumentFileSize,
  getDocumentSubmittedLabel,
  getHumanDocumentStatus,
  getPortalDocumentVersionLabel,
  groupPortalDocumentVersions,
  type PortalDocumentLifecycleState
} from "../../../lib/portal-documents";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Document Center Preview",
  description:
    "Preview of the Koinonia client document center for uploads, draft review, approvals, sending status, and final archive.",
  alternates: {
    canonical: absoluteUrl("/client/documents")
  },
  robots: {
    index: false,
    follow: false
  }
};

const documentSummary = [
  {
    label: "Documents Needed",
    value: "4",
    body: "Files or missing details Koinonia needs before the transaction can move forward."
  },
  {
    label: "Ready for Review",
    value: "2",
    body: "Prepared drafts waiting for Realtor review, approval, or revision notes."
  },
  {
    label: "Signature Status",
    value: "1",
    body: "A package has been sent and is waiting on signatures or delivery confirmation."
  },
  {
    label: "Archived",
    value: "9",
    body: "Completed, signed, or final documents saved to the transaction file."
  }
] as const;

const documentRequests = [
  {
    documentType: "Seller Property Disclosure",
    title: "Seller Property Disclosure",
    transaction: "Smith Contract-to-Close",
    status: "Requested",
    due: "Today",
    action: "Upload disclosure or note when it will be available."
  },
  {
    title: "Inspection Objection Instructions",
    transaction: "Smith Contract-to-Close",
    status: "Missing Terms",
    due: "Tomorrow",
    action: "Confirm requested repairs, credit amount, or no objection."
  },
  {
    documentType: "Lender Contact Sheet",
    title: "Lender Contact Sheet",
    transaction: "Buyer Offer Package",
    status: "Needed",
    due: "Before draft",
    action: "Provide lender name, email, and phone for the file."
  }
] as const;

type ClientDocumentItem = {
  approvalReady: boolean;
  createdAt: Date | string;
  detail: string;
  documentType: string;
  downloadHref?: string;
  fileName: string;
  id: string;
  lifecycleState: PortalDocumentLifecycleState;
  previousDocumentId?: string | null;
  status: string;
  submitted: string;
  supersededByDocumentId?: string | null;
  title: string;
  versionLabel: string;
  versionNumber: number;
  workflowStatus: string;
};

type ClientDocumentGroup = {
  current: ClientDocumentItem;
  versions: ClientDocumentItem[];
};

type ClientDocumentView = {
  approvalRequests: ClientDocumentItem[];
  documentGroups: ClientDocumentGroup[];
  documents: ClientDocumentItem[];
  isLiveData: boolean;
  notice?: string;
  uploadReady: boolean;
};

const sampleUploadedDocuments: ClientDocumentItem[] = [
  {
    createdAt: "2026-08-03T10:00:00.000Z",
    id: "sample-seller-disclosure",
    lifecycleState: "active",
    previousDocumentId: null,
    supersededByDocumentId: null,
    documentType: "Seller Property Disclosure",
    title: "Seller Property Disclosure",
    status: "Uploaded",
    detail: "Sample upload waiting for Koinonia review.",
    fileName: "seller-disclosure.pdf",
    submitted: "Today",
    versionLabel: "v1",
    versionNumber: 1,
    workflowStatus: "Uploaded",
    approvalReady: false
  },
  {
    createdAt: "2026-08-02T10:00:00.000Z",
    id: "sample-lender-contact",
    lifecycleState: "active",
    previousDocumentId: null,
    supersededByDocumentId: null,
    documentType: "Lender Contact Sheet",
    title: "Lender Contact Sheet",
    status: "In Review",
    detail: "Sample document tied to buyer offer preparation.",
    fileName: "lender-contact-sheet.pdf",
    submitted: "Yesterday",
    versionLabel: "v1",
    versionNumber: 1,
    workflowStatus: "In Review",
    approvalReady: false
  }
];

const sampleApprovalQueue: ClientDocumentItem[] = [
  {
    approvalReady: true,
    fileName: "buyer-offer-package-v2.pdf",
    createdAt: "2026-08-03T09:00:00.000Z",
    id: "sample-buyer-offer-package",
    lifecycleState: "active",
    previousDocumentId: null,
    supersededByDocumentId: null,
    documentType: "Buyer Offer Package",
    title: "Buyer Offer Package v2",
    status: "Ready for Review",
    detail: "Review price, concessions, financing terms, and closing date before approval.",
    submitted: "Client action",
    versionLabel: "v1",
    versionNumber: 1,
    workflowStatus: "Ready for Client Review"
  },
  {
    approvalReady: false,
    fileName: "inspection-resolution-draft-v1.pdf",
    createdAt: "2026-08-02T09:00:00.000Z",
    id: "sample-inspection-resolution",
    lifecycleState: "active",
    previousDocumentId: null,
    supersededByDocumentId: null,
    documentType: "Inspection Resolution Draft",
    title: "Inspection Resolution Draft v1",
    status: "Revision Requested",
    detail: "Koinonia is updating the draft from your requested repair language.",
    submitted: "Client action",
    versionLabel: "v1",
    versionNumber: 1,
    workflowStatus: "Revision Requested"
  },
  {
    approvalReady: false,
    fileName: "post-closing-archive-packet.pdf",
    createdAt: "2026-08-01T09:00:00.000Z",
    id: "sample-archive-packet",
    lifecycleState: "active",
    previousDocumentId: null,
    supersededByDocumentId: null,
    documentType: "Post-Closing Archive Packet",
    title: "Post-Closing Archive Packet",
    status: "Archived",
    detail: "Final signed documents are available for download.",
    submitted: "Client action",
    versionLabel: "v1",
    versionNumber: 1,
    workflowStatus: "Archived"
  }
];

const sendStatus = [
  {
    packageName: "Buyer Offer Signature Package",
    status: "Waiting on Realtor Approval",
    detail: "Cannot be sent until final Realtor approval is recorded."
  },
  {
    packageName: "Inspection Resolution",
    status: "Sent for Signature",
    detail: "Signature package is pending completion."
  },
  {
    packageName: "Closing File Archive",
    status: "Delivered",
    detail: "Final archive copy has been delivered and saved."
  }
] as const;

const clientTools = [
  "Upload requested files",
  "Review prepared drafts",
  "Approve or request revisions",
  "Confirm missing terms",
  "Track sent and signature status",
  "Download final archive"
] as const;

export default async function ClientDocumentCenterPreviewPage() {
  const actor = await requirePortalPermission("client-portal:documents:view", "/client/documents");
  const documentView = await getClientDocumentView(actor.workspaceId, actor.id);

  return (
    <main className="koinonia-site koinonia-document-center koinonia-client-documents">
      <Header />

      <section className="koinonia-section koinonia-document-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Client Document Center Preview</p>

            <h1 className="koinonia-title">
              Review, approve, and track transaction documents in one place.
            </h1>

            <p className="koinonia-lead">
              Document intake can use protected upload storage when the
              production database, storage location, and malware scanner are
              configured. Draft editing, send packages, and final archive
              delivery still need their own production passes.
            </p>
          </div>

          <div className="koinonia-document-summary-grid">
            {documentSummary.map((card) => (
              <article className="koinonia-document-summary-card" key={card.label}>
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
          <div className="koinonia-document-layout">
            <div className="koinonia-document-main-stack">
              <section className="koinonia-document-panel" aria-labelledby="documents-needed-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Needed</p>
                  <h2 id="documents-needed-title">Documents and Terms Needed</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {documentRequests.map((request) => (
                    <article className="koinonia-document-work-item" key={request.title}>
                      <div>
                        <span>{request.transaction}</span>
                        <h3>{request.title}</h3>
                        <p>{request.action}</p>
                      </div>

                      <div className="koinonia-document-work-meta">
                        <strong>{request.status}</strong>
                        <span>{request.due}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-document-panel" aria-labelledby="approval-queue-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Review</p>
                  <h2 id="approval-queue-title">Drafts and Approval Requests</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {documentView.approvalRequests.length ? (
                    documentView.approvalRequests.map((item) => (
                      <article className="koinonia-document-work-item" key={item.title}>
                        <div>
                          <span>{item.fileName}</span>
                          <h3>{item.title}</h3>
                          <p>{item.detail}</p>
                          {item.downloadHref ? (
                            <a className="koinonia-document-link" href={item.downloadHref}>
                              Download File
                            </a>
                          ) : null}
                        </div>

                        <div className="koinonia-document-work-meta">
                          <strong>{item.status}</strong>
                          <span>{item.submitted}</span>
                        </div>

                        {item.approvalReady ? (
                          <PortalDocumentApprovalForm
                            disabled={!documentView.isLiveData}
                            documentId={item.id}
                          />
                        ) : null}
                      </article>
                    ))
                  ) : (
                    <p className="koinonia-document-security-note">
                      No documents are waiting for client approval right now.
                    </p>
                  )}
                </div>
              </section>

              <section className="koinonia-document-panel" aria-labelledby="recent-uploads-title">
                <div className="koinonia-document-panel-heading">
                  <p className="koinonia-eyebrow">Uploads</p>
                  <h2 id="recent-uploads-title">Recent Uploads</h2>
                </div>

                <div className="koinonia-document-card-list">
                  {documentView.notice ? (
                    <p className="koinonia-document-security-note">{documentView.notice}</p>
                  ) : null}

                  {documentView.documents.length ? (
                    documentView.documents.map((item) => (
                      <article className="koinonia-document-work-item" key={item.id}>
                        <div>
                          <span>{item.fileName}</span>
                          <h3>{item.title}</h3>
                          <p>{item.detail}</p>
                          {item.downloadHref ? (
                            <a className="koinonia-document-link" href={item.downloadHref}>
                              Download File
                            </a>
                          ) : null}

                          <PortalDocumentRemoveForm
                            disabled={!documentView.isLiveData}
                            documentId={item.id}
                            documentName={item.title}
                          />
                        </div>

                        <div className="koinonia-document-work-meta">
                          <strong>{item.status}</strong>
                          <span>{item.submitted}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="koinonia-document-security-note">
                      No documents have been uploaded through the portal yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="koinonia-document-side-panel" aria-label="Document actions">
              <PortalDocumentUploadForm
                storageReady={documentView.isLiveData && documentView.uploadReady}
              />

              <section className="koinonia-document-panel">
                <p className="koinonia-eyebrow">Client Tools</p>
                <ul className="koinonia-document-tool-list">
                  {clientTools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-document-panel">
                <p className="koinonia-eyebrow">Sending Status</p>
                <div className="koinonia-document-status-list">
                  {sendStatus.map((item) => (
                    <article key={item.packageName}>
                      <span>{item.status}</span>
                      <strong>{item.packageName}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-document-panel koinonia-document-boundary-card">
                <p className="koinonia-eyebrow">Approval Boundary</p>
                <p>
                  Koinonia prepares documents from Realtor instructions. Final
                  approval, advice, negotiation decisions, and brokerage
                  compliance remain with the Realtor and their brokerage.
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

async function getClientDocumentView(
  workspaceId: string,
  ownerId: string
): Promise<ClientDocumentView> {
  try {
    const downloadReady = isDocumentStorageConfigured();
    const documents = await prisma.document.findMany({
      where: {
        workspaceId,
        ownerId,
        archivedAt: null,
        removedAt: null,
        lifecycleState: {
          in: ["active", "superseded"]
        }
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 100
    });

    const documentItems = documents.map((document) =>
      mapDocumentRecord(document, downloadReady)
    );
    const documentGroups = groupPortalDocumentVersions(documentItems);
    const currentDocuments = documentGroups.map((group) => group.current);

    return {
      approvalRequests: buildClientApprovalRequests(currentDocuments),
      documentGroups,
      documents: currentDocuments,
      isLiveData: true,
      uploadReady: isDocumentUploadConfigured()
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        approvalRequests: sampleApprovalQueue,
        documentGroups: groupPortalDocumentVersions(sampleUploadedDocuments),
        documents: sampleUploadedDocuments,
        isLiveData: false,
        notice: "Document storage is not reachable in this preview, so sample uploads are shown.",
        uploadReady: false
      };
    }

    throw error;
  }
}

function mapDocumentRecord(
  document: PortalDocumentRecord,
  storageReady: boolean
): ClientDocumentItem {
  const fileSize = formatDocumentFileSize(document.fileSizeBytes);

  return {
    approvalReady: document.status === "Ready for Client Review",
    createdAt: document.createdAt,
    documentType: document.documentType,
    id: document.id,
    lifecycleState: document.lifecycleState as PortalDocumentLifecycleState,
    previousDocumentId: document.previousDocumentId,
    title: document.documentType,
    status: getHumanDocumentStatus(document.status),
    detail: document.requestedAction ?? "Koinonia can review this uploaded document.",
    downloadHref:
      storageReady && document.storageKey
        ? `/api/portal/documents/${document.id}/download`
        : undefined,
    fileName: `${document.fileName} - ${fileSize}`,
    submitted: getDocumentSubmittedLabel(document.createdAt),
    supersededByDocumentId: document.supersededByDocumentId,
    versionLabel: getPortalDocumentVersionLabel(
      document.versionNumber,
      document.versionLabel
    ),
    versionNumber: document.versionNumber,
    workflowStatus: document.status
  };
}

function buildClientApprovalRequests(documents: ClientDocumentItem[]): ClientDocumentItem[] {
  const clientReviewStatuses = new Set([
    "Ready for Client Review",
    "Revision Requested",
    "Approved",
    "Sent",
    "Archived"
  ]);

  return documents
    .filter((document) => clientReviewStatuses.has(document.workflowStatus))
    .slice(0, 10);
}

function isDocumentStorageConfigured(): boolean {
  return isPortalDocumentR2Configured();
}

function isDocumentUploadConfigured(): boolean {
  return isPortalDocumentR2UploadEnabled();
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
