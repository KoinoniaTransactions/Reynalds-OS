import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import {
  buildClientTransactionName,
  ClientTransactionValidationError,
  clientRelationshipObjectType,
  clientTransactionObjectType,
  getClientTransactionNextAction,
  getClientTransactionPartyRelationshipType,
  getClientTransactionStatus,
  normalizeClientIdentityName,
  validateClientTransactionIntakeInput
} from "../../../../lib/client-transactions";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = await assertPermission("client-portal:transactions:create");
    const input = validateClientTransactionIntakeInput(await request.json());

    if (input.intakeRequestId) {
      const recentTransactions = await prisma.rosObject.findMany({
        where: {
          workspaceId: actor.workspaceId,
          objectType: clientTransactionObjectType,
          archivedAt: null,
          OR: [{ clientUserId: actor.id }, { ownerId: actor.id }]
        },
        orderBy: { createdAt: "desc" },
        take: 50
      });
      const existingTransaction = recentTransactions.find((transaction) => {
        const data = asRecord(transaction.data);
        return data?.intakeRequestId === input.intakeRequestId;
      });

      if (existingTransaction) {
        return NextResponse.json({
          clientObject: null,
          relationship: null,
          reusedClient: false,
          reusedIntake: true,
          transaction: existingTransaction
        });
      }
    }

    const normalizedClientName = input.clientName
      ? normalizeClientIdentityName(input.clientName)
      : null;

    const existingRelationships = normalizedClientName
      ? await prisma.rosObject.findMany({
          where: {
            workspaceId: actor.workspaceId,
            objectType: clientRelationshipObjectType,
            archivedAt: null,
            OR: [{ clientUserId: actor.id }, { ownerId: actor.id }]
          },
          select: {
            id: true,
            name: true,
            data: true
          },
          take: 100
        })
      : [];

    const matchedClient = normalizedClientName
      ? existingRelationships.find((relationship) => {
          const data = asRecord(relationship.data);
          const storedIdentity =
            typeof data?.normalizedClientName === "string"
              ? data.normalizedClientName
              : normalizeClientIdentityName(relationship.name);

          return storedIdentity === normalizedClientName;
        })
      : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const clientObject = input.clientName
        ? matchedClient ??
          (await tx.rosObject.create({
            data: {
              workspaceId: actor.workspaceId,
              objectType: clientRelationshipObjectType,
              name: input.clientName,
              status: "Active Client",
              health: "Healthy",
              ownerId: actor.id,
              clientUserId: actor.role === "Client" ? actor.id : undefined,
              nextAction: "Keep client details current across related transactions.",
              data: {
                normalizedClientName,
                relationshipKind: "client_household",
                source: "transaction_intake"
              } as Prisma.InputJsonObject
            }
          }))
        : null;

      const hasConfirmedIdentity = Boolean(
        input.side && input.stage && input.clientName && (input.side === "buyer" || input.propertyAddress)
      );
      const transaction = await tx.rosObject.create({
        data: {
          workspaceId: actor.workspaceId,
          objectType: clientTransactionObjectType,
          name: buildClientTransactionName(input),
          status: getClientTransactionStatus(input.stage, hasConfirmedIdentity),
          health: "Healthy",
          ownerId: actor.id,
          clientUserId: actor.role === "Client" ? actor.id : undefined,
          clientObjectId: clientObject?.id,
          nextAction: getClientTransactionNextAction(input),
          data: {
            clientName: input.clientName ?? null,
            intakeRequestId: input.intakeRequestId ?? null,
            intakeSource: "client_portal",
            propertyAddress: input.propertyAddress ?? null,
            side: input.side ?? null,
            sideStatus: input.side ? "provided" : "pending_document_review",
            sourceDocumentName: input.sourceDocumentName,
            stage: input.stage ?? null,
            stageStatus: input.stage ? "provided" : "pending_document_review",
            extractionStatus: hasConfirmedIdentity ? "partially_confirmed" : "pending"
          } as Prisma.InputJsonObject
        }
      });

      const relationship = clientObject && input.side
        ? await tx.objectRelationship.create({
            data: {
              sourceObjectId: clientObject.id,
              targetObjectId: transaction.id,
              relationshipType: getClientTransactionPartyRelationshipType(input.side)
            }
          })
        : null;

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: transaction.id,
          actorId: actor.id,
          eventType: "transaction.intake_started",
          summary: input.side
            ? `${input.side === "buyer" ? "Buyer" : "Seller"} transaction intake started from ${input.sourceDocumentName}`
            : `Document-first transaction intake started from ${input.sourceDocumentName}`,
          newValue: {
            clientObjectId: clientObject?.id ?? null,
            intakeRequestId: input.intakeRequestId ?? null,
            propertyAddress: input.propertyAddress ?? null,
            side: input.side ?? null,
            stage: input.stage ?? null,
            sourceDocumentName: input.sourceDocumentName
          }
        }
      });

      if (clientObject && !matchedClient) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: clientObject.id,
            actorId: actor.id,
            eventType: "relationship.created",
            summary: `Client relationship created: ${clientObject.name}`,
            newValue: {
              normalizedClientName
            }
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.transaction.intake_started",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary: `Transaction intake started for ${transaction.name}`,
          metadata: {
            clientObjectId: clientObject?.id ?? null,
            identityPending: !clientObject || !input.side || !input.stage,
            intakeRequestId: input.intakeRequestId ?? null,
            reusedClient: Boolean(matchedClient),
            side: input.side ?? null,
            stage: input.stage ?? null
          }
        }
      });

      return {
        clientObject,
        relationship,
        reusedClient: Boolean(matchedClient),
        reusedIntake: false,
        transaction
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    if (error instanceof ClientTransactionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: "Transaction intake storage is temporarily unavailable." },
        { status: 503 }
      );
    }

    throw error;
  }
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
