import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  TransactionExtractionValidationError,
  validateTransactionExtractionProposal
} from "../../../../../../lib/transaction-extraction";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = body.action;

    if (
      action !== "remove_mismatched_document" &&
      action !== "provide_missing_facts" &&
      action !== "wait_for_future_document"
    ) {
      return NextResponse.json({ error: "Unsupported attention action." }, { status: 400 });
    }

    const transaction = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null,
        OR: [{ clientUserId: actor.id }, { ownerId: actor.id }]
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    }

    const data = asRecord(transaction.data) ?? {};
    const extraction = asRecord(data.extraction);
    const proposal = validateTransactionExtractionProposal(extraction?.proposal);

    if (action === "provide_missing_facts") {
      const clientName = optionalString(body.clientName);
      const propertyAddress = optionalString(body.propertyAddress);
      const side = parseSide(body.side);
      const stage = parseStage(body.stage);
      const nextProposal = {
        ...proposal,
        clientNames: proposal.clientNames.length ? proposal.clientNames : clientName ? [clientName] : [],
        propertyAddress: proposal.propertyAddress ?? propertyAddress,
        inferredSide: proposal.inferredSide ?? side,
        inferredStage: proposal.inferredStage ?? stage
      };

      const missing = getMissingIdentityFacts(nextProposal);
      if (missing.length) {
        return NextResponse.json(
          { error: "A few transaction details are still missing.", missingFacts: missing },
          { status: 409 }
        );
      }

      const nextData = {
        ...data,
        extraction: {
          ...extraction,
          proposal: nextProposal,
          manualFacts: {
            providedAt: new Date().toISOString(),
            providedByUserId: actor.id,
            clientName: clientName ?? null,
            propertyAddress: propertyAddress ?? null,
            side: side ?? null,
            stage: stage ?? null
          }
        }
      } as Prisma.InputJsonObject;

      await prisma.rosObject.update({
        where: { id: transaction.id },
        data: { data: nextData }
      });

      return NextResponse.json({ saved: true });
    }

    if (action === "wait_for_future_document") {
      const now = new Date().toISOString();
      const missing = getMissingIdentityFacts(proposal);
      const nextData = {
        ...data,
        extraction: {
          ...extraction,
          status: "waiting_for_more_document",
          proposal,
          resolution: {
            action: "wait_for_future_document",
            missingFacts: missing,
            resolvedAt: now,
            resolvedByUserId: actor.id
          }
        }
      } as Prisma.InputJsonObject;

      const updatedTransaction = await prisma.$transaction(async (tx) => {
        const updated = await tx.rosObject.update({
          where: { id: transaction.id },
          data: {
            health: "Healthy",
            nextAction: "Koinonia is waiting for another transaction document and will use it to fill in the remaining details.",
            data: nextData
          }
        });

        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: transaction.id,
            actorId: actor.id,
            eventType: "transaction.extraction.waiting_for_document",
            summary: `Realtor chose to provide remaining transaction details through a future document for ${transaction.name}`,
            newValue: { missingFacts: missing }
          }
        });

        await tx.auditEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            actorId: actor.id,
            actorEmail: actor.email,
            action: "portal.transaction.extraction.waiting_for_document",
            subjectType: "RosObject",
            subjectId: transaction.id,
            summary: `Deferred missing transaction details until another document arrives for ${transaction.name}`,
            metadata: { missingFacts: missing }
          }
        });

        return updated;
      });

      return NextResponse.json({ transaction: updatedTransaction });
    }

    if (proposal.documentMatch !== "mismatch") {
      return NextResponse.json({ error: "This transaction does not have an active document mismatch." }, { status: 409 });
    }

    const now = new Date();
    const nextData = {
      ...data,
      extraction: {
        ...extraction,
        status: "rejected",
        proposal,
        resolution: {
          action: "removed_wrong_document",
          resolvedAt: now.toISOString(),
          resolvedByUserId: actor.id
        }
      }
    } as Prisma.InputJsonObject;

    const result = await prisma.$transaction(async (tx) => {
      const sourceDocument = await tx.document.findFirst({
        where: {
          id: proposal.sourceDocumentId,
          workspaceId: actor.workspaceId,
          relatedObjectId: transaction.id,
          archivedAt: null,
          removedAt: null
        },
        select: { id: true, fileName: true, documentType: true }
      });

      if (!sourceDocument) {
        throw new TransactionExtractionValidationError("The flagged source document is no longer available.");
      }

      await tx.document.update({
        where: { id: sourceDocument.id },
        data: {
          removedAt: now,
          removalReason: "Realtor confirmed this was the wrong document for the transaction"
        }
      });

      const updatedTransaction = await tx.rosObject.update({
        where: { id: transaction.id },
        data: {
          health: "Healthy",
          nextAction: "Send the correct document when available. Koinonia will continue from there.",
          data: nextData
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: transaction.id,
          actorId: actor.id,
          eventType: "transaction.extraction.mismatched_document_removed",
          summary: `Wrong document removed from ${transaction.name}`,
          newValue: {
            sourceDocumentId: sourceDocument.id,
            fileName: sourceDocument.fileName,
            documentType: sourceDocument.documentType,
            reason: proposal.documentMatchReason ?? null
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.transaction.extraction.mismatched_document_removed",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary: `Realtor removed a mismatched document from ${transaction.name}`,
          metadata: {
            sourceDocumentId: sourceDocument.id,
            fileName: sourceDocument.fileName,
            documentType: sourceDocument.documentType,
            reason: proposal.documentMatchReason ?? null
          }
        }
      });

      return updatedTransaction;
    });

    return NextResponse.json({ transaction: result });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (error instanceof TransactionExtractionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server"))
    ) {
      return NextResponse.json({ error: "Transaction attention storage is temporarily unavailable." }, { status: 503 });
    }

    throw error;
  }
}

function getMissingIdentityFacts(proposal: {
  clientNames: string[];
  propertyAddress?: string;
  inferredSide?: "buyer" | "seller";
  inferredStage?: "pre_contract" | "under_contract";
}): string[] {
  const missing: string[] = [];
  if (!proposal.clientNames.length) missing.push("clientName");
  if (!proposal.propertyAddress) missing.push("propertyAddress");
  if (!proposal.inferredSide) missing.push("side");
  if (!proposal.inferredStage) missing.push("stage");
  return missing;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function parseSide(value: unknown): "buyer" | "seller" | undefined {
  return value === "buyer" || value === "seller" ? value : undefined;
}

function parseStage(value: unknown): "pre_contract" | "under_contract" | undefined {
  return value === "pre_contract" || value === "under_contract" ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
