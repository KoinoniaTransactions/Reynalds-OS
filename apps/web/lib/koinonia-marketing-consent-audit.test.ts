import { describe, expect, it } from "vitest";
import { auditKoinoniaMarketingConsent as audit } from "./koinonia-marketing-consent-audit";
const base = {contact:{email:"qa@example.com"},emailMarketing:{status:"eligible",permissionSource:"explicit form",permissionRecordedAt:"2026-10-15T12:00:00Z",topicConsents:[{topicId:"qa",consent:"opted_in"}]}};
describe("marketing list consent audit — default deny", () => {
  it("never authorizes enrollment even with complete local evidence",()=>expect(audit(base)).toMatchObject({permissionEvidenceComplete:true,enrollmentApproved:false,action:"manual_review"}));
  it.each(["purchased","scraped","import","inferred"])("flags %s as unverified list source",source=>expect(audit({...base,emailMarketing:{...base.emailMarketing,permissionSource:source}}).reasons).toContain("permission_source_needs_review"));
  it("retains previous unsubscribe exclusion",()=>expect(audit({...base,emailMarketing:{...base.emailMarketing,optedOutAt:"2026-10-20T12:00:00Z"}}).reasons).toContain("prior_opt_out"));
  it("rejects missing topic evidence and permission date",()=>{
    expect(audit({...base,emailMarketing:{...base.emailMarketing,topicConsents:[]}}).reasons).toContain("topic_permission_unverified");
    expect(audit({...base,emailMarketing:{...base.emailMarketing,permissionRecordedAt:"future"}}).reasons).toContain("permission_date_invalid");
  });
  it("does not mutate the CRM payload",()=>{const before=JSON.stringify(base);audit(base);expect(JSON.stringify(base)).toBe(before)});
});
