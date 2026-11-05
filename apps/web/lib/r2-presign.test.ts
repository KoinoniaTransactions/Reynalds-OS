import { describe, expect, it } from "vitest";
import { presignR2Object } from "./r2-presign";
const base = { accountId: "1234567890abcdef", accessKeyId: "testaccess", secretAccessKey: "testsecret", bucket: "private-media", key: "social-preview/workspace/video/a.mp4", method: "PUT" as const, contentType: "video/mp4", now: new Date("2026-11-04T19:00:00.000Z") };
describe("R2 direct upload authorization", () => {
  it("creates a deterministic signed PUT for exactly one private key", () => {
    const url = new URL(presignR2Object(base));
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe("/private-media/social-preview/workspace/video/a.mp4");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("content-type;host");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
    expect(presignR2Object(base)).toBe(presignR2Object(base));
    expect(presignR2Object({ ...base, key: base.key + "2" })).not.toBe(presignR2Object(base));
  });
  it("never exposes the secret or permits unrestricted keys", () => {
    const url = presignR2Object(base);
    expect(url).not.toContain("testsecret");
    expect(() => presignR2Object({ ...base, key: "other-namespace/bad" })).toThrow();
    expect(() => presignR2Object({ ...base, expiresSeconds: 86400 })).toThrow();
  });
});
