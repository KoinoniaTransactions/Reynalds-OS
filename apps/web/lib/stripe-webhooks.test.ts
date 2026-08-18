import { createHmac } from "node:crypto";
import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import {
  summarizeStripePortalEvent,
  verifyStripeWebhookPayload,
  StripeWebhookValidationError
} from "./stripe-webhooks";

describe("stripe webhook helpers", () => {
  it("accepts a valid Stripe signature", () => {
    const payload = JSON.stringify({ id: "evt_123", type: "payment_intent.succeeded" });
    const secret = "whsec_test_secret";
    const timestamp = 1_800_000_000;
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");

    expect(() =>
      verifyStripeWebhookPayload(payload, `t=${timestamp},v1=${signature}`, secret, timestamp)
    ).not.toThrow();
  });

  it("rejects an invalid Stripe signature", () => {
    expect(() =>
      verifyStripeWebhookPayload("{}", "t=1800000000,v1=badbad", "whsec_test_secret", 1_800_000_000)
    ).toThrow(StripeWebhookValidationError);
  });

  it("maps paid invoice events from Koinonia metadata", () => {
    const event = {
      data: {
        object: {
          id: "pi_123",
          metadata: {
            koinoniaInvoiceId: "inv_123",
            koinoniaWorkspaceId: "wks_koinonia"
          }
        }
      },
      type: "payment_intent.succeeded"
    } as unknown as Stripe.Event;

    expect(summarizeStripePortalEvent(event)).toMatchObject({
      action: "invoice_paid",
      invoiceId: "inv_123",
      processorReference: "pi_123",
      workspaceId: "wks_koinonia"
    });
  });

  it("does not mark setup ready from checkout completion alone", () => {
    const event = {
      data: {
        object: {
          id: "cs_123",
          metadata: {
            koinoniaBillingSetupRequestId: "obj_123",
            koinoniaWorkspaceId: "wks_koinonia"
          },
          setup_intent: "seti_123"
        }
      },
      type: "checkout.session.completed"
    } as unknown as Stripe.Event;

    expect(summarizeStripePortalEvent(event)).toMatchObject({
      action: "record_only",
      billingSetupRequestId: "obj_123",
      workspaceId: "wks_koinonia"
    });
  });

  it("maps safe processor references and card display data from setup events", () => {
    const event = {
      data: {
        object: {
          customer: "cus_123ABC",
          id: "seti_123",
          metadata: {
            koinoniaBillingSetupRequestId: "obj_123",
            koinoniaWorkspaceId: "wks_koinonia"
          },
          payment_method: {
            id: "pm_123ABC",
            type: "card",
            card: {
              brand: "visa",
              exp_month: 12,
              exp_year: 2030,
              last4: "4242"
            }
          }
        }
      },
      type: "setup_intent.succeeded"
    } as unknown as Stripe.Event;

    expect(summarizeStripePortalEvent(event)).toMatchObject({
      action: "billing_setup_ready",
      billingSetupRequestId: "obj_123",
      customerReference: "cus_123ABC",
      paymentMethodBrand: "visa",
      paymentMethodExpirationMonth: 12,
      paymentMethodExpirationYear: 2030,
      paymentMethodLast4: "4242",
      paymentMethodReference: "pm_123ABC",
      paymentMethodSummary: "Visa ending 4242, expires 12/2030",
      processorReference: "seti_123",
      workspaceId: "wks_koinonia"
    });
  });

  it("maps string payment-method references without inventing card display data", () => {
    const event = {
      data: {
        object: {
          customer: "cus_456DEF",
          id: "seti_456",
          metadata: {
            koinoniaBillingSetupRequestId: "obj_456"
          },
          payment_method: "pm_456DEF"
        }
      },
      type: "setup_intent.succeeded"
    } as unknown as Stripe.Event;

    expect(summarizeStripePortalEvent(event)).toMatchObject({
      action: "billing_setup_ready",
      billingSetupRequestId: "obj_456",
      customerReference: "cus_456DEF",
      paymentMethodReference: "pm_456DEF",
      processorReference: "seti_456"
    });
    expect(summarizeStripePortalEvent(event).paymentMethodSummary).toBeUndefined();
  });
});
