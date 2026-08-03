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
  eventType: string;
  invoiceId?: string;
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
  const paymentMethodSummary = getPaymentMethodSummary(object);
  const baseSummary = {
    billingSetupRequestId,
    eventType: event.type,
    invoiceId,
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

function getPaymentMethodSummary(object: StripePortalEventObject): string | undefined {
  const card = object.payment_method_details?.card;

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
