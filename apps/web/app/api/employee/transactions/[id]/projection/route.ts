import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { buildStaffTransactionOperations } from "../../../../../../lib/transaction-portal-projections";
import {
  transactionObligationObjectType,
  transactionObligationRelationshipType
} from "../../../../../../lib/transaction-obligations";
import type { TransactionSide, TransactionStage } from "../../../../../../lib/transaction-intake";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("employee-portal:assigned-work:view");
    const { id } = await context.params;
    const canViewWorkspaceWork =
      actor.permissions.includes("employee-portal:assignments:update") ||
      actor.permissions.includes("employee-portal:clients:view");

    const transaction = await prisma.rosObject.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null,
        ...(canViewWorkspaceWork
          ? {}
          : { OR: [{ assignedStaffUserId: actor.id }, { backupStaffUserId: actor.id }] })
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    }

    const links = await prisma.objectRelationship.findMany({
      where: {
        sourceObjectId: transaction.id,
        relationshipType: transactionObligationRelationshipType,
        targetObject: {
          objectType: transactionObligationObjectType,
          archivedAt: null
        }
      },
      include: { targetObject: true }
    });

    const data = asRecord(transaction.data) ?? {};
    const side: TransactionSide | null =
      data.side === "seller" ? "seller" : data.side === "buyer" ? "buyer" : null;
    const stage: TransactionStage | null =
      data.stage === "under_contract"
        ? "under_contract"
        : data.stage === "pre_contract"
          ? "pre_contract"
          : null;

    return NextResponse.json({
      staff: buildStaffTransactionOperations({
        side,
        stage,
        closingDate: data.closingDate,
        status: transaction.status,
        obligations: links.map((link) => link.targetObject)
      })
    });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.includes("Can't reach database server"))
    ) {
      return NextResponse.json({ error: "Transaction operations are temporarily unavailable." }, { status: 503 });
    }

    throw error;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
