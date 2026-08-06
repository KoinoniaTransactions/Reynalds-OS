import {
  describe,
  expect,
  it
} from "vitest";

import {
  PERSONAL_FINANCE_AUTO_PRESELECT_CONFIDENCE,
  recommendedPersonalFinanceTargetKey
} from "./personal-finance-transaction-reconciliation-guidance";

describe("personal finance reconciliation guidance", () => {
  const suggestions = [
    {
      targetKey: "bill:first",
      confidence: 0.6
    },
    {
      targetKey: "category:second",
      confidence: 0.58
    }
  ];

  it("does not preselect an ambiguous suggestion", () => {
    expect(
      recommendedPersonalFinanceTargetKey({
        suggestions,
        isAmbiguous: true
      })
    ).toBeNull();

    expect(suggestions).toHaveLength(2);
  });

  it("preselects an unambiguous suggestion at the existing threshold", () => {
    expect(
      recommendedPersonalFinanceTargetKey({
        suggestions: [
          {
            targetKey: "bill:threshold",
            confidence:
              PERSONAL_FINANCE_AUTO_PRESELECT_CONFIDENCE
          }
        ],
        isAmbiguous: false
      })
    ).toBe("bill:threshold");
  });

  it("keeps low-confidence and no-evidence results manual", () => {
    expect(
      recommendedPersonalFinanceTargetKey({
        suggestions: [
          {
            targetKey: "bill:low",
            confidence: 0.49
          }
        ],
        isAmbiguous: false
      })
    ).toBeNull();

    expect(
      recommendedPersonalFinanceTargetKey({
        suggestions: [],
        isAmbiguous: false
      })
    ).toBeNull();
  });
});
