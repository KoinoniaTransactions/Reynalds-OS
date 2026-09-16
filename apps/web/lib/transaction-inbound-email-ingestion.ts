import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";
import { clientTransactionObjectType } from "./client-transactions";
import {
  extractTransactionDocumentWithOpenAI,
  isOpenAiTransactionExtractionConfigured
} from "./openai-transaction-extraction";
import {
  getConfiguredPortalDocumentScannerCommand,
  getConfiguredPortalDocumentUploadRoot,
  PortalDocumentScanUnavailableError,
  scanPortalDocumentUpload
} from "./portal-document-storage";
import {
  isPortalDocumentR2UploadEnabled,
  persistPortalDocumentToR2ForWorkspace,
  removePortalDocumentFromR2Quietly
} from "./portal-document-r2";
import {
  PortalDocumentValidationError,
  validatePortalDocumentSubmission
} from "./portal-documents";
import {
  downloadResendInboundAttachment,
  listResendReceivedAttachments,
  type ResendEmailReceivedEvent,
  type ResendInboundAttachment
} from "./resend-inbound-email";
import { getTransactionIdFromInboundRecipient } from "./transaction-inbound-email";

export type InboundEmailIngestionResult = {
  emailId: string;
  ignored: boolean;
  transactionId?: string;
  received: number;
  duplicates: number;
  rejected: number;
};

type InboundScanStatus = "scanned" | "preview-bypassed";

export async function ingestTransactionInboundEmail(
  event: ResendEmailReceivedEvent
): Promise<InboundEmailIngestionResult> {
  const transactionId = event.data.to
    .map(getTransactionIdFromInboundRecipient)
    .find((value): value is string => Boolean(value));

  if (!transactionId) {
    return {
      emailId: event.data.email_id,
      ignored: true,
      received: 0,
      duplicates: 0,
      rejected: 0
    };
  }

  const transaction = await prisma.rosObject.findFirst({
    where: {
      id: transactionId,
      objectType: clientTransactionObjectType,
      archivedAt: null
    },
    select: {
      id: true,
      workspaceId: true,
      ownerId: true,
      clientUserId: true,
      name: true,
      data: true
    }
  });

  if (!transaction) {
    return {
      emailId: event.data.email_id,
      ignored: true,
      received: 0,
      duplicates: 0,
      rejected: 0
    };
  }

  const attachments = await listResendReceivedAttachments(event.data.email_id);
  let received = 0;
  let duplicates = 0;
  let rejected = 0;

  for (const attachment of attachments) {
    if (!shouldProcessAttachment(attachment)) continue;

    const marker = buildInboundMarker(event.data.email_id, attachment.id);
    const existing = await prisma.document.findFirst({
      where: {
        workspaceId: transaction.workspaceId,
        relatedObjectId: transaction.id,
        notes: { contains: marker }
      },
      select: { id: true }
    });

    if (existing) {
      duplicates += 1;
      continue;
    }

    try {
      await ingestAttachment({
        attachment,
        event,
        marker,
        transaction
      });
      received += 1;
    } catch (error) {
      if (error instanceof PortalDocumentValidationError) {
        rejected += 1;
        await recordRejectedAttachment({ attachment, event, transaction, reason: error.message });
        continue;
      }
      throw error;
    }
  }

  if (!attachments.some(shouldProcessAttachment)) {
    await prisma.timelineEvent.create({
      data: {
        workspaceId: transaction.workspaceId,
        objectId: transaction.id,
        actorId: null,
        eventType: "document.email_received_no_supported_attachments",
        summary: "Email received for this transaction with no supported document attachments",
        newValue: {
          emailId: event.data.email_id,
          from: event.data.from,
          subject: event.data.subject
        }
      }
    });
  }

  return {
    emailId: event.data.email_id,
    ignored: false,
    transactionId: transaction.id,
    received,
    duplicates,
    rejected
  };
}

async function ingestAttachment({
  attachment,
  event,
  marker,
  transaction
}: {
  attachment: ResendInboundAttachment;
  event: ResendEmailReceivedEvent;
  marker: string;
  transaction: {
    id: string;
    workspaceId: string;
    ownerId: string | null;
    clientUserId: string | null;
    name: string;
    data: unknown;
  };
}) {
  if (!isPortalDocumentR2UploadEnabled()) {
    throw new Error("Cloudflare R2 inbound document uploads are not enabled.");
  }

  const file = await downloadResendInboundAttachment(attachment);
  const input = validatePortalDocumentSubmission({
    documentType: "Pending Classification",
    file: { name: file.name, size: file.size, type: file.type },
    notes: `${marker}\nReceived by email from ${event.data.from}. Subject: ${sanitizeNote(event.data.subject)}`,
    relatedObjectId: transaction.id,
    requestedAction: "Koinonia is classifying and filing this emailed document.",
    transactionName: transaction.name
  });

  const scanStatus = await scanInboundDocument({
    workspaceId: transaction.workspaceId,
    cleanName: input.file.cleanName,
    file
  });
  const stored = await persistPortalDocumentToR2ForWorkspace({
    workspaceId: transaction.workspaceId,
    cleanName: input.file.cleanName,
    file
  });

  let documentPersisted = false;
  try {
    const document = await prisma.document.create({
      data: {
        workspaceId: transaction.workspaceId,
        relatedObjectId: transaction.id,
        ownerId: transaction.clientUserId ?? transaction.ownerId,
        uploadedByUserId: null,
        fileName: input.file.cleanName,
        fileUrl: stored.fileUrl,
        storageKey: stored.storageKey,
        fileSizeBytes: input.file.size,
        mimeType: input.file.mimeType,
        documentType: input.documentType,
        status: "Uploaded",
        requestedAction: input.requestedAction,
        notes: input.notes,
        accessLevel: "client_and_staff"
      }
    });
    documentPersisted = true;

    await prisma.timelineEvent.create({
      data: {
        workspaceId: transaction.workspaceId,
        objectId: transaction.id,
        actorId: null,
        eventType: "document.received_by_email",
        summary: `Document received by email: ${input.file.cleanName}`,
        newValue: {
          documentId: document.id,
          emailId: event.data.email_id,
          attachmentId: attachment.id,
          from: event.data.from,
          subject: event.data.subject,
          scanStatus
        }
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: transaction.workspaceId,
        actorId: null,
        actorEmail: event.data.from,
        action: "inbound_email.document_received",
        subjectType: "Document",
        subjectId: document.id,
        summary: `Inbound email attachment received for ${transaction.name}`,
        metadata: {
          transactionId: transaction.id,
          emailId: event.data.email_id,
          attachmentId: attachment.id,
          fileName: input.file.cleanName,
          mimeType: input.file.mimeType,
          scanStatus,
          source: "inbound-email"
        }
      }
    });

    await classifyInboundDocument({
      bytes: new Uint8Array(await file.arrayBuffer()),
      document,
      transaction
    });
  } catch (error) {
    if (!documentPersisted) {
      await removePortalDocumentFromR2Quietly(stored.storageKey);
    }
    throw error;
  }
}

async function classifyInboundDocument({
  bytes,
  document,
  transaction
}: {
  bytes: Uint8Array;
  document: {
    id: string;
    fileName: string;
    mimeType: string | null;
    documentType: string;
  };
  transaction: {
    id: string;
    workspaceId: string;
    data: unknown;
  };
}) {
  if (!isOpenAiTransactionExtractionConfigured()) {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "In Review",
        requestedAction: "Staff review needed: automatic document classification is not configured."
      }
    });
    return;
  }

  const data = asRecord(transaction.data) ?? {};
  const side = data.side === "buyer" || data.side === "seller" ? data.side : undefined;
  const stage = data.stage === "pre_contract" || data.stage === "under_contract" ? data.stage : undefined;

  try {
    const proposal = await extractTransactionDocumentWithOpenAI({
      bytes,
      fileName: document.fileName,
      mimeType: document.mimeType ?? "application/octet-stream",
      sourceDocumentId: document.id,
      sourceDocumentType: document.documentType,
      side,
      stage
    });
    const highConfidenceMatch = proposal.confidence === "high" && proposal.documentMatch === "match";

    await prisma.document.update({
      where: { id: document.id },
      data: {
        documentType: proposal.identifiedDocumentType || "Other Transaction Document",
        status: "In Review",
        requestedAction: highConfidenceMatch
          ? "Koinonia classified this emailed document automatically."
          : "Staff review needed for inbound email classification."
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: transaction.workspaceId,
        objectId: transaction.id,
        actorId: null,
        eventType: highConfidenceMatch
          ? "document.email_classified"
          : "document.email_classification_needs_review",
        summary: highConfidenceMatch
          ? `Emailed document classified: ${proposal.identifiedDocumentType}`
          : "Emailed document is waiting for Koinonia classification review",
        newValue: {
          documentId: document.id,
          identifiedDocumentType: proposal.identifiedDocumentType,
          documentRequirementId: proposal.documentRequirementId ?? null,
          confidence: proposal.confidence,
          documentMatch: proposal.documentMatch,
          documentMatchReason: proposal.documentMatchReason ?? null
        }
      }
    });

    if (!highConfidenceMatch) {
      await createStaffReviewSignal({
        transactionId: transaction.id,
        workspaceId: transaction.workspaceId,
        documentId: document.id,
        documentType: proposal.identifiedDocumentType
      });
    }
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "In Review",
        requestedAction: "Staff review needed: automatic inbound document classification could not complete."
      }
    });
    await createStaffReviewSignal({
      transactionId: transaction.id,
      workspaceId: transaction.workspaceId,
      documentId: document.id,
      documentType: "Unclassified email attachment"
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: transaction.workspaceId,
        actorId: null,
        actorEmail: null,
        action: "inbound_email.classification_failed",
        subjectType: "Document",
        subjectId: document.id,
        summary: "Inbound document classification failed and was routed for staff review",
        metadata: {
          transactionId: transaction.id,
          error: error instanceof Error ? error.message.slice(0, 500) : "Unknown classification error"
        }
      }
    });
  }
}

async function createStaffReviewSignal({
  transactionId,
  workspaceId,
  documentId,
  documentType
}: {
  transactionId: string;
  workspaceId: string;
  documentId: string;
  documentType: string;
}) {
  await prisma.notification.create({
    data: {
      workspaceId,
      userId: null,
      relatedObjectId: transactionId,
      level: "info",
      title: "Inbound document needs review",
      message: `${documentType} needs a quick Koinonia classification check.`,
      status: "unread"
    }
  });

  await prisma.auditEvent.create({
    data: {
      workspaceId,
      actorId: null,
      actorEmail: null,
      action: "inbound_email.staff_review_queued",
      subjectType: "Document",
      subjectId: documentId,
      summary: "Inbound email document queued for staff review",
      metadata: { transactionId, documentType }
    }
  });
}

async function scanInboundDocument({
  workspaceId,
  cleanName,
  file
}: {
  workspaceId: string;
  cleanName: string;
  file: File;
}): Promise<InboundScanStatus> {
  const uploadRoot = getConfiguredPortalDocumentUploadRoot();
  const scannerCommand = getConfiguredPortalDocumentScannerCommand();

  if (!uploadRoot || !scannerCommand) {
    if (process.env.VERCEL_ENV === "preview") return "preview-bypassed";
    throw new PortalDocumentScanUnavailableError("Document malware scanning is temporarily unavailable.");
  }

  try {
    await scanPortalDocumentUpload({ cleanName, file, scannerCommand, uploadRoot, workspaceId });
    return "scanned";
  } catch (error) {
    if (error instanceof PortalDocumentScanUnavailableError && process.env.VERCEL_ENV === "preview") {
      return "preview-bypassed";
    }
    throw error;
  }
}

async function recordRejectedAttachment({
  attachment,
  event,
  transaction,
  reason
}: {
  attachment: ResendInboundAttachment;
  event: ResendEmailReceivedEvent;
  transaction: { id: string; workspaceId: string; name: string };
  reason: string;
}) {
  await prisma.timelineEvent.create({
    data: {
      workspaceId: transaction.workspaceId,
      objectId: transaction.id,
      actorId: null,
      eventType: "document.email_attachment_rejected",
      summary: `Email attachment could not be accepted: ${attachment.filename}`,
      newValue: { emailId: event.data.email_id, attachmentId: attachment.id, reason }
    }
  });
  await prisma.auditEvent.create({
    data: {
      workspaceId: transaction.workspaceId,
      actorId: null,
      actorEmail: event.data.from,
      action: "inbound_email.attachment_rejected",
      subjectType: "RosObject",
      subjectId: transaction.id,
      summary: `Inbound email attachment rejected for ${transaction.name}`,
      metadata: { emailId: event.data.email_id, attachmentId: attachment.id, fileName: attachment.filename, reason }
    }
  });
}

function shouldProcessAttachment(attachment: ResendInboundAttachment): boolean {
  const extension = attachment.filename.split(".").pop()?.toLocaleLowerCase("en-US") ?? "";
  const supported = new Set(["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"]);
  if (!supported.has(extension)) return false;
  if (attachment.content_disposition === "inline" && attachment.content_id && ["jpg", "jpeg", "png"].includes(extension)) {
    return false;
  }
  return true;
}

function buildInboundMarker(emailId: string, attachmentId: string): string {
  return `[inbound:${emailId}:${attachmentId}]`;
}

function sanitizeNote(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 300);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
