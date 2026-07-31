import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { AccessRequestForm } from "../../../components/client/AccessRequestForm";
import { ShowingRequestForm } from "../../../components/client/ShowingRequestForm";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";
import {
  accessRequestObjectType,
  getAccessRequestDetail,
  getAccessRequestMetaLabels,
  getHumanAccessRequestStatus
} from "../../../lib/access-requests";
import {
  getHumanShowingStatus,
  getShowingNoteLabels,
  getShowingTimingLabel,
  showingRequestObjectType
} from "../../../lib/showing-requests";
import {
  buildPortalWorkSummaryCounts,
  clientPortalWorkObjectTypes,
  getPortalWorkDueLabel,
  getPortalWorkItemTypeLabel
} from "../../../lib/portal-work-items";
import { getKoinoniaServiceTemplateForWork } from "../../../lib/koinonia-service-templates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Dashboard Preview",
  description:
    "Preview of the Koinonia client dashboard for active, pending, waiting, and completed work.",
  alternates: {
    canonical: absoluteUrl("/client/dashboard")
  },
  robots: {
    index: false,
    follow: false
  }
};

type ClientSummaryCard = {
  body: string;
  label: string;
  value: string;
};

type ClientWorkItem = {
  detailHref?: string;
  due: string;
  id: string;
  nextAction: string;
  serviceCues: string[];
  status: string;
  title: string;
  type: string;
};

type ClientWorkView = {
  isLiveData: boolean;
  items: ClientWorkItem[];
  notice?: string;
  summaryCards: ClientSummaryCard[];
};

const sampleSummaryCards: ClientSummaryCard[] = [
  {
    label: "Waiting on You",
    value: "2",
    body: "Items that need instructions, files, approval, or access."
  },
  {
    label: "Active Work",
    value: "3",
    body: "Support currently in progress with Koinonia."
  },
  {
    label: "Ready for Review",
    value: "1",
    body: "Drafts or next steps waiting for Realtor review."
  },
  {
    label: "Completed",
    value: "8",
    body: "Recently completed work and closed-out support."
  }
];

const sampleWorkItems: ClientWorkItem[] = [
  {
    id: "sample-buyer-offer",
    title: "Buyer Offer Package",
    type: "Contract & Document Support",
    status: "Waiting on You",
    nextAction: "Confirm offer instructions and preferred closing timeline.",
    serviceCues: ["Documents", "Realtor instructions", "Approval before sending"],
    due: "Today"
  },
  {
    id: "sample-smith-close",
    title: "Smith Contract-to-Close",
    type: "Transaction Support",
    status: "Active",
    nextAction: "Koinonia is tracking inspection and earnest money deadlines.",
    serviceCues: ["Documents", "Billing", "Executed contract"],
    due: "Jul 31"
  },
  {
    id: "sample-monthly-cleanup",
    title: "Monthly Operations Cleanup",
    type: "Monthly Operations Partnership",
    status: "Active",
    nextAction: "CRM follow-up groups are being organized for review.",
    serviceCues: ["Monthly priorities", "Check-in cadence", "Billing"],
    due: "This week"
  },
  {
    id: "sample-northgate-showing",
    title: "Northgate Showing Coverage",
    type: "Licensed Showing Coverage",
    status: "Completed",
    nextAction: "Showing notes and feedback are available in the work history.",
    serviceCues: ["Showings", "Access readiness confirmation", "Feedback request"],
    due: "Complete"
  }
];

type ShowingRequestItem = {
  id: string;
  nextAction: string;
  notes: string[];
  status: string;
  timing: string;
  title: string;
};

type ShowingRequestView = {
  isLiveData: boolean;
  notice?: string;
  requests: ShowingRequestItem[];
};

type AccessRequestItem = {
  detail: string;
  id: string;
  labels: string[];
  platform: string;
  status: string;
};

type AccessRequestView = {
  isLiveData: boolean;
  notice?: string;
  requests: AccessRequestItem[];
};

const sampleShowingRequests: ShowingRequestItem[] = [
  {
    id: "sample-northgate-tour",
    title: "Schedule Northgate Buyer Tour",
    status: "Scheduling",
    nextAction: "Koinonia is checking requested showing windows and buyer availability.",
    timing: "Thu afternoon",
    notes: ["Client contact authorized", "Friday morning is the backup window"]
  },
  {
    id: "sample-west-ridge",
    title: "West Ridge Showing Coverage",
    status: "Needs Follow-up",
    nextAction: "Access instructions and safety notes are needed before coverage can be confirmed.",
    timing: "Same-day request",
    notes: ["Rush review needed", "Access details pending"]
  },
  {
    id: "sample-northgate-follow-up",
    title: "Northgate Showing Follow-Up",
    status: "Completed",
    nextAction: "Showing notes were delivered. Follow-up remains open if the Realtor requests it.",
    timing: "Complete",
    notes: ["Buyer feedback delivered", "No immediate issue flagged"]
  }
];

const documentRequests = [
  "Executed listing agreement",
  "Seller property disclosure",
  "Inspection objection instructions",
  "Showing access notes for West Ridge"
] as const;

const sampleAccessRequests: AccessRequestItem[] = [
  {
    id: "sample-transaction-platform",
    platform: "Transaction platform",
    status: "Waiting on Client",
    detail: "Grant broker-approved transaction coordinator access or send an approved secure sharing link.",
    labels: ["No password stored", "Smith Contract-to-Close"]
  },
  {
    id: "sample-forms-workspace",
    platform: "Forms workspace",
    status: "Access Needed",
    detail: "Koinonia needs delegated document-preparation access before drafting forms.",
    labels: ["No password stored", "Buyer Offer Package"]
  }
];

export default async function ClientDashboardPreviewPage() {
  const actor = await requirePortalPermission("client-portal:view", "/client/dashboard");
  const workItemView = await getClientWorkItemView(actor.workspaceId, actor.id);
  const showingRequestView = await getClientShowingRequestView(actor.workspaceId, actor.id);
  const accessRequestView = await getClientAccessRequestView(actor.workspaceId, actor.id);

  return (
    <main className="koinonia-site koinonia-client-dashboard">
      <Header />

      <section className="koinonia-section koinonia-client-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Dashboard Preview</p>

            <h1 className="koinonia-title">
              One place for active work, pending items, and completed support.
            </h1>

            <p className="koinonia-lead">
              Current work, showing requests, access updates, documents, and
              billing setup can use protected storage when production database
              access is available. Document uploads also require private
              storage and malware scanning before live files are accepted.
            </p>
          </div>

          <div className="koinonia-client-summary-grid">
            {workItemView.summaryCards.map((card) => (
              <article className="koinonia-client-summary-card" key={card.label}>
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
          <div className="koinonia-client-dashboard-layout">
            <div className="koinonia-client-main-stack">
              <section className="koinonia-client-work-panel" aria-labelledby="client-work-title">
                <div className="koinonia-client-panel-heading">
                  <p className="koinonia-eyebrow">Work</p>
                  <h2 id="client-work-title">Current Support</h2>
                </div>

                <div className="koinonia-client-work-list">
                  {workItemView.notice ? (
                    <p className="koinonia-client-security-note">{workItemView.notice}</p>
                  ) : null}

                  {workItemView.items.map((item) => (
                    <article className="koinonia-client-work-item" key={item.id}>
                      <div>
                        <span>{item.type}</span>
                        <h3>{item.title}</h3>
                        <p>{item.nextAction}</p>
                        {item.serviceCues.length ? (
                          <ul className="koinonia-client-showing-notes">
                            {item.serviceCues.map((cue) => (
                              <li key={cue}>{cue}</li>
                            ))}
                          </ul>
                        ) : null}
                        {item.detailHref ? (
                          <a className="koinonia-document-link" href={item.detailHref}>
                            Open Work
                          </a>
                        ) : null}
                      </div>

                      <div className="koinonia-client-work-meta">
                        <strong>{item.status}</strong>
                        <span>{item.due}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-client-work-panel" aria-labelledby="client-showings-title">
                <div className="koinonia-client-panel-heading">
                  <p className="koinonia-eyebrow">Showings</p>
                  <h2 id="client-showings-title">Showing Requests</h2>
                </div>

                <div className="koinonia-client-work-list">
                  {showingRequestView.notice ? (
                    <p className="koinonia-client-security-note">{showingRequestView.notice}</p>
                  ) : null}

                  {showingRequestView.requests.map((request) => (
                    <article className="koinonia-client-work-item" key={request.id}>
                      <div>
                        <span>Request Showing Coverage</span>
                        <h3>{request.title}</h3>
                        <p>{request.nextAction}</p>
                        <ul className="koinonia-client-showing-notes">
                          {request.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="koinonia-client-work-meta">
                        <strong>{request.status}</strong>
                        <span>{request.timing}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="koinonia-client-side-panel" aria-label="Client requests">
              <ShowingRequestForm storageReady={showingRequestView.isLiveData} />

              <section className="koinonia-client-request-card">
                <p className="koinonia-eyebrow">Documents Needed</p>
                <ul>
                  {documentRequests.map((request) => (
                    <li key={request}>{request}</li>
                  ))}
                </ul>
                <a className="koinonia-document-link" href="/client/documents">
                  Open Document Center
                </a>
              </section>

              <AccessRequestForm storageReady={accessRequestView.isLiveData} />

              <section className="koinonia-client-request-card">
                <p className="koinonia-eyebrow">Access Needed</p>
                <div className="koinonia-client-access-list">
                  {accessRequestView.notice ? (
                    <p className="koinonia-client-security-note">{accessRequestView.notice}</p>
                  ) : null}

                  {accessRequestView.requests.map((request) => (
                    <article key={request.id}>
                      <span>{request.status}</span>
                      <strong>{request.platform}</strong>
                      <p>{request.detail}</p>
                      <ul className="koinonia-client-showing-notes">
                        {request.labels.map((label) => (
                          <li key={label}>{label}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="koinonia-client-request-card">
                <p className="koinonia-eyebrow">Billing</p>
                <p>
                  Payment method setup, prepaid invoices, and pay-at-closing
                  billing status should live on the customer file.
                </p>
                <a className="koinonia-billing-link" href="/client/billing">
                  Open Billing Center
                </a>
              </section>

              <section className="koinonia-client-request-card koinonia-client-boundary-card">
                <p className="koinonia-eyebrow">Security Boundary</p>
                <p>
                  Do not paste passwords into the portal. Access should be
                  granted through approved delegated permissions or an approved
                  encrypted sharing workflow.
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

async function getClientWorkItemView(
  workspaceId: string,
  userId: string
): Promise<ClientWorkView> {
  try {
    const workObjects = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        objectType: { in: [...clientPortalWorkObjectTypes] },
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 20
    });
    const items = workObjects.map((object) => {
      const template = getKoinoniaServiceTemplateForWork({
        data: object.data,
        name: object.name,
        objectType: object.objectType
      });

      return {
        id: object.id,
        title: object.name,
        type: template?.publicServiceTitle ?? getPortalWorkItemTypeLabel(object.objectType),
        status: object.status,
        nextAction: object.nextAction ?? template?.staffNextAction ?? "Koinonia will update this work item as it moves.",
        due: getPortalWorkDueLabel(object.data),
        detailHref: `/client/work/${object.id}`,
        serviceCues: buildServiceCues(template)
      };
    });

    return {
      isLiveData: true,
      items: withEmptyClientWorkItems(items),
      summaryCards: buildClientSummaryCards(items)
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      isLiveData: false,
      items: sampleWorkItems,
      notice:
        "Current work storage is not reachable in this preview, so sample support items are shown.",
      summaryCards: sampleSummaryCards
    };
  }
}

function buildClientSummaryCards(items: ClientWorkItem[]): ClientSummaryCard[] {
  const counts = buildPortalWorkSummaryCounts(items);

  return [
    {
      label: "Waiting on You",
      value: String(counts.waiting),
      body: "Items that need instructions, files, approval, or access."
    },
    {
      label: "Active Work",
      value: String(counts.active),
      body: "Support currently in progress with Koinonia."
    },
    {
      label: "Ready for Review",
      value: String(counts.review),
      body: "Drafts or next steps waiting for Realtor review."
    },
    {
      label: "Completed",
      value: String(counts.completed),
      body: "Recently completed work and closed-out support."
    }
  ];
}

function withEmptyClientWorkItems(items: ClientWorkItem[]): ClientWorkItem[] {
  if (items.length > 0) {
    return items;
  }

  return [
    {
      id: "empty-client-work-items",
      title: "No active portal work yet",
      type: "Portal Work",
      status: "Ready",
      nextAction: "New transaction, document, showing, access, and billing work will appear here.",
      serviceCues: ["Service package", "Documents", "Billing"],
      due: "No active item"
    }
  ];
}

function buildServiceCues(
  template: ReturnType<typeof getKoinoniaServiceTemplateForWork>
): string[] {
  if (!template) {
    return [];
  }

  return [
    ...template.clientPortalSections,
    ...template.documentRequests.slice(0, 2)
  ].slice(0, 5);
}

async function getClientAccessRequestView(
  workspaceId: string,
  userId: string
): Promise<AccessRequestView> {
  try {
    const accessRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        objectType: accessRequestObjectType,
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12
    });

    return {
      isLiveData: true,
      requests: withEmptyAccessRequests(
        accessRequests.map((request) => ({
          id: request.id,
          platform: request.name.replace(/^Access Request - /, ""),
          status: getHumanAccessRequestStatus(request.status),
          detail: getAccessRequestDetail(request.data),
          labels: getAccessRequestMetaLabels(request.data)
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
        "Access request storage is not reachable in this preview, so sample requests are shown.",
      requests: sampleAccessRequests
    };
  }
}

async function getClientShowingRequestView(
  workspaceId: string,
  userId: string
): Promise<ShowingRequestView> {
  try {
    const showingRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        objectType: showingRequestObjectType,
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12
    });

    return {
      isLiveData: true,
      requests: withEmptyShowingRequests(
        showingRequests.map((request) => ({
          id: request.id,
          title: request.name,
          status: getHumanShowingStatus(request.status),
          nextAction: request.nextAction ?? "Koinonia will review the showing request.",
          timing: getShowingTimingLabel(request.data),
          notes: getShowingNoteLabels(request.data)
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
        "Showing request storage is not reachable in this preview, so sample requests are shown.",
      requests: sampleShowingRequests
    };
  }
}

function withEmptyShowingRequests(requests: ShowingRequestItem[]): ShowingRequestItem[] {
  if (requests.length > 0) {
    return requests;
  }

  return [
    {
      id: "empty-showing-requests",
      title: "No showing requests yet",
      status: "Ready",
      nextAction: "Submit a showing request when a client needs scheduling or licensed coverage.",
      timing: "No active request",
      notes: ["Request form ready", "No access secrets in notes"]
    }
  ];
}

function withEmptyAccessRequests(requests: AccessRequestItem[]): AccessRequestItem[] {
  if (requests.length > 0) {
    return requests;
  }

  return [
    {
      id: "empty-access-requests",
      platform: "No access requests yet",
      status: "Ready",
      detail: "Use the access update form when Koinonia needs delegated access or status confirmation.",
      labels: ["No password stored", "Delegated access only"]
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
