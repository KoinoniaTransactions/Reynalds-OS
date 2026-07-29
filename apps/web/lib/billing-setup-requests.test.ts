import { describe, expect, it } from "vitest";
import {
  BillingSetupValidationError,
  buildBillingSetupNextAction,
  buildBillingSetupRequestName,
  getBillingSetupDetail,
  getBillingSetupHealth,
  getBillingSetupMetaLabels,
  validateBillingSetupRequestInput
} from "./billing-setup-requests";

describe("billing setup request helpers", () => {
  it("validates safe processor-hosted billing setup metadata", () => {
    const input = validateBillingSetupRequestInput({
      amountLabel: "$599 after close",
      billingModel: "Pay after successful close",
      clientName: "Northgate Partners",
      consentAcknowledged: true,
      serviceName: "Pay-at-Closing Coordination",
      status: "Pay at Close Watch",
      triggerDescription: "Charge after successful close"
    });

    expect(input).toEqual({
      amountLabel: "$599 after close",
      billingModel: "Pay after successful close",
      clientName: "Northgate Partners",
      consentAcknowledged: true,
      serviceName: "Pay-at-Closing Coordination",
      status: "Pay at Close Watch",
      triggerDescription: "Charge after successful close"
    });
    expect(buildBillingSetupRequestName(input)).toBe(
      "Billing Setup - Pay-at-Closing Coordination"
    );
    expect(buildBillingSetupNextAction(input)).toContain("closing trigger");
  });

  it("requires service and billing model", () => {
    expect(() => validateBillingSetupRequestInput({ billingModel: "Prepaid" })).toThrow(
      BillingSetupValidationError
    );
    expect(() => validateBillingSetupRequestInput({ serviceName: "Showing Coverage" })).toThrow(
      BillingSetupValidationError
    );
  });

  it("keeps setup blocked until client billing consent is recorded", () => {
    expect(
      validateBillingSetupRequestInput({
        billingModel: "Prepaid",
        consentAcknowledged: false,
        serviceName: "Transaction Coordination Plus",
        status: "Processor Link Needed"
      }).status
    ).toBe("Consent Needed");
  });

  it("blocks raw payment secrets in notes", () => {
    expect(() =>
      validateBillingSetupRequestInput({
        billingModel: "Prepaid",
        notes: "The card number is 4242 and CVV is here.",
        serviceName: "Transaction Coordination Plus"
      })
    ).toThrow("Do not include card numbers");
  });

  it("builds display labels", () => {
    expect(getBillingSetupHealth("Payment Method Ready")).toBe("Healthy");
    expect(getBillingSetupHealth("Blocked")).toBe("Critical");
    expect(getBillingSetupDetail({ billingModel: "Prepaid", amountLabel: "$389" })).toBe(
      "Prepaid - $389"
    );
    expect(
      getBillingSetupMetaLabels({
        clientName: "Wilson Realty Group",
        triggerDescription: "Before work begins"
      })
    ).toEqual(["No card stored", "Before work begins", "Wilson Realty Group"]);
  });
});
