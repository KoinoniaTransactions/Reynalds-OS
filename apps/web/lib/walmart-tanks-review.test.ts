import { describe, expect, it } from "vitest";

import {
  extractWalmartTanksIdentifiers,
  getWalmartTanksReviewCategory,
  getWalmartTanksWorkBuckets
} from "./walmart-tanks-review";

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

describe("WalMart Tanks work bucket detection", () => {
  it("detects ACC, UCO, and paperwork from doubled WM completion subjects", () => {
    expect(
      getWalmartTanksWorkBuckets(
        "Re: store: WM WM- 5172 02-15-2026 ACC Walmart ACC UCO Work Completion [^] Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com"
      )
    ).toEqual(["acc", "uco", "pw"]);
  });

  it("detects NHM UCO replacement subjects", () => {
    expect(
      getWalmartTanksWorkBuckets("NHM 7251 - Fort Worth UCO Tank Replacement")
    ).toEqual(["uco"]);
  });

  it("detects LxRetail workflow paperwork for UCO projects", () => {
    expect(
      getWalmartTanksWorkBuckets("[LxRetail] 4801.1015 Riverview FL UCO Tank Replacement Workflow Updated")
    ).toEqual(["uco", "pw"]);
  });

  it("detects ACC gauge work without forcing UCO", () => {
    expect(
      getWalmartTanksWorkBuckets("Waste water tank ACC analog gauge store 4201 Edgewood, NM")
    ).toEqual(["acc"]);
  });
});

describe("WalMart Tanks identifier extraction", () => {
  it("extracts doubled WM store numbers from completion subjects", () => {
    expect(
      extractWalmartTanksIdentifiers("Re: store: WM WM- 5172 02-15-2026 ACC Walmart ACC UCO Work Completion [^]")
    ).toMatchObject({
      storeNumbers: ["5172"],
      workOrderNumbers: [],
      purchaseOrderNumbers: []
    });
  });

  it("extracts NHM and Sam's Club store numbers", () => {
    expect(
      extractWalmartTanksIdentifiers("NHM 7251 Fort Worth TX and Sam's Club 6217 Doral FL")
    ).toMatchObject({
      storeNumbers: ["7251", "6217"]
    });
  });

  it("extracts LxRetail workflow identifiers as work orders", () => {
    expect(
      extractWalmartTanksIdentifiers("[LxRetail] 4801.1015 Riverview FL UCO Tank Replacement Workflow Updated")
    ).toMatchObject({
      storeNumbers: [],
      workOrderNumbers: ["4801.1015"]
    });
  });

  it("extracts labeled purchase orders without treating dates as purchase orders", () => {
    expect(
      extractWalmartTanksIdentifiers("WM 3826 Lubbock TX PO: PO-77812 install scheduled 03-31-2026")
    ).toMatchObject({
      storeNumbers: ["3826"],
      purchaseOrderNumbers: ["PO-77812"]
    });
  });
});
