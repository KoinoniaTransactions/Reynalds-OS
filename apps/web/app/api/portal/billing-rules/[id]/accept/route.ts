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
  buildBillingSetupStatusNextAction,
  getBillingSetupHealth
} from "../../../../../../lib/billing-setup-requests";
import {
  prisma
} from "../../../../../../lib/db";
import {
  buildAcceptedBillingRuleData,
  mergeBillingProfileRuleAuthorizationData,
  mergeBillingSetupRequestAcceptedTermsData,
  mergeServiceActivationAcceptedTermsData
} from "../../../../../../lib/portal-billing-rule-acceptance";
import {
  billingRuleAssignmentObjectType,
  BillingRuleValidationError,
  getBillingRuleContext,
  validateBillingRuleAcceptanceInput
} from "../../../../../../lib/portal-billing-rules";
import {
  customerBillingProfileObjectType,
  getCustomerBillingProfileHealth,
  getCustomerBillingProfileNextAction,
  getCustomerBillingProfileStatus,
  serviceActivationObjectType
} from "../../../../../../lib/portal-billing-entities";

export const dynamic =
  "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  {
    params
  }: Params
) {
  try {
    const actor =
      await assertPermission(
        "client-portal:billing:setup"
      );

    if (actor.role !== "Client") {
      return NextResponse.json(
        {
          error:
            "Billing terms not found."
        },
        {
          status: 404
        }
      );
    }

    const {
      id
    } = await params;

    const acceptance =
      validateBillingRuleAcceptanceInput(
        await request.json()
      );

    const billingRule =
      await prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id,
          objectType:
            billingRuleAssignmentObjectType,
          workspaceId:
            actor.workspaceId,
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
        }
      });

    if (!billingRule) {
      return NextResponse.json(
        {
          error:
            "Billing terms not found."
        },
        {
          status: 404
        }
      );
    }

    const context =
      getBillingRuleContext(
        billingRule.data
      );

    if (
      !context.billingModel ||
      !context.billingSetupRequestId ||
      !context.customerBillingProfileId ||
      !context.serviceActivationId ||
      !context.serviceName ||
      !context.termsVersion
    ) {
      throw new BillingRuleValidationError(
        "These billing terms are missing their persisted billing relationships."
      );
    }

    const {
      billingModel,
      billingSetupRequestId,
      customerBillingProfileId,
      serviceActivationId,
      serviceName,
      termsVersion
    } = context;

    if (
      termsVersion !==
      acceptance.termsVersion
    ) {
      throw new BillingRuleValidationError(
        "The submitted terms version does not match the current billing rule."
      );
    }

    const [
      billingSetupRequest,
      customerBillingProfile,
      serviceActivation
    ] = await Promise.all([
      prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id:
            billingSetupRequestId,
          objectType:
            billingSetupRequestObjectType,
          workspaceId:
            actor.workspaceId,
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
        }
      }),

      prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id:
            customerBillingProfileId,
          objectType:
            customerBillingProfileObjectType,
          workspaceId:
            actor.workspaceId
        }
      }),

      prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id:
            serviceActivationId,
          objectType:
            serviceActivationObjectType,
          workspaceId:
            actor.workspaceId,
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
        }
      })
    ]);

    if (!billingSetupRequest) {
      throw new BillingRuleValidationError(
        "The linked billing setup request was not found for this client."
      );
    }

    if (!customerBillingProfile) {
      throw new BillingRuleValidationError(
        "The linked customer billing profile was not found."
      );
    }

    if (!serviceActivation) {
      throw new BillingRuleValidationError(
        "The linked service activation was not found for this client."
      );
    }

    const setupData =
      toRecord(
        billingSetupRequest.data
      );

    const activationData =
      toRecord(
        serviceActivation.data
      );

    assertCurrentRelationships({
      activationData,
      billingModel,
      billingRuleId:
        billingRule.id,
      customerBillingProfileId,
      serviceActivationId,
      setupData,
      termsVersion
    });

    const acceptedAt =
      new Date();

    const accepted =
      await prisma.$transaction(
        async (tx) => {
          const acceptedRule =
            await tx.rosObject.update({
              where: {
                id:
                  billingRule.id
              },
              data: {
                data:
                  buildAcceptedBillingRuleData(
                    billingRule.data,
                    {
                      acceptance,
                      acceptedAt,
                      acceptedByUserId:
                        actor.id
                    }
                  ),
                health:
                  "Healthy",
                nextAction:
                  "Secure processor-hosted payment setup may now begin.",
                status:
                  "Authorized"
              }
            });

          const acceptedServiceActivation =
            await tx.rosObject.update({
              where: {
                id:
                  serviceActivation.id
              },
              data: {
                data:
                  mergeServiceActivationAcceptedTermsData(
                    serviceActivation.data,
                    {
                      acceptedAt,
                      acceptedByUserId:
                        actor.id,
                      billingRuleAssignmentId:
                        billingRule.id,
                      termsVersion
                    }
                  ),
                nextAction:
                  "Complete secure processor-hosted payment setup before any billing that requires a stored payment method."
              }
            });

          const acceptedBillingSetupRequest =
            await tx.rosObject.update({
              where: {
                id:
                  billingSetupRequest.id
              },
              data: {
                data:
                  mergeBillingSetupRequestAcceptedTermsData(
                    billingSetupRequest.data,
                    {
                      acceptedAt,
                      acceptedByUserId:
                        actor.id,
                      billingRuleAssignmentId:
                        billingRule.id,
                      termsVersion
                    }
                  ),
                health:
                  getBillingSetupHealth(
                    "Setup Requested"
                  ),
                nextAction:
                  buildBillingSetupStatusNextAction(
                    "Setup Requested"
                  ),
                status:
                  "Setup Requested"
              }
            });

          const acceptedBillingProfile =
            await tx.rosObject.update({
              where: {
                id:
                  customerBillingProfile.id
              },
              data: {
                data:
                  mergeBillingProfileRuleAuthorizationData(
                    customerBillingProfile.data,
                    {
                      acceptedAt,
                      acceptedByUserId:
                        actor.id,
                      billingModel,
                      billingRuleAssignmentId:
                        billingRule.id,
                      serviceActivationId:
                        serviceActivation.id,
                      termsVersion
                    }
                  ),
                health:
                  getCustomerBillingProfileHealth(
                    "Authorized"
                  ),
                nextAction:
                  getCustomerBillingProfileNextAction(
                    "Authorized"
                  ),
                status:
                  getCustomerBillingProfileStatus(
                    "Authorized"
                  )
              }
            });

          await tx.timelineEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              objectId:
                billingRule.id,
              actorId:
                actor.id,
              eventType:
                "billing_rule.accepted",
              summary:
                `Client accepted billing terms ${termsVersion} for ${serviceName}.`,
              previousValue: {
                authorizationStatus:
                  context.authorizationStatus ??
                  billingRule.status,
                termsVersion
              },
              newValue: {
                acceptedAt:
                  acceptedAt.toISOString(),
                acceptedByUserId:
                  actor.id,
                authorizationStatus:
                  "Authorized",
                billingSetupRequestId:
                  billingSetupRequest.id,
                customerBillingProfileId:
                  customerBillingProfile.id,
                serviceActivationId:
                  serviceActivation.id,
                termsVersion
              }
            }
          });

          await tx.timelineEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              objectId:
                billingSetupRequest.id,
              actorId:
                actor.id,
              eventType:
                "billing_setup.terms_authorized",
              summary:
                `Written billing terms ${termsVersion} authorized for ${serviceName}.`,
              previousValue: {
                status:
                  billingSetupRequest.status,
                termsAuthorizationStatus:
                  optionalString(
                    setupData.termsAuthorizationStatus
                  ) ??
                  null
              },
              newValue: {
                billingRuleAssignmentId:
                  billingRule.id,
                consentAcknowledged:
                  true,
                status:
                  "Setup Requested",
                termsAuthorizationStatus:
                  "Authorized",
                termsVersion
              }
            }
          });

          await tx.auditEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              actorId:
                actor.id,
              actorEmail:
                actor.email,
              action:
                "portal.billing_rule.accepted",
              subjectType:
                "RosObject",
              subjectId:
                billingRule.id,
              summary:
                `Client accepted written billing terms for ${serviceName}.`,
              metadata: {
                acceptedAt:
                  acceptedAt.toISOString(),
                billingModel,
                billingSetupRequestId:
                  billingSetupRequest.id,
                customerBillingProfileId:
                  customerBillingProfile.id,
                serviceActivationId:
                  serviceActivation.id,
                termsVersion
              }
            }
          });

          return {
            billingRule:
              acceptedRule,
            billingSetupRequest:
              acceptedBillingSetupRequest,
            customerBillingProfile:
              acceptedBillingProfile,
            serviceActivation:
              acceptedServiceActivation
          };
        }
      );

    return NextResponse.json(
      accepted
    );
  } catch (error) {
    return handleBillingRuleAcceptanceError(
      error
    );
  }
}

function assertCurrentRelationships(
  input: {
    activationData:
      Record<string, unknown>;
    billingModel: string;
    billingRuleId: string;
    customerBillingProfileId: string;
    serviceActivationId: string;
    setupData:
      Record<string, unknown>;
    termsVersion: string;
  }
): void {
  if (
    optionalString(
      input.setupData.billingRuleAssignmentId
    ) !== input.billingRuleId
  ) {
    throw new BillingRuleValidationError(
      "These billing terms are no longer the current version for this setup request."
    );
  }

  if (
    optionalString(
      input.setupData.customerBillingProfileId
    ) !==
      input.customerBillingProfileId ||
    optionalString(
      input.setupData.serviceActivationId
    ) !==
      input.serviceActivationId
  ) {
    throw new BillingRuleValidationError(
      "The billing setup request relationships do not match these terms."
    );
  }

  if (
    optionalString(
      input.setupData.canonicalBillingModel
    ) !==
      input.billingModel ||
    optionalString(
      input.activationData.billingModel
    ) !==
      input.billingModel
  ) {
    throw new BillingRuleValidationError(
      "The billing model relationships do not match these terms."
    );
  }

  if (
    optionalString(
      input.setupData.termsVersion
    ) !==
      input.termsVersion ||
    optionalString(
      input.activationData.termsVersion
    ) !==
      input.termsVersion
  ) {
    throw new BillingRuleValidationError(
      "These billing terms are no longer the current terms version."
    );
  }

  if (
    optionalString(
      input.activationData.billingRuleAssignmentId
    ) !== input.billingRuleId
  ) {
    throw new BillingRuleValidationError(
      "The linked service activation is not awaiting acceptance of these terms."
    );
  }
}

function optionalString(
  value: unknown
): string | undefined {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

function toRecord(
  value: unknown
): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (
        value as Record<
          string,
          unknown
        >
      )
    : {};
}

function handleBillingRuleAcceptanceError(
  error: unknown
) {
  const authResponse =
    getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (
    error instanceof
    BillingRuleValidationError
  ) {
    return NextResponse.json(
      {
        error:
          error.message
      },
      {
        status: 400
      }
    );
  }

  if (
    isDatabaseUnavailableError(
      error
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Billing terms storage is temporarily unavailable."
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
    (
      error.name ===
        "PrismaClientInitializationError" ||
      error.message.includes(
        "Can't reach database server"
      ) ||
      error.message.includes(
        "ECONNREFUSED"
      )
    )
  );
}
