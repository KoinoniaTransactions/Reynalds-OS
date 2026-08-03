import { describe, expect, it } from "vitest";
import {
  buildDocumentSendPackageName,
  buildDocumentSendPackageNextAction,
  buildDocumentSendPackageStatusNextAction,
  documentSendPackageStatusRequiresDeliveryConfirmation,
  documentSendPackageStatusRequiresApproval,
  DocumentSendPackageValidationError,
  getDocumentSendPackageDetail,
  getDocumentSendPackageHealth,
  getDocumentSendPackageMetaLabels,
  isDocumentSendPackageApprovalConfirmed,
  validateDocumentSendPackageStatusUpdateInput,
  validateDocumentSendPackageInput
} from "./document-send-packages";

describe("document send package helpers", () => {
  it("validates an approved document send package", () => {
    const input = validateDocumentSendPackageInput({
      approvalConfirmed: true,
      deliveryChannel: "E-Signature Provider",
      documentIds: ["doc_1", "doc_2", "doc_1"],
      packageName: "Buyer Offer Signature Set",
      recipientSummary: "Buyer and Realtor",
      requestedSendTiming: "Send today",
      signatureRequired: true
    });

    expect(input).toEqual({
      approvalConfirmed: true,
      deliveryChannel: "E-Signature Provider",
      documentIds: ["doc_1", "doc_2"],
      notes: undefined,
      packageName: "Buyer Offer Signature Set",
      recipientSummary: "Buyer and Realtor",
      requestedSendTiming: "Send today",
      signatureRequired: true,
      status: "Ready to Send"
    });
    expect(buildDocumentSendPackageName(input)).toBe(
      "Send Package - Buyer Offer Signature Set"
    );
    expect(buildDocumentSendPackageNextAction(input)).toContain("approved e-signature");
    expect(getDocumentSendPackageHealth(input.status)).toBe("Attention");
  });

  it("keeps unapproved packages in the approval-needed gate", () => {
    const input = validateDocumentSendPackageInput({
      approvalConfirmed: false,
      deliveryChannel: "Email Package",
      documentIds: ["doc_1"],
      packageName: "Inspection Response",
      recipientSummary: "Listing agent",
      signatureRequired: false,
      status: "Ready to Send"
    });

    expect(input.status).toBe("Approval Needed");
    expect(buildDocumentSendPackageNextAction(input)).toContain("Record Realtor approval");
  });

  it("rejects unsafe delivery notes and missing documents", () => {
    expect(() =>
      validateDocumentSendPackageInput({
        approvalConfirmed: true,
        deliveryChannel: "Client Portal",
        documentIds: [],
        packageName: "Unsafe",
        recipientSummary: "Client",
        signatureRequired: false
      })
    ).toThrow("At least one document");

    expect(() =>
      validateDocumentSendPackageInput({
        approvalConfirmed: true,
        deliveryChannel: "Client Portal",
        documentIds: ["doc_1"],
        notes: "The e-signature password is included.",
        packageName: "Unsafe",
        recipientSummary: "Client",
        signatureRequired: false
      })
    ).toThrow(DocumentSendPackageValidationError);
  });

  it("formats send package display helpers", () => {
    const data = {
      approvalConfirmed: true,
      deliveryChannel: "Client Portal",
      documentIds: ["doc_1", "doc_2"],
      recipientSummary: "Buyer and co-buyer",
      requestedSendTiming: "Before inspection deadline",
      signatureRequired: false
    };

    expect(getDocumentSendPackageDetail(data)).toBe("Client Portal - Buyer and co-buyer");
    expect(getDocumentSendPackageMetaLabels(data)).toEqual([
      "Approval recorded",
      "No signature required",
      "2 documents",
      "Before inspection deadline"
    ]);
  });

  it("validates safe send package status updates", () => {
    const input = validateDocumentSendPackageStatusUpdateInput({
      deliveryConfirmation: "Sent through approved e-signature provider queue.",
      notes: "Monitor signature completion before the inspection deadline.",
      status: "Signature Monitoring"
    });

    expect(input.status).toBe("Signature Monitoring");
    expect(buildDocumentSendPackageStatusNextAction(input.status, true)).toContain(
      "Monitor signature"
    );
    expect(documentSendPackageStatusRequiresApproval(input.status)).toBe(true);
    expect(documentSendPackageStatusRequiresDeliveryConfirmation(input.status)).toBe(true);
    expect(isDocumentSendPackageApprovalConfirmed({ approvalConfirmed: true })).toBe(true);
  });

  it("requires delivery confirmation before sent or completed states", () => {
    expect(() =>
      validateDocumentSendPackageStatusUpdateInput({
        status: "Sent"
      })
    ).toThrow("deliveryConfirmation is required");

    expect(() =>
      validateDocumentSendPackageStatusUpdateInput({
        notes: "Archive checked.",
        status: "Completed"
      })
    ).toThrow("deliveryConfirmation is required");
  });

  it("rejects unsafe send package status update notes", () => {
    expect(() =>
      validateDocumentSendPackageStatusUpdateInput({
        notes: "The brokerage password is saved in the e-signature note.",
        status: "Sent"
      })
    ).toThrow(DocumentSendPackageValidationError);
  });
});
