import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "../../../../components/site";
import { requirePortalPermission } from "../../../../lib/portal-auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Transaction | Koinonia", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function ClientTransactionWorkspace({ params }: Props) {
  const { id } = await params;
  const actor = await requirePortalPermission("client-portal:view", `/client/work/${id}`);
  const transaction = await prisma.rosObject.findFirst({
    where: {
      id,
      workspaceId: actor.workspaceId,
      objectType: "Transaction",
      archivedAt: null,
      OR: actor.role === "Client" ? [{ clientUserId: actor.id }, { ownerId: actor.id }] : undefined
    }
  });
  if (!transaction) notFound();

  const documents = await prisma.document.findMany({
    where: { workspaceId: actor.workspaceId, relatedObjectId: transaction.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 8
  });
  const data = asRecord(transaction.data) ?? {};
  const confirmed = asRecord(data.confirmedExtraction);
  const extraction = asRecord(data.extraction);
  const proposal = asRecord(extraction?.proposal);
  const propertyAddress = firstString(confirmed?.propertyAddress, data.propertyAddress, proposal?.propertyAddress, stripTransactionSuffix(transaction.name));
  const clientName = firstString(confirmed?.clientName, data.clientName, formatClientNames(confirmed?.clientNames), formatClientNames(proposal?.clientNames));
  const closingDate = firstString(confirmed?.closingDate, data.closingDate, proposal?.closingDate);
  const side = data.side === "seller" ? "Seller" : "Buyer";

  return (
    <main className="koinonia-site koinonia-client-workspace-detail">
      <Header />
      <section className="koinonia-section koinonia-client-workspace-hero">
        <div className="koinonia-container">
          <a className="koinonia-client-back-link" href="/client/dashboard">← Transactions</a>
          <div className="koinonia-client-workspace-title-row">
            <div>
              <p className="koinonia-client-transaction-kicker">{side} transaction</p>
              <h1>{propertyAddress || transaction.name}</h1>
              <p>{clientName || "Client details pending"}</p>
            </div>
            <a className="koinonia-button primary" href={`/client/documents?relatedObjectId=${encodeURIComponent(transaction.id)}#employee-document-upload`}>Send document</a>
          </div>

          <div className="koinonia-client-workspace-facts">
            <span><small>Status</small><strong>{humanizeStatus(transaction.status)}</strong></span>
            <span><small>Closing</small><strong>{closingDate ? formatDate(closingDate) : "Pending"}</strong></span>
            <span><small>Koinonia</small><strong>{needsAttention(transaction.status, transaction.health) ? "Needs you" : "Moving"}</strong></span>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container koinonia-client-workspace-grid">
          <section className="koinonia-client-workspace-section">
            <div className="koinonia-client-workspace-section-heading">
              <div><p className="koinonia-client-transaction-kicker">Koinonia overview</p><h2>What happens next</h2></div>
            </div>
            <p className="koinonia-client-workspace-next-action">{transaction.nextAction || "Koinonia is managing the active file. Nothing is needed from you right now."}</p>
          </section>

          <section className="koinonia-client-workspace-section" id="documents">
            <div className="koinonia-client-workspace-section-heading">
              <div><p className="koinonia-client-transaction-kicker">Files</p><h2>Current documents</h2></div>
              <a href={`/client/documents?relatedObjectId=${encodeURIComponent(transaction.id)}#employee-document-upload`}>Send another</a>
            </div>
            {documents.length ? (
              <div className="koinonia-client-workspace-document-list">
                {documents.map((document) => (
                  <article key={document.id}>
                    <div><strong>{document.documentType}</strong><span>{document.fileName}</span></div>
                    <div><strong>{document.status}</strong><span>{formatDateTime(document.createdAt)}</span></div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="koinonia-client-workspace-empty">No documents have been sent through the portal for this file yet.</p>
            )}
          </section>

          <details className="koinonia-client-workspace-details">
            <summary>Activity and file details</summary>
            <p>Koinonia keeps the operational detail backstage. Additional history and document review tools will appear here only when they help you make a decision.</p>
          </details>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function firstString(...values: unknown[]): string { for (const value of values) if (typeof value === "string" && value.trim()) return value.trim(); return ""; }
function formatClientNames(value: unknown): string { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).join(" & ") : ""; }
function stripTransactionSuffix(value: string): string { return value.replace(/\s+—\s+(Buyer|Seller)$/i, "").trim(); }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date); }
function formatDateTime(value: Date): string { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(value); }
function humanizeStatus(value: string): string { const normalized=value.toLocaleLowerCase("en-US"); if(normalized.includes("closed")||normalized.includes("complete"))return"Closed"; if(normalized.includes("processing")||normalized.includes("intake"))return"Koinonia is setting it up"; if(normalized.includes("waiting")||normalized.includes("needs")||normalized.includes("review"))return"In progress"; return value; }
function needsAttention(status: string, health: string): boolean { const normalized=status.toLocaleLowerCase("en-US"); return health === "Attention" || normalized.includes("waiting") || normalized.includes("needs") || normalized.includes("review") || normalized.includes("wrong document"); }
