import { formatDocumentFileSize, getDocumentSubmittedLabel, getHumanDocumentStatus } from "./portal-documents";
import { getPortalWorkDueLabel, getPortalWorkItemTypeLabel } from "./portal-work-items";

export type PortalWorkspaceSourceDocument = {
  createdAt: Date | string;
  documentType: string;
  fileName: string;
  fileSizeBytes?: number | null;
  id: string;
  requestedAction?: string | null;
  status: string;
  storageKey?: string | null;
};

export type PortalWorkspaceSourceEvent = {
  createdAt: Date | string;
  eventType: string;
  id: string;
  summary: string;
};

export type PortalWorkspaceSourceWorkItem = {
  createdAt: Date | string;
  data?: unknown;
  health: string;
  id: string;
  name: string;
  nextAction?: string | null;
  objectType: string;
  status: string;
  updatedAt: Date | string;
};

export type PortalWorkspaceDocumentItem = {
  detail: string;
  downloadHref?: string;
  fileInfo: string;
  id: string;
  status: string;
  submitted: string;
  title: string;
};

export type PortalWorkspaceEventItem = {
  id: string;
  label: string;
  summary: string;
  time: string;
};

export type PortalWorkspaceMetaItem = {
  label: string;
  value: string;
};

export type PortalWorkspaceSummary = {
  created: string;
  due: string;
  health: string;
  id: string;
  meta: PortalWorkspaceMetaItem[];
  nextAction: string;
  status: string;
  title: string;
  type: string;
  updated: string;
};

const hiddenDataKeyPattern =
  /(password|passcode|credential|secret|token|api|key|code|cvv|cvc|card|routing|account|bank|username|login|pin)/i;

const preferredDataKeys = [
  ["clientName", "Client"],
  ["customerName", "Customer"],
  ["serviceName", "Service"],
  ["serviceLevel", "Service Level"],
  ["packageName", "Package"],
  ["propertyAddress", "Property"],
  ["transactionName", "Transaction"],
  ["preferredWindow", "Timing"],
  ["billingModel", "Billing"],
  ["amountLabel", "Amount"],
  ["requestedAction", "Requested Action"],
  ["documentType", "Document Type"]
] as const;

export function buildPortalWorkspaceSummary(
  workItem: PortalWorkspaceSourceWorkItem
): PortalWorkspaceSummary {
  return {
    created: formatPortalWorkspaceDate(workItem.createdAt),
    due: getPortalWorkDueLabel(workItem.data),
    health: workItem.health,
    id: workItem.id,
    meta: buildPortalWorkspaceMeta(workItem.data),
    nextAction: workItem.nextAction ?? "Koinonia will update this work item as it moves.",
    status: workItem.status,
    title: workItem.name,
    type: getPortalWorkItemTypeLabel(workItem.objectType),
    updated: formatPortalWorkspaceDate(workItem.updatedAt)
  };
}

export function buildPortalWorkspaceDocuments(
  documents: PortalWorkspaceSourceDocument[],
  options: { downloadBasePath: string; storageReady: boolean }
): PortalWorkspaceDocumentItem[] {
  return documents.map((document) => ({
    detail: document.requestedAction ?? "Document is attached to this work item.",
    downloadHref:
      options.storageReady && document.storageKey
        ? `${options.downloadBasePath}/${document.id}/download`
        : undefined,
    fileInfo: `${document.fileName} - ${formatDocumentFileSize(document.fileSizeBytes)}`,
    id: document.id,
    status: getHumanDocumentStatus(document.status),
    submitted: getDocumentSubmittedLabel(document.createdAt),
    title: document.documentType
  }));
}

export function buildPortalWorkspaceTimeline(
  events: PortalWorkspaceSourceEvent[]
): PortalWorkspaceEventItem[] {
  return events.map((event) => ({
    id: event.id,
    label: getPortalWorkspaceEventLabel(event.eventType),
    summary: event.summary,
    time: formatPortalWorkspaceDateTime(event.createdAt)
  }));
}

export function buildEmptyPortalWorkspaceDocuments(): PortalWorkspaceDocumentItem[] {
  return [
    {
      detail: "Documents uploaded or prepared for this work item will appear here.",
      fileInfo: "No file attached",
      id: "empty-workspace-documents",
      status: "Ready",
      submitted: "No upload yet",
      title: "No documents on this work item yet"
    }
  ];
}

export function buildEmptyPortalWorkspaceTimeline(): PortalWorkspaceEventItem[] {
  return [
    {
      id: "empty-workspace-timeline",
      label: "Workspace Ready",
      summary: "Timeline history will appear after staff or portal actions are recorded.",
      time: "No history yet"
    }
  ];
}

function buildPortalWorkspaceMeta(data: unknown): PortalWorkspaceMetaItem[] {
  const record = toRecord(data);
  const meta = preferredDataKeys.flatMap(([key, label]) => {
    const value = getSafeDisplayValue(record[key]);

    return value ? [{ label, value }] : [];
  });

  return meta.length
    ? meta.slice(0, 8)
    : [{ label: "Details", value: "No additional safe metadata recorded yet." }];
}

function getSafeDisplayValue(value: unknown): string | null {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  if (!text || hiddenDataKeyPattern.test(text)) {
    return null;
  }

  return text.length > 140 ? `${text.slice(0, 137)}...` : text;
}

function getPortalWorkspaceEventLabel(eventType: string): string {
  return eventType
    .split(/[._:-]+/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatPortalWorkspaceDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatPortalWorkspaceDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "Time pending";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function toRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}
