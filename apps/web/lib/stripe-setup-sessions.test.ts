import { describe, expect, it } from "vitest";
import {
  assertBillingSetupProcessorReady,
  buildStripeCustomerCreateParams,
  buildStripeSetupCheckoutSessionParams,
  buildStripeSetupMetadata,
  canCreateProcessorSessionForRequest,
  getStoredStripeCustomerReference,
  getStripeSetupReturnBaseUrl,
  StripeSetupSessionValidationError
} from "./stripe-setup-sessions";

describe("stripe hosted setup session helpers", () => {
  it("requires recorded consent and a linked billing profile", () => {
    expect(() =>
      assertBillingSetupProcessorReady({
        consentAcknowledged: false,
        customerBillingProfileId: "obj_profile"
      })
    ).toThrow(/consent/i);

    expect(() =>
      assertBillingSetupProcessorReady({ consentAcknowledged: true })
    ).toThrow(/billing profile/i);
  });

  it("limits client setup sessions to their own billing requests", () => {
    expect(
      canCreateProcessorSessionForRequest({
        actorId: "usr_client",
        actorRole: "Client",
        clientUserId: "usr_client"
      })
    ).toBe(true);

    expect(
      canCreateProcessorSessionForRequest({
        actorId: "usr_other",
        actorRole: "Client",
        clientUserId: "usr_client"
      })
    ).toBe(false);

    expect(
      canCreateProcessorSessionForRequest({
        actorId: "usr_staff",
        actorRole: "Owner"
      })
    ).toBe(true);
  });

  it("reads only a valid Stripe customer reference from profile data", () => {
    expect(
      getStoredStripeCustomerReference({
        processorPaymentMethod: {
          customerReference: "cus_123ABC",
          provider: "stripe",
          status: "Pending"
        }
      })
    ).toBe("cus_123ABC");

    expect(
      getStoredStripeCustomerReference({
        processorPaymentMethod: {
          customerReference: "customer-123"
        }
      })
    ).toBeUndefined();
  });

  it("builds safe Koinonia metadata for Stripe reconciliation", () => {
    expect(
      buildStripeSetupMetadata({
        billingSetupRequestId: "obj_123",
        workspaceId: "wks_koinonia"
      })
    ).toEqual({
      koinoniaBillingSetupRequestId: "obj_123",
      koinoniaWorkspaceId: "wks_koinonia"
    });
  });

  it("builds a setup-mode Checkout Session without card data", () => {
    const params = buildStripeSetupCheckoutSessionParams({
      billingSetupRequestId: "obj_123",
      customerReference: "cus_123ABC",
      returnBaseUrl: "https://www.koinoniatransactions.com",
      workspaceId: "wks_koinonia"
    });

    expect(params).toMatchObject({
      cancel_url:
        "https://www.koinoniatransactions.com/client/billing?payment_setup=cancelled",
      client_reference_id: "obj_123",
      currency: "usd",
      customer: "cus_123ABC",
      metadata: {
        koinoniaBillingSetupRequestId: "obj_123",
        koinoniaWorkspaceId: "wks_koinonia"
      },
      mode: "setup",
      payment_method_types: ["card"],
      setup_intent_data: {
        metadata: {
          koinoniaBillingSetupRequestId: "obj_123",
          koinoniaWorkspaceId: "wks_koinonia"
        }
      },
      success_url:
        "https://www.koinoniatransactions.com/client/billing?payment_setup=success"
    });

    expect(JSON.stringify(params)).not.toMatch(/cardNumber|cvv|cvc|secret/i);
  });

  it("allows localhost return URLs only outside production", () => {
    expect(
      getStripeSetupReturnBaseUrl({
        configuredSiteUrl: "https://www.koinoniatransactions.com",
        nodeEnv: "development",
        requestUrl: "http://localhost:3000/api/portal/test"
      })
    ).toBe("http://localhost:3000");

    expect(
      getStripeSetupReturnBaseUrl({
        configuredSiteUrl: "https://www.koinoniatransactions.com",
        nodeEnv: "production",
        requestUrl: "https://www.koinoniatransactions.com/api/portal/test"
      })
    ).toBe("https://www.koinoniatransactions.com");
  });

  it("builds a Stripe customer with safe contact metadata only", () => {
    expect(
      buildStripeCustomerCreateParams({
        email: "client@example.com",
        name: "Bright Homes Team",
        workspaceId: "wks_koinonia"
      })
    ).toEqual({
      email: "client@example.com",
      metadata: { koinoniaWorkspaceId: "wks_koinonia" },
      name: "Bright Homes Team"
    });
  });

  it("rejects unsafe metadata references", () => {
    expect(() =>
      buildStripeSetupMetadata({
        billingSetupRequestId: "obj 123",
        workspaceId: "wks_koinonia"
      })
    ).toThrow(StripeSetupSessionValidationError);
  });
});
