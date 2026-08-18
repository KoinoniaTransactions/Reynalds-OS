import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  buildPortalLaunchProofName,
  buildPortalLaunchProofNextAction,
  getPortalLaunchProofHealth,
  getPortalLaunchProofRecord,
  portalLaunchProofObjectType,
  PortalLaunchProofValidationError,
  validatePortalLaunchProofInput
} from "../../../../lib/portal-launch-proof";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await assertPermission("employee-portal:view");

    const proofObjects = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: portalLaunchProofObjectType,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 100
    });

    return NextResponse.json({
      proofs: proofObjects.map(getPortalLaunchProofRecord).filter(Boolean)
    });
  } catch (error) {
    return handlePortalLaunchProofError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertAnyPermission([
      "employee-portal:assignments:update",
      "admin:update"
    ]);
    const input = validatePortalLaunchProofInput(await request.json());
    const proof = await prisma.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: portalLaunchProofObjectType,
        name: buildPortalLaunchProofName(input),
        status: input.status,
        health: getPortalLaunchProofHealth(input.status),
        ownerId: actor.id,
        assignedStaffUserId: actor.id,
        nextAction: buildPortalLaunchProofNextAction(input),
        data: buildPortalLaunchProofData(input, actor)
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: proof.id,
        actorId: actor.id,
        eventType: "portal_launch_proof.recorded",
        summary: `Launch proof recorded for ${input.checklistItemId}`,
        newValue: {
          checklistItemId: input.checklistItemId,
          proofId: proof.id,
          status: input.status
        }
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.launch_proof.recorded",
        subjectType: "RosObject",
        subjectId: proof.id,
        summary: `Launch proof recorded for ${input.checklistItemId}`,
        metadata: {
          checklistItemId: input.checklistItemId,
          proofDate: input.proofDate,
          proofOwner: input.proofOwner,
          status: input.status
        }
      }
    });

    return NextResponse.json({ proof: getPortalLaunchProofRecord(proof) }, { status: 201 });
  } catch (error) {
    return handlePortalLaunchProofError(error);
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

function buildPortalLaunchProofData(
  input: ReturnType<typeof validatePortalLaunchProofInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data: Record<string, string> = {
    checklistItemId: input.checklistItemId,
    notes: input.notes,
    proofDate: input.proofDate,
    proofOwner: input.proofOwner,
    recordedByEmail: actor.email,
    recordedByName: actor.name,
    recordedByUserId: actor.id,
    requestSource: "employee-portal",
    status: input.status
  };

  if (input.evidenceUrl) {
    data.evidenceUrl = input.evidenceUrl;
  }

  return data as Prisma.InputJsonObject;
}

function handlePortalLaunchProofError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalLaunchProofValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Launch proof storage is temporarily unavailable." }, { status: 503 });
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
