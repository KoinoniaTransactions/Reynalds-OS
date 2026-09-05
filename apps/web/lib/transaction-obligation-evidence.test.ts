import { describe, expect, it } from "vitest";
import { getTransactionObligationEvidenceRules } from "./transaction-obligation-evidence";

describe("transaction obligation evidence", () => {
  it("maps earnest money receipt only to the earnest money obligation", () => {
    const rules = getTransactionObligationEvidenceRules("Earnest Money Receipt");
    expect(rules).toHaveLength(1);
    expect(rules[0]?.obligationKeys).toEqual(["contract.alternative-earnest-money"]);
  });

  it("maps inspection objection and resolution to different milestones", () => {
    expect(getTransactionObligationEvidenceRules("Inspection Objection")[0]?.obligationKeys).toEqual([
      "contract.inspection-objection"
    ]);
    expect(getTransactionObligationEvidenceRules("Inspection Resolution")[0]?.obligationKeys).toEqual([
      "contract.inspection-resolution"
    ]);
  });

  it("does not infer satisfaction from generic or unrelated documents", () => {
    expect(getTransactionObligationEvidenceRules("Executed Contract to Buy and Sell")).toEqual([]);
    expect(getTransactionObligationEvidenceRules("Inspection Report")).toEqual([]);
    expect(getTransactionObligationEvidenceRules("Agreement to Amend / Extend")).toEqual([]);
  });

  it("maps title commitment to delivery without satisfying objection or resolution rights", () => {
    const rules = getTransactionObligationEvidenceRules("Title Commitment");
    expect(rules[0]?.obligationKeys).toEqual(["contract.record-title"]);
  });
});
