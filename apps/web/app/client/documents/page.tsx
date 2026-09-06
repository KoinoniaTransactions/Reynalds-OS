import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { PortalDocumentUploadForm } from "../../../components/client/PortalDocumentUploadForm";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { isPortalDocumentR2UploadEnabled } from "../../../lib/portal-document-r2";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send Document | Koinonia",
  description: "Send a transaction document directly to Koinonia.",
  alternates: { canonical: absoluteUrl("/client/documents") },
  robots: { index: false, follow: false }
};

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ClientDocumentsPage({ searchParams }: Props) {
  const actor = await requirePortalPermission("client-portal:documents:view", "/client/documents");
  const params = (await searchParams) ?? {};
  const relatedObjectId = firstParam(params.relatedObjectId);

  const transaction = relatedObjectId
    ? await prisma.rosObject.findFirst({
        where: {
          id: relatedObjectId,
          workspaceId: actor.workspaceId,
          archivedAt: null,
          objectType: "Transaction",
          OR: actor.role === "Client" ? [{ clientUserId: actor.id }, { ownerId: actor.id }] : undefined
        },
        select: { id: true, name: true, status: true }
      })
    : null;

  return (
    <main className="koinonia-site koinonia-client-documents">
      <Header />
      <section className="koinonia-section koinonia-client-document-intake">
        <div className="koinonia-container">
          <a className="koinonia-client-back-link" href="/client/dashboard">← Transactions</a>
          <div className="koinonia-client-document-heading">
            <p className="koinonia-client-transaction-kicker">Document handoff</p>
            <h1>{transaction ? transaction.name : "Send a document"}</h1>
            <p>{transaction ? "Send what you have. Koinonia will identify it, attach it to this file, and take it from here." : "Choose a transaction from your dashboard first so Koinonia can file the document automatically."}</p>
          </div>

          {relatedObjectId && !transaction ? (
            <div className="koinonia-client-security-note">That transaction is not available to this account. Return to your transaction list and choose the file again.</div>
          ) : transaction ? (
            <PortalDocumentUploadForm relatedObjectId={transaction.id} storageReady={isPortalDocumentR2UploadEnabled()} />
          ) : (
            <a className="koinonia-button primary" href="/client/dashboard">Choose a transaction</a>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  const resolved = Array.isArray(value) ? value[0] : value;
  return typeof resolved === "string" && resolved.trim() ? resolved.trim() : undefined;
}
