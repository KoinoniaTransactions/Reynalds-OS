import type { Metadata } from "next";
import { TransactionDocumentPackageIntake } from "../../../../components/client/TransactionDocumentPackageIntake";
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
              Tell Koinonia which side you represent, then upload the transaction documents you already have.
              We will identify them, combine the information across the package, and only ask for details the documents could not answer.
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
          <TransactionDocumentPackageIntake />
        </div>
      </section>

      <Footer />
    </main>
  );
}
