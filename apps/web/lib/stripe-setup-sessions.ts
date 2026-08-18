import type Stripe from "stripe";

export const stripeSetupProvider = "stripe" as const;

export type BillingSetupProcessorContext = {
  consentAcknowledged: boolean;
  customerBillingProfileId?: string;
  serviceName?: string;
};

export class StripeSetupSessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeSetupSessionValidationError";
  }
}

export function getBillingSetupProcessorContext(
  data: unknown
): BillingSetupProcessorContext {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { consentAcknowledged: false };
  }

  const value = data as Record<string, unknown>;

  return {
    consentAcknowledged: value.consentAcknowledged === true,
    customerBillingProfileId: optionalString(value.customerBillingProfileId),
    serviceName: optionalString(value.serviceName)
  };
}

export function assertBillingSetupProcessorReady(data: unknown): BillingSetupProcessorContext {
  const context = getBillingSetupProcessorContext(data);

  if (!context.consentAcknowledged) {
    throw new StripeSetupSessionValidationError(
      "Recorded billing consent is required before secure payment setup can begin."
    );
  }

  if (!context.customerBillingProfileId) {
    throw new StripeSetupSessionValidationError(
      "This billing setup request is not linked to a customer billing profile."
    );
  }

  return context;
}

export function canCreateProcessorSessionForRequest(input: {
  actorId: string;
  actorRole: string;
  clientUserId?: string | null;
  ownerId?: string | null;
}): boolean {
  if (input.actorRole !== "Client") {
    return true;
  }

  return input.clientUserId === input.actorId || input.ownerId === input.actorId;
}

export function getStoredStripeCustomerReference(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  const value = data as Record<string, unknown>;
  const processorPaymentMethod = value.processorPaymentMethod;

  if (
    !processorPaymentMethod ||
    typeof processorPaymentMethod !== "object" ||
    Array.isArray(processorPaymentMethod)
  ) {
    return undefined;
  }

  const customerReference = optionalString(
    (processorPaymentMethod as Record<string, unknown>).customerReference
  );

  return customerReference && /^cus_[A-Za-z0-9]+$/.test(customerReference)
    ? customerReference
    : undefined;
}

export function getBillingProfileContact(data: unknown): {
  email?: string;
  name?: string;
} {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const value = data as Record<string, unknown>;

  return {
    email: optionalString(value.billingContactEmail),
    name: optionalString(value.billingContactName) ?? optionalString(value.clientName)
  };
}

export function buildStripeSetupMetadata(input: {
  billingSetupRequestId: string;
  workspaceId: string;
}): Stripe.Metadata {
  const billingSetupRequestId = requiredSafeReference(
    input.billingSetupRequestId,
    "billingSetupRequestId"
  );
  const workspaceId = requiredSafeReference(input.workspaceId, "workspaceId");

  return {
    koinoniaBillingSetupRequestId: billingSetupRequestId,
    koinoniaWorkspaceId: workspaceId
  };
}

export function buildStripeSetupCheckoutSessionParams(input: {
  billingSetupRequestId: string;
  customerReference: string;
  returnBaseUrl: string;
  workspaceId: string;
}): Stripe.Checkout.SessionCreateParams {
  const customerReference = input.customerReference.trim();

  if (!/^cus_[A-Za-z0-9]+$/.test(customerReference)) {
    throw new StripeSetupSessionValidationError(
      "A valid Stripe customer reference is required for secure payment setup."
    );
  }

  const returnBaseUrl = normalizeReturnBaseUrl(input.returnBaseUrl);
  const metadata = buildStripeSetupMetadata(input);

  return {
    cancel_url: `${returnBaseUrl}/client/billing?payment_setup=cancelled`,
    client_reference_id: input.billingSetupRequestId,
    currency: "usd",
    customer: customerReference,
    metadata,
    mode: "setup",
    payment_method_types: ["card"],
    setup_intent_data: {
      metadata
    },
    success_url: `${returnBaseUrl}/client/billing?payment_setup=success`
  };
}

export function getStripeSetupReturnBaseUrl(input: {
  configuredSiteUrl?: string;
  nodeEnv?: string;
  requestUrl: string;
}): string {
  const requestOrigin = new URL(input.requestUrl).origin;
  const requestHost = new URL(requestOrigin).hostname;
  const isLocalRequest = requestHost === "localhost" || requestHost === "127.0.0.1";

  if (input.nodeEnv !== "production" && isLocalRequest) {
    return requestOrigin;
  }

  if (input.configuredSiteUrl) {
    return normalizeReturnBaseUrl(input.configuredSiteUrl);
  }

  return normalizeReturnBaseUrl(requestOrigin);
}

export function buildStripeCustomerCreateParams(input: {
  email?: string;
  name?: string;
  workspaceId: string;
}): Stripe.CustomerCreateParams {
  const workspaceId = requiredSafeReference(input.workspaceId, "workspaceId");
  const params: Stripe.CustomerCreateParams = {
    metadata: {
      koinoniaWorkspaceId: workspaceId
    }
  };

  if (input.email?.trim()) {
    params.email = input.email.trim();
  }

  if (input.name?.trim()) {
    params.name = input.name.trim();
  }

  return params;
}

function normalizeReturnBaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new StripeSetupSessionValidationError(
      "Secure payment setup requires a valid return URL."
    );
  }

  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
    throw new StripeSetupSessionValidationError(
      "Secure payment setup return URLs must use HTTPS outside local development."
    );
  }

  return url.origin;
}

function requiredSafeReference(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized || !/^[A-Za-z0-9_:-]+$/.test(normalized)) {
    throw new StripeSetupSessionValidationError(
      `${fieldName} must be a safe processor metadata reference.`
    );
  }

  return normalized;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
