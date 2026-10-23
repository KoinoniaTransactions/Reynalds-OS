import { describe, expect, it } from "vitest";
import { reconcileKoinoniaResendContact as reconcile } from "./koinonia-resend-reconciliation";
const profile = { contact: { email: "agent@example.com" }, emailMarketing: { status: "eligible", permissionSource: "signed opt-in", permissionRecordedAt: "2026-10-15T12:00:00Z", resendContactId: "contact_abc" } };
describe("Koinonia Resend identity reconciliation (read only)", () => {
  it("recognizes an exact ID and email match but never authorizes enrollment", () => {
    expect(reconcile(profile,{ state:"found",id:"contact_abc",email:"Agent@Example.com",unsubscribed:false })).toMatchObject({matched:true,identityMatched:true,marketingEligible:false,providerUnsubscribed:false,enrollmentApproved:false,action:"manual_review"});
  });
  it("rejects same email with a different contact ID", () => {
    expect(reconcile(profile,{ state:"found",id:"other",email:"agent@example.com",unsubscribed:false }).reasons).toContain("contact_id_mismatch");
  });
  it("rejects same ID paired with a different email", () => {
    expect(reconcile(profile,{ state:"found",id:"contact_abc",email:"other@example.com",unsubscribed:false }).reasons).toContain("email_mismatch");
  });
  it("flags provider unsubscribe", () => {
    const result = reconcile(profile,{ state:"found",id:"contact_abc",email:"agent@example.com",unsubscribed:true });
    expect(result.reasons).toContain("provider_unsubscribed");
    expect(result).toMatchObject({identityMatched:true,marketingEligible:false,providerUnsubscribed:true,matched:true,enrollmentApproved:false});
  });
  it.each(["unavailable","ambiguous","not_found"] as const)("fails closed on provider %s", state => {
    expect(reconcile(profile,{state}).identityMatched).toBe(false);
  });
  it("refuses to infer identity by email", () => {
    const p={...profile,emailMarketing:{...profile.emailMarketing,resendContactId:""}};
    expect(reconcile(p,{ state:"found",id:"contact_abc",email:"agent@example.com",unsubscribed:false }).reasons).toContain("unlinked_identity");
  });
  it("never mutates profile", () => {
    const before=JSON.stringify(profile);
    reconcile(profile,{state:"not_found"});
    expect(JSON.stringify(profile)).toBe(before);
  });
});
