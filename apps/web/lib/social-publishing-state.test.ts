import { describe, expect, it } from "vitest";
import { canQueueApprovedSocialVariant, canTransitionSocialVariant, nextEditedSocialRevision, socialPublishingGloballyEnabled } from "./social-publishing-state";

describe("social publishing safety gate", () => {
  it("requires owner-approved current revision and both enable flags", () => {
    const valid = { status: "approved" as const, revision: 3, approvedRevision: 3, connectionStatus: "connected", globalEnabled: true, channelEnabled: true };
    expect(canQueueApprovedSocialVariant(valid)).toBe(true);
    expect(canQueueApprovedSocialVariant({ ...valid, approvedRevision: 2 })).toBe(false);
    expect(canQueueApprovedSocialVariant({ ...valid, globalEnabled: false })).toBe(false);
    expect(canQueueApprovedSocialVariant({ ...valid, channelEnabled: false })).toBe(false);
    expect(canQueueApprovedSocialVariant({ ...valid, connectionStatus: "expired" })).toBe(false);
  });
  it("requires reapproval after editing", () => {
    expect(nextEditedSocialRevision(2)).toEqual({ revision: 3, status: "draft" });
    expect(canTransitionSocialVariant("draft", "published")).toBe(false);
    expect(canTransitionSocialVariant("in_review", "approved")).toBe(true);
  });
  it("defaults to disabled", () => {
    expect(socialPublishingGloballyEnabled(undefined)).toBe(false);
    expect(socialPublishingGloballyEnabled("TRUE")).toBe(false);
    expect(socialPublishingGloballyEnabled("true")).toBe(true);
  });
});
