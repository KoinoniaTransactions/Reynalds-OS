import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  isKoinoniaStripeEnabled,
  koinoniaStripeDisabledMessage
} from "../../../../../../lib/stripe-runtime";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { billingSetupRequestObjectType } from "../../../../../../lib/billing-setup-requests";
import { prisma } from "../../../../../../lib/db";
import { mergeProcessorPaymentMethodProfileData } from "../../../../../../lib/portal-billing-processor-references";
import {
  assertBillingSetupProcessorReady,
  buildStripeCustomerCreateParams,
  buildStripeSetupCheckoutSessionParams,
  canCreateProcessorSessionForRequest,
  getBillingProfileContact,
  getStoredStripeCustomerReference,
  getStripeSetupReturnBaseUrl,
  StripeSetupSessionValidationError
} from "../../../../../../lib/stripe-setup-sessions";

export const dynamic = "force-dynamic";

const customerBillingProfileObjectType = "CustomerBillingProfile";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isKoinoniaStripeEnabled()) {
    return NextResponse.json(
      { error: koinoniaStripeDisabledMessage },
      { status: 503 }
    );
  }

  try {
    const actor = await assertAnyPermission([
      "client-portal:billing:setup",
      "billing-workspace:payment-methods:request"
    ]);
    const { id } = await params;
    const billingSetupRequest = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id,
        objectType: billingSetupRequestObjectType,
        workspaceId: actor.workspaceId
      }
    });

    if (!billingSetupRequest) {
      return NextResponse.json({ error: "Billing setup request not found." }, { status: 404 });
    }

    if (
      !canCreateProcessorSessionForRequest({
        actorId: actor.id,
        actorRole: actor.role,
        clientUserId: billingSetupRequest.clientUserId,
        ownerId: billingSetupRequest.ownerId
      })
    ) {
      return NextResponse.json({ error: "Billing setup request not found." }, { status: 404 });
    }

    const context = assertBillingSetupProcessorReady(billingSetupRequest.data);
    const customerBillingProfile = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id: context.customerBillingProfileId,
        objectType: customerBillingProfileObjectType,
        workspaceId: actor.workspaceId
      }
    });

    if (!customerBillingProfile) {
      return NextResponse.json({ error: "Customer billing profile not found." }, { status: 404 });
    }

    const secretKey = process.env.KOINONIA_STRIPE_SECRET_KEY?.trim();

    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe secure setup is not configured." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(secretKey);
    let customerReference = getStoredStripeCustomerReference(customerBillingProfile.data);

    if (!customerReference) {
      const contact = getBillingProfileContact(customerBillingProfile.data);
      const customer = await stripe.customers.create(
        buildStripeCustomerCreateParams({
          email: contact.email,
          name: contact.name,
          workspaceId: actor.workspaceId
        })
      );
      customerReference = customer.id;

      const nextProfileData = mergeProcessorPaymentMethodProfileData(
        customerBillingProfile.data,
        {
          customerReference,
          provider: "stripe",
          status: "Pending"
        }
      );

      await prisma.rosObject.update({
        where: { id: customerBillingProfile.id },
        data: { data: nextProfileData }
      });
    }

    const returnBaseUrl = getStripeSetupReturnBaseUrl({
      configuredSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV,
      requestUrl: request.url
    });
    const checkoutSession = await stripe.checkout.sessions.create(
      buildStripeSetupCheckoutSessionParams({
        billingSetupRequestId: billingSetupRequest.id,
        customerReference,
        returnBaseUrl,
        workspaceId: actor.workspaceId
      })
    );

    if (!checkoutSession.url) {
      throw new StripeSetupSessionValidationError(
        "Stripe did not return a hosted payment setup URL."
      );
    }

    await prisma.$transaction(async (tx) => {
      const nextData = toRecord(billingSetupRequest.data);
      nextData.processor = "stripe";
      nextData.processorCustomerReference = customerReference;
      nextData.processorCheckoutSessionReference = checkoutSession.id;
      nextData.processorSetupRequestedAt = new Date().toISOString();
      nextData.processorSetupRequestedByUserId = actor.id;

      await tx.rosObject.update({
        where: { id: billingSetupRequest.id },
        data: {
          data: nextData as Prisma.InputJsonObject,
          status: "Processor Link Needed"
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: billingSetupRequest.id,
          actorId: actor.id,
          eventType: "billing_setup.processor_session.created",
          summary: `Secure Stripe payment setup created for ${billingSetupRequest.name}.`,
          newValue: {
            hasCustomerReference: true,
            hasHostedSetupUrl: true,
            provider: "stripe",
            status: "Processor Link Needed"
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.billing_setup.processor_session.created",
          subjectType: "RosObject",
          subjectId: billingSetupRequest.id,
          summary: `Secure Stripe payment setup created for ${billingSetupRequest.name}.`,
          metadata: {
            customerBillingProfileId: customerBillingProfile.id,
            hasCustomerReference: true,
            hasHostedSetupUrl: true,
            provider: "stripe"
          }
        }
      });
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    if (error instanceof StripeSetupSessionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: "Billing setup storage is temporarily unavailable." },
        { status: 503 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: "Stripe secure setup is temporarily unavailable." },
        { status: 502 }
      );
    }

    throw error;
  }
}

async function assertAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  let permissionDeniedError: PermissionDeniedError | null = null;

  for (const permission of permissions) {
    try {
      return await assertPermission(permission);
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        permissionDeniedError = error;
        continue;
      }

      throw error;
    }
  }

  throw permissionDeniedError ?? new PermissionDeniedError(permissions[0]);
}

function toRecord(value: unknown): Record<string, Prisma.InputJsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? ({ ...value } as Record<string, Prisma.InputJsonValue>)
    : {};
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
