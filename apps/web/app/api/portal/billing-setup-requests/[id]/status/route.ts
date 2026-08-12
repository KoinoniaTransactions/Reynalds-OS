import type {
  AuthUser
} from "@reynalds-os/auth";
import type {
  Prisma
} from "@reynalds-os/database";
import {
  NextResponse
} from "next/server";
import {
  getAuthErrorResponse
} from "../../../../../../lib/api-auth";
import {
  assertPermission
} from "../../../../../../lib/auth";
import {
  billingSetupRequestObjectType,
  BillingSetupValidationError,
  buildBillingSetupStatusNextAction,
  getBillingSetupHealth,
  validateBillingSetupStatusUpdateInput
} from "../../../../../../lib/billing-setup-requests";
import {
  prisma
} from "../../../../../../lib/db";
import {
  assertTermsManagedBillingSetupStatusAllowed,
  BillingRuleValidationError
} from "../../../../../../lib/portal-billing-rules";

export const dynamic =
  "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  {
    params
  }: Params
) {
  try {
    const actor =
      await assertPermission(
        "billing-workspace:payment-methods:request"
      );

    const {
      id
    } = await params;

    const billingSetupRequest =
      await prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id,
          objectType:
            billingSetupRequestObjectType,
          workspaceId:
            actor.workspaceId
        }
      });

    if (!billingSetupRequest) {
      return NextResponse.json(
        {
          error:
            "Billing setup request not found."
        },
        {
          status: 404
        }
      );
    }

    const input =
      validateBillingSetupStatusUpdateInput(
        await request.json()
      );

    assertTermsManagedBillingSetupStatusAllowed(
      billingSetupRequest.data,
      input.status
    );

    const previousValue = {
      data:
        billingSetupRequest.data,
      health:
        billingSetupRequest.health,
      nextAction:
        billingSetupRequest.nextAction,
      status:
        billingSetupRequest.status
    };

    const nextData =
      buildBillingSetupStatusData(
        billingSetupRequest.data,
        input,
        actor
      );

    const updatedBillingSetupRequest =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.rosObject.update({
              where: {
                id:
                  billingSetupRequest.id
              },
              data: {
                data: nextData,
                health:
                  getBillingSetupHealth(
                    input.status
                  ),
                nextAction:
                  buildBillingSetupStatusNextAction(
                    input.status
                  ),
                status:
                  input.status
              }
            });

          const newValue = {
            hasNotes:
              Boolean(input.notes),
            paymentMethodSummary:
              input.paymentMethodSummary ??
              null,
            processorReference:
              input.processorReference ??
              null,
            status: input.status,
            triggerDescription:
              input.triggerDescription ??
              null
          };

          await tx.timelineEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              objectId:
                billingSetupRequest.id,
              actorId: actor.id,
              eventType:
                "billing_setup.status.updated",
              summary:
                `Billing setup status updated: ${billingSetupRequest.name} is ${input.status}`,
              previousValue,
              newValue
            }
          });

          await tx.auditEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              actorId: actor.id,
              actorEmail:
                actor.email,
              action:
                "portal.billing_setup.status.updated",
              subjectType:
                "RosObject",
              subjectId:
                billingSetupRequest.id,
              summary:
                `Billing setup status updated: ${billingSetupRequest.name} is ${input.status}`,
              metadata: {
                hasNotes:
                  Boolean(
                    input.notes
                  ),
                hasPaymentMethodSummary:
                  Boolean(
                    input.paymentMethodSummary
                  ),
                hasProcessorReference:
                  Boolean(
                    input.processorReference
                  ),
                previousStatus:
                  billingSetupRequest.status,
                status:
                  input.status
              }
            }
          });

          return updated;
        }
      );

    return NextResponse.json({
      billingSetupRequest:
        updatedBillingSetupRequest
    });
  } catch (error) {
    return handleBillingSetupStatusError(
      error
    );
  }
}

function buildBillingSetupStatusData(
  currentData: unknown,
  input: ReturnType<
    typeof validateBillingSetupStatusUpdateInput
  >,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data =
    currentData &&
    typeof currentData === "object" &&
    !Array.isArray(currentData)
      ? {
          ...(currentData as Record<
            string,
            unknown
          >)
        }
      : {};

  data.statusUpdatedAt =
    new Date().toISOString();
  data.statusUpdatedByEmail =
    actor.email;
  data.statusUpdatedByUserId =
    actor.id;

  if (input.notes) {
    data.lastStatusNote =
      input.notes;
  }

  if (
    input.paymentMethodSummary
  ) {
    data.paymentMethodSummary =
      input.paymentMethodSummary;
  }

  if (input.processorReference) {
    data.processorReference =
      input.processorReference;
  }

  if (input.triggerDescription) {
    data.triggerDescription =
      input.triggerDescription;
  }

  return data as Prisma.InputJsonObject;
}

function handleBillingSetupStatusError(
  error: unknown
) {
  const authResponse =
    getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (
    error instanceof
      BillingSetupValidationError ||
    error instanceof
      BillingRuleValidationError
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
