import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { BillingSetupRequestForm } from "../../../components/client/BillingSetupRequestForm";
import { Footer, Header } from "../../../components/site";
import {
  billingSetupRequestObjectType,
  getBillingSetupDetail,
  getBillingSetupMetaLabels,
  getHumanBillingSetupStatus
} from "../../../lib/billing-setup-requests";
import { prisma } from "../../../lib/db";
import { requirePortalPermission } from "../../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Billing Center Preview",
  description:
    "Preview of the Koinonia client billing center for service billing models, secure payment setup, invoices, and pay-at-closing status.",
  alternates: {
    canonical: absoluteUrl("/client/billing")
  },
  robots: {
    index: false,
    follow: false
  }
};

const billingSummary = [
  {
    label: "Payment Setup",
    value: "Ready",
    body: "Payment method is stored with the processor; Koinonia keeps only safe reference details."
  },
  {
    label: "Open Invoices",
    value: "$389",
    body: "Prepaid transaction coordination invoice is due before work begins."
  },
  {
    label: "Pay at Close",
    value: "$599",
    body: "Only due after a successful closing on the selected pay-at-closing file."
  },
  {
    label: "Monthly / Custom",
    value: "Active",
    body: "Custom terms and recurring support are tracked by agreement."
  }
] as const;

const selectedServices = [
  {
    service: "Transaction Coordination Plus",
    billing: "$389 prepaid",
    status: "Invoice Open",
    nextAction: "Pay before coordination work begins."
  },
  {
    service: "Pay-at-Closing Coordination",
    billing: "$599 after successful close",
    status: "Closing Watch",
    nextAction: "No fee is due unless the transaction closes."
  },
  {
    service: "Licensed Showing Coverage",
    billing: "Per showing / custom",
    status: "Setup Ready",
    nextAction: "Showing charges follow the approved showing request."
  }
] as const;

const invoices = [
  {
    invoice: "INV-1042",
    service: "Transaction Coordination Plus",
    amount: "$389.00",
    status: "Due Before Work Begins",
    due: "Today"
  },
  {
    invoice: "PAC-2011",
    service: "Pay-at-Closing Coordination",
    amount: "$599.00",
    status: "Waiting on Successful Closing",
    due: "After close"
  },
  {
    invoice: "SHW-3310",
    service: "Showing Coverage",
    amount: "$75.00",
    status: "Pending",
    due: "After showing"
  }
] as const;

const paymentProfile = [
  "Processor customer reference is saved only after secure setup.",
  "Payment method details should come from approved processor metadata.",
  "Consent must be recorded for approved service billing models.",
  "Card number and CVV are not stored in Koinonia."
] as const;

const consentItems = [
  "Prepaid charge before work begins",
  "Pay-at-closing charge after successful close",
  "Approved showing coverage charges",
  "Monthly/custom billing only when authorized by agreement"
] as const;

type BillingSetupItem = {
  detail: string;
  id: string;
  labels: string[];
  nextAction: string;
  service: string;
  status: string;
};

type BillingSetupView = {
  isLiveData: boolean;
  notice?: string;
  requests: BillingSetupItem[];
};

const sampleBillingSetupRequests: BillingSetupItem[] = [
  {
    id: "sample-prepaid-coordination",
    service: "Transaction Coordination Plus",
    status: "Processor Link Needed",
    detail: "Prepaid before work begins - $389",
    nextAction: "Koinonia needs to send the secure setup link before coordination starts.",
    labels: ["No card stored", "Before work begins", "Bright Homes Team"]
  },
  {
    id: "sample-pay-at-close",
    service: "Pay-at-Closing Coordination",
    status: "Pay at Close Watch",
    detail: "Pay after successful close - $599",
    nextAction: "Track the closing trigger before billing the approved pay-at-close fee.",
    labels: ["No card stored", "After successful close", "Northgate Partners"]
  }
];

export default async function ClientBillingCenterPreviewPage() {
  const actor = await requirePortalPermission("client-portal:billing:view", "/client/billing");
  const billingSetupView = await getClientBillingSetupView(actor.workspaceId, actor.id);

  return (
    <main className="koinonia-site koinonia-billing-center koinonia-client-billing">
      <Header />

      <section className="koinonia-section koinonia-billing-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Client Billing Center Preview</p>

            <h1 className="koinonia-title">
              Billing setup that matches each service and transaction file.
            </h1>

            <p className="koinonia-lead">
              Billing setup requests can use protected portal storage when the
              production database is reachable. Real payment details should
              still be entered only through an approved processor-hosted flow so
              Koinonia never stores card numbers or CVV codes in portal fields.
            </p>
          </div>

          <div className="koinonia-billing-summary-grid">
            {billingSummary.map((card) => (
              <article className="koinonia-billing-summary-card" key={card.label}>
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
              <section className="koinonia-billing-panel" aria-labelledby="client-services-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Services</p>
                  <h2 id="client-services-title">Selected Services</h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {selectedServices.map((service) => (
                    <article className="koinonia-billing-work-item" key={service.service}>
                      <div>
                        <span>{service.billing}</span>
                        <h3>{service.service}</h3>
                        <p>{service.nextAction}</p>
                      </div>

                      <div className="koinonia-billing-work-meta">
                        <strong>{service.status}</strong>
                        <span>Billing rule</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-billing-panel" aria-labelledby="client-billing-setup-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Setup</p>
                  <h2 id="client-billing-setup-title">Billing Setup Requests</h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {billingSetupView.notice ? (
                    <p className="koinonia-billing-security-note">{billingSetupView.notice}</p>
                  ) : null}

                  {billingSetupView.requests.map((request) => (
                    <article className="koinonia-billing-work-item" key={request.id}>
                      <div>
                        <span>{request.detail}</span>
                        <h3>{request.service}</h3>
                        <p>{request.nextAction}</p>
                        <ul className="koinonia-billing-meta-list">
                          {request.labels.map((label) => (
                            <li key={label}>{label}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="koinonia-billing-work-meta">
                        <strong>{request.status}</strong>
                        <span>Setup status</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-billing-panel" aria-labelledby="client-invoices-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Invoices</p>
                  <h2 id="client-invoices-title">Invoice and Payment Status</h2>
                </div>

                <div className="koinonia-billing-table-wrap">
                  <table className="koinonia-billing-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.invoice}>
                          <td>{invoice.invoice}</td>
                          <td>{invoice.service}</td>
                          <td>{invoice.amount}</td>
                          <td>{invoice.status}</td>
                          <td>{invoice.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="koinonia-billing-side-panel" aria-label="Payment setup">
              <BillingSetupRequestForm storageReady={billingSetupView.isLiveData} />

              <section className="koinonia-billing-panel">
                <p className="koinonia-eyebrow">Payment Setup</p>
                <ul className="koinonia-billing-list">
                  {paymentProfile.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-billing-panel">
                <p className="koinonia-eyebrow">Authorized Billing</p>
                <ul className="koinonia-billing-list">
                  {consentItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-billing-panel koinonia-billing-boundary-card">
                <p className="koinonia-eyebrow">Payment Boundary</p>
                <p>
                  Card details should be entered only through the approved
                  payment processor. Koinonia should store the processor
                  reference, brand, last four digits, expiration, and consent
                  history, not the full card number or CVV.
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

async function getClientBillingSetupView(
  workspaceId: string,
  ownerId: string
): Promise<BillingSetupView> {
  try {
    const billingSetupRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        ownerId,
        objectType: billingSetupRequestObjectType,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12
    });

    return {
      isLiveData: true,
      requests: withEmptyBillingSetupRequests(
        billingSetupRequests.map((request) => ({
          id: request.id,
          service: request.name.replace(/^Billing Setup - /, ""),
          status: getHumanBillingSetupStatus(request.status),
          detail: getBillingSetupDetail(request.data),
          labels: getBillingSetupMetaLabels(request.data),
          nextAction: request.nextAction ?? "Koinonia will review this billing setup request."
        }))
      )
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      isLiveData: false,
      notice:
        "Billing setup storage is not reachable in this preview, so sample setup requests are shown.",
      requests: sampleBillingSetupRequests
    };
  }
}

function withEmptyBillingSetupRequests(requests: BillingSetupItem[]): BillingSetupItem[] {
  if (requests.length > 0) {
    return requests;
  }

  return [
    {
      id: "empty-billing-setup",
      service: "No billing setup requests yet",
      status: "Ready",
      detail: "Choose a service and billing model when setup is needed.",
      nextAction: "Submit a setup request before Koinonia sends a secure processor link.",
      labels: ["No card stored", "Processor-hosted setup only"]
    }
  ];
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
