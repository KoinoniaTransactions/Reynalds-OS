import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../../../lib/auth";
import { prisma } from "../../../../../../../../lib/db";
import {
  buildCompletedDeadlineData,
  getTransactionDeadlines
} from "../../../../../../../../lib/portal-deadlines";
import { isClientPortalWorkObjectType } from "../../../../../../../../lib/portal-work-items";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    deadlineKey: string;
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission(
      "employee-portal:assigned-work:update"
    );
    const { deadlineKey, id } = await params;
    const note = getOptionalCompletionNote(await request.json());

    const workItem = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id,
        workspaceId: actor.workspaceId
      }
    });

    if (
      !workItem ||
      !isClientPortalWorkObjectType(workItem.objectType)
    ) {
      return NextResponse.json(
        { error: "Portal work item not found." },
        { status: 404 }
      );
    }

    const deadline = getTransactionDeadlines(workItem.data).find(
      (item) => item.key === deadlineKey
    );

    if (!deadline) {
      return NextResponse.json(
        {
          error:
            "This deadline was not found, is invalid, or has already been completed."
        },
        { status: 400 }
      );
    }

    const completedAt = new Date();
    const nextData = buildCompletedDeadlineData({
      completedAt,
      completedByUserId: actor.id,
      currentData: workItem.data,
      deadlineKey,
      note
    }) as Prisma.InputJsonObject;

    const summary = `Deadline completed: ${deadline.label} for ${workItem.name}`;

    const updatedWorkItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.rosObject.update({
        where: {
          id: workItem.id
        },
        data: {
          data: nextData
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: workItem.id,
          actorId: actor.id,
          eventType: "portal_work.deadline.completed",
          summary,
          previousValue: {
            completed: false,
            deadlineDate: deadline.date.toISOString(),
            deadlineKey,
            deadlineLabel: deadline.label
          },
          newValue: {
            completed: true,
            completedAt: completedAt.toISOString(),
            deadlineKey,
            deadlineLabel: deadline.label,
            hasNote: Boolean(note)
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.work.deadline.completed",
          subjectType: "RosObject",
          subjectId: workItem.id,
          summary,
          metadata: {
            completedAt: completedAt.toISOString(),
            deadlineDate: deadline.date.toISOString(),
            deadlineKey,
            deadlineLabel: deadline.label,
            hasNote: Boolean(note),
            objectType: workItem.objectType
          }
        }
      });

      return updated;
    });

    return NextResponse.json({
      completion: {
        completedAt: completedAt.toISOString(),
        deadlineKey,
        deadlineLabel: deadline.label,
        note
      },
      workItem: updatedWorkItem
    });
  } catch (error) {
    return handleDeadlineCompletionError(error);
  }
}

function getOptionalCompletionNote(input: unknown): string | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const value = (input as Record<string, unknown>).note;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new DeadlineCompletionValidationError(
      "Completion note must be text."
    );
  }

  const note = value.trim();

  if (!note) {
    return null;
  }

  if (note.length > 500) {
    throw new DeadlineCompletionValidationError(
      "Completion note must be 500 characters or fewer."
    );
  }

  return note;
}

class DeadlineCompletionValidationError extends Error {}

function handleDeadlineCompletionError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof DeadlineCompletionValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      {
        error:
          "Deadline completion storage is temporarily unavailable."
      },
      { status: 503 }
    );
  }

  throw error;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
