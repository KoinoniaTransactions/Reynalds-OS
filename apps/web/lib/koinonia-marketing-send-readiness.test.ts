import { describe, expect, it } from "vitest";
import { evaluateKoinoniaSendReadiness as check } from "./koinonia-marketing-send-readiness";
const valid = {fromDomain:"koinoniatransactions.com",replyTo:"hello@koinoniatransactions.com",
 postalAddress:"123 Test Street, Test City, CO 00000",unsubscribeMechanismVerified:true,
 recipientSuppressionVerified:true,listPermissionReviewed:true,senderAuthenticationVerified:true,
 reputationRampApproved:true,ownerCampaignApproval:true};
describe("outbound send-readiness policy is pure and fail closed", () => {
 it("blocks every missing requirement",()=>{
  const r=check({});
  expect(r.sendingEnabled).toBe(false);
  expect(r.reasons).toContain("postal_address_missing");
  expect(r.reasons).toContain("unsubscribe_flow_unverified");
  expect(r.reasons).toContain("owner_approval_required");
 });
 it("rejects admin domain for customer-facing campaigns",()=>{
  expect(check({...valid,fromDomain:"koinoniaadmin.com"}).reasons).toContain("sender_domain_unverified");
  expect(check({...valid,replyTo:"billing@koinoniaadmin.com"}).reasons).toContain("reply_to_unverified");
 });
 it("never authorizes sending even when all declarations are true",()=>{
  expect(check(valid)).toEqual({checksPassed:true,sendingEnabled:false,enrollmentApproved:false,action:"manual_review",reasons:[]});
 });
 it("does not mutate input",()=>{const before=JSON.stringify(valid);check(valid);expect(JSON.stringify(valid)).toBe(before)});
});
