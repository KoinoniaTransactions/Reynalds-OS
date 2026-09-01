import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../../../../lib/auth";
import { prisma } from "../../../../../../../../../lib/db";
import { resolveTransactionObligationByStaff } from "../../../../../../../../../lib/transaction-obligation-resolution";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; obligationId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("employee-portal:assigned-work:update");
    const { id, obligationId } = await context.params;
    const body = await request.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const resolution =
      record.resolution === "satisfied" || record.resolution === "not_applicable"
        ? record.resolution
        : null;
    const reason = typeof record.reason === "string" ? record.reason.trim() : "";

    if (!resolution) {
      return NextResponse.json(
        { error: "resolution must be satisfied or not_applicable." },
        { status: 400 }
      );
    }
    if (reason.length < 3) {
      return NextResponse.json(
        { error: "A short staff resolution reason is required." },
        { status: 400 }
      );
    }

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
      },
      select: { id: true, name: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    }

    const occurredAt = new Date().toISOString();
    const data = await prisma.$transaction(async (tx) => {
      const resolved = await resolveTransactionObligationByStaff({
        tx,
        workspaceId: actor.workspaceId,
        transactionId: transaction.id,
        obligationId,
        actorId: actor.id,
        resolution,
        reason,
        occurredAt
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "employee.transaction.obligation.resolved",
          subjectType: "TransactionObligation",
          subjectId: obligationId,
          summary: `Resolved ${resolved.label} on ${transaction.name}`,
          metadata: {
            transactionId: transaction.id,
            obligationKey: resolved.obligationKey,
            resolution,
            reason
          }
        }
      });

      return resolved;
    });

    return NextResponse.json({ obligation: data });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes("cannot be resolved")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.includes("Can't reach database server"))
    ) {
      return NextResponse.json({ error: "Transaction storage is temporarily unavailable." }, { status: 503 });
    }

    throw error;
  }
}
