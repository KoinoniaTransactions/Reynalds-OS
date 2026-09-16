import { describe, expect, it } from "vitest";
import {
  buildClientTransactionName,
  getClientTransactionNextAction,
  getClientTransactionPartyRelationshipType,
  getClientTransactionStatus,
  getTransactionIntakeRequestId,
  normalizeClientIdentityName,
  validateClientTransactionIntakeInput
} from "./client-transactions";

describe("client transaction intake helpers", () => {
  it("starts from a document without asking Buyer Seller or stage first", () => {
    const input = validateClientTransactionIntakeInput({
      sourceDocumentName: "123 Main Contract.pdf"
    });

    expect(input.side).toBeUndefined();
    expect(input.stage).toBeUndefined();
    expect(input.clientName).toBeUndefined();
    expect(input.propertyAddress).toBeUndefined();
    expect(buildClientTransactionName(input)).toBe("123 Main Contract — Transaction Intake");
    expect(getClientTransactionStatus(input.stage)).toBe("Intake - Processing");
    expect(getClientTransactionNextAction(input)).toContain("Identify the transaction side");
  });

  it("still accepts known transaction context when it already exists", () => {
    const input = validateClientTransactionIntakeInput({
      side: "seller",
      sourceDocumentName: "123 Main Listing Agreement.pdf",
      stage: "pre_contract"
    });

    expect(input.clientName).toBeUndefined();
    expect(input.propertyAddress).toBeUndefined();
    expect(buildClientTransactionName(input)).toBe("123 Main Listing Agreement — Seller");
    expect(getClientTransactionStatus(input.stage)).toBe("Intake - Processing");
    expect(getClientTransactionNextAction(input)).toContain("Extract client, property");
  });

  it("uses confirmed identity details when available", () => {
    const input = validateClientTransactionIntakeInput({
      clientName: "John & Mary Smith",
      propertyAddress: "123 Main St",
      side: "seller",
      sourceDocumentName: "Contract.pdf",
      stage: "under_contract"
    });

    expect(buildClientTransactionName(input)).toBe("123 Main St — Seller");
    expect(getClientTransactionStatus(input.stage, true)).toBe("Under Contract");
  });

  it("keeps transaction role separate from reusable client identity", () => {
    expect(getClientTransactionPartyRelationshipType("buyer")).toBe("transaction_party:buyer");
    expect(getClientTransactionPartyRelationshipType("seller")).toBe("transaction_party:seller");
    expect(normalizeClientIdentityName("  John   & Mary Smith ")).toBe("john & mary smith");
  });

  it("preserves a bounded intake request id for safe retries", () => {
    const input = validateClientTransactionIntakeInput({
      intakeRequestId: "intake-123",
      sourceDocumentName: "Buyer Agency.pdf"
    });

    expect(input.intakeRequestId).toBe("intake-123");
    expect(getTransactionIntakeRequestId({ intakeRequestId: " intake-123 " })).toBe("intake-123");
    expect(() =>
      validateClientTransactionIntakeInput({
        intakeRequestId: "x".repeat(101),
        sourceDocumentName: "Buyer Agency.pdf"
      })
    ).toThrow("request id is too long");
  });
});
