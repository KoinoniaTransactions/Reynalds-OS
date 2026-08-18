import { describe, expect, it } from "vitest";
import {
  mergeProcessorPaymentMethodProfileData,
  validateProcessorPaymentMethodReference
} from "./portal-billing-processor-references";

describe("portal billing processor references", () => {
  it("accepts safe Stripe customer and payment-method references", () => {
    expect(
      validateProcessorPaymentMethodReference({
        brand: "visa",
        customerReference: "cus_123ABC",
        expirationMonth: 12,
        expirationYear: 2030,
        last4: "4242",
        paymentMethodReference: "pm_123ABC",
        provider: "stripe",
        status: "Ready",
        verifiedAt: "2026-08-12T12:00:00.000Z"
      })
    ).toEqual({
      brand: "visa",
      customerReference: "cus_123ABC",
      expirationMonth: 12,
      expirationYear: 2030,
      last4: "4242",
      paymentMethodReference: "pm_123ABC",
      provider: "stripe",
      status: "Ready",
      verifiedAt: "2026-08-12T12:00:00.000Z"
    });
  });

  it("rejects raw card and CVV fields", () => {
    expect(() =>
      validateProcessorPaymentMethodReference({
        cardNumber: "4242424242424242",
        cvv: "123",
        paymentMethodReference: "pm_123ABC",
        provider: "stripe",
        status: "Ready"
      })
    ).toThrow(/must not contain raw payment credentials/i);
  });

  it("rejects processor secrets and bank credentials", () => {
    expect(() =>
      validateProcessorPaymentMethodReference({
        bankAccount: "123456789",
        stripeSecret: "sk_live_example",
        provider: "stripe",
        status: "Pending"
      })
    ).toThrow(/must not contain raw payment credentials/i);
  });

  it("requires safe Stripe reference formats", () => {
    expect(() =>
      validateProcessorPaymentMethodReference({
        customerReference: "customer-123",
        paymentMethodReference: "pm_123ABC",
        provider: "stripe",
        status: "Ready"
      })
    ).toThrow(/cus_/i);

    expect(() =>
      validateProcessorPaymentMethodReference({
        paymentMethodReference: "card_123",
        provider: "stripe",
        status: "Ready"
      })
    ).toThrow(/pm_/i);
  });

  it("merges safe processor metadata without deleting billing profile data", () => {
    expect(
      mergeProcessorPaymentMethodProfileData(
        {
          authorizedBillingModels: ["prepaid"],
          clientName: "Bright Homes Team",
          consentStatus: "Authorized",
          processorPaymentMethod: {
            customerReference: "cus_old",
            provider: "stripe",
            status: "Pending"
          }
        },
        {
          brand: "visa",
          customerReference: "cus_new",
          expirationMonth: 12,
          expirationYear: 2030,
          last4: "4242",
          paymentMethodReference: "pm_new",
          provider: "stripe",
          status: "Ready",
          verifiedAt: "2026-08-12T12:00:00.000Z"
        }
      )
    ).toEqual({
      authorizedBillingModels: ["prepaid"],
      clientName: "Bright Homes Team",
      consentStatus: "Authorized",
      processorPaymentMethod: {
        brand: "visa",
        customerReference: "cus_new",
        expirationMonth: 12,
        expirationYear: 2030,
        last4: "4242",
        paymentMethodReference: "pm_new",
        provider: "stripe",
        status: "Ready",
        verifiedAt: "2026-08-12T12:00:00.000Z"
      }
    });
  });
});
