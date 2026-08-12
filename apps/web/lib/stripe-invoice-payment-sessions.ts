import type Stripe from "stripe";
import { getHumanPortalInvoiceStatus } from "./portal-billing-invoices";

export type PrepaidInvoicePaymentSource = {
  amount: unknown;
  clientObjectId: string;
  id: string;
  packageObjectId?: string | null;
  paidAt?: Date | string | null;
  relatedObjectId?: string | null;
  status: string;
};

export type StripeInvoiceTransitionDecision =
  | "process"
  | "redundant"
  | "stale";

export class StripeInvoicePaymentSessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "StripeInvoicePaymentSessionValidationError";
  }
}

export function canCreatePrepaidInvoicePaymentSession(
  invoice: PrepaidInvoicePaymentSource
): boolean {
  try {
    assertPrepaidInvoicePaymentEligible(invoice);
    return true;
  } catch {
    return false;
  }
}

export function assertPrepaidInvoicePaymentEligible(
  invoice: PrepaidInvoicePaymentSource
): {
  unitAmount: number;
} {
  const status = getHumanPortalInvoiceStatus(
    invoice.status
  );

  if (status !== "Due Before Work Begins") {
    throw new StripeInvoicePaymentSessionValidationError(
      "Only prepaid invoices due before work begins can be paid through this client payment flow."
    );
  }

  if (invoice.paidAt) {
    throw new StripeInvoicePaymentSessionValidationError(
      "This invoice already has a payment date."
    );
  }

  const unitAmount = getInvoiceAmountInCents(
    invoice.amount
  );

  if (unitAmount <= 0) {
    throw new StripeInvoicePaymentSessionValidationError(
      "Invoice amount must be greater than zero."
    );
  }

  return { unitAmount };
}

export function isInvoiceAccessibleToActor(
  invoice: Pick<
    PrepaidInvoicePaymentSource,
    | "clientObjectId"
    | "packageObjectId"
    | "relatedObjectId"
  >,
  accessibleObjectIds: Iterable<string>
): boolean {
  const allowed = new Set(accessibleObjectIds);
  const invoiceObjectIds = [
    invoice.clientObjectId,
    invoice.relatedObjectId,
    invoice.packageObjectId
  ].filter((value): value is string => Boolean(value));

  return invoiceObjectIds.some((id) => allowed.has(id));
}

export function buildStripeInvoicePaymentMetadata(
  input: {
    invoiceId: string;
    workspaceId: string;
  }
): Stripe.Metadata {
  return {
    koinoniaInvoiceId: requiredSafeReference(
      input.invoiceId,
      "invoiceId"
    ),
    koinoniaWorkspaceId: requiredSafeReference(
      input.workspaceId,
      "workspaceId"
    )
  };
}

export function buildStripeInvoicePaymentCheckoutSessionParams(
  input: {
    amount: unknown;
    customerReference?: string;
    invoiceId: string;
    returnBaseUrl: string;
    serviceName?: string;
    workspaceId: string;
  }
): Stripe.Checkout.SessionCreateParams {
  const unitAmount = getInvoiceAmountInCents(
    input.amount
  );

  if (unitAmount <= 0) {
    throw new StripeInvoicePaymentSessionValidationError(
      "Invoice amount must be greater than zero."
    );
  }

  const metadata = buildStripeInvoicePaymentMetadata(
    input
  );
  const returnBaseUrl =
    normalizeReturnBaseUrl(input.returnBaseUrl);
  const serviceName =
    input.serviceName?.trim() ||
    "Koinonia prepaid service";

  const params: Stripe.Checkout.SessionCreateParams = {
    cancel_url:
      `${returnBaseUrl}/client/billing?invoice_payment=cancelled`,
    client_reference_id: input.invoiceId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: serviceName.slice(0, 120)
          },
          unit_amount: unitAmount
        },
        quantity: 1
      }
    ],
    metadata,
    mode: "payment",
    payment_intent_data: {
      metadata
    },
    payment_method_types: ["card"],
    success_url:
      `${returnBaseUrl}/client/billing?invoice_payment=success`
  };

  if (input.customerReference) {
    const customerReference =
      input.customerReference.trim();

    if (
      !/^cus_[A-Za-z0-9]+$/.test(
        customerReference
      )
    ) {
      throw new StripeInvoicePaymentSessionValidationError(
        "A valid Stripe customer reference is required when a saved customer is supplied."
      );
    }

    params.customer = customerReference;
  }

  return params;
}

export function getStripeInvoicePaymentReturnBaseUrl(
  input: {
    configuredSiteUrl?: string;
    nodeEnv?: string;
    requestUrl: string;
  }
): string {
  const requestOrigin = new URL(
    input.requestUrl
  ).origin;
  const requestHost = new URL(
    requestOrigin
  ).hostname;
  const isLocalRequest =
    requestHost === "localhost" ||
    requestHost === "127.0.0.1";

  if (
    input.nodeEnv !== "production" &&
    isLocalRequest
  ) {
    return requestOrigin;
  }

  if (input.configuredSiteUrl) {
    return normalizeReturnBaseUrl(
      input.configuredSiteUrl
    );
  }

  return normalizeReturnBaseUrl(requestOrigin);
}

export function getStripeInvoiceTransitionDecision(
  currentStatus: string,
  nextStatus:
    | "Paid"
    | "Payment Failed"
    | "Refunded"
): StripeInvoiceTransitionDecision {
  if (currentStatus === nextStatus) {
    return "redundant";
  }

  if (
    currentStatus === "Refunded" &&
    nextStatus !== "Refunded"
  ) {
    return "stale";
  }

  if (
    currentStatus === "Paid" &&
    nextStatus === "Payment Failed"
  ) {
    return "stale";
  }

  return "process";
}

function getInvoiceAmountInCents(
  amount: unknown
): number {
  const text = stringifyAmount(amount);

  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new StripeInvoicePaymentSessionValidationError(
      "Invoice amount must be a valid USD amount with no more than two decimal places."
    );
  }

  const [whole, fractional = ""] =
    text.split(".");
  const cents =
    Number(whole) * 100 +
    Number(fractional.padEnd(2, "0"));

  if (!Number.isSafeInteger(cents)) {
    throw new StripeInvoicePaymentSessionValidationError(
      "Invoice amount is outside the supported payment range."
    );
  }

  return cents;
}

function stringifyAmount(
  amount: unknown
): string {
  if (typeof amount === "number") {
    return String(amount);
  }

  if (typeof amount === "string") {
    return amount.trim();
  }

  if (
    amount &&
    typeof amount === "object" &&
    "toString" in amount &&
    typeof amount.toString === "function"
  ) {
    return amount.toString().trim();
  }

  return "";
}

function normalizeReturnBaseUrl(
  value: string
): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new StripeInvoicePaymentSessionValidationError(
      "Secure invoice payment requires a valid return URL."
    );
  }

  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1";

  if (
    url.protocol !== "https:" &&
    !(url.protocol === "http:" && isLocal)
  ) {
    throw new StripeInvoicePaymentSessionValidationError(
      "Secure invoice payment return URLs must use HTTPS outside local development."
    );
  }

  return url.origin;
}

function requiredSafeReference(
  value: string,
  fieldName: string
): string {
  const normalized = value.trim();

  if (
    !normalized ||
    !/^[A-Za-z0-9_:-]+$/.test(normalized)
  ) {
    throw new StripeInvoicePaymentSessionValidationError(
      `${fieldName} must be a safe processor metadata reference.`
    );
  }

  return normalized;
}
