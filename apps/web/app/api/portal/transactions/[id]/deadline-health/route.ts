import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { evaluateTransactionDeadlineHealth } from "../../../../../../lib/transaction-deadline-health";

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

    const data = asRecord(transaction.data) ?? {};
    const side = data.side === "seller" ? "seller" : "buyer";
    const stage = data.stage === "under_contract" ? "under_contract" : "pre_contract";

    return NextResponse.json(
      evaluateTransactionDeadlineHealth({
        side,
        stage,
        listingExpirationDate: data.listingExpirationDate,
        deadlines: data.deadlines
      })
    );
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
