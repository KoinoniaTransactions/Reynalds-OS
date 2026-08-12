import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { BillingSetupRequestForm } from "../../../components/client/BillingSetupRequestForm";
import {
  ClientBillingTermsCard,
  type ClientBillingTermsCardTerms
} from "../../../components/client/ClientBillingTermsCard";
import { ClientInvoicePaymentButton } from "../../../components/client/ClientInvoicePaymentButton";
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
import {
  billingRuleAssignmentObjectType,
  getBillingRuleContext
} from "../../../lib/portal-billing-rules";
import { canCreatePrepaidInvoicePaymentSession } from "../../../lib/stripe-invoice-payment-sessions";

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
    body:
      "Payment method is stored with the processor; Koinonia keeps only safe reference details."
  },
  {
    label: "Open Invoices",
    value: "$389",
    body:
      "Prepaid transaction coordination invoice is due before work begins."
  },
  {
    label: "Pay at Close",
    value: "$599",
    body:
      "Only due after a successful closing on the selected pay-at-closing file."
  },
  {
    label: "Monthly / Custom",
    value: "Active",
    body:
      "Custom terms and recurring support are tracked by agreement."
  }
] as const;

type BillingServiceItem = {
  billing: string;
  nextAction: string;
  service: string;
  status: string;
};

const sampleSelectedServices: BillingServiceItem[] = [
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
    nextAction:
      "No fee is due unless the transaction closes."
  },
  {
    service: "Licensed Showing Coverage",
    billing: "Per showing / custom",
    status: "Setup Ready",
    nextAction:
      "Showing charges follow the approved showing request."
  }
];

type InvoiceItem = {
  amount: string;
  canPay: boolean;
  due: string;
  id: string;
  invoice: string;
  nextAction: string;
  service: string;
  status: string;
};

const invoices = [
  {
    id: "sample-invoice-1042",
    invoice: "INV-1042",
    service: "Transaction Coordination Plus",
    amount: "$389.00",
    status: "Due Before Work Begins",
    due: "Today",
    nextAction: "Pay before coordination work begins.",
    canPay: false
  },
  {
    id: "sample-pay-at-close-2011",
    invoice: "PAC-2011",
    service: "Pay-at-Closing Coordination",
    amount: "$599.00",
    status: "Waiting on Successful Closing",
    due: "After close",
    nextAction:
      "No fee is due unless the transaction closes.",
    canPay: false
  },
  {
    id: "sample-showing-3310",
    invoice: "SHW-3310",
    service: "Showing Coverage",
    amount: "$75.00",
    status: "Pending",
    due: "After showing",
    nextAction:
      "Showing charges follow the approved showing request.",
    canPay: false
  }
] as const satisfies readonly InvoiceItem[];

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

type BillingTermsView = {
  isLiveData: boolean;
  notice?: string;
  rules: ClientBillingTermsCardTerms[];
};

type InvoiceView = {
  invoices: InvoiceItem[];
  isLiveData: boolean;
  notice?: string;
};

const sampleBillingSetupRequests: BillingSetupItem[] = [
  {
    id: "sample-prepaid-coordination",
    service: "Transaction Coordination Plus",
    status: "Processor Link Needed",
    detail: "Prepaid before work begins - $389",
    nextAction:
      "Koinonia needs to send the secure setup link before coordination starts.",
    labels: [
      "No card stored",
      "Before work begins",
      "Bright Homes Team"
    ]
  },
  {
    id: "sample-pay-at-close",
    service: "Pay-at-Closing Coordination",
    status: "Pay at Close Watch",
    detail: "Pay after successful close - $599",
    nextAction:
      "Track the closing trigger before billing the approved pay-at-close fee.",
    labels: [
      "No card stored",
      "After successful close",
      "Northgate Partners"
    ]
  }
];

export default async function ClientBillingCenterPreviewPage() {
  const actor = await requirePortalPermission(
    "client-portal:billing:view",
    "/client/billing"
  );

  const [
    billingSetupView,
    billingTermsView,
    invoiceView
  ] = await Promise.all([
    getClientBillingSetupView(
      actor.workspaceId,
      actor.id
    ),
    getClientBillingTermsView(
      actor.workspaceId,
      actor.id
    ),
    getClientInvoiceView(
      actor.workspaceId,
      actor.id
    )
  ]);

  const selectedServiceView =
    buildSelectedServiceItems(
      billingSetupView.requests,
      invoiceView.invoices,
      billingSetupView.isLiveData ||
        invoiceView.isLiveData
    );

  return (
    <main className="koinonia-site koinonia-billing-center koinonia-client-billing">
      <Header />

      <section className="koinonia-section koinonia-billing-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">
              Client Billing Center Preview
            </p>

            <h1 className="koinonia-title">
              Billing setup that matches each service and
              transaction file.
            </h1>

            <p className="koinonia-lead">
              Billing setup requests can use protected
              portal storage when the production database
              is reachable. Real payment details should
              still be entered only through an approved
              processor-hosted flow so Koinonia never
              stores card numbers or CVV codes in portal
              fields.
            </p>
          </div>

          <div className="koinonia-billing-summary-grid">
            {billingSummary.map((card) => (
              <article
                className="koinonia-billing-summary-card"
                key={card.label}
              >
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
              <section
                className="koinonia-billing-panel"
                aria-labelledby="client-services-title"
              >
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">
                    Services
                  </p>
                  <h2 id="client-services-title">
                    Selected Services
                  </h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {selectedServiceView.map((service) => (
                    <article
                      className="koinonia-billing-work-item"
                      key={service.service}
                    >
                      <div>
                        <span>{service.billing}</span>
                        <h3>{service.service}</h3>
                        <p>{service.nextAction}</p>
                      </div>

                      <div className="koinonia-billing-work-meta">
                        <strong>
                          {service.status}
                        </strong>
                        <span>Billing rule</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className="koinonia-billing-panel"
                aria-labelledby="client-billing-setup-title"
              >
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">
                    Setup
                  </p>
                  <h2 id="client-billing-setup-title">
                    Billing Setup Requests
                  </h2>
                </div>

                <div className="koinonia-billing-card-list">
                  {billingSetupView.notice ? (
                    <p className="koinonia-billing-security-note">
                      {billingSetupView.notice}
                    </p>
                  ) : null}

                  {billingTermsView.notice ? (
                    <p className="koinonia-billing-security-note">
                      {billingTermsView.notice}
                    </p>
                  ) : null}

                  {billingSetupView.requests.map(
                    (request) => (
                      <article
                        className="koinonia-billing-work-item"
                        key={request.id}
                      >
                        <div>
                          <span>
                            {request.detail}
                          </span>
                          <h3>
                            {request.service}
                          </h3>
                          <p>
                            {request.nextAction}
                          </p>

                          <ul className="koinonia-billing-meta-list">
                            {request.labels.map(
                              (label) => (
                                <li key={label}>
                                  {label}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="koinonia-billing-work-meta">
                          <strong>
                            {request.status}
                          </strong>
                          <span>
                            Setup status
                          </span>
                        </div>

                        <ClientBillingTermsCard
                          disabled={
                            !billingTermsView.isLiveData
                          }
                          terms={
                            billingTermsView.rules.find(
                              (rule) =>
                                rule.billingSetupRequestId ===
                                request.id
                            )
                          }
                        />
                      </article>
                    )
                  )}
                </div>
              </section>

              <section
                className="koinonia-billing-panel"
                aria-labelledby="client-invoices-title"
              >
                <div className="koinonia-billing-panel-heading">
                  <p className="koinonia-eyebrow">
                    Invoices
                  </p>
                  <h2 id="client-invoices-title">
                    Invoice and Payment Status
                  </h2>
                </div>

                <div className="koinonia-billing-table-wrap">
                  {invoiceView.notice ? (
                    <p className="koinonia-billing-security-note">
                      {invoiceView.notice}
                    </p>
                  ) : null}

                  <table className="koinonia-billing-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due</th>
                        <th>Payment</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceView.invoices.map(
                        (invoice) => (
                          <tr key={invoice.id}>
                            <td>
                              {invoice.invoice}
                            </td>
                            <td>
                              {invoice.service}
                            </td>
                            <td>
                              {invoice.amount}
                            </td>
                            <td>
                              {invoice.status}
                            </td>
                            <td>{invoice.due}</td>
                            <td>
                              {invoice.canPay ? (
                                <ClientInvoicePaymentButton
                                  invoiceId={
                                    invoice.id
                                  }
                                />
                              ) : (
                                <span>
                                  {invoice.status ===
                                  "Paid"
                                    ? "Paid"
                                    : "—"}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside
              className="koinonia-billing-side-panel"
              aria-label="Payment setup"
            >
              <BillingSetupRequestForm
                storageReady={
                  billingSetupView.isLiveData
                }
              />

              <section className="koinonia-billing-panel">
                <p className="koinonia-eyebrow">
                  Payment Setup
                </p>

                <ul className="koinonia-billing-list">
                  {paymentProfile.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-billing-panel">
                <p className="koinonia-eyebrow">
                  Authorized Billing
                </p>

                <ul className="koinonia-billing-list">
                  {consentItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="koinonia-billing-panel koinonia-billing-boundary-card">
                <p className="koinonia-eyebrow">
                  Payment Boundary
                </p>

                <p>
                  Card details should be entered only
                  through the approved payment processor.
                  Koinonia should store the processor
                  reference, brand, last four digits,
                  expiration, and consent history, not the
                  full card number or CVV.
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

async function getClientBillingTermsView(
  workspaceId: string,
  ownerId: string
): Promise<BillingTermsView> {
  try {
    const billingRules =
      await prisma.rosObject.findMany({
        where: {
          workspaceId,
          objectType:
            billingRuleAssignmentObjectType,
          archivedAt: null,
          status: {
            not: "Superseded"
          },
          OR: [
            {
              clientUserId:
                ownerId
            },
            {
              ownerId
            }
          ]
        },
        orderBy: [
          {
            updatedAt: "desc"
          },
          {
            createdAt: "desc"
          }
        ]
      });

    const currentRules =
      new Map<
        string,
        ClientBillingTermsCardTerms
      >();

    for (const rule of billingRules) {
      const context =
        getBillingRuleContext(
          rule.data
        );

      if (
        !context.serviceActivationId ||
        currentRules.has(
          context.serviceActivationId
        )
      ) {
        continue;
      }

      const item =
        buildClientBillingTermsItem(
          rule
        );

      if (!item) {
        continue;
      }

      currentRules.set(
        context.serviceActivationId,
        item
      );
    }

    return {
      isLiveData: true,
      rules:
        Array.from(
          currentRules.values()
        )
    };
  } catch (error) {
    if (
      !isDatabaseUnavailableError(
        error
      )
    ) {
      throw error;
    }

    return {
      isLiveData: false,
      notice:
        "Written billing terms are temporarily unavailable.",
      rules: []
    };
  }
}

function buildClientBillingTermsItem(
  rule: {
    data: unknown;
    id: string;
    status: string;
  }
): ClientBillingTermsCardTerms | null {
  const context =
    getBillingRuleContext(
      rule.data
    );

  const data =
    toRecord(
      rule.data
    );

  const effectiveDate =
    optionalString(
      data.effectiveDate
    );

  const paymentTiming =
    optionalString(
      data.paymentTiming
    );

  const renewalCancellationSummary =
    optionalString(
      data.renewalCancellationSummary
    );

  const scopeSummary =
    optionalString(
      data.scopeSummary
    );

  if (
    !context.billingModel ||
    !context.billingSetupRequestId ||
    !context.serviceName ||
    !context.termsVersion ||
    !effectiveDate ||
    !paymentTiming ||
    !renewalCancellationSummary ||
    !scopeSummary
  ) {
    return null;
  }

  const common = {
    authorizationStatus:
      context.authorizationStatus ??
      rule.status,
    billingModel:
      context.billingModel,
    billingSetupRequestId:
      context.billingSetupRequestId,
    effectiveDate,
    id: rule.id,
    paymentTiming,
    renewalCancellationSummary,
    scopeSummary,
    serviceName:
      context.serviceName,
    termsVersion:
      context.termsVersion
  };

  if (
    context.billingModel ===
    "monthly"
  ) {
    const billingDay =
      optionalNumber(
        data.billingDay
      );

    const checkInCadence =
      optionalString(
        data.checkInCadence
      );

    const includedHours =
      optionalNumber(
        data.includedHours
      );

    const monthlyAmount =
      optionalString(
        data.monthlyAmount
      );

    if (
      billingDay === undefined ||
      !checkInCadence ||
      includedHours === undefined ||
      !monthlyAmount
    ) {
      return null;
    }

    return {
      ...common,
      billingModel:
        "monthly",
      billingDay,
      checkInCadence,
      includedHours,
      monthlyAmount,
      overageRate:
        optionalString(
          data.overageRate
        )
    };
  }

  const authorizationRequirements =
    optionalString(
      data.authorizationRequirements
    );

  const pricingBasis =
    optionalString(
      data.pricingBasis
    );

  const reviewCadence =
    optionalString(
      data.reviewCadence
    );

  if (
    !authorizationRequirements ||
    !pricingBasis ||
    !reviewCadence
  ) {
    return null;
  }

  return {
    ...common,
    billingModel:
      "custom",
    authorizationRequirements,
    pricingBasis,
    reviewCadence
  };
}

function toRecord(
  value: unknown
): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (
        value as Record<
          string,
          unknown
        >
      )
    : {};
}

function optionalString(
  value: unknown
): string | undefined {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

function optionalNumber(
  value: unknown
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : undefined;
}

async function getClientInvoiceView(
  workspaceId: string,
  ownerId: string
): Promise<InvoiceView> {
  try {
    const accessibleObjects =
      await prisma.rosObject.findMany({
        where: {
          workspaceId,
          archivedAt: null,
          OR: [
            { clientUserId: ownerId },
            { ownerId }
          ]
        },
        select: {
          id: true,
          name: true
        }
      });

    const accessibleObjectIds =
      accessibleObjects.map(
        (object) => object.id
      );

    if (!accessibleObjectIds.length) {
      return {
        invoices: withEmptyInvoices([]),
        isLiveData: true
      };
    }

    const liveInvoices =
      await prisma.invoice.findMany({
        where: {
          workspaceId,
          OR: [
            {
              clientObjectId: {
                in: accessibleObjectIds
              }
            },
            {
              relatedObjectId: {
                in: accessibleObjectIds
              }
            },
            {
              packageObjectId: {
                in: accessibleObjectIds
              }
            }
          ]
        },
        orderBy: [
          {
            createdAt: "desc"
          }
        ],
        take: 25
      });

    const objectNames = new Map(
      accessibleObjects.map((object) => [
        object.id,
        object.name
      ])
    );

    return {
      invoices: withEmptyInvoices(
        liveInvoices.map((invoice) => ({
          ...buildPortalInvoiceDisplayItem(
            invoice,
            objectNames
          ),
          canPay:
            canCreatePrepaidInvoicePaymentSession(
              invoice
            )
        }))
      ),
      isLiveData: true
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      invoices: [...invoices],
      isLiveData: false,
      notice:
        "Invoice storage is not reachable in this preview, so sample invoices are shown."
    };
  }
}

async function getClientBillingSetupView(
  workspaceId: string,
  ownerId: string
): Promise<BillingSetupView> {
  try {
    const billingSetupRequests =
      await prisma.rosObject.findMany({
        where: {
          workspaceId,
          objectType:
            billingSetupRequestObjectType,
          archivedAt: null,
          OR: [
            { clientUserId: ownerId },
            { ownerId }
          ]
        },
        orderBy: [
          {
            updatedAt: "desc"
          },
          {
            createdAt: "desc"
          }
        ],
        take: 12
      });

    return {
      isLiveData: true,
      requests:
        withEmptyBillingSetupRequests(
          billingSetupRequests.map(
            (request) => ({
              id: request.id,
              service: request.name.replace(
                /^Billing Setup - /,
                ""
              ),
              status:
                getHumanBillingSetupStatus(
                  request.status
                ),
              detail:
                getBillingSetupDetail(
                  request.data
                ),
              labels:
                getBillingSetupMetaLabels(
                  request.data
                ),
              nextAction:
                request.nextAction ??
                "Koinonia will review this billing setup request."
            })
          )
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

function withEmptyBillingSetupRequests(
  requests: BillingSetupItem[]
): BillingSetupItem[] {
  if (requests.length > 0) {
    return requests;
  }

  return [
    {
      id: "empty-billing-setup",
      service:
        "No billing setup requests yet",
      status: "Ready",
      detail:
        "Choose a service and billing model when setup is needed.",
      nextAction:
        "Submit a setup request before Koinonia sends a secure processor link.",
      labels: [
        "No card stored",
        "Processor-hosted setup only"
      ]
    }
  ];
}

function buildSelectedServiceItems(
  billingSetupRequests: BillingSetupItem[],
  invoiceItems: InvoiceItem[],
  isLiveData: boolean
): BillingServiceItem[] {
  if (!isLiveData) {
    return sampleSelectedServices;
  }

  const services = new Map<
    string,
    BillingServiceItem
  >();

  for (const request of billingSetupRequests) {
    if (request.id.startsWith("empty-")) {
      continue;
    }

    services.set(request.service, {
      billing: request.detail,
      nextAction: request.nextAction,
      service: request.service,
      status: request.status
    });
  }

  for (const invoice of invoiceItems) {
    if (
      invoice.id.startsWith("empty-") ||
      services.has(invoice.service)
    ) {
      continue;
    }

    services.set(invoice.service, {
      billing: invoice.amount,
      nextAction: invoice.nextAction,
      service: invoice.service,
      status: invoice.status
    });
  }

  if (services.size === 0) {
    return [
      {
        billing: "No active billing setup",
        nextAction:
          "Submit a setup request when a service needs processor-hosted billing.",
        service:
          "No selected services yet",
        status: "Ready"
      }
    ];
  }

  return Array.from(
    services.values()
  ).slice(0, 6);
}

function withEmptyInvoices(
  invoiceItems: InvoiceItem[]
): InvoiceItem[] {
  if (invoiceItems.length > 0) {
    return invoiceItems;
  }

  return [
    {
      id: "empty-client-invoices",
      invoice: "No invoices",
      service:
        "No invoice activity yet",
      amount: "$0.00",
      status: "Ready",
      due: "No due date",
      nextAction:
        "Invoices will appear here when Koinonia creates billing items for your file.",
      canPay: false
    }
  ];
}

function isDatabaseUnavailableError(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    (error.name ===
      "PrismaClientInitializationError" ||
      error.message.includes(
        "Can't reach database server"
      ) ||
      error.message.includes(
        "ECONNREFUSED"
      ))
  );
}
