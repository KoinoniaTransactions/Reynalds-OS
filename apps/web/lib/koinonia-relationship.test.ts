import { describe, expect, it } from "vitest";

import {
  mapConsultationTypeToRelationshipIntent,
  mergeKoinoniaRelationshipData,
  normalizeKoinoniaRelationshipData,
  preserveAdvancedLifecycle,
  suggestRelationshipQuickCapture
} from "./koinonia-relationship";

describe("Koinonia relationship profile", () => {
  it("maps current service consultation labels into learning intent", () => {
    expect(mapConsultationTypeToRelationshipIntent("Transaction Support")).toEqual({
      pressure: "Transaction/File Capacity",
      service: "Transaction Support / Contract-to-Close Coordination",
      path: "Keep Client"
    });

    expect(mapConsultationTypeToRelationshipIntent("Professional Open House Coverage")).toEqual({
      pressure: "Open House/Listing Capacity",
      service: "Professional Open House Coverage",
      path: "Keep Client"
    });

    expect(mapConsultationTypeToRelationshipIntent("40% Referral Partner Option")).toEqual({
      pressure: "Referral/No-Capacity Client Opportunity",
      service: "40% Referral Partner Option",
      path: "Refer Client"
    });
  });

  it("normalizes missing nested relationship data without deleting extra fields", () => {
    const result = normalizeKoinoniaRelationshipData({
      customField: "keep me",
      contact: { email: "agent@example.com" }
    });

    expect(result.customField).toBe("keep me");
    expect(result.contact?.email).toBe("agent@example.com");
    expect(result.diagnosis?.path).toBe("Undetermined");
    expect(result.growth?.repeatEngagementCount).toBe(0);
  });

  it("preserves paid campaign click identifiers in relationship attribution", () => {
    const result = normalizeKoinoniaRelationshipData({
      acquisition: {
        firstTouch: {
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: "showing-coverage",
          utmTerm: "realtor showing coverage",
          gclid: "google-click-id",
          gbraid: "google-braid",
          wbraid: "google-wbraid",
          msclkid: "microsoft-click-id"
        }
      }
    });

    expect(result.acquisition?.firstTouch).toMatchObject({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "showing-coverage",
      utmTerm: "realtor showing coverage",
      gclid: "google-click-id",
      gbraid: "google-braid",
      wbraid: "google-wbraid",
      msclkid: "microsoft-click-id"
    });
  });

  it("merges one profile section without erasing existing learning", () => {
    const result = mergeKoinoniaRelationshipData(
      {
        contact: { email: "agent@example.com", brokerage: "ABC Realty" },
        problem: { exactLanguage: "My weekends are packed." }
      },
      {
        contact: { phone: "719-555-0100" }
      }
    );

    expect(result.contact).toMatchObject({
      email: "agent@example.com",
      phone: "719-555-0100",
      brokerage: "ABC Realty"
    });
    expect(result.problem?.exactLanguage).toBe("My weekends are packed.");
  });

  it("does not downgrade an advanced lifecycle on a new consultation request", () => {
    expect(preserveAdvancedLifecycle("Active Client", "Consultation")).toBe("Active Client");
    expect(preserveAdvancedLifecycle("Proposal", "Consultation")).toBe("Proposal");
    expect(preserveAdvancedLifecycle("Lead", "Consultation")).toBe("Consultation");
  });

  it("suggests open-house relationship structure from a natural conversation note", () => {
    const result = suggestRelationshipQuickCapture(
      "Met Sarah from ABC Realty at the office meeting. She said she already has a TC but hates losing Saturdays to open houses. I gave her the tri-fold and she wants to try one standalone open house next month."
    );

    expect(result).toMatchObject({
      brokerage: "ABC Realty",
      lifecycle: "Interest",
      source: "Brokerage Meeting",
      material: "Tri-Fold Brochure",
      primaryPressure: "Open House/Listing Capacity",
      path: "Keep Client",
      requestedService: "Professional Open House Coverage",
      recommendedService: "Professional Open House Coverage",
      nextAction: "Follow up about open house coverage next month"
    });
  });

  it("keeps referral intent separate from operational support", () => {
    const result = suggestRelationshipQuickCapture(
      "Mike said he cannot take the client and asked about the 40% referral fee. We should follow up after his team meeting."
    );

    expect(result.primaryPressure).toBe("Referral/No-Capacity Client Opportunity");
    expect(result.path).toBe("Refer Client");
    expect(result.recommendedService).toBe("40% Referral Partner Option");
  });

  it("preserves confirmed interaction history while merging later profile data", () => {
    const result = mergeKoinoniaRelationshipData(
      {
        learning: {
          interactions: [
            {
              capturedAt: "2026-08-15T12:00:00.000Z",
              note: "Met at the office meeting.",
              confirmed: { source: "Brokerage Meeting" }
            }
          ]
        }
      },
      {
        contact: { brokerage: "ABC Realty" }
      }
    );

    expect(result.learning?.interactions).toHaveLength(1);
    expect(result.learning?.interactions?.[0]?.note).toBe("Met at the office meeting.");
  });
});
