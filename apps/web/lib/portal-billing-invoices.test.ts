import { describe, expect, it } from "vitest";
import {
  buildPortalInvoiceDisplayItem,
  buildPortalInvoiceNextAction,
  formatPortalInvoiceAmount,
  formatPortalInvoiceLabel,
  getHumanPortalInvoiceStatus,
  getPaymentRecordStatus,
  getPortalInvoiceDueLabel,
  PortalInvoiceValidationError,
  validatePortalInvoiceStatusUpdateInput
} from "./portal-billing-invoices";

describe("portal billing invoice helpers", () => {
  it("validates safe invoice status updates", () => {
    const input = validatePortalInvoiceStatusUpdateInput({
      dueAt: "2026-08-15",
      notes: "Processor shows successful payment after client authorization.",
      paymentMethodSummary: "Visa ending 4242",
      processorPaymentReference: "pi_koinonia_reference_123",
      status: "Paid"
    });

    expect(input).toMatchObject({
      notes: "Processor shows successful payment after client authorization.",
      paymentMethodSummary: "Visa ending 4242",
      processorPaymentReference: "pi_koinonia_reference_123",
      status: "Paid"
    });
    expect(input.dueAt).toBeInstanceOf(Date);
    expect(getPaymentRecordStatus(input.status)).toBe("Succeeded");
  });

  it("rejects raw payment details in invoice updates", () => {
    expect(() =>
      validatePortalInvoiceStatusUpdateInput({
        notes: "Card number 4242 4242 4242 4242 and CVV 111",
        status: "Ready to Process"
      })
    ).toThrow(PortalInvoiceValidationError);
  });

  it("normalizes legacy invoice statuses for portal display", () => {
    expect(getHumanPortalInvoiceStatus("Pending")).toBe("Open");
    expect(getHumanPortalInvoiceStatus("Waiting on Successful Closing")).toBe(
      "Pay at Close Watch"
    );
    expect(getHumanPortalInvoiceStatus("Custom External Status")).toBe("Open");
  });

  it("formats invoice display rows", () => {
    const row = buildPortalInvoiceDisplayItem(
      {
        amount: "599",
        clientObjectId: "obj_client",
        dueAt: null,
        id: "inv_pay_at_close_2011",
        paidAt: null,
        relatedObjectId: "obj_txn",
        status: "Waiting on Successful Closing"
      },
      new Map([
        ["obj_client", "Bright Homes"],
        ["obj_txn", "Lakewood Seller File"]
      ])
    );

    expect(row).toEqual({
      amount: "$599.00",
      due: "After close",
      id: "inv_pay_at_close_2011",
      invoice: "INV-SE2011",
      nextAction: buildPortalInvoiceNextAction("Pay at Close Watch"),
      service: "Lakewood Seller File",
      status: "Pay at Close Watch"
    });
  });

  it("formats amount, labels, and due labels", () => {
    expect(formatPortalInvoiceAmount(389)).toBe("$389.00");
    expect(formatPortalInvoiceLabel("inv_1042")).toBe("INV-NV1042");
    expect(
      getPortalInvoiceDueLabel({
        dueAt: "2026-08-01",
        paidAt: "2026-08-02",
        status: "Paid"
      })
    ).toContain("Paid");
  });
});
