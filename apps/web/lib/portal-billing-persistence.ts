import type { AuthUser } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import {
  billingSetupRequestObjectType,
  BillingSetupValidationError,
  buildBillingSetupNextAction,
  buildBillingSetupRequestName,
  getBillingSetupHealth,
  type BillingSetupRequestInput,
  type BillingSetupRequestSource
} from "./billing-setup-requests";
import { prisma } from "./db";
import { getKoinoniaServiceTemplateByPackageName } from "./koinonia-service-templates";
import {
  buildCustomerBillingProfileObject,
  buildServiceActivationObject,
  customerBillingProfileObjectType,
  type CustomerBillingConsentStatus,
  type ServiceBillingModel
} from "./portal-billing-entities";
import {
  buildPersistedPortalPlaybookSnapshot,
  buildPortalPlaybook
} from "./portal-playbook";

export class BillingTargetNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingTargetNotFoundError";
  }
}

type BillingPersistenceTarget = {
  billingContactEmail?: string;
  billingContactName?: string;
  clientName: string;
  clientObjectId?: string;
  clientUserId?: string;
};

type CreatePortalBillingSetupBundleInput = {
  actor: AuthUser;
  input: BillingSetupRequestInput;
  rawInput: unknown;
  requestSource: BillingSetupRequestSource;
};

export function getCanonicalBillingModelForService(
  serviceName: string
): ServiceBillingModel {
  const template = getKoinoniaServiceTemplateByPackageName(serviceName);

  switch (template?.billingModel) {
    case "prepaid":
      return "prepaid";
    case "pay_at_close":
      return "pay_at_close";
    case "monthly":
      return "monthly";
    case "per_request":
      return "per_request";
    case "custom":
    default:
      return "custom";
  }
}

export function getRequestedBillingClientObjectId(
  rawInput: unknown,
  requestSource: BillingSetupRequestSource
): string | undefined {
  if (requestSource === "client-portal") {
    return undefined;
  }

  if (!rawInput || typeof rawInput !== "object" || Array.isArray(rawInput)) {
    throw new BillingSetupValidationError(
      "clientObjectId is required when staff create a billing setup request."
    );
  }

  const value = (rawInput as Record<string, unknown>).clientObjectId;

  if (typeof value !== "string" || !value.trim()) {
    throw new BillingSetupValidationError(
      "clientObjectId is required when staff create a billing setup request."
    );
  }

  return value.trim();
}

export function getBillingOwnerId(
  clientUserId?: string
): string | null {
  return clientUserId ?? null;
}

export function mergeBillingProfileData(
  currentData: unknown,
  nextData: Prisma.InputJsonObject
): Prisma.InputJsonObject {
  const current = toRecord(currentData);
  const incoming = toRecord(nextData);

  const authorizedBillingModels = [
    ...readBillingModels(current.authorizedBillingModels),
    ...readBillingModels(incoming.authorizedBillingModels)
  ];

  const merged = {
    ...current,
    ...incoming
  } as Record<string, Prisma.InputJsonValue>;

  if (authorizedBillingModels.length) {
    merged.authorizedBillingModels = [...new Set(authorizedBillingModels)];
  }

  return merged as Prisma.InputJsonObject;
}

export async function createPortalBillingSetupBundle({
  actor,
  input,
  rawInput,
  requestSource
}: CreatePortalBillingSetupBundleInput) {
  const target = await resolveBillingTarget(actor, requestSource, rawInput);
  const billingModel = getCanonicalBillingModelForService(input.serviceName);

  return prisma.$transaction(async (tx) => {
    const existingProfile = await tx.rosObject.findFirst({
      where: {
        workspaceId: actor.workspaceId,
        objectType: customerBillingProfileObjectType,
        archivedAt: null,
        ...getBillingProfileIdentityWhere(target)
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    const existingConsentStatus = getStoredConsentStatus(existingProfile?.data);

    const consentStatus: CustomerBillingConsentStatus =
      input.consentAcknowledged
        ? "Authorized"
        : existingConsentStatus ?? "Pending";

    const profileShape = buildCustomerBillingProfileObject({
      authorizedBillingModels: input.consentAcknowledged
        ? [billingModel]
        : undefined,
      billingContactEmail: target.billingContactEmail,
      billingContactName: target.billingContactName,
      clientName: target.clientName,
      clientObjectId: target.clientObjectId,
      clientUserId: target.clientUserId,
      consentStatus,
      consentTimestamp: input.consentAcknowledged
        ? new Date().toISOString()
        : undefined
    });

    const profileData = mergeBillingProfileData(
      existingProfile?.data,
      profileShape.data
    );

    const customerBillingProfile = existingProfile
      ? await tx.rosObject.update({
          where: {
            id: existingProfile.id
          },
          data: {
            name: profileShape.name,
            status: profileShape.status,
            health: profileShape.health,
            ownerId: getBillingOwnerId(target.clientUserId),
            clientUserId:
              target.clientUserId ??
              existingProfile.clientUserId,
            clientObjectId:
              target.clientObjectId ??
              existingProfile.clientObjectId,
            assignedStaffUserId:
              actor.role === "Client"
                ? existingProfile.assignedStaffUserId
                : actor.id,
            nextAction: profileShape.nextAction,
            data: profileData
          }
        })
      : await tx.rosObject.create({
          data: {
            workspaceId: actor.workspaceId,
            objectType: profileShape.objectType,
            name: profileShape.name,
            status: profileShape.status,
            health: profileShape.health,
            ownerId: getBillingOwnerId(target.clientUserId),
            clientUserId: target.clientUserId,
            clientObjectId: target.clientObjectId,
            assignedStaffUserId:
              actor.role === "Client" ? undefined : actor.id,
            nextAction: profileShape.nextAction,
            data: profileData
          }
        });

    await tx.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: customerBillingProfile.id,
        actorId: actor.id,
        eventType: existingProfile
          ? "billing_profile.updated"
          : "billing_profile.created",
        summary: existingProfile
          ? `Billing profile updated for ${target.clientName}.`
          : `Billing profile created for ${target.clientName}.`,
        previousValue: existingProfile
          ? {
              status: existingProfile.status
            }
          : undefined,
        newValue: {
          billingModel,
          clientObjectId: target.clientObjectId ?? null,
          clientUserId: target.clientUserId ?? null,
          consentStatus,
          status: customerBillingProfile.status
        }
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: existingProfile
          ? "portal.billing_profile.updated"
          : "portal.billing_profile.created",
        subjectType: "RosObject",
        subjectId: customerBillingProfile.id,
        summary: existingProfile
          ? `Billing profile updated for ${target.clientName}.`
          : `Billing profile created for ${target.clientName}.`,
        metadata: {
          billingModel,
          clientObjectId: target.clientObjectId ?? null,
          clientUserId: target.clientUserId ?? null,
          consentStatus,
          requestSource
        }
      }
    });

    const serviceActivationShape = buildServiceActivationObject({
      amountLabel: input.amountLabel,
      billingModel,
      clientName: target.clientName,
      clientObjectId: target.clientObjectId,
      clientUserId: target.clientUserId,
      consentStatus: input.consentAcknowledged
        ? "Authorized"
        : "Pending",
      serviceName: input.serviceName,
      status: "Pending",
      triggerDescription: input.triggerDescription
    });

    const serviceActivation = await tx.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: serviceActivationShape.objectType,
        name: serviceActivationShape.name,
        status: serviceActivationShape.status,
        health: serviceActivationShape.health,
        ownerId: getBillingOwnerId(target.clientUserId),
        clientUserId: target.clientUserId,
        clientObjectId: target.clientObjectId,
        assignedStaffUserId:
          actor.role === "Client" ? undefined : actor.id,
        nextAction: serviceActivationShape.nextAction,
        data: {
          ...serviceActivationShape.data,
          customerBillingProfileId: customerBillingProfile.id
        }
      }
    });

    await tx.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: serviceActivation.id,
        actorId: actor.id,
        eventType: "service_activation.created",
        summary: `Service activation created for ${input.serviceName}.`,
        newValue: {
          billingModel,
          clientObjectId: target.clientObjectId ?? null,
          clientUserId: target.clientUserId ?? null,
          customerBillingProfileId: customerBillingProfile.id,
          status: serviceActivation.status
        }
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.service_activation.created",
        subjectType: "RosObject",
        subjectId: serviceActivation.id,
        summary: `Service activation created for ${input.serviceName}.`,
        metadata: {
          billingModel,
          clientObjectId: target.clientObjectId ?? null,
          clientUserId: target.clientUserId ?? null,
          customerBillingProfileId: customerBillingProfile.id,
          requestSource
        }
      }
    });

    const billingSetupRequest = await tx.rosObject.create({
      data: {
        workspaceId: actor.workspaceId,
        objectType: billingSetupRequestObjectType,
        name: buildBillingSetupRequestName(input),
        status: input.status,
        health: getBillingSetupHealth(input.status),
        ownerId: getBillingOwnerId(target.clientUserId),
        clientUserId: target.clientUserId,
        clientObjectId: target.clientObjectId,
        assignedStaffUserId:
          actor.role === "Client" ? undefined : actor.id,
        nextAction: buildBillingSetupNextAction(input),
        data: buildBillingSetupRequestData({
          actor,
          billingModel,
          customerBillingProfileId: customerBillingProfile.id,
          input,
          requestSource,
          serviceActivationId: serviceActivation.id,
          target
        })
      }
    });

    await tx.timelineEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        objectId: billingSetupRequest.id,
        actorId: actor.id,
        eventType: "billing_setup.requested",
        summary: `Billing setup requested for ${input.serviceName}`,
        newValue: {
          billingSetupRequestId: billingSetupRequest.id,
          billingModel: input.billingModel,
          canonicalBillingModel: billingModel,
          customerBillingProfileId: customerBillingProfile.id,
          serviceActivationId: serviceActivation.id,
          serviceName: input.serviceName,
          status: input.status
        }
      }
    });

    await tx.auditEvent.create({
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
          canonicalBillingModel: billingModel,
          clientObjectId: target.clientObjectId ?? null,
          clientUserId: target.clientUserId ?? null,
          consentAcknowledged: input.consentAcknowledged,
          customerBillingProfileId: customerBillingProfile.id,
          requestSource,
          serviceActivationId: serviceActivation.id,
          serviceName: input.serviceName,
          status: input.status
        }
      }
    });

    return {
      billingSetupRequest,
      customerBillingProfile,
      serviceActivation
    };
  });
}

async function resolveBillingTarget(
  actor: AuthUser,
  requestSource: BillingSetupRequestSource,
  rawInput: unknown
): Promise<BillingPersistenceTarget> {
  if (requestSource === "client-portal") {
    const invitation = await prisma.portalInvitation.findFirst({
      where: {
        workspaceId: actor.workspaceId,
        email: actor.email,
        roleName: "Client",
        status: "accepted",
        clientObjectId: {
          not: null
        }
      },
      orderBy: [
        {
          acceptedAt: "desc"
        },
        {
          createdAt: "desc"
        }
      ]
    });

    const clientObject = invitation?.clientObjectId
      ? await prisma.rosObject.findFirst({
          where: {
            id: invitation.clientObjectId,
            workspaceId: actor.workspaceId,
            archivedAt: null
          },
          select: {
            id: true,
            name: true
          }
        })
      : null;

    return {
      billingContactEmail: actor.email,
      billingContactName: actor.name,
      clientName: clientObject?.name ?? actor.name,
      clientObjectId: clientObject?.id,
      clientUserId: actor.id
    };
  }

  const clientObjectId = getRequestedBillingClientObjectId(
    rawInput,
    requestSource
  );

  const clientObject = await prisma.rosObject.findFirst({
    where: {
      id: clientObjectId,
      workspaceId: actor.workspaceId,
      archivedAt: null
    },
    select: {
      id: true,
      name: true,
      clientUserId: true
    }
  });

  if (!clientObject) {
    throw new BillingTargetNotFoundError(
      "clientObjectId was not found in this workspace."
    );
  }

  return {
    clientName: clientObject.name,
    clientObjectId: clientObject.id,
    clientUserId: await resolveActiveClientUserId(
      actor.workspaceId,
      clientObject.id,
      clientObject.clientUserId
    )
  };
}

async function resolveActiveClientUserId(
  workspaceId: string,
  clientObjectId: string,
  directClientUserId: string | null
): Promise<string | undefined> {
  if (directClientUserId) {
    const directUser = await prisma.user.findFirst({
      where: {
        id: directClientUserId,
        workspaceId,
        status: "active",
        portalAccessStatus: "active"
      },
      include: {
        role: true
      }
    });

    if (directUser?.role?.name === "Client") {
      return directUser.id;
    }
  }

  const invitation = await prisma.portalInvitation.findFirst({
    where: {
      workspaceId,
      clientObjectId,
      roleName: "Client",
      status: "accepted"
    },
    orderBy: [
      {
        acceptedAt: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  if (!invitation) {
    return undefined;
  }

  const user = await prisma.user.findFirst({
    where: {
      workspaceId,
      email: invitation.email,
      status: "active",
      portalAccessStatus: "active"
    },
    include: {
      role: true
    }
  });

  return user?.role?.name === "Client" ? user.id : undefined;
}

function getBillingProfileIdentityWhere(
  target: BillingPersistenceTarget
): Prisma.RosObjectWhereInput {
  if (target.clientObjectId) {
    return {
      clientObjectId: target.clientObjectId
    };
  }

  if (target.clientUserId) {
    return {
      clientUserId: target.clientUserId
    };
  }

  throw new BillingSetupValidationError(
    "A billing profile requires a client user or client object target."
  );
}

function buildBillingSetupRequestData({
  actor,
  billingModel,
  customerBillingProfileId,
  input,
  requestSource,
  serviceActivationId,
  target
}: {
  actor: AuthUser;
  billingModel: ServiceBillingModel;
  customerBillingProfileId: string;
  input: BillingSetupRequestInput;
  requestSource: BillingSetupRequestSource;
  serviceActivationId: string;
  target: BillingPersistenceTarget;
}): Prisma.InputJsonObject {
  const data: Record<string, Prisma.InputJsonValue> = {
    billingModel: input.billingModel,
    canonicalBillingModel: billingModel,
    clientName: target.clientName,
    consentAcknowledged: input.consentAcknowledged,
    customerBillingProfileId,
    requestedByEmail: actor.email,
    requestedByUserId: actor.id,
    requestSource,
    serviceActivationId,
    serviceName: input.serviceName
  };

  if (target.clientObjectId) {
    data.clientObjectId = target.clientObjectId;
  }

  if (target.clientUserId) {
    data.clientUserId = target.clientUserId;
  }

  if (
    input.clientName &&
    input.clientName.trim() &&
    input.clientName.trim() !== target.clientName
  ) {
    data.submittedClientName = input.clientName.trim();
  }

  if (input.amountLabel) {
    data.amountLabel = input.amountLabel;
  }

  if (input.notes) {
    data.notes = input.notes;
  }

  if (input.triggerDescription) {
    data.triggerDescription = input.triggerDescription;
  }

  const playbook = buildPortalPlaybook({
    data,
    name: buildBillingSetupRequestName(input),
    objectType: billingSetupRequestObjectType
  });

  if (playbook) {
    data.playbook = buildPersistedPortalPlaybookSnapshot(
      playbook
    ) as Prisma.InputJsonObject;
  }

  return data as Prisma.InputJsonObject;
}

function getStoredConsentStatus(
  data: unknown
): CustomerBillingConsentStatus | undefined {
  const value = toRecord(data).consentStatus;

  switch (value) {
    case "Not Recorded":
    case "Pending":
    case "Authorized":
    case "Revoked":
      return value;
    default:
      return undefined;
  }
}

function readBillingModels(value: unknown): ServiceBillingModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ServiceBillingModel =>
      item === "prepaid" ||
      item === "pay_at_close" ||
      item === "monthly" ||
      item === "per_request" ||
      item === "custom"
  );
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
