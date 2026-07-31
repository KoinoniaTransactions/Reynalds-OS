import { describe, expect, it } from "vitest";
import {
  buildDocumentSendPackageName,
  buildDocumentSendPackageNextAction,
  DocumentSendPackageValidationError,
  getDocumentSendPackageDetail,
  getDocumentSendPackageHealth,
  getDocumentSendPackageMetaLabels,
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
});
