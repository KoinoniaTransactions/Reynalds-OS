import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculatePersonalFinanceNetWorth
} from "./personal-finance-net-worth-local";

describe(
  "personal finance net worth",
  () => {
    it(
      "calculates assets minus liabilities",
      () => {
        const result =
          calculatePersonalFinanceNetWorth(
            [
              {
                id: "home",
                name: "Primary home",
                valueCents:
                  350_000_00
              },
              {
                id: "vehicle",
                name: "Vehicle",
                valueCents:
                  30_000_00
              },
              {
                id: "cash",
                name: "Cash",
                valueCents:
                  15_000_00
              }
            ],
            [
              {
                id: "mortgage",
                name: "Mortgage",
                currentBalanceCents:
                  240_000_00,
                linkedAssetId:
                  "home"
              },
              {
                id: "auto-loan",
                name: "Auto loan",
                currentBalanceCents:
                  18_000_00,
                linkedAssetId:
                  "vehicle"
              },
              {
                id: "credit-card",
                name: "Credit card",
                currentBalanceCents:
                  2_000_00
              }
            ]
          );

        expect(
          result.totalAssetsCents
        ).toBe(395_000_00);

        expect(
          result.totalLiabilitiesCents
        ).toBe(260_000_00);

        expect(
          result.netWorthCents
        ).toBe(135_000_00);

        expect(
          result.unlinkedLiabilityCents
        ).toBe(2_000_00);
      }
    );

    it(
      "calculates equity for financed assets",
      () => {
        const result =
          calculatePersonalFinanceNetWorth(
            [
              {
                id: "home",
                name: "Primary home",
                valueCents:
                  350_000_00
              }
            ],
            [
              {
                id: "mortgage",
                name: "Mortgage",
                currentBalanceCents:
                  240_000_00,
                linkedAssetId:
                  "home"
              }
            ]
          );

        expect(
          result.assetEquity
        ).toEqual([
          {
            assetId: "home",
            assetName:
              "Primary home",
            assetValueCents:
              350_000_00,
            linkedLiabilityCents:
              240_000_00,
            equityCents:
              110_000_00
          }
        ]);
      }
    );

    it(
      "allows negative equity",
      () => {
        const result =
          calculatePersonalFinanceNetWorth(
            [
              {
                id: "vehicle",
                name: "Vehicle",
                valueCents:
                  15_000_00
              }
            ],
            [
              {
                id: "auto-loan",
                name: "Auto loan",
                currentBalanceCents:
                  20_000_00,
                linkedAssetId:
                  "vehicle"
              }
            ]
          );

        expect(
          result.assetEquity[0]
            ?.equityCents
        ).toBe(-5_000_00);
      }
    );
  }
);
