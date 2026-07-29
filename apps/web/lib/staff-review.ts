import { accessRequestObjectType } from "./access-requests";
import { billingSetupRequestObjectType } from "./billing-setup-requests";
import { getPortalWorkStatusBucket } from "./portal-work-items";
import { showingRequestObjectType } from "./showing-requests";

export type StaffReviewSeverity = "attention" | "clear" | "critical" | "monitor";

export type StaffReviewCategory =
  | "access"
  | "assignment"
  | "billing"
  | "documents"
  | "showings"
  | "workflow";

export type StaffReviewSourceObject = {
  assignedStaffUserId?: string | null;
  backupStaffUserId?: string | null;
  clientObjectId?: string | null;
  clientUserId?: string | null;
  createdAt?: Date | string | null;
  data?: unknown;
  health: string;
  id: string;
  name: string;
  nextAction?: string | null;
  objectType: string;
  status: string;
  updatedAt?: Date | string | null;
};

export type StaffReviewSourceDocument = {
  createdAt?: Date | string | null;
  documentType: string;
  fileName: string;
  id: string;
  relatedObjectId?: string | null;
  requestedAction?: string | null;
  status: string;
  storageKey?: string | null;
  updatedAt?: Date | string | null;
};

export type StaffReviewInput = {
  aiProviderConfigured?: boolean;
  documents: StaffReviewSourceDocument[];
  generatedAt?: Date | string;
  workItems: StaffReviewSourceObject[];
};

export type StaffReviewItem = {
  category: StaffReviewCategory;
  id: string;
  nextAction: string;
  proof: string;
  severity: StaffReviewSeverity;
  subject: string;
  title: string;
};

export type StaffReviewSection = {
  id: StaffReviewSeverity;
  items: StaffReviewItem[];
  title: string;
};

export type StaffReviewReport = {
  generatedAt: string;
  isAiProviderConfigured: boolean;
  items: StaffReviewItem[];
  overallStatus: StaffReviewSeverity;
  sections: StaffReviewSection[];
  summary: Array<{
    label: string;
    value: string;
  }>;
};

export const staffReviewWorkObjectTypes = [
  "AccessRequest",
  "BillingSetupRequest",
  "Customer Success",
  "Service",
  "ShowingRequest",
  "Task",
  "Transaction"
] as const;

const reviewableWorkTypes = new Set<string>(staffReviewWorkObjectTypes);

const severityOrder: Record<StaffReviewSeverity, number> = {
  critical: 0,
  attention: 1,
  monitor: 2,
  clear: 3
};

export function buildStaffReviewReport(input: StaffReviewInput): StaffReviewReport {
  const generatedAt = normalizeDate(input.generatedAt) ?? new Date();
  const items = [
    ...input.workItems.flatMap((workItem) => reviewWorkItem(workItem, generatedAt)),
    ...input.documents.flatMap(reviewDocument)
  ].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.subject.localeCompare(b.subject));

  const summary = countBySeverity(items);
  const overallStatus = getOverallStatus(summary);

  return {
    generatedAt: generatedAt.toISOString(),
    isAiProviderConfigured: input.aiProviderConfigured === true,
    items,
    overallStatus,
    sections: buildSections(items),
    summary: [
      { label: "Critical", value: String(summary.critical) },
      { label: "Needs Attention", value: String(summary.attention) },
      { label: "Monitor", value: String(summary.monitor) },
      { label: "Clear", value: overallStatus === "clear" ? "Ready" : "Open" }
    ]
  };
}

function reviewWorkItem(
  workItem: StaffReviewSourceObject,
  generatedAt: Date
): StaffReviewItem[] {
  if (!reviewableWorkTypes.has(workItem.objectType)) {
    return [];
  }

  const findings: StaffReviewItem[] = [];
  const statusBucket = getPortalWorkStatusBucket(workItem.status);
  const isClosed = isClosedStatus(workItem.status, statusBucket);
  const data = toRecord(workItem.data);

  if (!isClosed && !workItem.assignedStaffUserId) {
    findings.push({
      category: "assignment",
      id: `${workItem.id}:assignment`,
      nextAction: "Assign a primary staff owner before promising the next client update.",
      proof: "No assignedStaffUserId is present on the work item.",
      severity: workItem.health.toLowerCase().includes("critical") ? "critical" : "attention",
      subject: workItem.name,
      title: "Primary assignee needed"
    });
  }

  if (!isClosed && !workItem.clientUserId && !workItem.clientObjectId) {
    findings.push({
      category: "assignment",
      id: `${workItem.id}:client-link`,
      nextAction: "Link the work to a client user or client object so portal visibility stays scoped.",
      proof: "No clientUserId or clientObjectId is present on the work item.",
      severity: "attention",
      subject: workItem.name,
      title: "Client link needed"
    });
  }

  if (!isClosed && !trimmed(workItem.nextAction)) {
    findings.push({
      category: "workflow",
      id: `${workItem.id}:next-action`,
      nextAction: "Record the next staff action before this item continues.",
      proof: "The work item has no nextAction value.",
      severity: "attention",
      subject: workItem.name,
      title: "Next action missing"
    });
  }

  if (!isClosed && isCriticalWorkStatus(workItem.status, workItem.health)) {
    findings.push({
      category: "workflow",
      id: `${workItem.id}:critical-health`,
      nextAction: trimmed(workItem.nextAction) ?? "Review the blocker and assign an escalation owner.",
      proof: `Status is ${workItem.status}; health is ${workItem.health}.`,
      severity: "critical",
      subject: workItem.name,
      title: "Blocked or critical work"
    });
  }

  if (!isClosed && isStale(workItem.updatedAt ?? workItem.createdAt, generatedAt)) {
    findings.push({
      category: "workflow",
      id: `${workItem.id}:stale`,
      nextAction: "Confirm the current owner, client status, and next client update.",
      proof: "This open item has not been updated in more than seven days.",
      severity: "monitor",
      subject: workItem.name,
      title: "Update may be stale"
    });
  }

  if (workItem.objectType === accessRequestObjectType && !isClosed) {
    findings.push(reviewAccessRequest(workItem, data));
  }

  if (workItem.objectType === billingSetupRequestObjectType && !isClosed) {
    findings.push(reviewBillingSetup(workItem, data));
  }

  if (workItem.objectType === showingRequestObjectType && !isClosed) {
    findings.push(reviewShowingRequest(workItem, data));
  }

  return findings.filter(Boolean);
}

function reviewAccessRequest(
  workItem: StaffReviewSourceObject,
  data: Record<string, unknown>
): StaffReviewItem {
  const status = workItem.status;
  const platform = getString(data.platformName) ?? "Delegated access";
  const blocked = /blocked/i.test(status);

  return {
    category: "access",
    id: `${workItem.id}:access`,
    nextAction: blocked
      ? "Resolve the access blocker before staff use the related platform."
      : "Confirm delegated access through the approved platform flow; do not collect raw credentials.",
    proof: `${platform} request is ${status}.`,
    severity: blocked ? "critical" : "attention",
    subject: workItem.name,
    title: blocked ? "Access blocker" : "Delegated access pending"
  };
}

function reviewBillingSetup(
  workItem: StaffReviewSourceObject,
  data: Record<string, unknown>
): StaffReviewItem {
  const status = workItem.status;
  const consentAcknowledged = data.consentAcknowledged === true;
  const blocked = /blocked|consent/i.test(status) || !consentAcknowledged;
  const service = getString(data.serviceName) ?? "Service billing";

  return {
    category: "billing",
    id: `${workItem.id}:billing`,
    nextAction: blocked
      ? "Confirm billing consent and send a processor-hosted setup link before billable work advances."
      : "Track the processor setup state and store only safe payment method metadata.",
    proof: `${service} billing status is ${status}; consent ${consentAcknowledged ? "is recorded" : "is not recorded"}.`,
    severity: blocked ? "critical" : "attention",
    subject: workItem.name,
    title: blocked ? "Billing consent or setup gap" : "Billing setup follow-up"
  };
}

function reviewShowingRequest(
  workItem: StaffReviewSourceObject,
  data: Record<string, unknown>
): StaffReviewItem {
  const authorization = data.authorization === true;
  const window = getString(data.preferredWindow) ?? "Timing pending";

  return {
    category: "showings",
    id: `${workItem.id}:showing`,
    nextAction: authorization
      ? "Assign coverage and confirm the appointment window with the client."
      : "Confirm Realtor authorization before contacting the buyer or scheduling directly.",
    proof: `Preferred window: ${window}; authorization ${authorization ? "is recorded" : "is missing"}.`,
    severity: authorization ? "attention" : "critical",
    subject: workItem.name,
    title: authorization ? "Showing needs scheduling follow-up" : "Showing authorization needed"
  };
}

function reviewDocument(document: StaffReviewSourceDocument): StaffReviewItem[] {
  const findings: StaffReviewItem[] = [];
  const statusBucket = getPortalWorkStatusBucket(document.status);
  const isClosed = isClosedStatus(document.status, statusBucket);

  if (!isClosed && !trimmed(document.storageKey)) {
    findings.push({
      category: "documents",
      id: `${document.id}:storage`,
      nextAction: "Re-upload or repair the private storage reference before staff depend on this file.",
      proof: `${document.fileName} has no private storage key.`,
      severity: "critical",
      subject: document.documentType,
      title: "Document storage missing"
    });
  }

  if (!isClosed && !trimmed(document.requestedAction)) {
    findings.push({
      category: "documents",
      id: `${document.id}:requested-action`,
      nextAction: "Record whether this document needs review, drafting, approval, sending, or archive.",
      proof: `${document.fileName} has no requested action.`,
      severity: "attention",
      subject: document.documentType,
      title: "Document action needed"
    });
  }

  if (!isClosed && /review|approval|uploaded/i.test(document.status)) {
    findings.push({
      category: "documents",
      id: `${document.id}:review`,
      nextAction:
        trimmed(document.requestedAction) ??
        "Review the document and capture Realtor approval before sending anything.",
      proof: `${document.fileName} status is ${document.status}.`,
      severity: /approval/i.test(document.status) ? "critical" : "attention",
      subject: document.documentType,
      title: /approval/i.test(document.status) ? "Approval checkpoint open" : "Document review open"
    });
  }

  return findings;
}

function buildSections(items: StaffReviewItem[]): StaffReviewSection[] {
  return (["critical", "attention", "monitor"] as const).map((severity) => ({
    id: severity,
    items: items.filter((item) => item.severity === severity),
    title: getSectionTitle(severity)
  }));
}

function getSectionTitle(severity: StaffReviewSeverity): string {
  switch (severity) {
    case "critical":
      return "Critical";
    case "attention":
      return "Needs Attention";
    case "monitor":
      return "Monitor";
    case "clear":
      return "Clear";
  }
}

function countBySeverity(items: StaffReviewItem[]): Record<Exclude<StaffReviewSeverity, "clear">, number> {
  return items.reduce(
    (counts, item) => {
      if (item.severity !== "clear") {
        counts[item.severity] += 1;
      }

      return counts;
    },
    { attention: 0, critical: 0, monitor: 0 }
  );
}

function getOverallStatus(
  summary: Record<Exclude<StaffReviewSeverity, "clear">, number>
): StaffReviewSeverity {
  if (summary.critical > 0) return "critical";
  if (summary.attention > 0) return "attention";
  if (summary.monitor > 0) return "monitor";
  return "clear";
}

function isCriticalWorkStatus(status: string, health: string): boolean {
  return /blocked|critical|overdue|past due|urgent/i.test(`${status} ${health}`);
}

function isClosedStatus(status: string, statusBucket: string): boolean {
  return statusBucket === "completed" || /canceled|cancelled|no longer needed/i.test(status);
}

function isStale(value: Date | string | null | undefined, generatedAt: Date): boolean {
  const date = normalizeDate(value);

  if (!date) {
    return false;
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return generatedAt.getTime() - date.getTime() > sevenDaysMs;
}

function normalizeDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function trimmed(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
