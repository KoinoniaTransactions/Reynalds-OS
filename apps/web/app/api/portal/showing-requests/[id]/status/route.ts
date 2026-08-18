import type { AuthUser } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  buildShowingStatusNextAction,
  getShowingStatusHealth,
  showingRequestObjectType,
  ShowingRequestValidationError,
  validateShowingRequestStatusUpdateInput
} from "../../../../../../lib/showing-requests";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("employee-portal:assigned-work:update");
    const { id } = await params;
    const input = validateShowingRequestStatusUpdateInput(await request.json());
    const showingRequest = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id,
        objectType: showingRequestObjectType,
        workspaceId: actor.workspaceId
      }
    });

    if (!showingRequest) {
      return NextResponse.json({ error: "Showing request not found." }, { status: 404 });
    }

    const previousValue = {
      data: showingRequest.data,
      health: showingRequest.health,
      nextAction: showingRequest.nextAction,
      status: showingRequest.status
    };
    const nextData = buildShowingRequestStatusData(showingRequest.data, input, actor);
    const updatedShowingRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.rosObject.update({
        where: { id: showingRequest.id },
        data: {
          data: nextData,
          health: getShowingStatusHealth(input.status),
          nextAction: buildShowingStatusNextAction(input.status),
          status: input.status
        }
      });
      const newValue = {
        assignedProvider: input.assignedProvider ?? null,
        confirmedWindow: input.confirmedWindow ?? null,
        feedbackSummary: input.feedbackSummary ?? null,
        hasNotes: Boolean(input.notes),
        status: input.status
      };

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: showingRequest.id,
          actorId: actor.id,
          eventType: "showing_request.status.updated",
          summary: `Showing request status updated: ${showingRequest.name} is ${input.status}`,
          previousValue,
          newValue
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.showing_request.status.updated",
          subjectType: "RosObject",
          subjectId: showingRequest.id,
          summary: `Showing request status updated: ${showingRequest.name} is ${input.status}`,
          metadata: {
            hasFeedbackSummary: Boolean(input.feedbackSummary),
            hasNotes: Boolean(input.notes),
            previousStatus: showingRequest.status,
            status: input.status
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ showingRequest: updatedShowingRequest });
  } catch (error) {
    return handleShowingRequestStatusError(error);
  }
}

function buildShowingRequestStatusData(
  currentData: unknown,
  input: ReturnType<typeof validateShowingRequestStatusUpdateInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data =
    currentData && typeof currentData === "object" && !Array.isArray(currentData)
      ? { ...(currentData as Record<string, unknown>) }
      : {};

  data.statusUpdatedAt = new Date().toISOString();
  data.statusUpdatedByEmail = actor.email;
  data.statusUpdatedByUserId = actor.id;

  if (input.assignedProvider) {
    data.assignedProvider = input.assignedProvider;
  }

  if (input.confirmedWindow) {
    data.confirmedWindow = input.confirmedWindow;
  }

  if (input.feedbackSummary) {
    data.feedbackSummary = input.feedbackSummary;
  }

  if (input.notes) {
    data.lastStatusNote = input.notes;
  }

  return data as Prisma.InputJsonObject;
}

function handleShowingRequestStatusError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof ShowingRequestValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Showing request storage is temporarily unavailable." },
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
