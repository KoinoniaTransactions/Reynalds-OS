import type { Prisma } from "@reynalds-os/database";
import type {
  ReynaldsBrothersCommunicationEntry,
  ReynaldsBrothersWorkItemData
} from "./reynalds-brothers-work-items";
import { getCompatibleCommunicationLog } from "./reynalds-brothers-work-items";

export type ReynaldsBrothersDatabaseCommunication = {
  id: string;
  source: string;
  externalMessageId: string;
  externalThreadId: string | null;
  workItemId: string | null;
  subject: string;
  sender: string;
  recipients: Prisma.JsonValue | null;
  sentAt: Date | null;
  snippet: string | null;
  bodyText: string | null;
  sourceUrl: string | null;
  status: string;
  matchConfidence: number | null;
  matchEvidence: Prisma.JsonValue | null;
  rawMetadata: Prisma.JsonValue | null;
  createdAt: Date;
  attachments?: Array<{ fileName: string }>;
};

function stringList(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function stringRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

export function databaseCommunicationToEntry(
  communication: ReynaldsBrothersDatabaseCommunication
): ReynaldsBrothersCommunicationEntry {
  const metadata = stringRecord(communication.rawMetadata);
  const evidence = stringRecord(communication.matchEvidence);

  return {
    id: communication.id,
    channel: String(metadata.channel ?? "email"),
    direction: String(metadata.direction ?? "inbound"),
    sourceLabel: String(metadata.sourceLabel ?? communication.source),
    subject: communication.subject,
    from: communication.sender,
    to: stringList(communication.recipients).join(", ") || undefined,
    occurredAt: communication.sentAt?.toISOString() ?? communication.createdAt.toISOString(),
    snippet: communication.snippet ?? undefined,
    body: communication.bodyText ?? undefined,
    providerMessageId: communication.externalMessageId,
    communicationObjectId: communication.id,
    attachments: communication.attachments?.map((attachment) => attachment.fileName) ?? [],
    classificationConfidence: typeof evidence.confidence === "string" ? evidence.confidence : undefined,
    matchedBy: Array.isArray(evidence.reasons)
      ? evidence.reasons.filter((reason): reason is string => typeof reason === "string")
      : [],
    humanResponseStatus: typeof metadata.humanResponseStatus === "string"
      ? metadata.humanResponseStatus
      : communication.status === "filed"
        ? "Needs Response"
        : "Needs Review",
    humanResponseBy: typeof metadata.humanResponseBy === "string" ? metadata.humanResponseBy : undefined,
    humanResponseAt: typeof metadata.humanResponseAt === "string" ? metadata.humanResponseAt : undefined,
    humanResponseNotes: typeof metadata.humanResponseNotes === "string" ? metadata.humanResponseNotes : undefined,
    humanActionTaken: typeof metadata.humanActionTaken === "string" ? metadata.humanActionTaken : undefined,
    filedBy: typeof metadata.filedBy === "string" ? metadata.filedBy : undefined,
    filedAt: communication.createdAt.toISOString()
  };
}

export function mergeCommunicationHistory(
  data: ReynaldsBrothersWorkItemData,
  databaseCommunications: ReynaldsBrothersCommunicationEntry[]
): ReynaldsBrothersWorkItemData {
  const byKey = new Map<string, ReynaldsBrothersCommunicationEntry>();

  for (const communication of [
    ...databaseCommunications,
    ...getCompatibleCommunicationLog(data)
  ]) {
    const key = communication.providerMessageId
      ? `provider:${communication.providerMessageId}`
      : `id:${communication.id}`;

    if (!byKey.has(key)) byKey.set(key, communication);
  }

  const communicationLog = [...byKey.values()].sort((first, second) => {
    const firstTime = Date.parse(first.occurredAt ?? first.filedAt ?? "") || 0;
    const secondTime = Date.parse(second.occurredAt ?? second.filedAt ?? "") || 0;
    return secondTime - firstTime;
  });

  const latest = communicationLog[0];
  const needsResponse = communicationLog.some((entry) => {
    const status = String(entry.humanResponseStatus ?? "").toLowerCase();
    return !status || status.includes("needs") || status.includes("pending") || status.includes("review") || status.includes("follow");
  });

  return {
    ...data,
    communicationLog,
    lastCommunicationAt: latest?.occurredAt ?? latest?.filedAt ?? data.lastCommunicationAt,
    lastCommunicationSubject: latest?.subject ?? data.lastCommunicationSubject,
    communicationNeedsResponse: needsResponse,
    communicationResponseStatus: needsResponse ? "Needs Office Review" : "Current"
  };
}
