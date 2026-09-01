import type { Metadata } from "next";
import { TransactionDocumentPackageIntake } from "../../../../components/client/TransactionDocumentPackageIntake";
import { Footer, Header } from "../../../../components/site";
import { absoluteUrl } from "../../../../config/seo.config";
import { requirePortalPermission } from "../../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a File | Koinonia",
  description: "Start a real-estate transaction by sending Koinonia the documents you already have.",
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
    <main className="koinonia-site koinonia-client-dashboard koinonia-client-new-transaction">
      <Header
        canAccessClientPortal={actor.permissions.includes("client-portal:view")}
        canAccessEmployeePortal={actor.permissions.includes("employee-portal:view")}
      />

      <section className="koinonia-section koinonia-client-dashboard-hero koinonia-client-new-file-hero">
        <div className="koinonia-container">
          <a className="koinonia-client-back-link" href="/client/dashboard">← Transactions</a>
          <div className="koinonia-client-new-file-copy">
            <p className="koinonia-client-transaction-kicker">Start a file</p>
            <h1>Send us what you have.</h1>
            <p>
              Drop in the contract, listing agreement, disclosure, addendum, or whatever you have right now.
              You do not need to organize or rename anything. Koinonia will build the file from there.
            </p>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-client-new-file-body">
        <div className="koinonia-container">
          <TransactionDocumentPackageIntake />
        </div>
      </section>

      <Footer />
    </main>
  );
}
