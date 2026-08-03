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

  it("maps setup events from Koinonia metadata", () => {
    const event = {
      data: {
        object: {
          id: "seti_123",
          metadata: {
            koinoniaBillingSetupRequestId: "obj_123"
          },
          payment_method: "pm_123"
        }
      },
      type: "setup_intent.succeeded"
    } as unknown as Stripe.Event;

    expect(summarizeStripePortalEvent(event)).toMatchObject({
      action: "billing_setup_ready",
      billingSetupRequestId: "obj_123",
      processorReference: "seti_123"
    });
  });
});
