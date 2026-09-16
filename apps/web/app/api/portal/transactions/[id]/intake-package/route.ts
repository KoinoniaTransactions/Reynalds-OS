import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";

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
      },
      select: { id: true, data: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    }

    const data = asRecord(transaction.data) ?? {};
    const completedAt = typeof data.initialDocumentPackageCompletedAt === "string"
      ? data.initialDocumentPackageCompletedAt
      : null;

    return NextResponse.json({
      transactionId: transaction.id,
      complete: Boolean(completedAt),
      completedAt
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await assertPermission("client-portal:transactions:update");
    const { id } = await context.params;
    const body = await request.json();

    if (!body || typeof body !== "object" || (body as Record<string, unknown>).action !== "complete") {
      return NextResponse.json({ error: "action must be complete." }, { status: 400 });
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
    const existingCompletedAt = typeof data.initialDocumentPackageCompletedAt === "string"
      ? data.initialDocumentPackageCompletedAt
      : null;
    const completedAt = existingCompletedAt ?? new Date().toISOString();

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.rosObject.update({
        where: { id: transaction.id },
        data: {
          data: {
            ...data,
            initialDocumentPackageCompletedAt: completedAt
          } as Prisma.InputJsonObject
        }
      });

      if (!existingCompletedAt) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: transaction.id,
            actorId: actor.id,
            eventType: "transaction.initial_document_package.completed",
            summary: "Realtor finished uploading the initial document package",
            newValue: { completedAt }
          }
        });

        await tx.auditEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            actorId: actor.id,
            actorEmail: actor.email,
            action: "portal.transaction.initial_document_package.completed",
            subjectType: "RosObject",
            subjectId: transaction.id,
            summary: "Initial transaction document package marked complete",
            metadata: { completedAt }
          }
        });
      }

      return next;
    });

    return NextResponse.json({ transaction: updated, complete: true, completedAt });
  } catch (error) {
    return handleError(error);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function handleError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);
  if (authResponse) return authResponse;

  if (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  ) {
    return NextResponse.json({ error: "Transaction storage is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}
