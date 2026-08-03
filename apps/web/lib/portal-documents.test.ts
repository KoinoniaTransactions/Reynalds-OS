import { describe, expect, it } from "vitest";
import {
  buildPortalDocumentContentDisposition,
  buildPortalDocumentDisplayName,
  formatDocumentFileSize,
  getHumanDocumentStatus,
  getNextPortalDocumentVersionNumber,
  getPortalDocumentLifecycleState,
  getPortalDocumentVersionLabel,
  PortalDocumentValidationError,
  sanitizeDocumentFileName,
  validatePortalDocumentClientApprovalInput,
  validatePortalDocumentRemovalInput,
  validatePortalDocumentReplacementSubmission,
  validatePortalDocumentScannerCommand,
  validatePortalDocumentStatusUpdateInput,
  validatePortalDocumentStorageKey,
  validatePortalDocumentUploadRoot,
  validatePortalDocumentSubmission
} from "./portal-documents";

describe("portal document helpers", () => {
  it("validates a client document upload submission", () => {
    const submission = validatePortalDocumentSubmission({
      documentType: "Seller Property Disclosure",
      file: {
        name: "seller disclosure.pdf",
        size: 512_000,
        type: "application/pdf"
      },
      requestedAction: "Review for transaction file",
      transactionName: "Smith Contract-to-Close"
    });

    expect(submission).toMatchObject({
      documentType: "Seller Property Disclosure",
      requestedAction: "Review for transaction file",
      transactionName: "Smith Contract-to-Close",
      file: {
        cleanName: "seller-disclosure.pdf",
        extension: "pdf",
        mimeType: "application/pdf"
      }
    });
    expect(buildPortalDocumentDisplayName(submission)).toBe(
      "Smith Contract-to-Close - Seller Property Disclosure"
    );
  });

  it("rejects unsafe file types and oversize uploads", () => {
    expect(() =>
      validatePortalDocumentSubmission({
        documentType: "Source File",
        file: {
          name: "malware.exe",
          size: 100,
          type: "application/x-msdownload"
        }
      })
    ).toThrow(PortalDocumentValidationError);

    expect(() =>
      validatePortalDocumentSubmission({
        documentType: "Too Large",
        file: {
          name: "large.pdf",
          size: 26 * 1024 * 1024,
          type: "application/pdf"
        }
      })
    ).toThrow("25 MB or smaller");
  });

  it("blocks credentials in notes", () => {
    expect(() =>
      validatePortalDocumentSubmission({
        documentType: "Access Notes",
        file: {
          name: "notes.pdf",
          size: 100,
          type: "application/pdf"
        },
        notes: "The password is available here."
      })
    ).toThrow("Do not include passwords");
  });

  it("formats display helpers", () => {
    expect(sanitizeDocumentFileName(" Seller Disclosure Final!!.pdf ")).toBe(
      "Seller-Disclosure-Final.pdf"
    );
    expect(formatDocumentFileSize(1024)).toBe("1 KB");
    expect(formatDocumentFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
    expect(getHumanDocumentStatus("Ready for Client Review")).toBe("Ready for Review");
    expect(getHumanDocumentStatus("Revision Requested")).toBe("Revision Requested");
    expect(getHumanDocumentStatus("Superseded")).toBe("Superseded");
    expect(getNextPortalDocumentVersionNumber(2)).toBe(3);
    expect(getNextPortalDocumentVersionNumber(null)).toBe(2);
    expect(getPortalDocumentVersionLabel(3, "Broker Review")).toBe("Broker Review");
    expect(getPortalDocumentVersionLabel(3)).toBe("v3");
  });

  it("validates staff document status updates", () => {
    expect(
      validatePortalDocumentStatusUpdateInput({
        notes: "Reviewed against the source terms.",
        requestedAction: "Send to client for review",
        status: "Ready for Client Review"
      })
    ).toEqual({
      notes: "Reviewed against the source terms.",
      requestedAction: "Send to client for review",
      status: "Ready for Client Review"
    });

    expect(() =>
      validatePortalDocumentStatusUpdateInput({
        status: "Custom Workflow"
      })
    ).toThrow("Document status is not supported.");

    expect(() =>
      validatePortalDocumentStatusUpdateInput({
        notes: "The credit card number is here.",
        status: "In Review"
      })
    ).toThrow("Do not include passwords");
  });

  it("validates client document approval responses", () => {
    expect(
      validatePortalDocumentClientApprovalInput({
        action: "approve",
        notes: "Approved to continue."
      })
    ).toEqual({
      action: "approve",
      notes: "Approved to continue."
    });

    expect(
      validatePortalDocumentClientApprovalInput({
        action: "request_revision",
        notes: "Please correct the closing date."
      })
    ).toMatchObject({
      action: "request_revision"
    });

    expect(() =>
      validatePortalDocumentClientApprovalInput({
        action: "send_now"
      })
    ).toThrow("Document approval action is not supported.");

    expect(() =>
      validatePortalDocumentClientApprovalInput({
        action: "approve",
        notes: "The gate code is 1234."
      })
    ).toThrow("Do not include passwords");
  });

  it("validates staff document replacement uploads", () => {
    expect(
      validatePortalDocumentReplacementSubmission({
        file: {
          name: "buyer-offer-v2.pdf",
          size: 512_000,
          type: "application/pdf"
        },
        replacementReason: "Corrected closing date",
        requestedAction: "Review corrected version",
        versionLabel: "v2"
      })
    ).toMatchObject({
      replacementReason: "Corrected closing date",
      requestedAction: "Review corrected version",
      versionLabel: "v2",
      file: {
        cleanName: "buyer-offer-v2.pdf"
      }
    });

    expect(() =>
      validatePortalDocumentReplacementSubmission({
        file: {
          name: "buyer-offer.exe",
          size: 100,
          type: "application/x-msdownload"
        }
      })
    ).toThrow("Upload a PDF");

    expect(() =>
      validatePortalDocumentReplacementSubmission({
        file: {
          name: "buyer-offer-v2.pdf",
          size: 512_000,
          type: "application/pdf"
        },
        notes: "The bank account is noted here."
      })
    ).toThrow("Do not include passwords");
  });

  it("validates stored file references for authorized downloads", () => {
    expect(validatePortalDocumentStorageKey("wks_koinonia/file.pdf")).toBe(
      "wks_koinonia/file.pdf"
    );
    expect(validatePortalDocumentStorageKey("wks_koinonia\\file.pdf")).toBe(
      "wks_koinonia/file.pdf"
    );
    expect(buildPortalDocumentContentDisposition(" Buyer Offer Final!!.pdf ")).toBe(
      'attachment; filename="Buyer-Offer-Final.pdf"'
    );

    expect(() => validatePortalDocumentStorageKey("../outside.pdf")).toThrow(
      "Document file reference is invalid."
    );
    expect(() => validatePortalDocumentStorageKey("/tmp/outside.pdf")).toThrow(
      "Document file reference is invalid."
    );
    expect(() => validatePortalDocumentStorageKey("")).toThrow(
      "Document file reference is missing."
    );
  });

  it("requires an absolute malware scanner command before live uploads", () => {
    expect(validatePortalDocumentScannerCommand("/usr/local/bin/clamscan")).toBe(
      "/usr/local/bin/clamscan"
    );
    expect(() => validatePortalDocumentScannerCommand("clamscan")).toThrow(
      "Document malware scanner command must be an absolute path."
    );
    expect(() => validatePortalDocumentScannerCommand("")).toThrow(
      "Document malware scanner is not configured."
    );
  });

  it("requires an absolute private document upload root", () => {
    expect(validatePortalDocumentUploadRoot("/private/portal-documents")).toBe(
      "/private/portal-documents"
    );
    expect(() => validatePortalDocumentUploadRoot("portal-documents")).toThrow(
      "Document upload storage must use an absolute path."
    );
    expect(() => validatePortalDocumentUploadRoot("")).toThrow(
      "Document upload storage is not configured."
    );
  });
  it("validates an optional document removal reason", () => {
    expect(validatePortalDocumentRemovalInput(undefined)).toEqual({});
    expect(
      validatePortalDocumentRemovalInput({
        reason: "Duplicate upload"
      })
    ).toEqual({
      reason: "Duplicate upload"
    });
  });

  it("rejects unsafe or oversized document removal reasons", () => {
    expect(() =>
      validatePortalDocumentRemovalInput({
        reason: "Password is secret123"
      })
    ).toThrow("Do not include passwords");

    expect(() =>
      validatePortalDocumentRemovalInput({
        reason: "x".repeat(221)
      })
    ).toThrow("reason must be 220 characters or fewer.");
  });

  it("derives document lifecycle states consistently", () => {
    expect(getPortalDocumentLifecycleState({ status: "Uploaded" })).toBe("active");

    expect(
      getPortalDocumentLifecycleState({
        status: "Superseded",
        supersededAt: new Date()
      })
    ).toBe("superseded");

    expect(
      getPortalDocumentLifecycleState({
        removedAt: new Date(),
        status: "Uploaded"
      })
    ).toBe("removed");

    expect(
      getPortalDocumentLifecycleState({
        archivedAt: new Date(),
        status: "Archived"
      })
    ).toBe("archived");
  });

  it("prioritizes removal over other lifecycle timestamps", () => {
    expect(
      getPortalDocumentLifecycleState({
        archivedAt: new Date(),
        removedAt: new Date(),
        supersededAt: new Date()
      })
    ).toBe("removed");
  });

});
