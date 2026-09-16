import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import {
  buildConfirmedTransactionName,
  buildHouseholdName,
  getExtractionReviewStatus,
  mergeExtractionIntoTransactionData,
  TransactionExtractionValidationError,
  validateTransactionExtractionProposal
} from "../../../../../../lib/transaction-extraction";
import { getTransactionDocumentRequirement } from "../../../../../../lib/transaction-document-requirements";
import { reconcileConfirmedTransactionObligations } from "../../../../../../lib/transaction-obligation-persistence";
import {
  clientRelationshipObjectType,
  getClientTransactionPartyRelationshipType,
  normalizeClientIdentityName
} from "../../../../../../lib/client-transactions";
import { prisma } from "../../../../../../lib/db";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const proposal = validateTransactionExtractionProposal(await request.json());

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

    const reviewStatus = getExtractionReviewStatus(proposal.confidence, proposal.documentMatch);
    const data = asRecord(transaction.data) ?? {};
    const nextData = {
      ...data,
      extraction: {
        status: reviewStatus,
        proposal
      }
    } as Prisma.InputJsonObject;

    const nextAction =
      proposal.documentMatch === "mismatch"
        ? "Realtor must decide whether to replace the document or continue despite the mismatch warning."
        : !proposal.inferredSide || !proposal.inferredStage
          ? "Review the document and confirm any transaction identity Koinonia could not determine."
          : "Review extracted transaction information before applying it to the file.";

    const updated = await prisma.rosObject.update({
      where: { id: transaction.id },
      data: {
        health:
          proposal.confidence === "low" || proposal.documentMatch !== "match"
            ? "Attention"
            : transaction.health,
        nextAction,
        data: nextData
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: transaction.id,
        actorId: actor.id,
        eventType: "transaction.extraction.proposed",
        summary: `Document extraction proposed for ${transaction.name}`,
        newValue: {
          confidence: proposal.confidence,
          documentMatch: proposal.documentMatch,
          documentMatchReason: proposal.documentMatchReason ?? null,
          inferredSide: proposal.inferredSide ?? null,
          inferredStage: proposal.inferredStage ?? null,
          identifiedDocumentType: proposal.identifiedDocumentType,
          documentRequirementId: proposal.documentRequirementId ?? null,
          sourceDocumentId: proposal.sourceDocumentId
        }
      }
    });

    return NextResponse.json({ transaction: updated, proposal });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const body = await request.json();

    if (!body || typeof body !== "object" || (body as Record<string, unknown>).action !== "confirm") {
      return NextResponse.json({ error: "action must be confirm." }, { status: 400 });
    }

    const bodyRecord = body as Record<string, unknown>;
    const mismatchOverride = bodyRecord.mismatchOverride === true;
    const confirmedSide = parseSide(bodyRecord.confirmedSide);
    const confirmedStage = parseStage(bodyRecord.confirmedStage);

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

    if (proposal.documentMatch === "mismatch" && !mismatchOverride) {
      return NextResponse.json(
        {
          error:
            "The uploaded document appears not to match this transaction. Confirm the mismatch override to continue anyway."
        },
        { status: 409 }
      );
    }

    const side = data.side === "seller"
      ? "seller"
      : data.side === "buyer"
        ? "buyer"
        : confirmedSide ?? proposal.inferredSide;
    const stage = data.stage === "under_contract"
      ? "under_contract"
      : data.stage === "pre_contract"
        ? "pre_contract"
        : confirmedStage ?? proposal.inferredStage;

    if (!side || !stage) {
      return NextResponse.json(
        {
          error: "Koinonia still needs the represented side and transaction stage before this document can build the file.",
          needsTransactionIdentity: true,
          needsSide: !side,
          needsStage: !stage
        },
        { status: 409 }
      );
    }

    const confirmedProposal = {
      ...proposal,
      inferredSide: side,
      inferredStage: stage
    };
    const requirement = getTransactionDocumentRequirement(
      side,
      stage,
      confirmedProposal.documentRequirementId
    );
    const confirmedDocumentType = requirement?.label ?? confirmedProposal.identifiedDocumentType;
    const householdName = buildHouseholdName(confirmedProposal.clientNames);
    const confirmedAt = new Date().toISOString();

    const result = await prisma.$transaction(async (tx) => {
      let clientObjectId = transaction.clientObjectId;
      let reusedClient = false;

      if (householdName) {
        const normalizedClientName = normalizeClientIdentityName(householdName);
        const relationships = await tx.rosObject.findMany({
          where: {
            workspaceId: actor.workspaceId,
            objectType: clientRelationshipObjectType,
            archivedAt: null,
            OR: [{ clientUserId: actor.id }, { ownerId: actor.id }]
          },
          select: { id: true, name: true, data: true },
          take: 100
        });

        const existingClient = relationships.find((relationship) => {
          const relationshipData = asRecord(relationship.data);
          const stored =
            typeof relationshipData?.normalizedClientName === "string"
              ? relationshipData.normalizedClientName
              : normalizeClientIdentityName(relationship.name);
          return stored === normalizedClientName;
        });

        if (existingClient) {
          clientObjectId = existingClient.id;
          reusedClient = true;
        } else {
          const createdClient = await tx.rosObject.create({
            data: {
              workspaceId: actor.workspaceId,
              objectType: clientRelationshipObjectType,
              name: householdName,
              status: "Active Client",
              health: "Healthy",
              ownerId: actor.id,
              clientUserId: actor.role === "Client" ? actor.id : undefined,
              data: {
                normalizedClientName,
                relationshipKind: "client_household",
                source: "document_extraction"
              } as Prisma.InputJsonObject
            }
          });
          clientObjectId = createdClient.id;
        }
      }

      const sourceDocument = await tx.document.findFirst({
        where: {
          id: confirmedProposal.sourceDocumentId,
          workspaceId: actor.workspaceId,
          relatedObjectId: transaction.id,
          archivedAt: null,
          removedAt: null
        },
        select: { id: true, documentType: true }
      });

      if (!sourceDocument) {
        throw new TransactionExtractionValidationError(
          "The source document for this extraction is no longer available."
        );
      }

      if (sourceDocument.documentType !== confirmedDocumentType) {
        await tx.document.update({
          where: { id: sourceDocument.id },
          data: { documentType: confirmedDocumentType }
        });
      }

      const mergedData = mergeExtractionIntoTransactionData(
        transaction.data,
        confirmedProposal,
        confirmedAt
      );
      const updatedTransaction = await tx.rosObject.update({
        where: { id: transaction.id },
        data: {
          clientObjectId,
          name: buildConfirmedTransactionName({
            clientName: householdName,
            propertyAddress: confirmedProposal.propertyAddress,
            side
          }),
          status: stage === "under_contract" ? "Under Contract" : "Intake",
          health: "Healthy",
          nextAction: "Koinonia is managing the next transaction milestone.",
          data: {
            ...mergedData,
            side,
            sideStatus: confirmedSide ? "realtor_confirmed" : "document_confirmed",
            stage,
            stageStatus: confirmedStage ? "realtor_confirmed" : "document_confirmed",
            extractionOverride: confirmedProposal.documentMatch === "mismatch"
              ? {
                  confirmedByUserId: actor.id,
                  confirmedAt,
                  reason: confirmedProposal.documentMatchReason ?? null
                }
              : null
          } as Prisma.InputJsonObject
        }
      });

      if (clientObjectId) {
        const existingLink = await tx.objectRelationship.findFirst({
          where: {
            sourceObjectId: clientObjectId,
            targetObjectId: transaction.id,
            relationshipType: getClientTransactionPartyRelationshipType(side)
          }
        });
        if (!existingLink) {
          await tx.objectRelationship.create({
            data: {
              sourceObjectId: clientObjectId,
              targetObjectId: transaction.id,
              relationshipType: getClientTransactionPartyRelationshipType(side)
            }
          });
        }
      }

      const obligationChanges = await reconcileConfirmedTransactionObligations({
        tx,
        workspaceId: actor.workspaceId,
        transactionId: transaction.id,
        ownerId: transaction.ownerId,
        clientUserId: transaction.clientUserId,
        actorId: actor.id,
        side,
        stage,
        proposal: confirmedProposal,
        confirmedDocumentType,
        confirmedAt
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: transaction.id,
          actorId: actor.id,
          eventType:
            confirmedProposal.documentMatch === "mismatch"
              ? "transaction.extraction.mismatch_overridden"
              : "transaction.extraction.confirmed",
          summary:
            confirmedProposal.documentMatch === "mismatch"
              ? `Document mismatch warning overridden for ${updatedTransaction.name}`
              : `Extracted transaction information confirmed for ${updatedTransaction.name}`,
          newValue: {
            clientObjectId,
            side,
            stage,
            sideSource: confirmedSide ? "realtor" : "document",
            stageSource: confirmedStage ? "realtor" : "document",
            propertyAddress: confirmedProposal.propertyAddress ?? null,
            closingDate: confirmedProposal.closingDate ?? null,
            identifiedDocumentType: confirmedProposal.identifiedDocumentType,
            confirmedDocumentType,
            documentRequirementId: confirmedProposal.documentRequirementId ?? null,
            priorDocumentType: sourceDocument.documentType,
            sourceDocumentId: confirmedProposal.sourceDocumentId,
            documentMatch: confirmedProposal.documentMatch,
            mismatchOverride,
            obligationChanges
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action:
            confirmedProposal.documentMatch === "mismatch"
              ? "portal.transaction.extraction.mismatch_overridden"
              : "portal.transaction.extraction.confirmed",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary:
            confirmedProposal.documentMatch === "mismatch"
              ? `Overrode document mismatch warning for ${updatedTransaction.name}`
              : `Confirmed extracted data for ${updatedTransaction.name}`,
          metadata: {
            confidence: confirmedProposal.confidence,
            documentMatch: confirmedProposal.documentMatch,
            documentMatchReason: confirmedProposal.documentMatchReason ?? null,
            side,
            stage,
            sideSource: confirmedSide ? "realtor" : "document",
            stageSource: confirmedStage ? "realtor" : "document",
            identifiedDocumentType: confirmedProposal.identifiedDocumentType,
            confirmedDocumentType,
            documentRequirementId: confirmedProposal.documentRequirementId ?? null,
            priorDocumentType: sourceDocument.documentType,
            mismatchOverride,
            reusedClient,
            sourceDocumentId: confirmedProposal.sourceDocumentId,
            obligationChanges
          }
        }
      });

      return {
        transaction: updatedTransaction,
        reusedClient,
        mismatchOverride,
        side,
        stage,
        documentType: confirmedDocumentType,
        documentRequirementId: confirmedProposal.documentRequirementId ?? null,
        obligationChanges
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

function parseSide(value: unknown): "buyer" | "seller" | undefined {
  return value === "buyer" || value === "seller" ? value : undefined;
}

function parseStage(value: unknown): "pre_contract" | "under_contract" | undefined {
  return value === "pre_contract" || value === "under_contract" ? value : undefined;
}

function handleError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);
  if (authResponse) return authResponse;

  if (error instanceof TransactionExtractionValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server"))
  ) {
    return NextResponse.json({ error: "Transaction extraction storage is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
