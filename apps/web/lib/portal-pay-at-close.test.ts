import { describe, expect, it } from "vitest";
import {
  assertManualPayAtCloseInvoiceTransitionAllowed,
  assertPayAtCloseTriggerEligibility,
  buildPayAtCloseTriggerData,
  isManualPayAtCloseTransitionBlocked,
  PayAtCloseTriggerValidationError,
  validatePayAtCloseConfirmationInput
} from "./portal-pay-at-close";

const eligibleInvoice = {
  amount: "599",
  paidAt: null,
  relatedObjectId: "obj_service_activation",
  status: "Pay at Close Watch"
};

const eligibleServiceActivation = {
  id: "obj_service_activation",
  objectType: "ServiceActivation",
  status: "Active",
  data: {
    billingModel: "pay_at_close",
    consentStatus: "Authorized",
    relatedWorkObjectId: "obj_transaction"
  }
};

describe("pay-at-close trigger helpers", () => {
  it("validates a successful closing confirmation", () => {
    const input = validatePayAtCloseConfirmationInput(
      {
        closingDate: "2026-08-12",
        confirmationSource: "Title company closing confirmation",
        note: "Successful closing confirmed.",
        outcome: "successful_close"
      },
      new Date("2026-08-12T18:00:00.000Z")
    );

    expect(input.outcome).toBe("successful_close");
    expect(input.confirmationSource).toBe(
      "Title company closing confirmation"
    );
    expect(input.closingDate.toISOString()).toContain("2026-08-12");
  });

  it("does not accept a future closing date", () => {
    expect(() =>
      validatePayAtCloseConfirmationInput(
        {
          closingDate: "2026-08-13",
          confirmationSource: "Title company",
          outcome: "successful_close"
        },
        new Date("2026-08-12T18:00:00.000Z")
      )
    ).toThrow(PayAtCloseTriggerValidationError);
  });

  it("rejects payment credentials in closing evidence", () => {
    expect(() =>
      validatePayAtCloseConfirmationInput(
        {
          closingDate: "2026-08-12",
          confirmationSource:
            "Card number 4242 4242 4242 4242 confirmed the closing",
          outcome: "successful_close"
        },
        new Date("2026-08-12T18:00:00.000Z")
      )
    ).toThrow(PayAtCloseTriggerValidationError);
  });

  it("requires an authorized linked pay-at-close service activation", () => {
    expect(
      assertPayAtCloseTriggerEligibility({
        invoice: eligibleInvoice,
        serviceActivation: eligibleServiceActivation
      })
    ).toEqual({
      relatedWorkObjectId: "obj_transaction"
    });
  });

  it("rejects the wrong billing model or missing authorization", () => {
    expect(() =>
      assertPayAtCloseTriggerEligibility({
        invoice: eligibleInvoice,
        serviceActivation: {
          ...eligibleServiceActivation,
          data: {
            billingModel: "prepaid",
            consentStatus: "Authorized",
            relatedWorkObjectId: "obj_transaction"
          }
        }
      })
    ).toThrow(PayAtCloseTriggerValidationError);

    expect(() =>
      assertPayAtCloseTriggerEligibility({
        invoice: eligibleInvoice,
        serviceActivation: {
          ...eligibleServiceActivation,
          data: {
            billingModel: "pay_at_close",
            consentStatus: "Pending",
            relatedWorkObjectId: "obj_transaction"
          }
        }
      })
    ).toThrow(PayAtCloseTriggerValidationError);
  });

  it("rejects an invoice that is not on closing watch", () => {
    expect(() =>
      assertPayAtCloseTriggerEligibility({
        invoice: {
          ...eligibleInvoice,
          status: "Ready to Process"
        },
        serviceActivation: eligibleServiceActivation
      })
    ).toThrow(PayAtCloseTriggerValidationError);
  });

  it("blocks manual bypass into processing or payment states", () => {
    expect(
      isManualPayAtCloseTransitionBlocked(
        "Pay at Close Watch",
        "Ready to Process"
      )
    ).toBe(true);

    expect(
      isManualPayAtCloseTransitionBlocked(
        "Pay at Close Watch",
        "Paid"
      )
    ).toBe(true);

    expect(
      isManualPayAtCloseTransitionBlocked(
        "Pay at Close Watch",
        "Void"
      )
    ).toBe(false);

    expect(() =>
      assertManualPayAtCloseInvoiceTransitionAllowed(
        "Pay at Close Watch",
        "Processing"
      )
    ).toThrow(PayAtCloseTriggerValidationError);
  });

  it("builds safe durable trigger metadata", () => {
    const input = validatePayAtCloseConfirmationInput(
      {
        closingDate: "2026-08-12",
        confirmationSource: "Title company",
        outcome: "successful_close"
      },
      new Date("2026-08-12T18:00:00.000Z")
    );

    expect(
      buildPayAtCloseTriggerData({
        actorId: "usr_finance",
        confirmedAt: new Date("2026-08-12T18:30:00.000Z"),
        input,
        invoiceId: "inv_599",
        relatedWorkObjectId: "obj_transaction",
        serviceActivationId: "obj_service_activation"
      })
    ).toEqual({
      closingDate: "2026-08-12",
      confirmationSource: "Title company",
      confirmedAt: "2026-08-12T18:30:00.000Z",
      confirmedByUserId: "usr_finance",
      invoiceId: "inv_599",
      note: null,
      outcome: "successful_close",
      relatedWorkObjectId: "obj_transaction",
      serviceActivationId: "obj_service_activation"
    });
  });
});
