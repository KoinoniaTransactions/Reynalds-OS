import { describe, expect, it } from "vitest";
import { evaluateKoinoniaProviderDecision as evaluate } from "./koinonia-marketing-provider-decision";
const profile = {contact:{email:"qa@example.com"},emailMarketing:{status:"eligible",permissionSource:"signed opt in",permissionRecordedAt:"2026-10-15T12:00:00Z",resendContactId:"qa-id"}};
const contact = {state:"found" as const,id:"qa-id",email:"QA@Example.com",unsubscribed:false};
const clear = {state:"not_found" as const};
describe("combined provider policy (pure and fail closed)", () => {
  it("never approves enrollment even when identity, CRM and suppression lookup clear", () => {
    expect(evaluate(profile,contact,clear)).toMatchObject({identityMatched:true,marketingEligible:false,enrollmentApproved:false,reasons:["provider_unverified","topic_permission_unverified","provider_topic_unverified"]});
  });
  it("does not confuse missing suppression with global unsubscribe", () => {
    const d=evaluate(profile,{...contact,unsubscribed:true},clear);
    expect(d).toMatchObject({identityMatched:true,providerUnsubscribed:true,enrollmentApproved:false});
    expect(d.reasons).toContain("provider_unsubscribed");
  });
  it.each(["bounce","complaint","manual"] as const)("blocks %s", origin => {
    expect(evaluate(profile,contact,{state:"suppressed",origin,observedAt:"2026-10-22T12:00:00Z"}).reasons).toContain("provider_suppressed");
  });
  it("blocks unavailable suppression", () => {
    expect(evaluate(profile,contact,{state:"unavailable"}).reasons).toContain("suppression_unverified");
  });
  it("blocks unknown provider and identity mismatch", () => {
    expect(evaluate(profile,{state:"unavailable"},clear).identityMatched).toBe(false);
    expect(evaluate(profile,{...contact,id:"wrong"},clear).reasons).toContain("contact_id_mismatch");
  });
  it("keeps approval disabled with valid exact-topic permission and clear provider", () => {
    const p={...profile,emailMarketing:{...profile.emailMarketing,topicConsents:[{
      topicId:"b19acea4-8f2e-44b8-bd20-478f89b4ec20",
      consent:"opted_in",permissionSource:"test consent",permissionRecordedAt:"2026-10-22T12:00:00Z"
    }]}};
    const d=evaluate(p,contact,clear);
    expect(d.reasons).not.toContain("topic_permission_unverified");
    expect(d.reasons).toContain("provider_topic_unverified");
    expect(d).toMatchObject({marketingEligible:false,enrollmentApproved:false});
  });
  it.each(["bounce","complaint","manual"] as const)("fails closed on %s even with valid exact-topic permission", origin => {
    const p={...profile,emailMarketing:{...profile.emailMarketing,topicConsents:[{
      topicId:"b19acea4-8f2e-44b8-bd20-478f89b4ec20",consent:"opted_in",
      permissionSource:"explicit test",permissionRecordedAt:"2026-10-22T12:00:00Z"
    }]}};
    const d=evaluate(p,contact,{state:"suppressed",origin,observedAt:"2026-10-22T12:00:00Z"});
    expect(d.reasons).toContain("provider_suppressed");
    expect(d.enrollmentApproved).toBe(false);
  });
  it("preserves historical CRM opt out even if status reads eligible", () => {
    const p={...profile,emailMarketing:{...profile.emailMarketing,optedOutAt:"2026-10-20T12:00:00Z"}};
    expect(evaluate(p,contact,clear).reasons).toContain("prior_opt_out");
  });
});
