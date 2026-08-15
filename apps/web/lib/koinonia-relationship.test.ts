import { describe, expect, it } from "vitest";

import {
  mapConsultationTypeToRelationshipIntent,
  mergeKoinoniaRelationshipData,
  normalizeKoinoniaRelationshipData,
  preserveAdvancedLifecycle
} from "./koinonia-relationship";

describe("Koinonia relationship profile", () => {
  it("maps current service consultation labels into learning intent", () => {
    expect(mapConsultationTypeToRelationshipIntent("Transaction Support")).toEqual({
      pressure: "Transaction/File Capacity",
      service: "Transaction Support / Contract-to-Close Coordination"
    });

    expect(mapConsultationTypeToRelationshipIntent("Professional Open House Coverage")).toEqual({
      pressure: "Open House/Listing Capacity",
      service: "Professional Open House Coverage"
    });

    expect(mapConsultationTypeToRelationshipIntent("40% Referral Partner Option")).toEqual({
      pressure: "Referral/No-Capacity Client Opportunity",
      service: "40% Referral Partner Option"
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
});
