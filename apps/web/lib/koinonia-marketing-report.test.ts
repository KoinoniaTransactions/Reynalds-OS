import { describe, expect, it } from "vitest";
import { buildKoinoniaMarketingReport } from "./koinonia-marketing-report";
import { evaluateKoinoniaMarketingEligibility } from "./koinonia-marketing-eligibility";
describe("evidence-based acquisition reporting", () => {
  it("separates competitors and preserves unknown measurements", () => {
    const report = buildKoinoniaMarketingReport([{ status: "Lead", data: { contact: { audienceType: "competitor" } } }, { status: "Lead", data: {} }]);
    expect(report).toMatchObject({ relationships: 1, competitors: 1, unclassified: 1, websiteVisits: null, landingPageConversionRate: null, socialImpressions: null });
    expect(report.campaigns[0].campaign).toBe("Unattributed");
  });
  it("uses conversion tags ahead of staff campaign labels and does not double-count revenue", () => {
    const report = buildKoinoniaMarketingReport([{ status: "Client", data: { acquisition: { campaign: "manual", conversionTouch: { utmCampaign: "tagged-campaign" } }, engagement: { firstEngagementRevenue: 450 }, growth: { cumulativeRevenue: 900 }, consultationRequest: { submittedAt: "2026-11-01T12:00:00Z" } } }]);
    expect(report).toMatchObject({ customers: 1, recordedRevenue: 900, consultationRequests: 1 });
    expect(report.campaigns[0]).toMatchObject({ campaign: "tagged-campaign", tagged: 1, staffRecorded: 0, recordedRevenue: 900 });
  });
  it("never lets competitor classification authorize a customer marketing send", () => {
    const decision = evaluateKoinoniaMarketingEligibility({ contact: { email: "test@example.com", audienceType: "competitor" }, emailMarketing: { status: "eligible", permissionSource: "documented", permissionRecordedAt: "2026-01-01T00:00:00Z" } }, "verified_clear");
    expect(decision.eligible).toBe(false); expect(decision.reasons).toContain("competitor_excluded");
  });
});
