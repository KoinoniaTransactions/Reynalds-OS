import { describe, expect, it } from "vitest";
import {
  buildCustomerBillingProfileObject,
  buildServiceActivationObject,
  customerBillingProfileObjectType,
  serviceActivationObjectType,
  validateCustomerBillingProfileInput,
  validateServiceActivationInput
} from "./portal-billing-entities";

describe("portal billing entity schemas", () => {
  it("builds a safe customer billing profile as a canonical RosObject", () => {
    const input = validateCustomerBillingProfileInput({
      authorizedBillingModels: ["prepaid", "pay_at_close"],
      billingContactEmail: "billing@example.com",
      billingContactName: "Jordan Client",
      clientName: "Bright Homes Team",
      clientObjectId: "obj_client_123",
      clientUserId: "user_client_123",
      consentStatus: "Authorized",
      consentTermsVersion: "2026-08",
      consentTimestamp: "2026-08-07T18:00:00.000Z"
    });

    expect(buildCustomerBillingProfileObject(input)).toEqual({
      clientObjectId: "obj_client_123",
      clientUserId: "user_client_123",
      data: {
        authorizedBillingModels: ["prepaid", "pay_at_close"],
        billingContactEmail: "billing@example.com",
        billingContactName: "Jordan Client",
        clientName: "Bright Homes Team",
        consentStatus: "Authorized",
        consentTermsVersion: "2026-08",
        consentTimestamp: "2026-08-07T18:00:00.000Z"
      },
      health: "Healthy",
      name: "Billing Profile - Bright Homes Team",
      nextAction:
        "Continue to processor-hosted payment setup when required by the service billing model.",
      objectType: customerBillingProfileObjectType,
      status: "Consent Recorded"
    });
  });

  it("rejects sensitive payment data from customer billing profile notes", () => {
    expect(() =>
      validateCustomerBillingProfileInput({
        clientName: "Unsafe Client",
        consentStatus: "Pending",
        internalBillingNotes: "Credit card 4242 4242 4242 4242"
      })
    ).toThrow(/must not contain raw payment credentials/i);
  });

  it("builds a pay-at-close service activation without processor references", () => {
    const input = validateServiceActivationInput({
      amountLabel: "$599",
      billingModel: "pay_at_close",
      clientName: "Northgate Partners",
      clientObjectId: "obj_client_456",
      consentStatus: "Authorized",
      relatedWorkObjectId: "obj_transaction_456",
      serviceName: "Pay-at-Closing Coordination",
      startedAt: "2026-08-07T18:30:00.000Z",
      status: "Active",
      termsVersion: "2026-08",
      triggerDescription: "After successful closing"
    });

    expect(buildServiceActivationObject(input)).toEqual({
      clientObjectId: "obj_client_456",
      clientUserId: undefined,
      data: {
        amountLabel: "$599",
        billingModel: "pay_at_close",
        clientName: "Northgate Partners",
        consentStatus: "Authorized",
        relatedWorkObjectId: "obj_transaction_456",
        serviceName: "Pay-at-Closing Coordination",
        startedAt: "2026-08-07T18:30:00.000Z",
        termsVersion: "2026-08",
        triggerDescription: "After successful closing"
      },
      health: "Healthy",
      name: "Service Activation - Pay-at-Closing Coordination",
      nextAction:
        "Track the successful closing trigger before charging the approved fee.",
      objectType: serviceActivationObjectType,
      status: "Active"
    });
  });

  it("rejects unsupported service billing models", () => {
    expect(() =>
      validateServiceActivationInput({
        billingModel: "store_card_locally",
        serviceName: "Unsafe Service",
        status: "Pending"
      })
    ).toThrow(/approved service billing model/i);
  });
});
