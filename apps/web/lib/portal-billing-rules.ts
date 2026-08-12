import type {
  Prisma
} from "@reynalds-os/database";
import type {
  BillingSetupRequestInput,
  BillingSetupStatus
} from "./billing-setup-requests";
import type {
  ServiceBillingModel
} from "./portal-billing-entities";

export const billingRuleAssignmentObjectType =
  "BillingRuleAssignment";

export const termsManagedBillingModels = [
  "monthly",
  "custom"
] as const;

export type TermsManagedBillingModel =
  (typeof termsManagedBillingModels)[number];

export const billingRuleAuthorizationStatuses = [
  "Pending Acceptance",
  "Authorized",
  "Superseded"
] as const;

export type BillingRuleAuthorizationStatus =
  (typeof billingRuleAuthorizationStatuses)[number];

type BillingRuleCommonInput = {
  billingModel: TermsManagedBillingModel;
  effectiveDate: string;
  renewalCancellationSummary: string;
  scopeSummary: string;
  termsVersion: string;
};

export type BillingRuleAssignmentInput =
  | (BillingRuleCommonInput & {
      billingModel: "monthly";
      billingDay: number;
      checkInCadence: string;
      includedHours: number;
      monthlyAmount: string;
      overageRate?: string;
      paymentTiming: string;
    })
  | (BillingRuleCommonInput & {
      authorizationRequirements: string;
      billingModel: "custom";
      paymentTiming: string;
      pricingBasis: string;
      reviewCadence: string;
    });

export type BillingRuleAcceptanceInput = {
  accepted: true;
  termsVersion: string;
};

export type BillingRuleContext = {
  authorizationStatus?: BillingRuleAuthorizationStatus;
  billingModel?: TermsManagedBillingModel;
  billingSetupRequestId?: string;
  customerBillingProfileId?: string;
  serviceActivationId?: string;
  serviceName?: string;
  termsVersion?: string;
};

export class BillingRuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingRuleValidationError";
  }
}

export function isTermsManagedBillingModel(
  value: string | null | undefined
): value is TermsManagedBillingModel {
  return value === "monthly" || value === "custom";
}

export function applyTermsManagedBillingSetupPolicy(
  input: BillingSetupRequestInput,
  canonicalBillingModel: ServiceBillingModel
): BillingSetupRequestInput {
  if (!isTermsManagedBillingModel(canonicalBillingModel)) {
    return input;
  }

  return {
    ...input,
    consentAcknowledged: false,
    status: "Consent Needed"
  };
}

export function assertTermsManagedBillingSetupStatusAllowed(
  data: unknown,
  nextStatus: BillingSetupStatus
): void {
  const value = toRecord(data);

  const billingModel = optionalString(
    value.canonicalBillingModel
  );

  const authorizationStatus = optionalString(
    value.termsAuthorizationStatus
  );

  if (!isTermsManagedBillingModel(billingModel)) {
    return;
  }

  if (authorizationStatus === "Authorized") {
    return;
  }

  if (
    nextStatus === "Consent Needed" ||
    nextStatus === "Blocked"
  ) {
    return;
  }

  throw new BillingRuleValidationError(
    "Monthly or custom billing cannot advance until the client accepts the exact written billing terms."
  );
}

export function validateBillingRuleAssignmentInput(
  input: unknown
): BillingRuleAssignmentInput {
  const value = requireRecord(input);

  const billingModel = requiredString(
    value.billingModel,
    "billingModel"
  );

  if (!isTermsManagedBillingModel(billingModel)) {
    throw new BillingRuleValidationError(
      "billingModel must be monthly or custom."
    );
  }

  const common = {
    billingModel,
    effectiveDate: requiredDate(
      value.effectiveDate,
      "effectiveDate"
    ),
    renewalCancellationSummary: requiredSafeText(
      value.renewalCancellationSummary,
      "renewalCancellationSummary",
      800
    ),
    scopeSummary: requiredSafeText(
      value.scopeSummary,
      "scopeSummary",
      1000
    ),
    termsVersion: requiredTermsVersion(
      value.termsVersion
    )
  };

  if (billingModel === "monthly") {
    return {
      ...common,
      billingModel: "monthly",
      billingDay: requiredInteger(
        value.billingDay,
        "billingDay",
        1,
        28
      ),
      checkInCadence: requiredSafeText(
        value.checkInCadence,
        "checkInCadence",
        240
      ),
      includedHours: requiredNumber(
        value.includedHours,
        "includedHours",
        0,
        1000
      ),
      monthlyAmount: requiredMoney(
        value.monthlyAmount,
        "monthlyAmount"
      ),
      overageRate: optionalMoney(
        value.overageRate,
        "overageRate"
      ),
      paymentTiming: requiredSafeText(
        value.paymentTiming,
        "paymentTiming",
        500
      )
    };
  }

  return {
    ...common,
    billingModel: "custom",
    authorizationRequirements: requiredSafeText(
      value.authorizationRequirements,
      "authorizationRequirements",
      800
    ),
    paymentTiming: requiredSafeText(
      value.paymentTiming,
      "paymentTiming",
      500
    ),
    pricingBasis: requiredSafeText(
      value.pricingBasis,
      "pricingBasis",
      800
    ),
    reviewCadence: requiredSafeText(
      value.reviewCadence,
      "reviewCadence",
      240
    )
  };
}

export function validateBillingRuleAcceptanceInput(
  input: unknown
): BillingRuleAcceptanceInput {
  const value = requireRecord(input);

  if (value.accepted !== true) {
    throw new BillingRuleValidationError(
      "The client must explicitly accept the billing terms."
    );
  }

  return {
    accepted: true,
    termsVersion: requiredTermsVersion(
      value.termsVersion
    )
  };
}

export function assertBillingRuleAcceptanceMatches(
  ruleData: unknown,
  input: BillingRuleAcceptanceInput
): void {
  const value = toRecord(ruleData);

  if (
    value.authorizationStatus !== "Pending Acceptance"
  ) {
    throw new BillingRuleValidationError(
      "These billing terms are not awaiting acceptance."
    );
  }

  const currentTermsVersion = requiredTermsVersion(
    value.termsVersion
  );

  if (currentTermsVersion !== input.termsVersion) {
    throw new BillingRuleValidationError(
      "The submitted terms version does not match the current billing rule."
    );
  }
}

export function buildBillingRuleAssignmentData(
  input: {
    actorId: string;
    billingSetupRequestId: string;
    createdAt: Date;
    customerBillingProfileId: string;
    rule: BillingRuleAssignmentInput;
    serviceActivationId: string;
    serviceName: string;
  }
): Prisma.InputJsonObject {
  const data: Record<
    string,
    Prisma.InputJsonValue
  > = {
    authorizationStatus:
      "Pending Acceptance",
    billingModel:
      input.rule.billingModel,
    billingSetupRequestId:
      input.billingSetupRequestId,
    createdAt:
      input.createdAt.toISOString(),
    createdByUserId:
      input.actorId,
    customerBillingProfileId:
      input.customerBillingProfileId,
    effectiveDate:
      input.rule.effectiveDate,
    renewalCancellationSummary:
      input.rule.renewalCancellationSummary,
    scopeSummary:
      input.rule.scopeSummary,
    serviceActivationId:
      input.serviceActivationId,
    serviceName:
      input.serviceName,
    termsVersion:
      input.rule.termsVersion
  };

  if (input.rule.billingModel === "monthly") {
    data.billingDay =
      input.rule.billingDay;
    data.checkInCadence =
      input.rule.checkInCadence;
    data.includedHours =
      input.rule.includedHours;
    data.monthlyAmount =
      input.rule.monthlyAmount;
    data.paymentTiming =
      input.rule.paymentTiming;

    if (input.rule.overageRate) {
      data.overageRate =
        input.rule.overageRate;
    }
  } else {
    data.authorizationRequirements =
      input.rule.authorizationRequirements;
    data.paymentTiming =
      input.rule.paymentTiming;
    data.pricingBasis =
      input.rule.pricingBasis;
    data.reviewCadence =
      input.rule.reviewCadence;
  }

  return data as Prisma.InputJsonObject;
}

export function buildSupersededBillingRuleData(
  currentData: unknown,
  input: {
    actorId: string;
    supersededAt: Date;
  }
): Prisma.InputJsonObject {
  const data = toJsonRecord(
    currentData
  );

  data.authorizationStatus =
    "Superseded";

  data.supersededAt =
    input.supersededAt.toISOString();

  data.supersededByUserId =
    input.actorId;

  return data as Prisma.InputJsonObject;
}

export function mergeServiceActivationPendingTermsData(
  currentData: unknown,
  input: {
    billingRuleAssignmentId: string;
    termsVersion: string;
  }
): Prisma.InputJsonObject {
  const data = toJsonRecord(
    currentData
  );

  data.billingRuleAssignmentId =
    input.billingRuleAssignmentId;

  data.consentStatus =
    "Pending";

  data.termsAuthorizationStatus =
    "Pending Acceptance";

  data.termsVersion =
    input.termsVersion;

  delete data.termsAcceptedAt;
  delete data.termsAcceptedByUserId;

  return data as Prisma.InputJsonObject;
}

export function mergeBillingSetupRequestPendingTermsData(
  currentData: unknown,
  input: {
    billingRuleAssignmentId: string;
    termsVersion: string;
  }
): Prisma.InputJsonObject {
  const data = toJsonRecord(
    currentData
  );

  data.billingRuleAssignmentId =
    input.billingRuleAssignmentId;

  data.consentAcknowledged =
    false;

  data.termsAuthorizationStatus =
    "Pending Acceptance";

  data.termsVersion =
    input.termsVersion;

  delete data.termsAcceptedAt;
  delete data.termsAcceptedByUserId;

  return data as Prisma.InputJsonObject;
}

export function getBillingRuleContext(
  data: unknown
): BillingRuleContext {
  const value = toRecord(data);

  const billingModel =
    optionalString(
      value.billingModel
    );

  const authorizationStatus =
    optionalString(
      value.authorizationStatus
    );

  return {
    authorizationStatus:
      billingRuleAuthorizationStatuses.includes(
        authorizationStatus as
          BillingRuleAuthorizationStatus
      )
        ? (
            authorizationStatus as
              BillingRuleAuthorizationStatus
          )
        : undefined,

    billingModel:
      isTermsManagedBillingModel(
        billingModel
      )
        ? billingModel
        : undefined,

    billingSetupRequestId:
      optionalString(
        value.billingSetupRequestId
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
      ),

    termsVersion:
      optionalString(
        value.termsVersion
      )
  };
}

function requiredTermsVersion(
  value: unknown
): string {
  const text = requiredString(
    value,
    "termsVersion"
  );

  if (
    text.length > 80 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(
      text
    )
  ) {
    throw new BillingRuleValidationError(
      "termsVersion must use only letters, numbers, periods, underscores, or hyphens and be 80 characters or fewer."
    );
  }

  return text;
}

function requiredDate(
  value: unknown,
  fieldName: string
): string {
  const text = requiredString(
    value,
    fieldName
  );

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    throw new BillingRuleValidationError(
      `${fieldName} must use YYYY-MM-DD.`
    );
  }

  const date = new Date(
    `${text}T12:00:00.000Z`
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !==
      text
  ) {
    throw new BillingRuleValidationError(
      `${fieldName} must be a valid calendar date.`
    );
  }

  return text;
}

function requiredSafeText(
  value: unknown,
  fieldName: string,
  maxLength: number
): string {
  const text = requiredString(
    value,
    fieldName
  );

  if (text.length > maxLength) {
    throw new BillingRuleValidationError(
      `${fieldName} must be ${maxLength} characters or fewer.`
    );
  }

  if (
    /\b(card number|credit card|debit card|cvv|cvc|routing number|account number|bank password|bank login|stripe secret|api key|secret key)\b/i.test(
      text
    ) ||
    /(?:\d[ -]?){13,19}/.test(
      text
    )
  ) {
    throw new BillingRuleValidationError(
      "Billing terms must not contain raw payment credentials, bank details, or processor secrets."
    );
  }

  return text;
}

function requiredMoney(
  value: unknown,
  fieldName: string
): string {
  const amount = normalizeMoney(
    value
  );

  if (!amount) {
    throw new BillingRuleValidationError(
      `${fieldName} must be a positive dollar amount with no more than two decimal places.`
    );
  }

  return amount;
}

function optionalMoney(
  value: unknown,
  fieldName: string
): string | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  return requiredMoney(
    value,
    fieldName
  );
}

function normalizeMoney(
  value: unknown
): string | undefined {
  const text =
    typeof value === "number"
      ? String(value)
      : optionalString(value);

  if (
    !text ||
    !/^\d+(?:\.\d{1,2})?$/.test(
      text
    )
  ) {
    return undefined;
  }

  const amount = Number(text);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1000000
  ) {
    return undefined;
  }

  return amount.toFixed(2);
}

function requiredInteger(
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new BillingRuleValidationError(
      `${fieldName} must be an integer from ${min} through ${max}.`
    );
  }

  return value;
}

function requiredNumber(
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new BillingRuleValidationError(
      `${fieldName} must be a number from ${min} through ${max}.`
    );
  }

  return value;
}

function requireRecord(
  value: unknown
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new BillingRuleValidationError(
      "Billing rule input must be an object."
    );
  }

  return value as Record<
    string,
    unknown
  >;
}

function requiredString(
  value: unknown,
  fieldName: string
): string {
  const text =
    optionalString(value);

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
