import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { prisma } from "../../../lib/db";
import { requirePortalPermission } from "../../../lib/portal-auth";
import {
  buildStaffReviewReport,
  staffReviewWorkObjectTypes,
  type StaffReviewItem,
  type StaffReviewReport,
  type StaffReviewSeverity,
  type StaffReviewSourceDocument,
  type StaffReviewSourceObject
} from "../../../lib/staff-review";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff Review Center",
  description:
    "Koinonia staff review center for missing assignments, document gaps, billing blockers, access needs, showing requests, and AI-ready oversight.",
  alternates: {
    canonical: absoluteUrl("/employee/review")
  },
  robots: {
    index: false,
    follow: false
  }
};

type StaffReviewView = {
  isLiveData: boolean;
  notice?: string;
  report: StaffReviewReport;
};

const sampleWorkItems: StaffReviewSourceObject[] = [
  {
    assignedStaffUserId: null,
    clientObjectId: "obj_client_bright_homes",
    data: {
      authorization: false,
      preferredWindow: "Today after 3 PM"
    },
    health: "Critical",
    id: "sample_showing_authorization",
    name: "West Ridge Showing Coverage",
    nextAction: "Confirm Realtor authorization before scheduling.",
    objectType: "ShowingRequest",
    status: "Requested",
    updatedAt: "2026-07-28T15:00:00.000Z"
  },
  {
    assignedStaffUserId: "usr_contract_support",
    clientObjectId: "obj_client_wilson",
    data: {
      consentAcknowledged: false,
      serviceName: "Contract & Document Support"
    },
    health: "Attention",
    id: "sample_billing_consent",
    name: "Billing Setup - Contract & Document Support",
    nextAction: "Confirm billing consent before drafting begins.",
    objectType: "BillingSetupRequest",
    status: "Consent Needed",
    updatedAt: "2026-07-28T12:00:00.000Z"
  },
  {
    assignedStaffUserId: "usr_operations",
    clientObjectId: null,
    data: {
      platformName: "Brokerage transaction platform"
    },
    health: "Attention",
    id: "sample_access_request",
    name: "Access Request - Brokerage transaction platform",
    nextAction: "Send safe delegated-access instructions.",
    objectType: "AccessRequest",
    status: "Waiting on Client",
    updatedAt: "2026-07-26T12:00:00.000Z"
  }
];

const sampleDocuments: StaffReviewSourceDocument[] = [
  {
    documentType: "Purchase Agreement",
    fileName: "purchase-agreement.pdf",
    id: "sample_purchase_agreement",
    requestedAction: "Review terms and request Realtor approval.",
    status: "Ready for Client Review",
    storageKey: "portal/wks_koinonia/sample_purchase_agreement/purchase-agreement.pdf",
    updatedAt: "2026-07-28T20:00:00.000Z"
  },
  {
    documentType: "Commission Instructions",
    fileName: "commission-instructions.pdf",
    id: "sample_commission_instructions",
    requestedAction: null,
    status: "Uploaded",
    storageKey: null,
    updatedAt: "2026-07-27T18:00:00.000Z"
  }
];

export default async function EmployeeStaffReviewPage() {
  const actor = await requirePortalPermission("employee-portal:reviews:view", "/employee/review");
  const reviewView = await getStaffReviewView(actor.workspaceId);

  return (
    <main className="koinonia-site koinonia-staff-review">
      <Header />

      <section className="koinonia-section koinonia-staff-review-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Staff Review Center</p>

            <h1 className="koinonia-title">
              A live check for the work Koinonia cannot afford to miss.
            </h1>

            <p className="koinonia-lead">
              Missing assignments, document gaps, billing blockers, access
              needs, and showing authorization issues are grouped for staff
              oversight before work moves forward.
            </p>
          </div>

          <div className="koinonia-staff-review-status-row">
            <ReviewBadge status={reviewView.report.overallStatus} label="Overall" />
            <span>{reviewView.isLiveData ? "Live portal records" : "Preview records"}</span>
            <span>Updated: {formatDateTime(reviewView.report.generatedAt)}</span>
            <span>
              AI: {reviewView.report.isAiProviderConfigured ? "Provider configured" : "Rules active"}
            </span>
          </div>

          {reviewView.notice ? (
            <p className="koinonia-staff-review-notice">{reviewView.notice}</p>
          ) : null}

          <div className="koinonia-staff-review-summary-grid">
            {reviewView.report.summary.map((card) => (
              <article className="koinonia-staff-review-summary-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          {reviewView.report.items.length === 0 ? (
            <section className="koinonia-staff-review-empty">
              <ReviewBadge status="clear" />
              <h2>Current portal work is clear.</h2>
              <p>
                New review findings will appear when staff assignments,
                documents, billing setup, access requests, or showing requests
                need attention.
              </p>
            </section>
          ) : (
            <div className="koinonia-staff-review-grid">
              {reviewView.report.sections.map((section) => (
                <section className="koinonia-staff-review-panel" key={section.id}>
                  <div className="koinonia-staff-review-panel-heading">
                    <p className="koinonia-eyebrow">{section.title}</p>
                    <ReviewBadge status={section.id} />
                  </div>

                  <div className="koinonia-staff-review-list">
                    {section.items.length > 0 ? (
                      section.items.map((item) => <ReviewItemCard item={item} key={item.id} />)
                    ) : (
                      <p className="koinonia-staff-review-empty-line">
                        No current {section.title.toLowerCase()} findings.
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-staff-review-next">
            <p className="koinonia-eyebrow">Review Sources</p>
            <h2 className="koinonia-heading">Rules now, AI after production controls pass.</h2>
            <div className="koinonia-staff-review-next-grid">
              <a href="/employee/documents">Documents</a>
              <a href="/employee/billing">Billing</a>
              <a href="/employee/access">Access</a>
              <a href="/employee/dashboard">Assignments</a>
              <a href="/employee/readiness">Readiness</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ReviewItemCard({ item }: { item: StaffReviewItem }) {
  return (
    <article className={`koinonia-staff-review-item ${item.severity}`}>
      <div className="koinonia-staff-review-item-heading">
        <div>
          <span>{getCategoryLabel(item.category)}</span>
          <h2>{item.title}</h2>
        </div>
        <ReviewBadge status={item.severity} />
      </div>
      <strong>{item.subject}</strong>
      <p>{item.nextAction}</p>
      <small>{item.proof}</small>
    </article>
  );
}

function ReviewBadge({ label, status }: { label?: string; status: StaffReviewSeverity }) {
  return (
    <span className={`koinonia-staff-review-badge ${status}`}>
      {label ? `${label}: ` : ""}
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status: StaffReviewSeverity): string {
  switch (status) {
    case "attention":
      return "Needs Attention";
    case "clear":
      return "Clear";
    case "critical":
      return "Critical";
    case "monitor":
      return "Monitor";
  }
}

function getCategoryLabel(category: StaffReviewItem["category"]): string {
  switch (category) {
    case "access":
      return "Access";
    case "assignment":
      return "Assignment";
    case "billing":
      return "Billing";
    case "documents":
      return "Documents";
    case "showings":
      return "Showings";
    case "workflow":
      return "Workflow";
  }
}

function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

async function getStaffReviewView(workspaceId: string): Promise<StaffReviewView> {
  try {
    const [workItems, documents] = await Promise.all([
      prisma.rosObject.findMany({
        where: {
          archivedAt: null,
          objectType: { in: [...staffReviewWorkObjectTypes] },
          workspaceId
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          assignedStaffUserId: true,
          backupStaffUserId: true,
          clientObjectId: true,
          clientUserId: true,
          createdAt: true,
          data: true,
          health: true,
          id: true,
          name: true,
          nextAction: true,
          objectType: true,
          status: true,
          updatedAt: true
        },
        take: 75
      }),
      prisma.document.findMany({
        where: {
          archivedAt: null,
          workspaceId
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          createdAt: true,
          documentType: true,
          fileName: true,
          id: true,
          relatedObjectId: true,
          requestedAction: true,
          status: true,
          storageKey: true,
          updatedAt: true
        },
        take: 75
      })
    ]);

    return {
      isLiveData: true,
      report: buildStaffReviewReport({
        aiProviderConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER),
        documents,
        workItems
      })
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      isLiveData: false,
      notice:
        "Production storage is not reachable in this preview, so sample staff review findings are shown.",
      report: buildStaffReviewReport({
        aiProviderConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER),
        documents: sampleDocuments,
        workItems: sampleWorkItems
      })
    };
  }
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
