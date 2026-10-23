import {describe,expect,it} from "vitest";
import {evaluateTopicConsent as decide} from "./koinonia-marketing-topic-policy";
const valid={topicId:"monthly_update",consent:"opted_in" as const,permissionSource:"explicit form",permissionRecordedAt:"2026-10-01T00:00:00Z"};
describe("read-only topic evidence policy",()=>{
 it("fails closed without a topic or consent",()=>{expect(decide(undefined,"monthly_update").verified).toBe(false);expect(decide([valid],"").verified).toBe(false);});
 it("rejects missing, duplicated, revoked or undated consent",()=>{expect(decide([{...valid,consent:"opted_out"}],"monthly_update").verified).toBe(false);expect(decide([valid,valid],"monthly_update").verified).toBe(false);expect(decide([{...valid,permissionSource:""}],"monthly_update").verified).toBe(false);expect(decide([{...valid,permissionRecordedAt:"not a date"}],"monthly_update").verified).toBe(false);});
 it("recognizes local consent evidence without granting sending permission",()=>expect(decide([valid],"monthly_update")).toEqual({verified:true,reason:null}));
});
