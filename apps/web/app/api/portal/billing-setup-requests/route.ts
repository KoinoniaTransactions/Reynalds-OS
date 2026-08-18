import {
  PermissionDeniedError,
  type AuthUser,
  type Permission
} from "@reynalds-os/auth";
import { NextResponse } from "next/server";
import {
  getAuthErrorResponse
} from "../../../../lib/api-auth";
import {
  assertPermission
} from "../../../../lib/auth";
import {
  applyBillingSetupRequestSourcePolicy,
  billingSetupRequestObjectType,
  BillingSetupValidationError,
  validateBillingSetupRequestInput
} from "../../../../lib/billing-setup-requests";
import {
  prisma
} from "../../../../lib/db";
import {
  BillingTargetNotFoundError,
  createPortalBillingSetupBundle,
  getCanonicalBillingModelForService
} from "../../../../lib/portal-billing-persistence";
import {
  applyTermsManagedBillingSetupPolicy
} from "../../../../lib/portal-billing-rules";
import {
  getBillingSetupRequestPermission,
  getBillingSetupRequestSource,
  koinoniaBillingRequestSourceHeader
} from "../../../../lib/portal-billing-request-source";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor =
      await assertAnyPermission([
        "client-portal:billing:view",
        "billing-workspace:view"
      ]);

    const canViewWorkspaceQueue =
      canViewAllBillingSetupRequests(
        actor
      );

    const billingSetupRequests =
      await prisma.rosObject.findMany({
        where: {
          workspaceId:
            actor.workspaceId,
          objectType:
            billingSetupRequestObjectType,
          archivedAt: null,
          ...(canViewWorkspaceQueue
            ? {}
            : {
                OR: [
                  {
                    clientUserId:
                      actor.id
                  },
                  {
                    ownerId:
                      actor.id
                  }
                ]
              })
        },
        orderBy: [
          {
            updatedAt: "desc"
          },
          {
            createdAt: "desc"
          }
        ],
        take: 50
      });

    return NextResponse.json({
      billingSetupRequests
    });
  } catch (error) {
    return handleBillingSetupRequestError(
      error
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const actor =
      await assertAnyPermission([
        "client-portal:billing:setup",
        "billing-workspace:payment-methods:request"
      ]);

    const requestSource =
      getBillingSetupRequestSource(
        request.headers.get(
          koinoniaBillingRequestSourceHeader
        ),
        actor.role
      );

    const requiredPermission =
      getBillingSetupRequestPermission(
        requestSource
      );

    if (
      !actor.permissions.includes(
        requiredPermission
      )
    ) {
      throw new PermissionDeniedError(
        requiredPermission
      );
    }

    const rawInput =
      await request.json();

    const sourcePolicyInput =
      applyBillingSetupRequestSourcePolicy(
        validateBillingSetupRequestInput(
          rawInput
        ),
        requestSource
      );

    const canonicalBillingModel =
      getCanonicalBillingModelForService(
        sourcePolicyInput.serviceName
      );

    const input =
      applyTermsManagedBillingSetupPolicy(
        sourcePolicyInput,
        canonicalBillingModel
      );

    const created =
      await createPortalBillingSetupBundle({
        actor,
        input,
        rawInput,
        requestSource
      });

    return NextResponse.json(created, {
      status: 201
    });
  } catch (error) {
    return handleBillingSetupRequestError(
      error
    );
  }
}

async function assertAnyPermission(
  permissions: Permission[]
): Promise<AuthUser> {
  let permissionDeniedError:
    | PermissionDeniedError
    | null = null;

  for (const permission of permissions) {
    try {
      return await assertPermission(
        permission
      );
    } catch (error) {
      if (
        error instanceof
        PermissionDeniedError
      ) {
        permissionDeniedError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    permissionDeniedError ??
    new PermissionDeniedError(
      permissions[0]
    )
  );
}

function canViewAllBillingSetupRequests(
  actor: AuthUser
): boolean {
  return (
    actor.role !== "Client" &&
    actor.permissions.includes(
      "billing-workspace:view"
    )
  );
}

function handleBillingSetupRequestError(
  error: unknown
) {
  const authResponse =
    getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (
    error instanceof
    BillingTargetNotFoundError
  ) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 404
      }
    );
  }

  if (
    error instanceof
    BillingSetupValidationError
  ) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 400
      }
    );
  }

  if (
    isDatabaseUnavailableError(error)
  ) {
    return NextResponse.json(
      {
        error:
          "Billing setup storage is temporarily unavailable."
      },
      {
        status: 503
      }
    );
  }

  throw error;
}

function isDatabaseUnavailableError(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    (error.name ===
      "PrismaClientInitializationError" ||
      error.message.includes(
        "Can't reach database server"
      ) ||
      error.message.includes(
        "ECONNREFUSED"
      ))
  );
}
