import { describe, expect, it } from "vitest";
import { applyGlobalMarketingUnsubscribe, selectLinkedMarketingRelationship } from "./resend-contact-matching";

describe("Resend CRM contact matching", () => {
  const linked = { id: "a", data: { contact: { email: "qa@example.com" }, emailMarketing: { resendContactId: "contact_123", status: "eligible" } } };
  it("matches only an explicitly linked single contact", () => {
    expect(selectLinkedMarketingRelationship([linked], "contact_123", "QA@example.com")?.id).toBe("a");
    expect(selectLinkedMarketingRelationship([linked], "different", "qa@example.com")).toBeNull();
    expect(selectLinkedMarketingRelationship([linked], "contact_123", "other@example.com")).toBeNull();
    expect(selectLinkedMarketingRelationship([linked, { ...linked, id: "b" }], "contact_123", "qa@example.com")).toBeNull();
  });
  it("changes eligibility only toward an opt-out and preserves stricter restrictions", () => {
    const profile = selectLinkedMarketingRelationship([linked], "contact_123", "qa@example.com")!.profile;
    const result = applyGlobalMarketingUnsubscribe(profile, "2026-10-15T19:30:00Z");
    expect(result.emailMarketing?.status).toBe("unsubscribed");
    expect(result.emailMarketing?.optOutSource).toBe("resend");
    expect(applyGlobalMarketingUnsubscribe(result, "2026-10-16T00:00:00Z").emailMarketing?.optedOutAt).toBe("2026-10-15T19:30:00Z");
    const strict = { ...profile, emailMarketing: { ...profile.emailMarketing, status: "do_not_contact" as const } };
    expect(applyGlobalMarketingUnsubscribe(strict, "2026-10-16T00:00:00Z").emailMarketing?.status).toBe("do_not_contact");
  });
});
