import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/db";
import {
  extractTransactionDocumentWithOpenAI,
  TransactionDocumentExtractionError
} from "../../../../../../../lib/openai-transaction-extraction";
import { getPortalDocumentFromR2 } from "../../../../../../../lib/portal-document-r2";
import { getExtractionReviewStatus } from "../../../../../../../lib/transaction-extraction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const body = await request.json();
    const documentId = getDocumentId(body);

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required." }, { status: 400 });
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

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        workspaceId: actor.workspaceId,
        relatedObjectId: transaction.id,
        archivedAt: null,
        removedAt: null,
        ...(actor.role === "Client" ? { ownerId: actor.id } : {})
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Transaction document was not found." }, { status: 404 });
    }

    if (!document.storageKey) {
      return NextResponse.json(
        { error: "This document is not available for automatic extraction." },
        { status: 409 }
      );
    }

    if (!isSupportedExtractionMimeType(document.mimeType)) {
      return NextResponse.json(
        { error: "Automatic extraction currently supports PDF, JPEG, and PNG files." },
        { status: 400 }
      );
    }

    const transactionData = asRecord(transaction.data) ?? {};
    const side = transactionData.side === "seller" ? "seller" : "buyer";
    const stage = transactionData.stage === "under_contract" ? "under_contract" : "pre_contract";
    const bytes = await getPortalDocumentFromR2(document.storageKey);
    const proposal = await extractTransactionDocumentWithOpenAI({
      bytes,
      fileName: document.fileName,
      mimeType: document.mimeType ?? "application/pdf",
      sourceDocumentId: document.id,
      sourceDocumentType: document.documentType,
      side,
      stage
    });

    const reviewStatus = getExtractionReviewStatus(proposal.confidence, proposal.documentMatch);
    const nextData = {
      ...transactionData,
      extraction: {
        status: reviewStatus,
        proposal,
        generatedAt: new Date().toISOString(),
        provider: "openai"
      }
    } as Prisma.InputJsonObject;

    const updated = await prisma.rosObject.update({
      where: { id: transaction.id },
      data: {
        health:
          proposal.confidence === "low" || proposal.documentMatch !== "match"
            ? "Attention"
            : transaction.health,
        nextAction:
          proposal.documentMatch === "mismatch"
            ? "Review the document-type warning and decide whether to replace the document or continue."
            : "Review extracted transaction information before applying it to the file.",
        data: nextData
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: transaction.id,
        actorId: actor.id,
        eventType: "transaction.extraction.generated",
        summary: `Automatic document extraction generated for ${transaction.name}`,
        newValue: {
          confidence: proposal.confidence,
          documentMatch: proposal.documentMatch,
          documentMatchReason: proposal.documentMatchReason ?? null,
          identifiedDocumentType: proposal.identifiedDocumentType,
          sourceDocumentId: proposal.sourceDocumentId,
          provider: "openai"
        }
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.transaction.extraction.generated",
        subjectType: "RosObject",
        subjectId: transaction.id,
        summary: `Generated transaction extraction for ${transaction.name}`,
        metadata: {
          confidence: proposal.confidence,
          documentMatch: proposal.documentMatch,
          identifiedDocumentType: proposal.identifiedDocumentType,
          sourceDocumentId: proposal.sourceDocumentId,
          provider: "openai"
        }
      }
    });

    return NextResponse.json({ transaction: updated, proposal });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (error instanceof TransactionDocumentExtractionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.includes("Can't reach database server") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      return NextResponse.json(
        { error: "Automatic transaction extraction is temporarily unavailable." },
        { status: 503 }
      );
    }

    throw error;
  }
}

function getDocumentId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const documentId = (value as Record<string, unknown>).documentId;
  return typeof documentId === "string" && documentId.trim() ? documentId.trim() : null;
}

function isSupportedExtractionMimeType(value: string | null): boolean {
  return value === "application/pdf" || value === "image/jpeg" || value === "image/png";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
