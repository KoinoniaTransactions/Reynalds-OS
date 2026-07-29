import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import {
  accessRequestObjectType,
  AccessRequestValidationError,
  buildAccessRequestName,
  buildAccessRequestNextAction,
  getAccessRequestHealth,
  validateAccessRequestInput
} from "../../../../lib/access-requests";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await assertAnyPermission([
      "client-portal:access:view",
      "employee-portal:clients:view"
    ]);
    const canViewWorkspaceQueue = canViewAllAccessRequests(actor);

    const accessRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: accessRequestObjectType,
        archivedAt: null,
        ...(canViewWorkspaceQueue ? {} : { ownerId: actor.id })
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });

    return NextResponse.json({ accessRequests });
  } catch (error) {
    return handleAccessRequestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertAnyPermission([
      "client-portal:access:update",
      "employee-portal:assigned-work:update"
    ]);
    const input = validateAccessRequestInput(await request.json());

    const accessRequest = await prisma.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: accessRequestObjectType,
        name: buildAccessRequestName(input),
        status: input.status,
        health: getAccessRequestHealth(input.status),
        ownerId: actor.id,
        nextAction: buildAccessRequestNextAction(input),
        data: buildAccessRequestData(input, actor)
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: accessRequest.id,
        actorId: actor.id,
        eventType: "access_request.created",
        summary: `Access request created for ${input.platformName}`,
        newValue: {
          accessRequestId: accessRequest.id,
          platformName: input.platformName,
          status: input.status
        }
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.access_request.created",
        subjectType: "RosObject",
        subjectId: accessRequest.id,
        summary: `Access request created for ${input.platformName}`,
        metadata: {
          accessPurpose: input.accessPurpose,
          permissionLevel: input.permissionLevel,
          requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
          status: input.status
        }
      }
    });

    return NextResponse.json({ accessRequest }, { status: 201 });
  } catch (error) {
    return handleAccessRequestError(error);
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

function canViewAllAccessRequests(actor: AuthUser): boolean {
  return actor.role !== "Client" && actor.permissions.includes("employee-portal:clients:view");
}

function buildAccessRequestData(
  input: ReturnType<typeof validateAccessRequestInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data: Record<string, string> = {
    accessPurpose: input.accessPurpose,
    permissionLevel: input.permissionLevel,
    platformName: input.platformName,
    requestedByEmail: actor.email,
    requestedByUserId: actor.id,
    requestSource: actor.role === "Client" ? "client-portal" : "employee-portal"
  };

  if (input.clientName) {
    data.clientName = input.clientName;
  }

  if (input.notes) {
    data.notes = input.notes;
  }

  if (input.relatedWorkName) {
    data.relatedWorkName = input.relatedWorkName;
  }

  return data as Prisma.InputJsonObject;
}

function handleAccessRequestError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof AccessRequestValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Access request storage is temporarily unavailable." }, { status: 503 });
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
