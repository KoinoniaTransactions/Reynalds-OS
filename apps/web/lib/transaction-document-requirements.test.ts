import { describe, expect, it } from "vitest";
import {
  buildTransactionDocumentChecklist,
  getTransactionDocumentRequirements
} from "./transaction-document-requirements";

describe("transaction document requirements", () => {
  it("tracks a listing agreement as received for a seller listing-stage file", () => {
    const checklist = buildTransactionDocumentChecklist("seller", "pre_contract", [
      {
        id: "doc_listing",
        documentType: "Listing Agreement",
        fileName: "listing-agreement.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "listing-agreement")).toMatchObject({
      status: "received",
      documentId: "doc_listing",
      fileName: "listing-agreement.pdf"
    });
  });

  it("does not count a pending-classification upload as received", () => {
    const checklist = buildTransactionDocumentChecklist("seller", "pre_contract", [
      {
        id: "doc_pending",
        documentType: "Pending Classification",
        fileName: "unknown.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "listing-agreement")?.status).toBe("missing");
    expect(checklist.every((item) => item.documentId !== "doc_pending")).toBe(true);
  });

  it("changes the required document set when a seller goes under contract", () => {
    const listingRequirements = getTransactionDocumentRequirements("seller", "pre_contract");
    const contractRequirements = getTransactionDocumentRequirements("seller", "under_contract");

    expect(listingRequirements.find((item) => item.id === "purchase-contract")).toBeUndefined();
    expect(contractRequirements.find((item) => item.id === "purchase-contract")?.level).toBe("required");
    expect(contractRequirements.find((item) => item.id === "listing-agreement")?.level).toBe("required");
  });

  it("recognizes common canonical aliases", () => {
    const checklist = buildTransactionDocumentChecklist("buyer", "under_contract", [
      {
        id: "doc_contract",
        documentType: "Purchase Contract",
        fileName: "contract.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "purchase-contract")?.status).toBe("received");
  });
});
