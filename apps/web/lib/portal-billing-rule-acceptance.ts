import type {
  Prisma
} from "@reynalds-os/database";
import {
  assertBillingRuleAcceptanceMatches,
  type BillingRuleAcceptanceInput,
  type TermsManagedBillingModel
} from "./portal-billing-rules";

type AcceptanceEvidence = {
  acceptedAt: Date;
  acceptedByUserId: string;
  billingRuleAssignmentId: string;
  termsVersion: string;
};

export function buildAcceptedBillingRuleData(
  currentData: unknown,
  input: {
    acceptance: BillingRuleAcceptanceInput;
    acceptedAt: Date;
    acceptedByUserId: string;
  }
): Prisma.InputJsonObject {
  assertBillingRuleAcceptanceMatches(
    currentData,
    input.acceptance
  );

  const data =
    toJsonRecord(currentData);

  data.authorizationStatus =
    "Authorized";

  data.acceptedAt =
    input.acceptedAt.toISOString();

  data.acceptedByUserId =
    input.acceptedByUserId;

  data.acceptedTermsVersion =
    input.acceptance.termsVersion;

  return data as Prisma.InputJsonObject;
}

export function mergeServiceActivationAcceptedTermsData(
  currentData: unknown,
  input: AcceptanceEvidence
): Prisma.InputJsonObject {
  const data =
    toJsonRecord(currentData);

  data.billingRuleAssignmentId =
    input.billingRuleAssignmentId;

  data.consentStatus =
    "Authorized";

  data.termsAuthorizationStatus =
    "Authorized";

  data.termsVersion =
    input.termsVersion;

  data.termsAcceptedAt =
    input.acceptedAt.toISOString();

  data.termsAcceptedByUserId =
    input.acceptedByUserId;

  return data as Prisma.InputJsonObject;
}

export function mergeBillingSetupRequestAcceptedTermsData(
  currentData: unknown,
  input: AcceptanceEvidence
): Prisma.InputJsonObject {
  const data =
    toJsonRecord(currentData);

  data.billingRuleAssignmentId =
    input.billingRuleAssignmentId;

  data.consentAcknowledged =
    true;

  data.termsAuthorizationStatus =
    "Authorized";

  data.termsVersion =
    input.termsVersion;

  data.termsAcceptedAt =
    input.acceptedAt.toISOString();

  data.termsAcceptedByUserId =
    input.acceptedByUserId;

  return data as Prisma.InputJsonObject;
}

export function mergeBillingProfileRuleAuthorizationData(
  currentData: unknown,
  input: AcceptanceEvidence & {
    billingModel: TermsManagedBillingModel;
    serviceActivationId: string;
  }
): Prisma.InputJsonObject {
  const data =
    toJsonRecord(currentData);

  const authorizedBillingModels =
    readAuthorizedBillingModels(
      data.authorizedBillingModels
    );

  if (
    !authorizedBillingModels.includes(
      input.billingModel
    )
  ) {
    authorizedBillingModels.push(
      input.billingModel
    );
  }

  data.authorizedBillingModels =
    authorizedBillingModels;

  data.consentStatus =
    "Authorized";

  data.consentTermsVersion =
    input.termsVersion;

  data.consentTimestamp =
    input.acceptedAt.toISOString();

  const billingTermAuthorizations =
    toJsonRecord(
      data.billingTermAuthorizations
    );

  billingTermAuthorizations[
    input.serviceActivationId
  ] = {
    acceptedAt:
      input.acceptedAt.toISOString(),
    acceptedByUserId:
      input.acceptedByUserId,
    authorizationStatus:
      "Authorized",
    billingModel:
      input.billingModel,
    billingRuleAssignmentId:
      input.billingRuleAssignmentId,
    termsVersion:
      input.termsVersion
  };

  data.billingTermAuthorizations =
    billingTermAuthorizations;

  return data as Prisma.InputJsonObject;
}

function readAuthorizedBillingModels(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowed =
    new Set([
      "prepaid",
      "pay_at_close",
      "monthly",
      "per_request",
      "custom"
    ]);

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      allowed.has(item)
  );
}

function toJsonRecord(
  value: unknown
): Record<
  string,
  Prisma.InputJsonValue
> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? {
        ...(
          value as Record<
            string,
            Prisma.InputJsonValue
          >
        )
      }
    : {};
}
