import { createHmac, timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";

export const stripeWebhookToleranceSeconds = 300;

export type StripePortalEventAction =
  | "billing_setup_ready"
  | "invoice_paid"
  | "invoice_payment_failed"
  | "invoice_refunded"
  | "record_only";

export type StripePortalEventSummary = {
  action: StripePortalEventAction;
  billingSetupRequestId?: string;
  customerReference?: string;
  eventType: string;
  invoiceId?: string;
  paymentMethodBrand?: string;
  paymentMethodExpirationMonth?: number;
  paymentMethodExpirationYear?: number;
  paymentMethodLast4?: string;
  paymentMethodReference?: string;
  paymentMethodSummary?: string;
  processorReference?: string;
  workspaceId?: string;
};

export class StripeWebhookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeWebhookValidationError";
  }
}

export function verifyStripeWebhookPayload(
  payload: string,
  signatureHeader: string | null,
  webhookSecret: string,
  now = Math.floor(Date.now() / 1000)
): void {
  if (!signatureHeader) {
    throw new StripeWebhookValidationError("Stripe signature header is missing.");
  }

  if (!webhookSecret.trim()) {
    throw new StripeWebhookValidationError("Stripe webhook secret is missing.");
  }

  const signature = parseStripeSignatureHeader(signatureHeader);

  if (!signature.timestamp || signature.signatures.length === 0) {
    throw new StripeWebhookValidationError("Stripe signature header is malformed.");
  }

  if (Math.abs(now - signature.timestamp) > stripeWebhookToleranceSeconds) {
    throw new StripeWebhookValidationError("Stripe signature timestamp is outside the allowed tolerance.");
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(`${signature.timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expected = Buffer.from(expectedSignature, "hex");

  const hasValidSignature = signature.signatures.some((value) => {
    const received = Buffer.from(value, "hex");

    return received.length === expected.length && timingSafeEqual(received, expected);
  });

  if (!hasValidSignature) {
    throw new StripeWebhookValidationError("Stripe signature verification failed.");
  }
}

export function summarizeStripePortalEvent(event: Stripe.Event): StripePortalEventSummary {
  const object = event.data.object as StripePortalEventObject;
  const metadata = getStripeMetadata(object);
  const invoiceId = getMetadataValue(metadata, "koinoniaInvoiceId");
  const billingSetupRequestId = getMetadataValue(metadata, "koinoniaBillingSetupRequestId");
  const workspaceId = getMetadataValue(metadata, "koinoniaWorkspaceId");
  const processorReference = getProcessorReference(object);
  const customerReference = getStripeObjectReference(object.customer, "cus_");
  const paymentMethodReference = getStripeObjectReference(object.payment_method, "pm_");
  const paymentMethodCard = getPaymentMethodCard(object);
  const paymentMethodSummary = getPaymentMethodSummary(paymentMethodCard);
  const baseSummary = {
    billingSetupRequestId,
    customerReference,
    eventType: event.type,
    invoiceId,
    paymentMethodBrand: paymentMethodCard?.brand,
    paymentMethodExpirationMonth: paymentMethodCard?.exp_month,
    paymentMethodExpirationYear: paymentMethodCard?.exp_year,
    paymentMethodLast4: paymentMethodCard?.last4,
    paymentMethodReference,
    paymentMethodSummary,
    processorReference,
    workspaceId
  };

  switch (event.type) {
    case "checkout.session.completed":
      return {
        ...baseSummary,
        action: invoiceId ? "invoice_paid" : billingSetupRequestId ? "billing_setup_ready" : "record_only"
      };
    case "setup_intent.succeeded":
      return {
        ...baseSummary,
        action: billingSetupRequestId ? "billing_setup_ready" : "record_only"
      };
    case "payment_intent.succeeded":
      return {
        ...baseSummary,
        action: invoiceId ? "invoice_paid" : "record_only"
      };
    case "payment_intent.payment_failed":
      return {
        ...baseSummary,
        action: invoiceId ? "invoice_payment_failed" : "record_only"
      };
    case "charge.refunded":
      return {
        ...baseSummary,
        action: invoiceId ? "invoice_refunded" : "record_only"
      };
    default:
      return {
        ...baseSummary,
        action: "record_only"
      };
  }
}

type StripePortalEventObject = Stripe.Event.Data.Object & {
  amount?: number | null;
  amount_received?: number | null;
  charges?: {
    data?: Stripe.Charge[];
  };
  customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  latest_charge?: string | Stripe.Charge | null;
  metadata?: Stripe.Metadata | null;
  id?: string;
  mode?: string | null;
  payment_intent?: string | Stripe.PaymentIntent | null;
  payment_method?: string | Stripe.PaymentMethod | null;
  payment_method_details?: Stripe.Charge.PaymentMethodDetails | null;
  setup_intent?: string | Stripe.SetupIntent | null;
};

type SafeCardSummary = {
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  last4?: string;
};

function parseStripeSignatureHeader(value: string): { signatures: string[]; timestamp: number | null } {
  const parts = value.split(",");
  const signatures: string[] = [];
  let timestamp: number | null = null;

  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    const parsedValue = rest.join("=");

    if (key === "t") {
      const parsedTimestamp = Number(parsedValue);
      timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : null;
    }

    if (key === "v1" && /^[a-f0-9]+$/i.test(parsedValue)) {
      signatures.push(parsedValue);
    }
  }

  return { signatures, timestamp };
}

function getStripeMetadata(object: StripePortalEventObject): Stripe.Metadata | null {
  return object.metadata ?? null;
}

function getMetadataValue(metadata: Stripe.Metadata | null, key: string): string | undefined {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getProcessorReference(object: StripePortalEventObject): string | undefined {
  const references = [
    typeof object.id === "string" ? object.id : undefined,
    typeof object.payment_intent === "string" ? object.payment_intent : undefined,
    typeof object.setup_intent === "string" ? object.setup_intent : undefined,
    typeof object.latest_charge === "string" ? object.latest_charge : undefined,
    typeof object.payment_method === "string" ? object.payment_method : undefined
  ];

  return references.find((value): value is string => Boolean(value));
}

function getStripeObjectReference(
  value: string | { id?: string } | null | undefined,
  prefix: "cus_" | "pm_"
): string | undefined {
  const reference =
    typeof value === "string"
      ? value
      : value && typeof value.id === "string"
        ? value.id
        : undefined;

  return reference?.startsWith(prefix) ? reference : undefined;
}

function getPaymentMethodCard(object: StripePortalEventObject): SafeCardSummary | undefined {
  const expandedPaymentMethod =
    object.payment_method && typeof object.payment_method === "object"
      ? object.payment_method
      : undefined;
  const expandedCard = expandedPaymentMethod?.card;

  if (expandedCard?.last4) {
    return {
      brand: expandedCard.brand ?? undefined,
      exp_month: expandedCard.exp_month ?? undefined,
      exp_year: expandedCard.exp_year ?? undefined,
      last4: expandedCard.last4
    };
  }

  const chargeCard = object.payment_method_details?.card;

  if (!chargeCard?.last4) {
    return undefined;
  }

  return {
    brand: chargeCard.brand ?? undefined,
    exp_month: chargeCard.exp_month ?? undefined,
    exp_year: chargeCard.exp_year ?? undefined,
    last4: chargeCard.last4
  };
}

function getPaymentMethodSummary(card: SafeCardSummary | undefined): string | undefined {
  if (!card?.last4) {
    return undefined;
  }

  const brand = card.brand ? `${capitalize(card.brand)} ` : "";
  const expiration = card.exp_month && card.exp_year ? `, expires ${card.exp_month}/${card.exp_year}` : "";

  return `${brand}ending ${card.last4}${expiration}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
