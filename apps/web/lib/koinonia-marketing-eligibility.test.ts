import { describe, expect, it } from "vitest";
import { evaluateKoinoniaMarketingEligibility as evaluate, previewKoinoniaMarketingProvisioning as preview } from "./koinonia-marketing-eligibility";

const allowed = {
  contact: { email: " QA@Example.com " },
  emailMarketing: { status: "eligible", permissionSource: "explicit opt-in", permissionRecordedAt: "2026-10-15T12:00:00Z" }
};
describe("marketing eligibility: default deny", () => {
  it("requires external provider check", () => {
    expect(evaluate(allowed).reasons).toContain("provider_unverified");
  });
  it("only returns eligible for review, never sends", () => {
    expect(preview(allowed, "verified_clear")).toEqual({ eligible: true, email: "qa@example.com", reasons: [], action: "eligible_for_review" });
  });
  it.each(["unknown","unsubscribed","do_not_contact"])("denies %s", status => {
    expect(evaluate({ ...allowed, emailMarketing: { ...allowed.emailMarketing, status } }, "verified_clear").eligible).toBe(false);
  });
  it("requires source and valid opt-in date", () => {
    expect(evaluate({ ...allowed, emailMarketing: { status: "eligible" } }, "verified_clear").eligible).toBe(false);
    for (const date of ["invalid", "2999-01-01T00:00:00Z", "2026-10-15"]) {
      expect(evaluate({ ...allowed, emailMarketing: { ...allowed.emailMarketing, permissionRecordedAt: date } }, "verified_clear").reasons).toContain("permission_date_invalid");
    }
  });
  it("honors historic opt-out even if status later eligible", () => {
    expect(evaluate({ ...allowed, emailMarketing: { ...allowed.emailMarketing, optedOutAt: "2026-10-15T16:00:00Z" } }, "verified_clear").reasons).toContain("prior_opt_out");
  });
  it("denies provider suppression and invalid emails", () => {
    expect(evaluate(allowed, "suppressed").reasons).toContain("provider_suppressed");
    expect(evaluate({ ...allowed, contact: { email: "bad" } }, "verified_clear").reasons).toContain("invalid_email");
  });
  it("does not mutate the input", () => {
    const before = JSON.stringify(allowed);
    preview(allowed, "verified_clear");
    expect(JSON.stringify(allowed)).toBe(before);
  });
});
