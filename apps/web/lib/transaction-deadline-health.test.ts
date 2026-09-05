import { describe, expect, it } from "vitest";
import { evaluateTransactionDeadlineHealth } from "./transaction-deadline-health";

describe("transaction deadline health", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");

  it("flags an expired seller listing for Amend Extend review", () => {
    const health = evaluateTransactionDeadlineHealth({
      side: "seller",
      stage: "pre_contract",
      listingExpirationDate: "2026-08-31",
      now
    });

    expect(health.status).toBe("review");
    expect(health.alerts).toContainEqual(
      expect.objectContaining({
        kind: "listing_expired",
        recommendedDocument: "Listing Contract Amend / Extend"
      })
    );
  });

  it("does not flag a seller listing whose expiration is today or later", () => {
    const today = evaluateTransactionDeadlineHealth({
      side: "seller",
      stage: "pre_contract",
      listingExpirationDate: "2026-09-01",
      now
    });
    const future = evaluateTransactionDeadlineHealth({
      side: "seller",
      stage: "pre_contract",
      listingExpirationDate: "2026-09-10",
      now
    });

    expect(today.alerts).toHaveLength(0);
    expect(future.alerts).toHaveLength(0);
  });

  it("flags passed under-contract deadlines for human review", () => {
    const health = evaluateTransactionDeadlineHealth({
      side: "buyer",
      stage: "under_contract",
      deadlines: {
        "Inspection Objection": "2026-08-29",
        "Loan Conditions": "2026-09-10"
      },
      now
    });

    expect(health.alerts).toHaveLength(1);
    expect(health.alerts[0]).toMatchObject({
      kind: "contract_deadline_passed",
      deadlineName: "Inspection Objection",
      recommendedDocument: "Agreement to Amend / Extend"
    });
  });

  it("does not create contract deadline alerts before the file is under contract", () => {
    const health = evaluateTransactionDeadlineHealth({
      side: "buyer",
      stage: "pre_contract",
      deadlines: { "Inspection Objection": "2026-08-29" },
      now
    });

    expect(health.status).toBe("clear");
    expect(health.alerts).toHaveLength(0);
  });
});
