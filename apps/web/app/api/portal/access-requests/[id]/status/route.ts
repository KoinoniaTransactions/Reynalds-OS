import type { AuthUser } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import {
  accessRequestObjectType,
  AccessRequestValidationError,
  buildAccessRequestStatusNextAction,
  getAccessRequestHealth,
  validateAccessRequestStatusUpdateInput
} from "../../../../../../lib/access-requests";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("employee-portal:assigned-work:update");
    const { id } = await params;
    const input = validateAccessRequestStatusUpdateInput(await request.json());
    const accessRequest = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id,
        objectType: accessRequestObjectType,
        workspaceId: actor.workspaceId
      }
    });

    if (!accessRequest) {
      return NextResponse.json({ error: "Access request not found." }, { status: 404 });
    }

    const previousValue = {
      data: accessRequest.data,
      health: accessRequest.health,
      nextAction: accessRequest.nextAction,
      status: accessRequest.status
    };
    const nextData = buildAccessRequestStatusData(accessRequest.data, input, actor);

    const updatedAccessRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.rosObject.update({
        where: { id: accessRequest.id },
        data: {
          data: nextData,
          health: getAccessRequestHealth(input.status),
          nextAction: buildAccessRequestStatusNextAction(input.status),
          status: input.status
        }
      });

      const newValue = {
        hasNotes: Boolean(input.notes),
        status: input.status
      };

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: accessRequest.id,
          actorId: actor.id,
          eventType: "access_request.status.updated",
          summary: `Access request status updated: ${accessRequest.name} is ${input.status}`,
          previousValue,
          newValue
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.access_request.status.updated",
          subjectType: "RosObject",
          subjectId: accessRequest.id,
          summary: `Access request status updated: ${accessRequest.name} is ${input.status}`,
          metadata: {
            hasNotes: Boolean(input.notes),
            previousStatus: accessRequest.status,
            status: input.status
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ accessRequest: updatedAccessRequest });
  } catch (error) {
    return handleAccessRequestStatusError(error);
  }
}

function buildAccessRequestStatusData(
  currentData: unknown,
  input: ReturnType<typeof validateAccessRequestStatusUpdateInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data =
    currentData && typeof currentData === "object" && !Array.isArray(currentData)
      ? { ...(currentData as Record<string, unknown>) }
      : {};

  data.statusUpdatedAt = new Date().toISOString();
  data.statusUpdatedByEmail = actor.email;
  data.statusUpdatedByUserId = actor.id;

  if (input.notes) {
    data.lastStatusNote = input.notes;
  }

  return data as Prisma.InputJsonObject;
}

function handleAccessRequestStatusError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof AccessRequestValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Access request storage is temporarily unavailable." },
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
