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
    const actor = await assertPermission("client-portal:view");
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

    const data = asRecord(transaction.data) ?? {};
    const nextData = {
      ...data,
      extraction: {
        status: getExtractionReviewStatus(proposal.confidence),
        proposal
      }
    } as Prisma.InputJsonObject;

    const updated = await prisma.rosObject.update({
      where: { id: transaction.id },
      data: {
        health: proposal.confidence === "low" ? "Attention" : transaction.health,
        nextAction: "Review extracted transaction information before applying it to the file.",
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
    const actor = await assertPermission("client-portal:view");
    const { id } = await context.params;
    const body = await request.json();

    if (!body || typeof body !== "object" || (body as Record<string, unknown>).action !== "confirm") {
      return NextResponse.json({ error: "action must be confirm." }, { status: 400 });
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
    const side = data.side === "seller" ? "seller" : "buyer";
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
          data: mergeExtractionIntoTransactionData(transaction.data, proposal, confirmedAt) as Prisma.InputJsonObject
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
          eventType: "transaction.extraction.confirmed",
          summary: `Extracted transaction information confirmed for ${updatedTransaction.name}`,
          newValue: {
            clientObjectId,
            propertyAddress: proposal.propertyAddress ?? null,
            closingDate: proposal.closingDate ?? null,
            sourceDocumentId: proposal.sourceDocumentId
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.transaction.extraction.confirmed",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary: `Confirmed extracted data for ${updatedTransaction.name}`,
          metadata: {
            confidence: proposal.confidence,
            reusedClient,
            sourceDocumentId: proposal.sourceDocumentId
          }
        }
      });

      return { transaction: updatedTransaction, reusedClient };
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
