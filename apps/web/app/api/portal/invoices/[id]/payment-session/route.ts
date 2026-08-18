import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  isKoinoniaStripeEnabled,
  koinoniaStripeDisabledMessage
} from "../../../../../../lib/stripe-runtime";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { getStoredStripeCustomerReference } from "../../../../../../lib/stripe-setup-sessions";
import {
  assertPrepaidInvoicePaymentEligible,
  buildStripeInvoicePaymentCheckoutSessionParams,
  getStripeInvoicePaymentReturnBaseUrl,
  isInvoiceAccessibleToActor,
  StripeInvoicePaymentSessionValidationError
} from "../../../../../../lib/stripe-invoice-payment-sessions";

export const dynamic = "force-dynamic";

const customerBillingProfileObjectType =
  "CustomerBillingProfile";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: Params
) {
  if (!isKoinoniaStripeEnabled()) {
    return NextResponse.json(
      { error: koinoniaStripeDisabledMessage },
      { status: 503 }
    );
  }

  try {
    const actor = await assertPermission(
      "client-portal:billing:pay"
    );
    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const accessibleObjects =
      await prisma.rosObject.findMany({
        where: {
          archivedAt: null,
          workspaceId: actor.workspaceId,
          OR: [
            { clientUserId: actor.id },
            { ownerId: actor.id }
          ]
        },
        select: {
          id: true,
          name: true
        }
      });

    if (
      !isInvoiceAccessibleToActor(
        invoice,
        accessibleObjects.map(
          (object) => object.id
        )
      )
    ) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    assertPrepaidInvoicePaymentEligible(invoice);

    const secretKey =
      process.env.KOINONIA_STRIPE_SECRET_KEY?.trim();

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "Stripe secure invoice payment is not configured."
        },
        { status: 503 }
      );
    }

    const customerBillingProfile =
      await prisma.rosObject.findFirst({
        where: {
          archivedAt: null,
          workspaceId: actor.workspaceId,
          objectType:
            customerBillingProfileObjectType,
          OR: [
            { clientUserId: actor.id },
            { ownerId: actor.id }
          ]
        },
        orderBy: {
          updatedAt: "desc"
        }
      });

    const customerReference =
      customerBillingProfile
        ? getStoredStripeCustomerReference(
            customerBillingProfile.data
          )
        : undefined;

    const objectNames = new Map(
      accessibleObjects.map((object) => [
        object.id,
        object.name
      ])
    );

    const serviceName =
      (invoice.relatedObjectId
        ? objectNames.get(
            invoice.relatedObjectId
          )
        : undefined) ??
      (invoice.packageObjectId
        ? objectNames.get(
            invoice.packageObjectId
          )
        : undefined) ??
      objectNames.get(invoice.clientObjectId) ??
      "Koinonia prepaid service";

    const returnBaseUrl =
      getStripeInvoicePaymentReturnBaseUrl({
        configuredSiteUrl:
          process.env.NEXT_PUBLIC_SITE_URL,
        nodeEnv: process.env.NODE_ENV,
        requestUrl: request.url
      });

    const stripe = new Stripe(secretKey);

    const checkoutSession =
      await stripe.checkout.sessions.create(
        buildStripeInvoicePaymentCheckoutSessionParams(
          {
            amount: invoice.amount,
            customerReference,
            invoiceId: invoice.id,
            returnBaseUrl,
            serviceName,
            workspaceId:
              actor.workspaceId
          }
        )
      );

    if (!checkoutSession.url) {
      return NextResponse.json(
        {
          error:
            "Stripe did not return a hosted invoice payment URL."
        },
        { status: 502 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.timelineEvent.create({
        data: {
          workspaceId:
            actor.workspaceId,
          objectId:
            invoice.relatedObjectId ??
            invoice.clientObjectId,
          actorId: actor.id,
          eventType:
            "invoice.processor_session.created",
          summary:
            "Secure Stripe prepaid invoice payment session created.",
          newValue: {
            hasCustomerReference:
              Boolean(customerReference),
            hasHostedPaymentUrl: true,
            invoiceId: invoice.id,
            provider: "stripe",
            status: invoice.status
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId:
            actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action:
            "portal.invoice.processor_session.created",
          subjectType: "Invoice",
          subjectId: invoice.id,
          summary:
            "Secure Stripe prepaid invoice payment session created.",
          metadata: {
            checkoutSessionReference:
              checkoutSession.id,
            hasCustomerReference:
              Boolean(customerReference),
            hasHostedPaymentUrl: true,
            provider: "stripe",
            status: invoice.status
          }
        }
      });
    });

    return NextResponse.json({
      url: checkoutSession.url
    });
  } catch (error) {
    const authResponse =
      getAuthErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    if (
      error instanceof
      StripeInvoicePaymentSessionValidationError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        {
          error:
            "Invoice storage is temporarily unavailable."
        },
        { status: 503 }
      );
    }

    if (
      error instanceof
      Stripe.errors.StripeError
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe secure invoice payment is temporarily unavailable."
        },
        { status: 502 }
      );
    }

    throw error;
  }
}

function isDatabaseUnavailableError(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    (error.name ===
      "PrismaClientInitializationError" ||
      error.message.includes(
        "Can't reach database server"
      ) ||
      error.message.includes("ECONNREFUSED"))
  );
}
