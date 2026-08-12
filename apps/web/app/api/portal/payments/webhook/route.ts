import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { buildBillingSetupStatusNextAction, getBillingSetupHealth } from "../../../../../lib/billing-setup-requests";
import { prisma } from "../../../../../lib/db";
import { mergeProcessorPaymentMethodProfileData } from "../../../../../lib/portal-billing-processor-references";
import { getPaymentRecordStatus } from "../../../../../lib/portal-billing-invoices";
import {
  StripeWebhookValidationError,
  summarizeStripePortalEvent,
  verifyStripeWebhookPayload
} from "../../../../../lib/stripe-webhooks";

export const dynamic = "force-dynamic";

const stripeProvider = "stripe";
const customerBillingProfileObjectType = "CustomerBillingProfile";

export async function POST(request: Request) {
  const webhookSecret = process.env.KOINONIA_PAYMENT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured." }, { status: 503 });
  }

  const payload = await request.text();

  try {
    verifyStripeWebhookPayload(payload, request.headers.get("stripe-signature"), webhookSecret);
  } catch (error) {
    if (error instanceof StripeWebhookValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }

  const event = JSON.parse(payload);
  const summary = summarizeStripePortalEvent(event);
  const workspaceId =
    summary.workspaceId || process.env.ROS_DEFAULT_WORKSPACE_ID || "wks_koinonia";
  const existingEvent = await prisma.auditEvent.findFirst({
    where: {
      action: "portal.payment.stripe_event.processed",
      subjectId: event.id,
      subjectType: "StripeEvent",
      workspaceId
    }
  });

  if (existingEvent) {
    return NextResponse.json({ duplicate: true, received: true });
  }

  if (summary.action === "billing_setup_ready" && summary.billingSetupRequestId) {
    await markBillingSetupReady({
      customerReference: summary.customerReference,
      eventId: event.id,
      paymentMethodBrand: summary.paymentMethodBrand,
      paymentMethodExpirationMonth: summary.paymentMethodExpirationMonth,
      paymentMethodExpirationYear: summary.paymentMethodExpirationYear,
      paymentMethodLast4: summary.paymentMethodLast4,
      paymentMethodReference: summary.paymentMethodReference,
      paymentMethodSummary: summary.paymentMethodSummary,
      processorReference: summary.processorReference,
      requestId: summary.billingSetupRequestId,
      workspaceId
    });
  } else if (
    summary.action === "invoice_paid" ||
    summary.action === "invoice_payment_failed" ||
    summary.action === "invoice_refunded"
  ) {
    await updateInvoicePaymentStatus({
      eventId: event.id,
      invoiceId: summary.invoiceId,
      paymentMethodSummary: summary.paymentMethodSummary,
      processorReference: summary.processorReference,
      status:
        summary.action === "invoice_paid"
          ? "Paid"
          : summary.action === "invoice_refunded"
            ? "Refunded"
            : "Payment Failed",
      workspaceId
    });
  } else {
    await recordStripeEvent({
      action: "portal.payment.stripe_event.received",
      eventId: event.id,
      eventType: summary.eventType,
      metadata: {
        hasBillingSetupRequestId: Boolean(summary.billingSetupRequestId),
        hasInvoiceId: Boolean(summary.invoiceId)
      },
      summary: `Stripe event received: ${summary.eventType}`,
      workspaceId
    });
  }

  return NextResponse.json({ received: true });
}

async function markBillingSetupReady(input: {
  customerReference?: string;
  eventId: string;
  paymentMethodBrand?: string;
  paymentMethodExpirationMonth?: number;
  paymentMethodExpirationYear?: number;
  paymentMethodLast4?: string;
  paymentMethodReference?: string;
  paymentMethodSummary?: string;
  processorReference?: string;
  requestId: string;
  workspaceId: string;
}) {
  const billingSetupRequest = await prisma.rosObject.findFirst({
    where: {
      archivedAt: null,
      id: input.requestId,
      objectType: "BillingSetupRequest",
      workspaceId: input.workspaceId
    }
  });

  if (!billingSetupRequest) {
    await recordStripeEvent({
      action: "portal.payment.stripe_event.unmatched",
      eventId: input.eventId,
      eventType: "billing_setup_ready",
      metadata: { requestId: input.requestId },
      summary: "Stripe billing setup event did not match a portal billing setup request.",
      workspaceId: input.workspaceId
    });
    return;
  }

  const nextData =
    billingSetupRequest.data && typeof billingSetupRequest.data === "object" && !Array.isArray(billingSetupRequest.data)
      ? { ...(billingSetupRequest.data as Record<string, unknown>) }
      : {};
  const customerBillingProfileId = readOptionalString(
    nextData.customerBillingProfileId
  );
  const verifiedAt = new Date().toISOString();

  nextData.paymentMethodSummary = input.paymentMethodSummary ?? nextData.paymentMethodSummary;
  nextData.processorReference = input.processorReference ?? nextData.processorReference;
  nextData.processorCustomerReference =
    input.customerReference ?? nextData.processorCustomerReference;
  nextData.processorPaymentMethodReference =
    input.paymentMethodReference ?? nextData.processorPaymentMethodReference;
  nextData.processor = stripeProvider;
  nextData.processorVerifiedAt = verifiedAt;
  nextData.processorWebhookEventId = input.eventId;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.rosObject.update({
      where: { id: billingSetupRequest.id },
      data: {
        data: nextData as Prisma.InputJsonObject,
        health: getBillingSetupHealth("Payment Method Ready"),
        nextAction: buildBillingSetupStatusNextAction("Payment Method Ready"),
        status: "Payment Method Ready"
      }
    });

    let customerBillingProfileUpdated = false;

    if (customerBillingProfileId && input.paymentMethodReference) {
      const customerBillingProfile = await tx.rosObject.findFirst({
        where: {
          archivedAt: null,
          id: customerBillingProfileId,
          objectType: customerBillingProfileObjectType,
          workspaceId: input.workspaceId
        }
      });

      if (customerBillingProfile) {
        const profileData = mergeProcessorPaymentMethodProfileData(
          customerBillingProfile.data,
          {
            brand: input.paymentMethodBrand,
            customerReference: input.customerReference,
            expirationMonth: input.paymentMethodExpirationMonth,
            expirationYear: input.paymentMethodExpirationYear,
            last4: input.paymentMethodLast4,
            paymentMethodReference: input.paymentMethodReference,
            provider: stripeProvider,
            status: "Ready",
            verifiedAt
          }
        );

        await tx.rosObject.update({
          where: { id: customerBillingProfile.id },
          data: { data: profileData }
        });

        await tx.timelineEvent.create({
          data: {
            workspaceId: input.workspaceId,
            objectId: customerBillingProfile.id,
            eventType: "billing_profile.payment_method.verified",
            summary: `Stripe confirmed a payment method for ${customerBillingProfile.name}.`,
            newValue: {
              hasCustomerReference: Boolean(input.customerReference),
              hasPaymentMethodReference: true,
              paymentMethodBrand: input.paymentMethodBrand ?? null,
              paymentMethodLast4: input.paymentMethodLast4 ?? null,
              provider: stripeProvider,
              status: "Ready"
            }
          }
        });

        customerBillingProfileUpdated = true;
      }
    }

    await tx.timelineEvent.create({
      data: {
        workspaceId: input.workspaceId,
        objectId: billingSetupRequest.id,
        eventType: "billing_setup.processor.verified",
        summary: `Stripe confirmed payment setup for ${billingSetupRequest.name}.`,
        previousValue: {
          status: billingSetupRequest.status
        },
        newValue: {
          customerBillingProfileUpdated,
          hasCustomerReference: Boolean(input.customerReference),
          hasPaymentMethodReference: Boolean(input.paymentMethodReference),
          hasPaymentMethodSummary: Boolean(input.paymentMethodSummary),
          hasProcessorReference: Boolean(input.processorReference),
          processor: stripeProvider,
          status: updated.status
        }
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        action: "portal.payment.stripe_event.processed",
        actorEmail: "stripe",
        subjectType: "StripeEvent",
        subjectId: input.eventId,
        summary: `Stripe payment setup event processed for ${billingSetupRequest.name}.`,
        metadata: {
          billingSetupRequestId: billingSetupRequest.id,
          customerBillingProfileId: customerBillingProfileId ?? null,
          customerBillingProfileUpdated,
          hasCustomerReference: Boolean(input.customerReference),
          hasPaymentMethodReference: Boolean(input.paymentMethodReference),
          hasPaymentMethodSummary: Boolean(input.paymentMethodSummary),
          hasProcessorReference: Boolean(input.processorReference),
          provider: stripeProvider,
          status: updated.status
        }
      }
    });
  });
}

async function updateInvoicePaymentStatus(input: {
  eventId: string;
  invoiceId?: string;
  paymentMethodSummary?: string;
  processorReference?: string;
  status: "Paid" | "Payment Failed" | "Refunded";
  workspaceId: string;
}) {
  if (!input.invoiceId) {
    return;
  }

  const existing = await prisma.invoice.findFirst({
    where: {
      id: input.invoiceId,
      workspaceId: input.workspaceId
    }
  });

  if (!existing) {
    await recordStripeEvent({
      action: "portal.payment.stripe_event.unmatched",
      eventId: input.eventId,
      eventType: input.status,
      metadata: { invoiceId: input.invoiceId },
      summary: "Stripe payment event did not match a portal invoice.",
      workspaceId: input.workspaceId
    });
    return;
  }

  const paidAt = input.status === "Paid" ? existing.paidAt ?? new Date() : existing.paidAt;
  const paymentRecordStatus = getPaymentRecordStatus(input.status);

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.update({
      where: { id: existing.id },
      data: {
        paidAt,
        status: input.status
      }
    });

    if (paymentRecordStatus) {
      await tx.payment.create({
        data: {
          workspaceId: input.workspaceId,
          invoiceId: invoice.id,
          amount: invoice.amount,
          status: paymentRecordStatus,
          receivedAt: input.status === "Paid" ? invoice.paidAt : undefined
        }
      });
    }

    await tx.timelineEvent.create({
      data: {
        workspaceId: input.workspaceId,
        objectId: invoice.relatedObjectId ?? invoice.clientObjectId,
        eventType: input.status === "Paid" ? "invoice.paid" : "invoice.status.updated",
        summary: `Stripe updated invoice payment status to ${input.status}.`,
        previousValue: {
          paidAt: existing.paidAt?.toISOString() ?? null,
          status: existing.status
        },
        newValue: {
          hasPaymentMethodSummary: Boolean(input.paymentMethodSummary),
          hasProcessorPaymentReference: Boolean(input.processorReference),
          paidAt: invoice.paidAt?.toISOString() ?? null,
          processor: stripeProvider,
          status: invoice.status
        }
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        action: "portal.payment.stripe_event.processed",
        actorEmail: "stripe",
        subjectType: "StripeEvent",
        subjectId: input.eventId,
        summary: `Stripe payment event processed for invoice ${invoice.id}.`,
        metadata: {
          hasPaymentMethodSummary: Boolean(input.paymentMethodSummary),
          hasProcessorPaymentReference: Boolean(input.processorReference),
          invoiceId: invoice.id,
          paymentRecordStatus,
          provider: stripeProvider,
          status: invoice.status
        }
      }
    });
  });
}

async function recordStripeEvent(input: {
  action: string;
  eventId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  summary: string;
  workspaceId: string;
}) {
  await prisma.auditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      action: input.action,
      actorEmail: "stripe",
      subjectType: "StripeEvent",
      subjectId: input.eventId,
      summary: input.summary,
      metadata: {
        eventType: input.eventType,
        provider: stripeProvider,
        ...input.metadata
      }
    }
  });
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
