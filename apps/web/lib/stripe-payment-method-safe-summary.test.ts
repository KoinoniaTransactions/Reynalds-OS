import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { summarizeStripePaymentMethod } from "./stripe-payment-method-safe-summary";

describe("safe Stripe payment method summaries", () => {
  it("extracts only safe card display metadata", () => {
    const paymentMethod = {
      id: "pm_123ABC",
      type: "card",
      card: {
        brand: "visa",
        exp_month: 12,
        exp_year: 2030,
        last4: "4242"
      }
    } as unknown as Stripe.PaymentMethod;

    expect(summarizeStripePaymentMethod(paymentMethod)).toEqual({
      paymentMethodBrand: "visa",
      paymentMethodExpirationMonth: 12,
      paymentMethodExpirationYear: 2030,
      paymentMethodLast4: "4242",
      paymentMethodReference: "pm_123ABC",
      paymentMethodSummary: "Visa ending 4242, expires 12/2030"
    });
  });

  it("does not invent card details for non-card payment methods", () => {
    const paymentMethod = {
      id: "pm_456DEF",
      type: "us_bank_account"
    } as unknown as Stripe.PaymentMethod;

    expect(summarizeStripePaymentMethod(paymentMethod)).toEqual({
      paymentMethodReference: "pm_456DEF"
    });
  });

  it("does not persist malformed processor references", () => {
    const paymentMethod = {
      id: "unsafe-reference",
      type: "card",
      card: {
        brand: "mastercard",
        exp_month: 1,
        exp_year: 2031,
        last4: "4444"
      }
    } as unknown as Stripe.PaymentMethod;

    expect(summarizeStripePaymentMethod(paymentMethod).paymentMethodReference).toBeUndefined();
  });
});
