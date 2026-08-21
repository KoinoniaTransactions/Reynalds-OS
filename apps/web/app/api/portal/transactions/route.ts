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
    const actor = await assertPermission("client-portal:view");
    const input = validateClientTransactionIntakeInput(await request.json());
    const normalizedClientName = normalizeClientIdentityName(input.clientName);

    const existingRelationships = await prisma.rosObject.findMany({
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
    });

    const matchedClient = existingRelationships.find((relationship) => {
      const data = asRecord(relationship.data);
      const storedIdentity =
        typeof data?.normalizedClientName === "string"
          ? data.normalizedClientName
          : normalizeClientIdentityName(relationship.name);

      return storedIdentity === normalizedClientName;
    });

    const result = await prisma.$transaction(async (tx) => {
      const clientObject =
        matchedClient ??
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
        }));

      const transaction = await tx.rosObject.create({
        data: {
          workspaceId: actor.workspaceId,
          objectType: clientTransactionObjectType,
          name: buildClientTransactionName(input),
          status: getClientTransactionStatus(input.stage),
          health: "Healthy",
          ownerId: actor.id,
          clientUserId: actor.role === "Client" ? actor.id : undefined,
          clientObjectId: clientObject.id,
          nextAction: getClientTransactionNextAction(input),
          data: {
            clientName: input.clientName,
            intakeSource: "client_portal",
            propertyAddress: input.propertyAddress ?? null,
            side: input.side,
            sourceDocumentName: input.sourceDocumentName,
            stage: input.stage
          } as Prisma.InputJsonObject
        }
      });

      const relationship = await tx.objectRelationship.create({
        data: {
          sourceObjectId: clientObject.id,
          targetObjectId: transaction.id,
          relationshipType: getClientTransactionPartyRelationshipType(input.side)
        }
      });

      await tx.timelineEvent.createMany({
        data: [
          {
            workspaceId: actor.workspaceId,
            objectId: transaction.id,
            actorId: actor.id,
            eventType: "transaction.created",
            summary: `${input.side === "buyer" ? "Buyer" : "Seller"} transaction started: ${transaction.name}`,
            newValue: {
              clientObjectId: clientObject.id,
              propertyAddress: input.propertyAddress ?? null,
              side: input.side,
              stage: input.stage
            }
          },
          ...(!matchedClient
            ? [
                {
                  workspaceId: actor.workspaceId,
                  objectId: clientObject.id,
                  actorId: actor.id,
                  eventType: "relationship.created",
                  summary: `Client relationship created: ${clientObject.name}`,
                  newValue: {
                    normalizedClientName
                  }
                }
              ]
            : [])
        ]
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.transaction.created",
          subjectType: "RosObject",
          subjectId: transaction.id,
          summary: `Transaction intake created for ${transaction.name}`,
          metadata: {
            clientObjectId: clientObject.id,
            reusedClient: Boolean(matchedClient),
            side: input.side,
            stage: input.stage
          }
        }
      });

      return {
        clientObject,
        relationship,
        reusedClient: Boolean(matchedClient),
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
