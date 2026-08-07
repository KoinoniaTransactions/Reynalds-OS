import { describe, expect, it } from "vitest";
import {
  applyBillingSetupRequestSourcePolicy,
  BillingSetupValidationError,
  buildBillingSetupNextAction,
  buildBillingSetupRequestName,
  buildBillingSetupStatusNextAction,
  getBillingSetupDetail,
  getBillingSetupHealth,
  getBillingSetupMetaLabels,
  validateBillingSetupRequestInput,
  validateBillingSetupStatusUpdateInput
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

  it("prevents client intake from setting staff-confirmed billing statuses", () => {
    const prepaidInput = validateBillingSetupRequestInput({
      billingModel: "Prepaid before work begins",
      consentAcknowledged: true,
      serviceName: "Transaction Coordination Plus",
      status: "Payment Method Ready"
    });

    const payAtCloseInput = validateBillingSetupRequestInput({
      billingModel: "Pay after successful close",
      consentAcknowledged: true,
      serviceName: "Pay-at-Closing Coordination",
      status: "Payment Method Ready"
    });

    expect(
      applyBillingSetupRequestSourcePolicy(prepaidInput, "client-portal").status
    ).toBe("Setup Requested");

    expect(
      applyBillingSetupRequestSourcePolicy(payAtCloseInput, "client-portal").status
    ).toBe("Pay at Close Watch");

    expect(
      applyBillingSetupRequestSourcePolicy(prepaidInput, "employee-portal").status
    ).toBe("Payment Method Ready");
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

  it("validates safe billing setup status updates", () => {
    const input = validateBillingSetupStatusUpdateInput(
      {
        notes: "Processor setup completed by client through hosted setup link.",
        paymentMethodSummary: "Visa ending 4242, expires 12/29",
        processorReference: "pm_koinonia_reference_123",
        status: "Payment Method Ready"
      },
      { consentAcknowledged: true }
    );

    expect(input.status).toBe("Payment Method Ready");
    expect(buildBillingSetupStatusNextAction(input.status)).toContain(
      "safe payment method metadata"
    );
  });

  it("requires recorded consent before advancing billing setup", () => {
    expect(() =>
      validateBillingSetupStatusUpdateInput(
        { status: "Processor Link Needed" },
        { consentAcknowledged: false }
      )
    ).toThrow("Recorded billing consent is required");

    expect(
      validateBillingSetupStatusUpdateInput(
        { status: "Consent Needed" },
        { consentAcknowledged: false }
      ).status
    ).toBe("Consent Needed");
  });

  it("requires processor evidence before marking a payment method ready", () => {
    expect(() =>
      validateBillingSetupStatusUpdateInput(
        { status: "Payment Method Ready" },
        { consentAcknowledged: true }
      )
    ).toThrow("requires a processor reference");

    expect(() =>
      validateBillingSetupStatusUpdateInput(
        {
          processorReference: "pm_reference_only",
          status: "Payment Method Ready"
        },
        { consentAcknowledged: true }
      )
    ).toThrow("requires a processor reference");

    expect(
      validateBillingSetupStatusUpdateInput(
        { status: "Payment Method Ready" },
        {
          consentAcknowledged: true,
          paymentMethodSummary: "Visa ending 4242",
          processorReference: "pm_existing_reference"
        }
      ).status
    ).toBe("Payment Method Ready");
  });

  it("requires a billing trigger before pay-at-close watch", () => {
    expect(() =>
      validateBillingSetupStatusUpdateInput(
        { status: "Pay at Close Watch" },
        { consentAcknowledged: true }
      )
    ).toThrow("requires a recorded billing trigger");

    expect(
      validateBillingSetupStatusUpdateInput(
        { status: "Pay at Close Watch" },
        {
          consentAcknowledged: true,
          triggerDescription: "Charge only after confirmed successful close"
        }
      ).status
    ).toBe("Pay at Close Watch");
  });

  it("rejects raw payment details in billing setup updates", () => {
    expect(() =>
      validateBillingSetupStatusUpdateInput({
        notes: "The client provided the CVV and bank account number.",
        status: "Payment Method Ready"
      })
    ).toThrow(BillingSetupValidationError);
  });
});
