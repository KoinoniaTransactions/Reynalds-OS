import type { Metadata } from "next";
import { BillingSetupStatusForm } from "../../../components/employee/BillingSetupStatusForm";
import { InvoiceStatusForm } from "../../../components/employee/InvoiceStatusForm";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import {
  billingSetupRequestObjectType,
  getBillingSetupDetail,
  getBillingSetupMetaLabels,
  getHumanBillingSetupStatus
} from "../../../lib/billing-setup-requests";
import { prisma } from "../../../lib/db";
import { buildPortalInvoiceDisplayItem } from "../../../lib/portal-billing-invoices";
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
    payment: "Processor Ready",
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

type BillingSetupItem = {
  detail: string;
  id: string;
  labels: string[];
  nextAction: string;
  requestedBy: string;
  service: string;
  status: string;
  workflowStatus: string;
};

type BillingSetupView = {
  isLiveData: boolean;
  notice?: string;
  requests: BillingSetupItem[];
};

type InvoiceItem = {
  amount: string;
  due: string;
  id: string;
  invoice: string;
  nextAction: string;
  service: string;
  status: string;
};

type InvoiceView = {
  invoices: InvoiceItem[];
  isLiveData: boolean;
  notice?: string;
};

const sampleBillingSetupRequests: BillingSetupItem[] = [
  {
    id: "sample-wilson-monthly",
    requestedBy: "Wilson Realty Group",
    service: "Monthly Operations Partnership",
    status: "Processor Link Needed",
    detail: "Monthly recurring support - Custom monthly",
    nextAction: "Send the secure setup link after recurring billing consent is confirmed.",
    labels: ["No card stored", "Monthly recurring support", "Wilson Realty Group"],
    workflowStatus: "Processor Link Needed"
  },
  {
    id: "sample-northgate-close",
    requestedBy: "Northgate Partners",
    service: "Pay-at-Closing Coordination",
    status: "Pay at Close Watch",
    detail: "Pay after successful close - $599",
    nextAction: "Track the closing trigger before billing the approved pay-at-close fee.",
    labels: ["No card stored", "After successful close", "Northgate Partners"],
    workflowStatus: "Pay at Close Watch"
  }
];

const sampleInvoices: InvoiceItem[] = [
  {
    id: "sample-invoice-prepaid",
    invoice: "INV-1042",
    service: "Transaction Coordination Plus",
    amount: "$389.00",
    status: "Due Before Work Begins",
    due: "Due Today",
    nextAction: "Collect payment or record an approved exception before work begins."
  },
  {
    id: "sample-invoice-close",
    invoice: "PAC-2011",
    service: "Pay-at-Closing Coordination",
    amount: "$599.00",
    status: "Pay at Close Watch",
    due: "After close",
    nextAction: "Wait for a confirmed successful closing before charging this invoice."
  }
];

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
  const actor = await requirePortalPermission("billing-workspace:view", "/employee/billing");
  const canUpdateBillingSetup = actor.permissions.includes(
    "billing-workspace:payment-methods:request"
  );
  const [billingSetupView, invoiceView] = await Promise.all([
    getEmployeeBillingSetupView(actor.workspaceId),
    getEmployeeInvoiceView(actor.workspaceId)
  ]);
  const billingSetupDisabledReason = !billingSetupView.isLiveData
    ? "Live billing setup storage must be available before staff billing updates can be saved."
    : canUpdateBillingSetup
      ? undefined
      : "Your role can view billing setup requests but cannot change billing readiness.";

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
              Billing setup requests can now flow through protected portal
              storage when the production database is reachable. Actual card
              collection and charges should stay inside an approved payment
              processor with tokenized references, consent records, and audit
              logs.
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

              <section className="koinonia-billing-panel employee" aria-labelledby="billing-setup-queue-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Setup</p>
                  <h2 id="billing-setup-queue-title">Billing Setup Request Queue</h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {billingSetupView.notice ? (
                    <p className="koinonia-billing-security-note employee">{billingSetupView.notice}</p>
                  ) : null}

                  {billingSetupView.requests.map((request) => (
                    <article className="koinonia-billing-work-item employee" key={request.id}>
                      <div>
                        <span>{request.requestedBy}</span>
                        <h3>{request.service}</h3>
                        <p>{request.detail}</p>
                        <p>{request.nextAction}</p>
                        <ul className="koinonia-billing-meta-list employee">
                          {request.labels.map((label) => (
                            <li key={label}>{label}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="koinonia-billing-work-meta employee">
                        <strong>{request.status}</strong>
                        <span>Setup status</span>
                      </div>

                      <BillingSetupStatusForm
                        currentStatus={request.workflowStatus}
                        disabled={Boolean(billingSetupDisabledReason)}
                        disabledReason={billingSetupDisabledReason}
                        requestId={request.id}
                      />
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

              <section className="koinonia-billing-panel employee" aria-labelledby="invoice-queue-title">
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">Invoices</p>
                  <h2 id="invoice-queue-title">Invoice and Payment Queue</h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {invoiceView.notice ? (
                    <p className="koinonia-billing-security-note employee">{invoiceView.notice}</p>
                  ) : null}

                  {invoiceView.invoices.map((invoice) => (
                    <article className="koinonia-billing-work-item employee" key={invoice.id}>
                      <div>
                        <span>{invoice.invoice}</span>
                        <h3>{invoice.service}</h3>
                        <p>
                          {invoice.amount} - {invoice.due}
                        </p>
                        <p>{invoice.nextAction}</p>
                      </div>

                      <div className="koinonia-billing-work-meta employee">
                        <strong>{invoice.status}</strong>
                        <span>Invoice status</span>
                      </div>

                      <InvoiceStatusForm
                        currentStatus={invoice.status}
                        disabled={!invoiceView.isLiveData}
                        invoiceId={invoice.id}
                      />
                    </article>
                  ))}
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

async function getEmployeeInvoiceView(workspaceId: string): Promise<InvoiceView> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }],
      take: 25
    });
    const objectIds = [
      ...new Set(
        invoices.flatMap((invoice) =>
          [invoice.clientObjectId, invoice.relatedObjectId, invoice.packageObjectId].filter(
            (id): id is string => Boolean(id)
          )
        )
      )
    ];
    const objects = objectIds.length
      ? await prisma.rosObject.findMany({
          where: {
            id: { in: objectIds },
            workspaceId
          },
          select: { id: true, name: true }
        })
      : [];
    const objectNames = new Map(objects.map((object) => [object.id, object.name]));

    return {
      invoices: withEmptyInvoices(
        invoices.map((invoice) => buildPortalInvoiceDisplayItem(invoice, objectNames))
      ),
      isLiveData: true
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      invoices: sampleInvoices,
      isLiveData: false,
      notice: "Invoice storage is not reachable in this preview, so sample invoices are shown."
    };
  }
}

async function getEmployeeBillingSetupView(workspaceId: string): Promise<BillingSetupView> {
  try {
    const billingSetupRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        objectType: billingSetupRequestObjectType,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 25
    });

    return {
      isLiveData: true,
      requests: withEmptyBillingSetupRequests(
        billingSetupRequests.map((request) => ({
          id: request.id,
          requestedBy: getBillingSetupRequester(request.data),
          service: request.name.replace(/^Billing Setup - /, ""),
          status: getHumanBillingSetupStatus(request.status),
          detail: getBillingSetupDetail(request.data),
          labels: getBillingSetupMetaLabels(request.data),
          nextAction:
            request.nextAction ?? "Review this billing setup request before sending a secure processor link.",
          workflowStatus: request.status
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
      id: "empty-billing-setup-queue",
      requestedBy: "Billing queue is clear",
      service: "No billing setup requests",
      status: "Ready",
      detail: "Setup requests will appear after a client or staff member records billing intent.",
      nextAction: "Send secure processor links only after consent and service billing terms are clear.",
      labels: ["No card stored", "Processor-hosted setup only"],
      workflowStatus: "Setup Requested"
    }
  ];
}

function withEmptyInvoices(invoices: InvoiceItem[]): InvoiceItem[] {
  if (invoices.length > 0) {
    return invoices;
  }

  return [
    {
      id: "empty-invoice-queue",
      invoice: "No invoices",
      service: "Invoice queue is clear",
      amount: "$0.00",
      status: "Ready",
      due: "No due date",
      nextAction: "Invoices will appear after staff create billing items for client files."
    }
  ];
}

function getBillingSetupRequester(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Portal user";
  }

  const value = data as Record<string, unknown>;

  if (typeof value.clientName === "string" && value.clientName.trim()) {
    return value.clientName.trim();
  }

  if (typeof value.requestedByEmail === "string" && value.requestedByEmail.trim()) {
    return value.requestedByEmail.trim();
  }

  return "Portal user";
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
