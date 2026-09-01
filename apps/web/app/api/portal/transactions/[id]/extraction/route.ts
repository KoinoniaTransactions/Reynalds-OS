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

    const mismatchOverride = (body as Record<string, unknown>).mismatchOverride === true;

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
            "The uploaded document appears not to match the selected file type. Confirm the mismatch override to continue anyway."
        },
        { status: 409 }
      );
    }

    const side = data.side === "seller" ? "seller" : "buyer";
    const stage = data.stage === "under_contract" ? "under_contract" : "pre_contract";
    const requirement = getTransactionDocumentRequirement(
      side,
      stage,
      proposal.documentRequirementId
    );
    const confirmedDocumentType = requirement?.label ?? proposal.identifiedDocumentType;
    const householdName = buildHouseholdName(proposal.clientNames);
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
          id: proposal.sourceDocumentId,
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

      const updatedTransaction = await tx.rosObject.update({
        where: { id: transaction.id },
        data: {
          clientObjectId,
          name: buildConfirmedTransactionName({
            clientName: householdName,
            propertyAddress: proposal.propertyAddress,
            side
          }),
          health: "Healthy",
          nextAction: "Koinonia is managing the next transaction milestone.",
          data: {
            ...mergeExtractionIntoTransactionData(transaction.data, proposal, confirmedAt),
            extractionOverride: proposal.documentMatch === "mismatch"
              ? {
                  confirmedByUserId: actor.id,
                  confirmedAt,
                  reason: proposal.documentMatchReason ?? null
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

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: transaction.id,
          actorId: actor.id,
          eventType:
            proposal.documentMatch === "mismatch"
              ? "transaction.extraction.mismatch_overridden"
              : "transaction.extraction.confirmed",
          summary:
            proposal.documentMatch === "mismatch"
              ? `Document mismatch warning overridden for ${updatedTransaction.name}`
              : `Extracted transaction information confirmed for ${updatedTransaction.name}`,
          newValue: {
            clientObjectId,
            propertyAddress: proposal.propertyAddress ?? null,
            closingDate: proposal.closingDate ?? null,
            identifiedDocumentType: proposal.identifiedDocumentType,
            confirmedDocumentType,
            documentRequirementId: proposal.documentRequirementId ?? null,
            priorDocumentType: sourceDocument.documentType,
            sourceDocumentId: proposal.sourceDocumentId,
            documentMatch: proposal.documentMatch,
            mismatchOverride
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action:
            proposal.documentMatch === "mismatch"
              ? "portal.transaction.extraction.mismatch_overridden"
              : "portal.transaction.extraction.confirmed",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary:
            proposal.documentMatch === "mismatch"
              ? `Overrode document mismatch warning for ${updatedTransaction.name}`
              : `Confirmed extracted data for ${updatedTransaction.name}`,
          metadata: {
            confidence: proposal.confidence,
            documentMatch: proposal.documentMatch,
            documentMatchReason: proposal.documentMatchReason ?? null,
            identifiedDocumentType: proposal.identifiedDocumentType,
            confirmedDocumentType,
            documentRequirementId: proposal.documentRequirementId ?? null,
            priorDocumentType: sourceDocument.documentType,
            mismatchOverride,
            reusedClient,
            sourceDocumentId: proposal.sourceDocumentId
          }
        }
      });

      return {
        transaction: updatedTransaction,
        reusedClient,
        mismatchOverride,
        documentType: confirmedDocumentType,
        documentRequirementId: proposal.documentRequirementId ?? null
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
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
