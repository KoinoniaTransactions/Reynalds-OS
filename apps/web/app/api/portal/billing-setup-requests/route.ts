import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import {
  billingSetupRequestObjectType,
  BillingSetupValidationError,
  buildBillingSetupNextAction,
  buildBillingSetupRequestName,
  getBillingSetupHealth,
  validateBillingSetupRequestInput
} from "../../../../lib/billing-setup-requests";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await assertAnyPermission([
      "client-portal:billing:view",
      "billing-workspace:view"
    ]);
    const canViewWorkspaceQueue = canViewAllBillingSetupRequests(actor);

    const billingSetupRequests = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: billingSetupRequestObjectType,
        archivedAt: null,
        ...(canViewWorkspaceQueue
          ? {}
          : { OR: [{ clientUserId: actor.id }, { ownerId: actor.id }] })
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });

    return NextResponse.json({ billingSetupRequests });
  } catch (error) {
    return handleBillingSetupRequestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertAnyPermission([
      "client-portal:billing:setup",
      "billing-workspace:payment-methods:request"
    ]);
    const input = validateBillingSetupRequestInput(await request.json());

    const billingSetupRequest = await prisma.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: billingSetupRequestObjectType,
        name: buildBillingSetupRequestName(input),
        status: input.status,
        health: getBillingSetupHealth(input.status),
        ownerId: actor.id,
        clientUserId: actor.role === "Client" ? actor.id : undefined,
        assignedStaffUserId: actor.role === "Client" ? undefined : actor.id,
        nextAction: buildBillingSetupNextAction(input),
        data: buildBillingSetupRequestData(input, actor)
      }
    });

    await prisma.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: billingSetupRequest.id,
        actorId: actor.id,
        eventType: "billing_setup.requested",
        summary: `Billing setup requested for ${input.serviceName}`,
        newValue: {
          billingSetupRequestId: billingSetupRequest.id,
          billingModel: input.billingModel,
          serviceName: input.serviceName,
          status: input.status
        }
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.billing_setup.requested",
        subjectType: "RosObject",
        subjectId: billingSetupRequest.id,
        summary: `Billing setup requested for ${input.serviceName}`,
        metadata: {
          billingModel: input.billingModel,
          consentAcknowledged: input.consentAcknowledged,
          requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
          serviceName: input.serviceName,
          status: input.status
        }
      }
    });

    return NextResponse.json({ billingSetupRequest }, { status: 201 });
  } catch (error) {
    return handleBillingSetupRequestError(error);
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

function canViewAllBillingSetupRequests(actor: AuthUser): boolean {
  return actor.role !== "Client" && actor.permissions.includes("billing-workspace:view");
}

function buildBillingSetupRequestData(
  input: ReturnType<typeof validateBillingSetupRequestInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data: Record<string, string | boolean> = {
    billingModel: input.billingModel,
    consentAcknowledged: input.consentAcknowledged,
    requestedByEmail: actor.email,
    requestedByUserId: actor.id,
    requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
    serviceName: input.serviceName
  };

  if (input.amountLabel) {
    data.amountLabel = input.amountLabel;
  }

  if (input.clientName) {
    data.clientName = input.clientName;
  }

  if (input.notes) {
    data.notes = input.notes;
  }

  if (input.triggerDescription) {
    data.triggerDescription = input.triggerDescription;
  }

  return data as Prisma.InputJsonObject;
}

function handleBillingSetupRequestError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof BillingSetupValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Billing setup storage is temporarily unavailable." }, { status: 503 });
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
