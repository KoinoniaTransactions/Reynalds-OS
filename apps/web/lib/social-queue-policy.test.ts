import { describe, expect, it } from "vitest";
import { liveSocialContentProblem, liveSocialPublishingEnabled, parseSocialSchedule, readSocialSnapshot, socialQueueKey, socialRetryAt } from "./social-queue-policy";
const snapshot = { workspaceId: "w1", variantId: "v1", revision: 1, platform: "facebook", caption: "Approved copy", media: [], campaignKey: null };
describe("durable social queue policy", () => {
  it("isolates idempotency by workspace, revision, account and mode", () => {
    const key = socialQueueKey("w1", "v1", 1, "c1", "live");
    expect(socialQueueKey("w1", "v1", 1, "c1", "live")).toBe(key);
    for (const other of [socialQueueKey("w2", "v1", 1, "c1", "live"), socialQueueKey("w1", "v1", 2, "c1", "live"), socialQueueKey("w1", "v1", 1, "c2", "live"), socialQueueKey("w1", "v1", 1, null, "dry_run")]) expect(other).not.toBe(key);
  });
  it("requires both activation and owner approval", () => {
    expect(liveSocialPublishingEnabled({ SOCIAL_PUBLISHING_ENABLED: "true" })).toBe(false);
    expect(liveSocialPublishingEnabled({ SOCIAL_PUBLISHING_ENABLED: "true", SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED: "true" })).toBe(true);
  });
  it("preserves distinct daylight-saving instants and rejects naive times", () => {
    const now = Date.parse("2027-10-01T00:00:00Z");
    const a = parseSocialSchedule("2027-11-07T01:30:00-06:00", "America/Denver", now);
    const b = parseSocialSchedule("2027-11-07T01:30:00-07:00", "America/Denver", now);
    expect(b.getTime() - a.getTime()).toBe(3600000);
    expect(() => parseSocialSchedule("2027-11-07T01:30:00", "America/Denver", now)).toThrow();
    expect(() => parseSocialSchedule("2027-11-07T01:30:00Z", "Invalid/Zone", now)).toThrow();
  });
  it("rejects cross-workspace media, malformed media and path traversal", () => {
    expect(readSocialSnapshot(snapshot)).toMatchObject(snapshot);
    for (const key of ["social-preview/w2/v1/file.jpg", "social-preview/w1/v1/../secret", "social-preview/w1/v1/nested/file.jpg"]) {
      expect(() => readSocialSnapshot({ ...snapshot, media: [{ key, type: "image/jpeg", size: 100, name: "file" }] })).toThrow();
    }
    expect(() => readSocialSnapshot({ ...snapshot, media: [{}] })).toThrow();
  });
  it("caps exponential backoff and respects bounded provider retry-after", () => {
    expect(socialRetryAt(1, 0).getTime()).toBe(30000);
    expect(socialRetryAt(3, 0, 300).getTime()).toBe(300000);
    expect(socialRetryAt(100, 0, 99999999).getTime()).toBe(86400000);
  });
  it("reports unsupported content and TikTok policy without silently discarding media", () => {
    const base = readSocialSnapshot(snapshot);
    expect(liveSocialContentProblem(base)).toBeNull();
    expect(liveSocialContentProblem({ ...base, platform: "tiktok" })).toContain("policy");
    expect(liveSocialContentProblem({ ...base, platform: "instagram" })).toContain("JPEG");
    expect(liveSocialContentProblem({ ...base, platform: "linkedin", caption: "a".repeat(3001) })).toContain("3,000");
  });
});
