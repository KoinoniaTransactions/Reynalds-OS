import type { Prisma } from "@reynalds-os/database";

export const customerBillingProfileObjectType = "CustomerBillingProfile";
export const serviceActivationObjectType = "ServiceActivation";

export const customerBillingConsentStatuses = [
  "Not Recorded",
  "Pending",
  "Authorized",
  "Revoked"
] as const;

export type CustomerBillingConsentStatus =
  (typeof customerBillingConsentStatuses)[number];

export const serviceActivationStatuses = [
  "Pending",
  "Active",
  "Paused",
  "Completed",
  "Cancelled"
] as const;

export type ServiceActivationStatus =
  (typeof serviceActivationStatuses)[number];

export const serviceBillingModels = [
  "prepaid",
  "pay_at_close",
  "monthly",
  "per_request",
  "custom"
] as const;

export type ServiceBillingModel = (typeof serviceBillingModels)[number];

export type CustomerBillingProfileInput = {
  authorizedBillingModels?: ServiceBillingModel[];
  billingContactEmail?: string;
  billingContactName?: string;
  billingContactPhone?: string;
  clientName: string;
  clientObjectId?: string;
  clientUserId?: string;
  consentStatus: CustomerBillingConsentStatus;
  consentTermsVersion?: string;
  consentTimestamp?: string;
  internalBillingNotes?: string;
  paymentIssues?: string;
};

export type ServiceActivationInput = {
  amountLabel?: string;
  billingModel: ServiceBillingModel;
  clientName?: string;
  clientObjectId?: string;
  clientUserId?: string;
  consentStatus?: CustomerBillingConsentStatus;
  relatedWorkObjectId?: string;
  serviceName: string;
  startedAt?: string;
  status: ServiceActivationStatus;
  termsVersion?: string;
  triggerDescription?: string;
};

export type PortalBillingRosObjectInput = {
  clientObjectId?: string;
  clientUserId?: string;
  data: Prisma.InputJsonObject;
  health: string;
  name: string;
  nextAction: string;
  objectType: string;
  status: string;
};

const consentStatusSet = new Set<string>(customerBillingConsentStatuses);
const serviceActivationStatusSet = new Set<string>(serviceActivationStatuses);
const billingModelSet = new Set<string>(serviceBillingModels);

export function validateCustomerBillingProfileInput(
  input: unknown
): CustomerBillingProfileInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Customer billing profile input must be an object.");
  }

  const value = input as Record<string, unknown>;
  const consentStatus = requiredString(value.consentStatus, "consentStatus");

  if (!consentStatusSet.has(consentStatus)) {
    throw new Error("consentStatus must match an approved billing consent status.");
  }

  const internalBillingNotes = optionalString(value.internalBillingNotes);
  const paymentIssues = optionalString(value.paymentIssues);

  rejectSensitivePaymentData(internalBillingNotes);
  rejectSensitivePaymentData(paymentIssues);

  return {
    authorizedBillingModels: validateBillingModels(value.authorizedBillingModels),
    billingContactEmail: optionalString(value.billingContactEmail),
    billingContactName: optionalString(value.billingContactName),
    billingContactPhone: optionalString(value.billingContactPhone),
    clientName: requiredString(value.clientName, "clientName"),
    clientObjectId: optionalString(value.clientObjectId),
    clientUserId: optionalString(value.clientUserId),
    consentStatus: consentStatus as CustomerBillingConsentStatus,
    consentTermsVersion: optionalString(value.consentTermsVersion),
    consentTimestamp: optionalIsoDate(value.consentTimestamp, "consentTimestamp"),
    internalBillingNotes,
    paymentIssues
  };
}

export function buildCustomerBillingProfileObject(
  input: CustomerBillingProfileInput
): PortalBillingRosObjectInput {
  const data: Record<string, Prisma.InputJsonValue> = {
    clientName: input.clientName,
    consentStatus: input.consentStatus
  };

  addOptionalString(data, "billingContactEmail", input.billingContactEmail);
  addOptionalString(data, "billingContactName", input.billingContactName);
  addOptionalString(data, "billingContactPhone", input.billingContactPhone);
  addOptionalString(data, "consentTermsVersion", input.consentTermsVersion);
  addOptionalString(data, "consentTimestamp", input.consentTimestamp);
  addOptionalString(data, "internalBillingNotes", input.internalBillingNotes);
  addOptionalString(data, "paymentIssues", input.paymentIssues);

  if (input.authorizedBillingModels?.length) {
    data.authorizedBillingModels = input.authorizedBillingModels;
  }

  return {
    clientObjectId: input.clientObjectId,
    clientUserId: input.clientUserId,
    data: data as Prisma.InputJsonObject,
    health: getCustomerBillingProfileHealth(input.consentStatus),
    name: `Billing Profile - ${input.clientName}`,
    nextAction: getCustomerBillingProfileNextAction(input.consentStatus),
    objectType: customerBillingProfileObjectType,
    status: getCustomerBillingProfileStatus(input.consentStatus)
  };
}

export function validateServiceActivationInput(
  input: unknown
): ServiceActivationInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Service activation input must be an object.");
  }

  const value = input as Record<string, unknown>;
  const billingModel = requiredString(value.billingModel, "billingModel");
  const status = requiredString(value.status, "status");
  const consentStatus = optionalString(value.consentStatus);

  if (!billingModelSet.has(billingModel)) {
    throw new Error("billingModel must match an approved service billing model.");
  }

  if (!serviceActivationStatusSet.has(status)) {
    throw new Error("status must match an approved service activation status.");
  }

  if (consentStatus && !consentStatusSet.has(consentStatus)) {
    throw new Error("consentStatus must match an approved billing consent status.");
  }

  return {
    amountLabel: optionalString(value.amountLabel),
    billingModel: billingModel as ServiceBillingModel,
    clientName: optionalString(value.clientName),
    clientObjectId: optionalString(value.clientObjectId),
    clientUserId: optionalString(value.clientUserId),
    consentStatus: consentStatus as CustomerBillingConsentStatus | undefined,
    relatedWorkObjectId: optionalString(value.relatedWorkObjectId),
    serviceName: requiredString(value.serviceName, "serviceName"),
    startedAt: optionalIsoDate(value.startedAt, "startedAt"),
    status: status as ServiceActivationStatus,
    termsVersion: optionalString(value.termsVersion),
    triggerDescription: optionalString(value.triggerDescription)
  };
}

export function buildServiceActivationObject(
  input: ServiceActivationInput
): PortalBillingRosObjectInput {
  const data: Record<string, Prisma.InputJsonValue> = {
    billingModel: input.billingModel,
    serviceName: input.serviceName
  };

  addOptionalString(data, "amountLabel", input.amountLabel);
  addOptionalString(data, "clientName", input.clientName);
  addOptionalString(data, "consentStatus", input.consentStatus);
  addOptionalString(data, "relatedWorkObjectId", input.relatedWorkObjectId);
  addOptionalString(data, "startedAt", input.startedAt);
  addOptionalString(data, "termsVersion", input.termsVersion);
  addOptionalString(data, "triggerDescription", input.triggerDescription);

  return {
    clientObjectId: input.clientObjectId,
    clientUserId: input.clientUserId,
    data: data as Prisma.InputJsonObject,
    health: getServiceActivationHealth(input.status),
    name: `Service Activation - ${input.serviceName}`,
    nextAction: getServiceActivationNextAction(input),
    objectType: serviceActivationObjectType,
    status: input.status
  };
}

export function getCustomerBillingProfileStatus(
  consentStatus: CustomerBillingConsentStatus
): string {
  switch (consentStatus) {
    case "Authorized":
      return "Consent Recorded";
    case "Revoked":
      return "Consent Revoked";
    case "Pending":
      return "Consent Pending";
    case "Not Recorded":
    default:
      return "Consent Needed";
  }
}

export function getCustomerBillingProfileHealth(
  consentStatus: CustomerBillingConsentStatus
): string {
  switch (consentStatus) {
    case "Authorized":
      return "Healthy";
    case "Revoked":
      return "Critical";
    case "Pending":
    case "Not Recorded":
    default:
      return "Attention";
  }
}

export function getCustomerBillingProfileNextAction(
  consentStatus: CustomerBillingConsentStatus
): string {
  switch (consentStatus) {
    case "Authorized":
      return "Continue to processor-hosted payment setup when required by the service billing model.";
    case "Revoked":
      return "Do not process new charges until updated billing consent is recorded.";
    case "Pending":
      return "Complete pending billing consent before processor setup or charging.";
    case "Not Recorded":
    default:
      return "Record billing consent before processor setup or charging.";
  }
}

export function getServiceActivationHealth(
  status: ServiceActivationStatus
): string {
  switch (status) {
    case "Active":
    case "Completed":
      return "Healthy";
    case "Cancelled":
      return "Neutral";
    case "Pending":
    case "Paused":
    default:
      return "Attention";
  }
}

export function getServiceActivationNextAction(
  input: Pick<ServiceActivationInput, "billingModel" | "status">
): string {
  if (input.status === "Completed") {
    return "Confirm final billing state and retain the service billing audit history.";
  }

  if (input.status === "Cancelled") {
    return "Keep the cancellation and billing outcome available for audit history.";
  }

  if (input.status === "Paused") {
    return "Resolve the service or billing blocker before resuming work.";
  }

  switch (input.billingModel) {
    case "prepaid":
      return "Confirm consent and prepaid invoice readiness before billable work begins.";
    case "pay_at_close":
      return "Track the successful closing trigger before charging the approved fee.";
    case "monthly":
      return "Confirm recurring billing terms and consent before recurring charges.";
    case "per_request":
      return "Bill only after the approved request reaches its billing trigger.";
    case "custom":
    default:
      return "Follow the approved custom billing terms and authorization requirements.";
  }
}

function validateBillingModels(value: unknown): ServiceBillingModel[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error("authorizedBillingModels must be an array.");
  }

  const models = value.map((item) => requiredString(item, "authorizedBillingModels"));

  if (models.some((model) => !billingModelSet.has(model))) {
    throw new Error(
      "authorizedBillingModels contains an unsupported service billing model."
    );
  }

  return [...new Set(models)] as ServiceBillingModel[];
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalIsoDate(value: unknown, fieldName: string): string | undefined {
  const text = optionalString(value);

  if (!text) {
    return undefined;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date.toISOString();
}

function addOptionalString(
  data: Record<string, Prisma.InputJsonValue>,
  key: string,
  value: string | undefined
) {
  if (value) {
    data[key] = value;
  }
}

function rejectSensitivePaymentData(value: string | undefined) {
  if (!value) {
    return;
  }

  if (
    /\b(card number|credit card|debit card|cvv|cvc|security code|routing number|account number|bank password|bank login|payment password|stripe secret|api key|secret key)\b/i.test(
      value
    ) ||
    /(?:\d[ -]?){13,19}/.test(value)
  ) {
    throw new Error(
      "Billing profile notes must not contain raw payment credentials or sensitive account data."
    );
  }
}
