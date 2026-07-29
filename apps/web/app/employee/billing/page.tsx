import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employee Billing Workspace Preview",
  description:
    "Preview of the Koinonia employee billing workspace for customer billing profiles, payment setup, invoices, and pay-at-closing triggers.",
  alternates: {
    canonical: absoluteUrl("/employee/billing")
  },
  robots: {
    index: false,
    follow: false
  }
};

const billingSummary = [
  {
    label: "Setup Needed",
    value: "3",
    body: "Customers need secure payment setup links before billing can run smoothly."
  },
  {
    label: "Prepay Due",
    value: "$778",
    body: "Prepaid coordination invoices due before active work begins."
  },
  {
    label: "Pay-at-Close Watch",
    value: "$1.8k",
    body: "Files that bill only after confirmed successful closing."
  },
  {
    label: "Ready to Process",
    value: "5",
    body: "Invoices or service charges have authorization and payment method readiness."
  }
] as const;

const billingProfiles = [
  {
    client: "Bright Homes Team",
    service: "Transaction Coordination Plus",
    model: "$389 prepaid",
    payment: "Setup Ready",
    status: "Invoice Open",
    nextAction: "Collect prepaid invoice before work begins."
  },
  {
    client: "Wilson Realty Group",
    service: "Realtor Support Plus",
    model: "Custom monthly",
    payment: "Setup Needed",
    status: "Send Setup Link",
    nextAction: "Confirm custom scope and recurring billing consent."
  },
  {
    client: "Northgate Partners",
    service: "Pay-at-Closing Coordination",
    model: "$599 after successful close",
    payment: "Card Ready",
    status: "Closing Watch",
    nextAction: "Charge only after confirmed close."
  },
  {
    client: "Summit Line Realty",
    service: "Licensed Showing Coverage",
    model: "Per showing / custom",
    payment: "Setup Ready",
    status: "Ready to Bill",
    nextAction: "Process approved showing charge after completion."
  }
] as const;

const paymentSetupQueue = [
  {
    client: "Wilson Realty Group",
    reason: "Custom monthly support needs recurring authorization.",
    status: "Setup Link Needed"
  },
  {
    client: "Canyon View Realty",
    reason: "New transaction client selected prepaid coordination.",
    status: "Billing Contact Needed"
  },
  {
    client: "Front Range Homes",
    reason: "Payment method expired before new showing request.",
    status: "Update Required"
  }
] as const;

const payAtCloseWatch = [
  {
    file: "Northgate Closing File",
    closeDate: "Aug 12",
    fee: "$599",
    status: "Pending Close"
  },
  {
    file: "Meadow Creek Buyer File",
    closeDate: "Aug 19",
    fee: "$599",
    status: "Title Confirmation Needed"
  },
  {
    file: "Lakewood Seller File",
    closeDate: "Closed",
    fee: "$599",
    status: "Ready to Invoice"
  }
] as const;

const billingRules = [
  "Use processor-hosted payment setup; do not store card numbers.",
  "Prepaid work should not start until paid or an exception is approved.",
  "Pay-at-closing fees trigger only after successful close.",
  "Recurring billing needs clear consent and billing terms.",
  "Payment method metadata may show brand, last four, expiration, and processor reference only."
] as const;

export default async function EmployeeBillingWorkspacePreviewPage() {
  await requirePortalPermission("billing-workspace:view", "/employee/billing");

  return (
    <main className="koinonia-site koinonia-billing-center koinonia-employee-billing">
      <Header />

      <section className="koinonia-section koinonia-billing-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Employee Billing Workspace Preview</p>

            <h1 className="koinonia-title">
              Billing readiness tied to every customer file and service.
            </h1>

            <p className="koinonia-lead">
              This preview uses sample data only. Real payments should be
              processed through an approved payment processor with tokenized
              payment methods, consent records, and audit logs.
            </p>
          </div>

          <div className="koinonia-billing-summary-grid">
            {billingSummary.map((card) => (
              <article className="koinonia-billing-summary-card employee" key={card.label}>
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
          <div className="koinonia-billing-layout">
            <div className="koinonia-billing-main-stack">
              <section className="koinonia-billing-panel employee" aria-labelledby="billing-profiles-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Customers</p>
                  <h2 id="billing-profiles-title">Billing Profiles</h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {billingProfiles.map((profile) => (
                    <article className="koinonia-billing-work-item employee" key={profile.client}>
                      <div>
                        <span>{profile.model}</span>
                        <h3>{profile.client}</h3>
                        <p>{profile.service}</p>
                        <p>{profile.nextAction}</p>
                      </div>

                      <div className="koinonia-billing-work-meta employee">
                        <strong>{profile.status}</strong>
                        <span>{profile.payment}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-billing-panel employee" aria-labelledby="pay-at-close-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Pay at Close</p>
                  <h2 id="pay-at-close-title">Closing Billing Watch</h2>
                </div>

                <div className="koinonia-billing-table-wrap">
                  <table className="koinonia-billing-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Close Date</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payAtCloseWatch.map((item) => (
                        <tr key={item.file}>
                          <td>{item.file}</td>
                          <td>{item.closeDate}</td>
                          <td>{item.fee}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="koinonia-billing-side-panel" aria-label="Billing operations">
              <section className="koinonia-billing-panel employee">
                <p className="koinonia-eyebrow">Setup Queue</p>
                <div className="koinonia-billing-status-list">
                  {paymentSetupQueue.map((item) => (
                    <article key={item.client}>
                      <span>{item.status}</span>
                      <strong>{item.client}</strong>
                      <p>{item.reason}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-billing-panel employee">
                <p className="koinonia-eyebrow">Billing Rules</p>
                <ul className="koinonia-billing-list">
                  {billingRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-billing-panel employee koinonia-billing-boundary-card">
                <p className="koinonia-eyebrow">Processor Boundary</p>
                <p>
                  Staff should send a secure setup link or open the approved
                  processor dashboard. Do not ask clients to type card numbers,
                  CVV, or banking secrets directly into Koinonia portal fields.
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
