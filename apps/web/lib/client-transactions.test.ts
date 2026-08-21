import { describe, expect, it } from "vitest";
import {
  buildClientTransactionName,
  getClientTransactionNextAction,
  getClientTransactionPartyRelationshipType,
  getClientTransactionStatus,
  normalizeClientIdentityName,
  validateClientTransactionIntakeInput
} from "./client-transactions";

describe("client transaction intake helpers", () => {
  it("allows document-first intake without manual client/property fields", () => {
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
});
