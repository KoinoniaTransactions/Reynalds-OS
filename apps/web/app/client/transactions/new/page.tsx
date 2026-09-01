import type { Metadata } from "next";
import { TransactionIntakeStart } from "../../../../components/client/TransactionIntakeStart";
import { Footer, Header } from "../../../../components/site";
import { absoluteUrl } from "../../../../config/seo.config";
import { requirePortalPermission } from "../../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a New File | Koinonia",
  description: "Start a buyer or seller transaction with Koinonia.",
  alternates: {
    canonical: absoluteUrl("/client/transactions/new")
  },
  robots: {
    index: false,
    follow: false
  }
};

export default async function NewClientTransactionPage() {
  const actor = await requirePortalPermission(
    "client-portal:transactions:create",
    "/client/transactions/new"
  );

  return (
    <main className="koinonia-site koinonia-client-dashboard">
      <Header
        canAccessClientPortal={actor.permissions.includes("client-portal:view")}
        canAccessEmployeePortal={actor.permissions.includes("employee-portal:view")}
      />

      <section className="koinonia-section koinonia-client-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">New Transaction</p>
            <h1 className="koinonia-title">Start a new file.</h1>
            <p className="koinonia-lead">
              Tell Koinonia which side you represent, then give us the documents you already have.
              We will use those documents to build the file and only ask for information that is still missing.
            </p>
            <p>
              <a className="koinonia-document-link" href="/client/dashboard">
                ← Back to dashboard
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <TransactionIntakeStart />
        </div>
      </section>

      <Footer />
    </main>
  );
}
