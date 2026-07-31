import { describe, expect, it } from "vitest";

import { getWalmartTanksReviewCategory } from "./walmart-tanks-review";

describe("WalMart Tanks review categorization", () => {
  it("flags missing city and state review items", () => {
    expect(
      getWalmartTanksReviewCategory({
        subject: "Re: store: WM 1118 ACC Walmart ACC UCO Work Completion",
        sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
        reviewReason: "Needs city/state before filing to a store card."
      })
    ).toBe("Needs city/state");
  });

  it("flags multi-store invoice subjects", () => {
    expect(
      getWalmartTanksReviewCategory({
        subject: "Walmart 1590 Hialeah FL, Sam's Club 6217 Doral, FL invoices",
        sender: "Roy Payne via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
        reviewReason: "Multiple store numbers need split review.",
        city: "Hialeah",
        state: "FL"
      })
    ).toBe("Multi-store");
  });

  it("flags vendor statements separately from job mail", () => {
    expect(
      getWalmartTanksReviewCategory({
        subject: "Vendor statement for Walmart tank invoices",
        sender: "billing@example.com",
        reviewReason: "Vendor statement needs accounting review.",
        city: "Doral",
        state: "FL"
      })
    ).toBe("Vendor statement");
  });

  it("keeps normal ACC/UCO completion mail in manual review when only job clues are present", () => {
    expect(
      getWalmartTanksReviewCategory({
        subject: "Re: store: WM WM- 5172 ACC Walmart ACC UCO Work Completion [^]",
        sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
        city: "Perry",
        state: "FL"
      })
    ).toBe("Manual review");
  });
});
