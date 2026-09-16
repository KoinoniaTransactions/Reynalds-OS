import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  evaluateTransactionObligation,
  transactionObligationObjectType,
  transactionObligationRelationshipType
} from "../../../../../../lib/transaction-obligations";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:view");
    const { id } = await context.params;

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

    const links = await prisma.objectRelationship.findMany({
      where: {
        sourceObjectId: transaction.id,
        relationshipType: transactionObligationRelationshipType
      },
      include: {
        targetObject: true
      }
    });

    const alerts = links
      .map((link) => link.targetObject)
      .filter(
        (obligation) =>
          obligation.objectType === transactionObligationObjectType && !obligation.archivedAt
      )
      .map((obligation) => evaluateTransactionObligation(obligation))
      .filter((alert): alert is NonNullable<typeof alert> => Boolean(alert));

    return NextResponse.json({
      status: alerts.some((alert) => alert.state === "passed_needs_review") ? "review" : "clear",
      alerts
    });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server"))
    ) {
      return NextResponse.json({ error: "Transaction storage is temporarily unavailable." }, { status: 503 });
    }

    throw error;
  }
}
