import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";
import { prisma } from "../../../lib/db";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document Queue | Koinonia Staff",
  description: "Koinonia staff document intake queue.",
  alternates: { canonical: absoluteUrl("/employee/documents") },
  robots: { index: false, follow: false }
};

export default async function EmployeeDocumentsPage() {
  const actor = await requirePortalPermission("document-workspace:view", "/employee/documents");
  const documents = await prisma.document.findMany({
    where: {
      workspaceId: actor.workspaceId,
      archivedAt: null,
      lifecycleState: { in: ["active", "superseded", "removed"] }
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 100
  });

  const transactionIds = [...new Set(documents.map((document) => document.relatedObjectId).filter((id): id is string => Boolean(id)))];
  const transactions = transactionIds.length
    ? await prisma.rosObject.findMany({
        where: { id: { in: transactionIds }, workspaceId: actor.workspaceId },
        select: { id: true, name: true, status: true }
      })
    : [];
  const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));

  const activeDocuments = documents.filter((document) => document.lifecycleState === "active");
  const needsReview = activeDocuments.filter((document) => ["Uploaded", "In Review", "Revision Requested"].includes(document.status));
  const ready = activeDocuments.filter((document) => ["Approved", "Ready for Client Review", "Sent"].includes(document.status));

  return (
    <main className="koinonia-site koinonia-staff-documents">
      <Header />
      <section className="koinonia-section koinonia-staff-documents-hero">
        <div className="koinonia-container">
          <p className="koinonia-client-transaction-kicker">Koinonia staff</p>
          <div className="koinonia-staff-documents-heading">
            <div>
              <h1>Document intake</h1>
              <p>Everything Realtors send lands here for Koinonia to identify, review, file, and move forward.</p>
            </div>
            <a className="koinonia-staff-documents-link" href="/client/dashboard">Client portal</a>
          </div>

          <div className="koinonia-staff-documents-summary" aria-label="Document queue summary">
            <div><strong>{activeDocuments.length}</strong><span>Active documents</span></div>
            <div><strong>{needsReview.length}</strong><span>Needs staff review</span></div>
            <div><strong>{ready.length}</strong><span>Review complete / moving</span></div>
            <div><strong>{transactionIds.length}</strong><span>Files represented</span></div>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-staff-documents-body">
        <div className="koinonia-container">
          <div className="koinonia-staff-documents-bar">
            <div>
              <h2>Incoming queue</h2>
              <p>Newest activity first. Removed and superseded versions stay visible for audit context.</p>
            </div>
            <span>{documents.length} shown</span>
          </div>

          {documents.length ? (
            <div className="koinonia-staff-document-table" role="table" aria-label="Incoming documents">
              <div className="koinonia-staff-document-row koinonia-staff-document-head" role="row">
                <span>Document</span><span>Transaction</span><span>Status</span><span>Received</span>
              </div>
              {documents.map((document) => {
                const transaction = document.relatedObjectId ? transactionById.get(document.relatedObjectId) : undefined;
                return (
                  <article className="koinonia-staff-document-row" role="row" key={document.id}>
                    <div className="koinonia-staff-document-primary">
                      <strong>{document.documentType}</strong>
                      <span>{document.fileName}</span>
                      {document.requestedAction ? <small>{document.requestedAction}</small> : null}
                    </div>
                    <div>
                      <strong>{transaction?.name ?? "Unassigned transaction"}</strong>
                      <span>{transaction?.status ?? (document.relatedObjectId ? "Transaction" : "Needs assignment")}</span>
                    </div>
                    <div>
                      <span className={`koinonia-staff-status ${document.lifecycleState !== "active" ? "muted" : ""}`}>{document.lifecycleState === "active" ? document.status : document.lifecycleState}</span>
                      <small>v{document.versionNumber}</small>
                    </div>
                    <div>
                      <strong>{formatDate(document.createdAt)}</strong>
                      <span>{formatBytes(document.fileSizeBytes)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="koinonia-staff-documents-empty">
              <h2>No documents are waiting.</h2>
              <p>New Realtor uploads will appear here automatically.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

function formatBytes(value: number | null) {
  if (value === null) return "Size unavailable";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
