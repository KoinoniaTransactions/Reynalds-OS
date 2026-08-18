import {
  NextResponse
} from "next/server";
import {
  getAuthErrorResponse
} from "../../../../lib/api-auth";
import {
  assertPermission
} from "../../../../lib/auth";
import {
  billingSetupRequestObjectType,
  getBillingSetupHealth
} from "../../../../lib/billing-setup-requests";
import {
  prisma
} from "../../../../lib/db";
import {
  customerBillingProfileObjectType,
  serviceActivationObjectType
} from "../../../../lib/portal-billing-entities";
import {
  billingRuleAssignmentObjectType,
  BillingRuleValidationError,
  buildBillingRuleAssignmentData,
  buildSupersededBillingRuleData,
  getBillingRuleContext,
  isTermsManagedBillingModel,
  mergeBillingSetupRequestPendingTermsData,
  mergeServiceActivationPendingTermsData,
  validateBillingRuleAssignmentInput
} from "../../../../lib/portal-billing-rules";

export const dynamic =
  "force-dynamic";

const billingRuleServiceActivationRelationshipType =
  "billing_rule_service_activation";

const billingRuleCustomerBillingProfileRelationshipType =
  "billing_rule_customer_billing_profile";

export async function POST(
  request: Request
) {
  try {
    const actor =
      await assertPermission(
        "billing-workspace:profiles:update"
      );

    const rawInput =
      await request.json();

    const billingSetupRequestId =
      getRequiredString(
        rawInput,
        "billingSetupRequestId"
      );

    const ruleInput =
      validateBillingRuleAssignmentInput(
        rawInput
      );

    const billingSetupRequest =
      await prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          id:
            billingSetupRequestId,
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

    const requestContext =
      getBillingSetupContext(
        billingSetupRequest.data
      );

    if (
      !isTermsManagedBillingModel(
        requestContext.billingModel
      )
    ) {
      throw new BillingRuleValidationError(
        "This billing setup request does not use monthly or custom written terms."
      );
    }

    if (
      requestContext.billingModel !==
      ruleInput.billingModel
    ) {
      throw new BillingRuleValidationError(
        "The submitted billing model does not match the billing setup request."
      );
    }

    const {
      customerBillingProfileId,
      serviceActivationId,
      serviceName
    } = requestContext;

    if (
      !customerBillingProfileId ||
      !serviceActivationId ||
      !serviceName
    ) {
      throw new BillingRuleValidationError(
        "The billing setup request is missing its persisted billing relationships."
      );
    }

    const [
      customerBillingProfile,
      serviceActivation,
      serviceRules
    ] = await Promise.all([
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
            actor.workspaceId
        }
      }),

      prisma.rosObject.findMany({
        where: {
          archivedAt: null,
          objectType:
            billingRuleAssignmentObjectType,
          workspaceId:
            actor.workspaceId,
          sourceLinks: {
            some: {
              relationshipType:
                billingRuleServiceActivationRelationshipType,
              targetObjectId:
                serviceActivationId
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    if (!customerBillingProfile) {
      throw new BillingRuleValidationError(
        "The linked customer billing profile was not found."
      );
    }

    if (!serviceActivation) {
      throw new BillingRuleValidationError(
        "The linked service activation was not found."
      );
    }

    const serviceActivationData =
      toRecord(
        serviceActivation.data
      );

    const serviceBillingModel =
      optionalString(
        serviceActivationData.billingModel
      );

    if (
      serviceBillingModel !==
      ruleInput.billingModel
    ) {
      throw new BillingRuleValidationError(
        "The linked service activation billing model does not match the requested terms."
      );
    }

    const duplicateVersion =
      serviceRules.some(
        (rule) =>
          getBillingRuleContext(
            rule.data
          ).termsVersion ===
          ruleInput.termsVersion
      );

    if (duplicateVersion) {
      throw new BillingRuleValidationError(
        "That terms version already exists for this service activation."
      );
    }

    const createdAt =
      new Date();

    const billingRule =
      await prisma.$transaction(
        async (tx) => {
          for (
            const existingRule
            of serviceRules
          ) {
            const context =
              getBillingRuleContext(
                existingRule.data
              );

            if (
              context.authorizationStatus ===
                "Superseded" ||
              existingRule.status ===
                "Superseded"
            ) {
              continue;
            }

            await tx.rosObject.update({
              where: {
                id:
                  existingRule.id
              },
              data: {
                data:
                  buildSupersededBillingRuleData(
                    existingRule.data,
                    {
                      actorId:
                        actor.id,
                      supersededAt:
                        createdAt
                    }
                  ),
                health:
                  "Neutral",
                nextAction:
                  "A newer billing terms version requires client acceptance.",
                status:
                  "Superseded"
              }
            });

            await tx.timelineEvent.create({
              data: {
                workspaceId:
                  actor.workspaceId,
                objectId:
                  existingRule.id,
                actorId:
                  actor.id,
                eventType:
                  "billing_rule.superseded",
                summary:
                  `Billing terms ${context.termsVersion ?? existingRule.name} were superseded by a newer version.`,
                previousValue: {
                  authorizationStatus:
                    context.authorizationStatus ??
                    existingRule.status,
                  termsVersion:
                    context.termsVersion ??
                    null
                },
                newValue: {
                  authorizationStatus:
                    "Superseded",
                  replacementTermsVersion:
                    ruleInput.termsVersion
                }
              }
            });
          }

          const ruleData =
            buildBillingRuleAssignmentData(
              {
                actorId:
                  actor.id,
                billingSetupRequestId:
                  billingSetupRequest.id,
                createdAt,
                customerBillingProfileId:
                  customerBillingProfile.id,
                rule:
                  ruleInput,
                serviceActivationId:
                  serviceActivation.id,
                serviceName
              }
            );

          const createdRule =
            await tx.rosObject.create({
              data: {
                workspaceId:
                  actor.workspaceId,
                objectType:
                  billingRuleAssignmentObjectType,
                name:
                  `Billing Terms - ${serviceName} - ${ruleInput.termsVersion}`,
                status:
                  "Pending Acceptance",
                health:
                  "Attention",
                ownerId:
                  billingSetupRequest.ownerId,
                clientUserId:
                  billingSetupRequest.clientUserId,
                clientObjectId:
                  billingSetupRequest.clientObjectId,
                assignedStaffUserId:
                  actor.id,
                nextAction:
                  "Client must review and accept this exact written billing terms version.",
                data:
                  ruleData
              }
            });

          await tx.objectRelationship.createMany({
            data: [
              {
                relationshipType:
                  billingRuleServiceActivationRelationshipType,
                sourceObjectId:
                  createdRule.id,
                targetObjectId:
                  serviceActivation.id
              },
              {
                relationshipType:
                  billingRuleCustomerBillingProfileRelationshipType,
                sourceObjectId:
                  createdRule.id,
                targetObjectId:
                  customerBillingProfile.id
              }
            ]
          });

          await tx.rosObject.update({
            where: {
              id:
                serviceActivation.id
            },
            data: {
              data:
                mergeServiceActivationPendingTermsData(
                  serviceActivation.data,
                  {
                    billingRuleAssignmentId:
                      createdRule.id,
                    termsVersion:
                      ruleInput.termsVersion
                  }
                ),
              nextAction:
                "Wait for client acceptance of the current written billing terms."
            }
          });

          await tx.rosObject.update({
            where: {
              id:
                billingSetupRequest.id
            },
            data: {
              data:
                mergeBillingSetupRequestPendingTermsData(
                  billingSetupRequest.data,
                  {
                    billingRuleAssignmentId:
                      createdRule.id,
                    termsVersion:
                      ruleInput.termsVersion
                  }
                ),
              health:
                getBillingSetupHealth(
                  "Consent Needed"
                ),
              nextAction:
                "Client must accept the exact written billing terms before secure payment setup can begin.",
              status:
                "Consent Needed"
            }
          });

          await tx.timelineEvent.create({
            data: {
              workspaceId:
                actor.workspaceId,
              objectId:
                createdRule.id,
              actorId:
                actor.id,
              eventType:
                "billing_rule.created",
              summary:
                `Billing terms ${ruleInput.termsVersion} created for ${serviceName}.`,
              newValue: {
                authorizationStatus:
                  "Pending Acceptance",
                billingModel:
                  ruleInput.billingModel,
                billingSetupRequestId:
                  billingSetupRequest.id,
                customerBillingProfileId:
                  customerBillingProfile.id,
                serviceActivationId:
                  serviceActivation.id,
                termsVersion:
                  ruleInput.termsVersion
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
                "portal.billing_rule.created",
              subjectType:
                "RosObject",
              subjectId:
                createdRule.id,
              summary:
                `Written billing terms created for ${serviceName}.`,
              metadata: {
                authorizationStatus:
                  "Pending Acceptance",
                billingModel:
                  ruleInput.billingModel,
                billingSetupRequestId:
                  billingSetupRequest.id,
                customerBillingProfileId:
                  customerBillingProfile.id,
                serviceActivationId:
                  serviceActivation.id,
                termsVersion:
                  ruleInput.termsVersion
              }
            }
          });

          return createdRule;
        }
      );

    return NextResponse.json(
      {
        billingRule
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return handleBillingRuleError(
      error
    );
  }
}

function getBillingSetupContext(
  data: unknown
): {
  billingModel?: string;
  customerBillingProfileId?: string;
  serviceActivationId?: string;
  serviceName?: string;
} {
  const value =
    toRecord(data);

  return {
    billingModel:
      optionalString(
        value.canonicalBillingModel
      ),
    customerBillingProfileId:
      optionalString(
        value.customerBillingProfileId
      ),
    serviceActivationId:
      optionalString(
        value.serviceActivationId
      ),
    serviceName:
      optionalString(
        value.serviceName
      )
  };
}

function getRequiredString(
  value: unknown,
  fieldName: string
): string {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new BillingRuleValidationError(
      `${fieldName} is required.`
    );
  }

  const text =
    optionalString(
      (
        value as Record<
          string,
          unknown
        >
      )[fieldName]
    );

  if (!text) {
    throw new BillingRuleValidationError(
      `${fieldName} is required.`
    );
  }

  return text;
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

function handleBillingRuleError(
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
          "Billing rule storage is temporarily unavailable."
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
