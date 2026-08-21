import { describe, expect, it } from "vitest";
import {
  buildConfirmedTransactionName,
  buildHouseholdName,
  getExtractionReviewStatus,
  mergeExtractionIntoTransactionData,
  TransactionExtractionValidationError,
  validateTransactionExtractionProposal
} from "./transaction-extraction";

describe("transaction extraction helpers", () => {
  it("validates a reviewable extraction proposal", () => {
    const proposal = validateTransactionExtractionProposal({
      clientNames: ["John Smith", "Mary Smith"],
      propertyAddress: "123 Main St",
      purchasePrice: 625000,
      earnestMoney: 10000,
      closingDate: "2026-09-18",
      deadlines: { inspection: "2026-08-29" },
      confidence: "high",
      sourceDocumentId: "doc_1",
      sourceDocumentType: "Executed Contract to Buy and Sell"
    });

    expect(proposal.closingDate).toBe("2026-09-18");
    expect(getExtractionReviewStatus(proposal.confidence)).toBe("Ready for Review");
    expect(buildHouseholdName(proposal.clientNames)).toBe("John Smith & Mary Smith");
  });

  it("keeps low-confidence extraction in review", () => {
    expect(getExtractionReviewStatus("low")).toBe("Needs Review");
  });

  it("rejects invalid confidence", () => {
    expect(() =>
      validateTransactionExtractionProposal({
        clientNames: [],
        confidence: "certain",
        deadlines: {},
        sourceDocumentId: "doc_1",
        sourceDocumentType: "Contract"
      })
    ).toThrow(TransactionExtractionValidationError);
  });

  it("builds a transaction identity from property before client name", () => {
    expect(
      buildConfirmedTransactionName({
        clientName: "John Smith",
        propertyAddress: "123 Main St",
        side: "seller"
      })
    ).toBe("123 Main St — Seller");
  });

  it("merges confirmed extraction without losing intake metadata", () => {
    const proposal = validateTransactionExtractionProposal({
      clientNames: ["John Smith"],
      propertyAddress: "123 Main St",
      closingDate: "2026-09-18",
      deadlines: {},
      confidence: "medium",
      sourceDocumentId: "doc_1",
      sourceDocumentType: "Contract"
    });

    const merged = mergeExtractionIntoTransactionData(
      { side: "buyer", stage: "under_contract", intakeSource: "client_portal" },
      proposal,
      "2026-08-21T13:00:00.000Z"
    );

    expect(merged.side).toBe("buyer");
    expect(merged.propertyAddress).toBe("123 Main St");
    expect(merged.extraction).toMatchObject({ status: "confirmed", confidence: "medium" });
  });
});
