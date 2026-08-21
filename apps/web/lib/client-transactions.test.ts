import { describe, expect, it } from "vitest";
import {
  buildClientTransactionName,
  ClientTransactionValidationError,
  getClientTransactionNextAction,
  getClientTransactionPartyRelationshipType,
  getClientTransactionStatus,
  normalizeClientIdentityName,
  validateClientTransactionIntakeInput
} from "./client-transactions";

describe("client transaction intake helpers", () => {
  it("allows a pre-contract buyer without a property", () => {
    const input = validateClientTransactionIntakeInput({
      clientName: "John & Mary Smith",
      side: "buyer",
      sourceDocumentName: "Buyer Agency.pdf",
      stage: "pre_contract"
    });

    expect(input.propertyAddress).toBeUndefined();
    expect(buildClientTransactionName(input)).toBe("John & Mary Smith — Buyer");
    expect(getClientTransactionStatus(input.stage)).toBe("Intake");
  });

  it("requires property for sellers and under-contract buyers", () => {
    expect(() =>
      validateClientTransactionIntakeInput({
        clientName: "John Smith",
        side: "seller",
        sourceDocumentName: "Listing Agreement.pdf",
        stage: "pre_contract"
      })
    ).toThrow(ClientTransactionValidationError);

    expect(() =>
      validateClientTransactionIntakeInput({
        clientName: "John Smith",
        side: "buyer",
        sourceDocumentName: "Contract.pdf",
        stage: "under_contract"
      })
    ).toThrow("Property address is required");
  });

  it("keeps transaction role separate from reusable client identity", () => {
    expect(getClientTransactionPartyRelationshipType("buyer")).toBe("transaction_party:buyer");
    expect(getClientTransactionPartyRelationshipType("seller")).toBe("transaction_party:seller");
    expect(normalizeClientIdentityName("  John   & Mary Smith ")).toBe("john & mary smith");
  });

  it("builds stage-specific next actions", () => {
    const buyer = validateClientTransactionIntakeInput({
      clientName: "John Smith",
      side: "buyer",
      sourceDocumentName: "Buyer Agency.pdf",
      stage: "pre_contract"
    });
    const seller = validateClientTransactionIntakeInput({
      clientName: "John Smith",
      propertyAddress: "123 Main St",
      side: "seller",
      sourceDocumentName: "Contract.pdf",
      stage: "under_contract"
    });

    expect(getClientTransactionNextAction(buyer)).toContain("buyer representation");
    expect(getClientTransactionNextAction(seller)).toContain("executed contract");
  });
});
