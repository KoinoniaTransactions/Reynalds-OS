import { describe, expect, it } from "vitest";
import {
  assertPrepaidInvoicePaymentEligible,
  buildStripeInvoicePaymentCheckoutSessionParams,
  buildStripeInvoicePaymentMetadata,
  canCreatePrepaidInvoicePaymentSession,
  getStripeInvoicePaymentReturnBaseUrl,
  getStripeInvoiceTransitionDecision,
  isInvoiceAccessibleToActor,
  StripeInvoicePaymentSessionValidationError
} from "./stripe-invoice-payment-sessions";

describe("stripe prepaid invoice payment helpers", () => {
  const prepaidInvoice = {
    amount: "389.00",
    clientObjectId: "obj_client",
    id: "inv_389",
    paidAt: null,
    relatedObjectId: "obj_service",
    status: "Due Before Work Begins"
  };

  it("allows only unpaid prepaid invoices due before work begins", () => {
    expect(
      canCreatePrepaidInvoicePaymentSession(
        prepaidInvoice
      )
    ).toBe(true);

    expect(
      assertPrepaidInvoicePaymentEligible(
        prepaidInvoice
      )
    ).toEqual({
      unitAmount: 38900
    });

    expect(
      canCreatePrepaidInvoicePaymentSession({
        ...prepaidInvoice,
        status: "Pay at Close Watch"
      })
    ).toBe(false);

    expect(
      canCreatePrepaidInvoicePaymentSession({
        ...prepaidInvoice,
        paidAt: new Date(),
        status: "Paid"
      })
    ).toBe(false);
  });

  it("requires the invoice to belong to an object accessible to the actor", () => {
    expect(
      isInvoiceAccessibleToActor(
        prepaidInvoice,
        ["obj_client"]
      )
    ).toBe(true);

    expect(
      isInvoiceAccessibleToActor(
        prepaidInvoice,
        ["obj_other"]
      )
    ).toBe(false);
  });

  it("builds safe Stripe reconciliation metadata", () => {
    expect(
      buildStripeInvoicePaymentMetadata({
        invoiceId: "inv_389",
        workspaceId: "wks_koinonia"
      })
    ).toEqual({
      koinoniaInvoiceId: "inv_389",
      koinoniaWorkspaceId: "wks_koinonia"
    });
  });

  it("builds a payment-mode Checkout Session from the server invoice amount", () => {
    const params =
      buildStripeInvoicePaymentCheckoutSessionParams({
        amount: "389.00",
        customerReference: "cus_123ABC",
        invoiceId: "inv_389",
        returnBaseUrl:
          "https://www.koinoniatransactions.com",
        serviceName:
          "Transaction Coordination Plus",
        workspaceId: "wks_koinonia"
      });

    expect(params).toMatchObject({
      cancel_url:
        "https://www.koinoniatransactions.com/client/billing?invoice_payment=cancelled",
      client_reference_id: "inv_389",
      customer: "cus_123ABC",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name:
                "Transaction Coordination Plus"
            },
            unit_amount: 38900
          },
          quantity: 1
        }
      ],
      metadata: {
        koinoniaInvoiceId: "inv_389",
        koinoniaWorkspaceId: "wks_koinonia"
      },
      mode: "payment",
      payment_intent_data: {
        metadata: {
          koinoniaInvoiceId: "inv_389",
          koinoniaWorkspaceId: "wks_koinonia"
        }
      },
      payment_method_types: ["card"],
      success_url:
        "https://www.koinoniatransactions.com/client/billing?invoice_payment=success"
    });

    expect(JSON.stringify(params)).not.toMatch(
      /cardNumber|cvv|cvc|secret/i
    );
  });

  it("allows localhost return URLs only outside production", () => {
    expect(
      getStripeInvoicePaymentReturnBaseUrl({
        configuredSiteUrl:
          "https://www.koinoniatransactions.com",
        nodeEnv: "development",
        requestUrl:
          "http://localhost:3000/api/portal/invoices/inv_389/payment-session"
      })
    ).toBe("http://localhost:3000");
  });

  it("prevents duplicate and stale terminal invoice transitions", () => {
    expect(
      getStripeInvoiceTransitionDecision(
        "Due Before Work Begins",
        "Paid"
      )
    ).toBe("process");

    expect(
      getStripeInvoiceTransitionDecision(
        "Paid",
        "Paid"
      )
    ).toBe("redundant");

    expect(
      getStripeInvoiceTransitionDecision(
        "Paid",
        "Payment Failed"
      )
    ).toBe("stale");

    expect(
      getStripeInvoiceTransitionDecision(
        "Paid",
        "Refunded"
      )
    ).toBe("process");

    expect(
      getStripeInvoiceTransitionDecision(
        "Refunded",
        "Paid"
      )
    ).toBe("stale");
  });

  it("rejects unsafe processor metadata and malformed amounts", () => {
    expect(() =>
      buildStripeInvoicePaymentMetadata({
        invoiceId: "invoice 389",
        workspaceId: "wks_koinonia"
      })
    ).toThrow(
      StripeInvoicePaymentSessionValidationError
    );

    expect(() =>
      buildStripeInvoicePaymentCheckoutSessionParams({
        amount: "389.999",
        invoiceId: "inv_389",
        returnBaseUrl:
          "https://www.koinoniatransactions.com",
        workspaceId: "wks_koinonia"
      })
    ).toThrow(
      StripeInvoicePaymentSessionValidationError
    );
  });
});
