import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { buildPortalPlaybook } from "../../../../lib/portal-playbook";
import {
  buildShowingRequestName,
  buildShowingRequestNextAction,
  showingRequestObjectType,
  ShowingRequestValidationError,
  validateShowingRequestInput
} from "../../../../lib/showing-requests";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await assertAnyPermission([
      "client-portal:showings:view",
      "employee-portal:assigned-work:view"
    ]);
    const canViewWorkspaceQueue = canViewAllShowingRequests(actor);

    const showingRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: showingRequestObjectType,
        archivedAt: null,
        ...(canViewWorkspaceQueue
          ? {}
          : { OR: [{ clientUserId: actor.id }, { ownerId: actor.id }] })
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });

    return NextResponse.json({ showingRequests });
  } catch (error) {
    return handleShowingRequestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertAnyPermission([
      "client-portal:showings:create",
      "employee-portal:assigned-work:update"
    ]);
    const input = validateShowingRequestInput(await request.json());
    const showingRequestName = buildShowingRequestName(input);
    const showingRequestData = buildShowingRequestData(
      input,
      actor,
      showingRequestName
    );

    const showingRequest = await prisma.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: showingRequestObjectType,
        name: showingRequestName,
        status: input.authorization ? "Requested" : "Needs Follow-up",
        health: input.authorization ? "Attention" : "Blocked",
        ownerId: actor.id,
        clientUserId: actor.role === "Client" ? actor.id : undefined,
        assignedStaffUserId: actor.role === "Client" ? undefined : actor.id,
        nextAction: buildShowingRequestNextAction(input),
        data: showingRequestData
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: showingRequest.id,
        actorId: actor.id,
        eventType: "showing_request.created",
        summary: `Showing request created for ${input.propertyAddress}`,
        newValue: showingRequest
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.showing_request.created",
        subjectType: "RosObject",
        subjectId: showingRequest.id,
        summary: `Showing request created for ${input.propertyAddress}`,
        metadata: {
          authorization: input.authorization,
          requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
          serviceLevel: input.serviceLevel
        }
      }
    });

    return NextResponse.json({ showingRequest }, { status: 201 });
  } catch (error) {
    return handleShowingRequestError(error);
  }
}

async function assertAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  let permissionDeniedError: PermissionDeniedError | null = null;

  for (const permission of permissions) {
    try {
      return await assertPermission(permission);
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        permissionDeniedError = error;
        continue;
      }

      throw error;
    }
  }

  throw permissionDeniedError ?? new PermissionDeniedError(permissions[0]);
}

function canViewAllShowingRequests(actor: AuthUser): boolean {
  return actor.role !== "Client" && actor.permissions.includes("employee-portal:assigned-work:view");
}

function buildShowingRequestData(
  input: ReturnType<typeof validateShowingRequestInput>,
  actor: AuthUser,
  showingRequestName: string
): Prisma.InputJsonObject {
  const data: Record<string, Prisma.InputJsonValue> = {
    authorization: input.authorization,
    preferredWindow: input.preferredWindow,
    propertyAddress: input.propertyAddress,
    requestedByEmail: actor.email,
    requestedByUserId: actor.id,
    requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
    serviceLevel: input.serviceLevel
  };

  if (input.buyerContact) {
    data.buyerContact = input.buyerContact;
  }

  if (input.buyerName) {
    data.buyerName = input.buyerName;
  }

  if (input.clientName) {
    data.clientName = input.clientName;
  }

  if (input.notes) {
    data.notes = input.notes;
  }

  const playbook = buildPortalPlaybook({
    data,
    name: showingRequestName,
    objectType: showingRequestObjectType
  });

  if (playbook) {
    data.playbook = {
      billingModel: playbook.billingModel,
      deadlinePlaceholders: playbook.deadlinePlaceholders.map(
        (deadline) => ({
          date: deadline.date.toISOString(),
          dateLabel: deadline.dateLabel,
          daysUntilDue: deadline.daysUntilDue,
          key: deadline.key,
          label: deadline.label,
          risk: deadline.risk
        })
      ),
      expectedDocuments: playbook.expectedDocuments,
      healthFactorKeys: playbook.healthFactorKeys,
      initialActions: playbook.initialActions,
      instantiatedAt: new Date().toISOString(),
      requiredStaffRoles: playbook.requiredStaffRoles,
      serviceName: playbook.serviceName,
      templateId: playbook.templateId
    };
  }

  return data as Prisma.InputJsonObject;
}

function handleShowingRequestError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof ShowingRequestValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Showing request storage is temporarily unavailable." }, { status: 503 });
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
