import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "../../../../config/seo.config";
import { Footer, Header } from "../../../../components/site";
import { TransactionRequirementQuestions } from "../../../../components/client/TransactionRequirementQuestions";
import { isPortalDocumentR2Configured } from "../../../../lib/portal-document-r2";
import { prisma } from "../../../../lib/db";
import { requirePortalPermission } from "../../../../lib/portal-auth";
import {
  buildEmptyPortalWorkspaceDocuments,
  buildEmptyPortalWorkspaceTimeline,
  buildPortalWorkspaceDocuments,
  buildPortalWorkspaceSummary,
  buildPortalWorkspaceTimeline,
  type PortalWorkspaceDocumentItem,
  type PortalWorkspaceEventItem,
  type PortalWorkspaceSummary
} from "../../../../lib/portal-workspace";
import { clientPortalWorkObjectTypes } from "../../../../lib/portal-work-items";
import {
  buildTransactionDocumentChecklist,
  defaultPhase,
  getTransactionRequirementQuestions,
  type TransactionDocumentChecklistItem,
  type TransactionFacts,
  type TransactionRequirementQuestion
} from "../../../../lib/transaction-document-requirements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Work Detail",
  description:
    "Protected Koinonia client work detail for status, next action, documents, and work history.",
  alternates: {
    canonical: absoluteUrl("/client/work")
  },
  robots: {
    index: false,
    follow: false
  }
};

type Params = {
  params: Promise<{ id: string }>;
};

type ClientWorkWorkspaceView = {
  checklist: TransactionDocumentChecklistItem[];
  documents: PortalWorkspaceDocumentItem[];
  events: PortalWorkspaceEventItem[];
  notice?: string;
  questions: TransactionRequirementQuestion[];
  summary: PortalWorkspaceSummary;
  transactionId: string;
};

export default async function ClientWorkDetailPage({ params }: Params) {
  const actor = await requirePortalPermission("client-portal:work:view", "/client/dashboard");
  const { id } = await params;
  const workspace = await getClientWorkWorkspace(actor.workspaceId, actor.id, id);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="koinonia-site koinonia-workspace-detail koinonia-client-workspace-detail">
      <Header />

      <section className="koinonia-section koinonia-workspace-hero">
        <div className="koinonia-container">
          <a className="koinonia-document-link" href="/client/dashboard">
            ← Back to Dashboard
          </a>

          <div className="koinonia-workspace-transaction-header">
            <div className="koinonia-section-header">
              <p className="koinonia-eyebrow">{workspace.summary.type}</p>
              <h1 className="koinonia-title">{workspace.summary.title}</h1>
              <p className="koinonia-lead">{workspace.summary.nextAction}</p>
            </div>

            <div className="koinonia-workspace-health-strip" aria-label="Transaction status">
              <span>{workspace.summary.status}</span>
              <strong>{workspace.summary.health}</strong>
              <span>{workspace.summary.due}</span>
            </div>
          </div>

          {workspace.notice ? (
            <p className="koinonia-client-security-note">{workspace.notice}</p>
          ) : null}

          <nav className="koinonia-workspace-tabs" aria-label="Transaction workspace sections">
            <a href="#overview">Overview</a>
            <a href="#documents">Documents</a>
            <a href="#timeline">Timeline</a>
          </nav>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-workspace-main-stack">
            <section
              id="overview"
              className="koinonia-workspace-panel koinonia-workspace-overview-panel"
              aria-labelledby="client-work-overview"
            >
              <div className="koinonia-workspace-panel-heading">
                <div>
                  <p className="koinonia-eyebrow">Overview</p>
                  <h2 id="client-work-overview">What matters right now</h2>
                </div>
                <p>Updated {workspace.summary.updated}</p>
              </div>

              <div className="koinonia-workspace-next-action">
                <span>Next up</span>
                <strong>{workspace.summary.nextAction}</strong>
              </div>

              <div className="koinonia-workspace-meta-grid">
                {workspace.summary.meta.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </section>

            <WorkspaceDocuments
              checklist={workspace.checklist}
              documents={workspace.documents}
              isEmployee={false}
              questions={workspace.questions}
              transactionId={workspace.transactionId}
            />
            <WorkspaceTimeline events={workspace.events} isEmployee={false} />

            <section className="koinonia-workspace-panel koinonia-workspace-boundary-card">
              <p className="koinonia-eyebrow">Keep sensitive access private</p>
              <p>
                Do not place passwords, access codes, card numbers, or private login details in portal notes.
                Use approved delegated access or processor-hosted payment setup instead.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function WorkspaceDocuments({
  checklist,
  documents,
  isEmployee,
  questions,
  transactionId
}: {
  checklist: TransactionDocumentChecklistItem[];
  documents: PortalWorkspaceDocumentItem[];
  isEmployee: boolean;
  questions: TransactionRequirementQuestion[];
  transactionId: string;
}) {
  const receivedCount = checklist.filter((item) => item.status === "received").length;
  const requiredMissingCount = checklist.filter((item) => item.status === "missing").length;

  return (
    <section id="documents" className="koinonia-workspace-panel" aria-labelledby="client-work-documents">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">Documents</p>
          <h2 id="client-work-documents">What we have and what is still needed</h2>
        </div>
        <a className="koinonia-document-link" href="/client/documents">
          Document Center
        </a>
      </div>

      <TransactionRequirementQuestions transactionId={transactionId} questions={questions} />

      {checklist.length ? (
        <div className="koinonia-document-checklist">
          <div className="koinonia-document-checklist-summary">
            <strong>{receivedCount} received</strong>
            <span>
              {requiredMissingCount
                ? `${requiredMissingCount} required ${requiredMissingCount === 1 ? "document" : "documents"} still missing`
                : "No currently-required documents missing"}
            </span>
          </div>

          <div className="koinonia-document-checklist-list">
            {checklist.map((item) => (
              <article className={`koinonia-document-checklist-item is-${item.status}`} key={item.id}>
                <div>
                  <span>{formatChecklistStatus(item)}</span>
                  <h3>{item.label}</h3>
                  <p>{item.guidance}</p>
                  {item.fileName ? <p>Received: {item.fileName}</p> : null}
                </div>
                <strong>{formatRequirementLevel(item.level)}</strong>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="koinonia-workspace-panel-heading koinonia-workspace-documents-heading">
        <div>
          <p className="koinonia-eyebrow">Attached</p>
          <h3>Files in this transaction</h3>
        </div>
      </div>

      <div className="koinonia-workspace-list">
        {documents.map((document) => (
          <article className="koinonia-workspace-list-item" key={document.id}>
            <div>
              <span>{document.status}</span>
              <h3>{document.title}</h3>
              <p>{document.detail}</p>
              <p>{document.fileInfo}</p>
              {document.downloadHref ? (
                <a
                  className={isEmployee ? "koinonia-document-link employee" : "koinonia-document-link"}
                  href={document.downloadHref}
                >
                  Download
                </a>
              ) : null}
            </div>
            <strong>{document.submitted}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkspaceTimeline({
  events,
  isEmployee
}: {
  events: PortalWorkspaceEventItem[];
  isEmployee: boolean;
}) {
  return (
    <section id="timeline" className="koinonia-workspace-panel" aria-labelledby="client-work-history">
      <div className="koinonia-workspace-panel-heading">
        <div>
          <p className="koinonia-eyebrow">Timeline</p>
          <h2 id="client-work-history">Recent activity</h2>
        </div>
      </div>

      <div className="koinonia-workspace-timeline">
        {events.map((event) => (
          <article className={isEmployee ? "employee" : undefined} key={event.id}>
            <span>{event.label}</span>
            <strong>{event.summary}</strong>
            <p>{event.time}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

async function getClientWorkWorkspace(
  workspaceId: string,
  userId: string,
  workItemId: string
): Promise<ClientWorkWorkspaceView | null> {
  try {
    const workItem = await prisma.rosObject.findFirst({
      where: {
        id: workItemId,
        workspaceId,
        objectType: {
          in: [...clientPortalWorkObjectTypes]
        },
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      }
    });

    if (!workItem) {
      return null;
    }

    const [documents, events] = await Promise.all([
      prisma.document.findMany({
        where: {
          workspaceId,
          relatedObjectId: workItem.id,
          archivedAt: null,
          accessLevel: {
            in: ["client", "client_and_staff"]
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 50
      }),
      prisma.timelineEvent.findMany({
        where: {
          workspaceId,
          objectId: workItem.id
        },
        orderBy: { createdAt: "desc" },
        take: 30
      })
    ]);

    const data = asRecord(workItem.data) ?? {};
    const side = data.side === "seller" ? "seller" : data.side === "buyer" ? "buyer" : null;
    const stage =
      data.stage === "under_contract"
        ? "under_contract"
        : data.stage === "pre_contract"
          ? "pre_contract"
          : null;
    const facts = readRequirementFacts(data);
    const phase = side && stage ? defaultPhase(side, stage) : null;
    const checklist =
      side && stage && phase
        ? buildTransactionDocumentChecklist(
            side,
            stage,
            documents
              .filter((document) => !document.removedAt && document.lifecycleState === "active")
              .map((document) => ({
                id: document.id,
                documentType: document.documentType,
                fileName: document.fileName
              })),
            facts,
            phase
          )
        : [];
    const questions =
      side && stage && phase
        ? getTransactionRequirementQuestions(side, stage, facts, phase)
        : [];

    return {
      checklist,
      documents: withWorkspaceDocuments(
        buildPortalWorkspaceDocuments(documents, {
          downloadBasePath: "/api/portal/documents",
          storageReady: isDocumentStorageConfigured()
        })
      ),
      events: withWorkspaceEvents(buildPortalWorkspaceTimeline(events)),
      questions,
      summary: buildPortalWorkspaceSummary(workItem),
      transactionId: workItem.id
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return {
      checklist: [],
      documents: buildEmptyPortalWorkspaceDocuments(),
      events: buildEmptyPortalWorkspaceTimeline(),
      notice:
        "Work detail storage is not reachable in this preview, so live status, documents, and history cannot be shown yet.",
      questions: [],
      summary: buildUnavailableWorkspaceSummary(workItemId),
      transactionId: workItemId
    };
  }
}

function readRequirementFacts(data: Record<string, unknown>): TransactionFacts {
  const stored = asRecord(data.requirementFacts) ?? {};
  const facts: TransactionFacts = {};

  const propertyUse = stored.propertyUse ?? data.propertyUse;
  if (
    propertyUse === "residential" ||
    propertyUse === "income_residential" ||
    propertyUse === "land" ||
    propertyUse === "commercial" ||
    propertyUse === "unknown"
  ) facts.propertyUse = propertyUse;

  const yearBuilt = stored.yearBuilt ?? data.yearBuilt;
  if (typeof yearBuilt === "number" && Number.isInteger(yearBuilt)) facts.yearBuilt = yearBuilt;

  const financingType = stored.financingType ?? data.financingType;
  if (financingType === "cash" || financingType === "loan" || financingType === "owner_carry" || financingType === "unknown") {
    facts.financingType = financingType;
  } else if (typeof financingType === "string") {
    const normalized = financingType.toLocaleLowerCase("en-US");
    if (normalized.includes("cash")) facts.financingType = "cash";
    else if (normalized.includes("owner") || normalized.includes("seller")) facts.financingType = "owner_carry";
    else if (normalized.includes("loan") || normalized.includes("conventional") || normalized.includes("fha") || normalized.includes("va")) facts.financingType = "loan";
  }

  const booleanKeys: Array<keyof TransactionFacts> = [
    "inHoa",
    "squareFootageAdvertised",
    "sellerDisclosureExempt",
    "waterDisclosureSatisfied",
    "shortSale",
    "foreclosure",
    "manufacturedHome",
    "hasCounterproposal",
    "contractAmended",
    "inspectionObjectionUsed",
    "titleObjectionUsed",
    "appraisalObjectionUsed",
    "contractTerminated",
    "contractRevived",
    "powerOfAttorneyUsed",
    "personalPropertyAgreementUsed",
    "postClosingOccupancy",
    "preClosingOccupancy",
    "affiliatedBusinessReferral",
    "referralFee"
  ];

  for (const key of booleanKeys) {
    const value = stored[key] ?? data[key];
    if (typeof value === "boolean") {
      (facts as Record<string, unknown>)[key] = value;
    }
  }

  return facts;
}

function formatChecklistStatus(item: TransactionDocumentChecklistItem): string {
  if (item.status === "received") return "Received";
  if (item.status === "missing") return "Missing now";
  if (item.status === "expected") return "Expected";
  if (item.status === "upcoming") return "Upcoming";
  return "Optional";
}

function formatRequirementLevel(level: TransactionDocumentChecklistItem["level"]): string {
  if (level === "required") return "Required";
  if (level === "expected") return "Expected";
  return "Optional";
}

function withWorkspaceDocuments(
  documents: PortalWorkspaceDocumentItem[]
): PortalWorkspaceDocumentItem[] {
  return documents.length ? documents : buildEmptyPortalWorkspaceDocuments();
}

function withWorkspaceEvents(events: PortalWorkspaceEventItem[]): PortalWorkspaceEventItem[] {
  return events.length ? events : buildEmptyPortalWorkspaceTimeline();
}

function isDocumentStorageConfigured(): boolean {
  return isPortalDocumentR2Configured();
}

function buildUnavailableWorkspaceSummary(workItemId: string): PortalWorkspaceSummary {
  return {
    created: "Storage unavailable",
    due: "Storage unavailable",
    health: "Unavailable",
    id: workItemId,
    meta: [{ label: "Storage", value: "Work detail unavailable" }],
    nextAction: "Connect production database storage before using live work detail pages.",
    status: "Storage Unavailable",
    title: "Work detail temporarily unavailable",
    type: "Portal Work",
    updated: "Storage unavailable"
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
