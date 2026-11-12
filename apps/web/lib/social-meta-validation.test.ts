import { describe, expect, it } from "vitest";
import { parseMetaPages, validateMetaGrant } from "./social-meta-validation";

describe("Meta authorization response validation", () => {
  const data = { is_valid: true, app_id: "123", scopes: ["pages_manage_posts"], expires_at: 2000000000 };
  it("rejects malformed, wrong-app, expired and falsely valid grants", () => {
    for (const response of [null, {}, { data: null }, { data: { ...data, app_id: "other" } },
      { data: { ...data, is_valid: "true" } }, { data: { ...data, scopes: "pages_manage_posts" } },
      { data: { ...data, expires_at: 1 } }, { data: { ...data, data_access_expires_at: 1 } }]) {
      expect(() => validateMetaGrant(response, "123")).toThrow();
    }
  });
  it("uses the earliest token or data-access expiry", () => {
    const grant = validateMetaGrant({ data: { ...data, data_access_expires_at: 1900000000 } }, "123", 1);
    expect(grant.expiresAt?.getTime()).toBe(1900000000000);
    expect(grant.scopes).toEqual(["pages_manage_posts"]);
  });
  it("never substitutes a user token for absent page credentials", () => {
    expect(() => parseMetaPages({ data: [{ id: "1", name: "Page" }] })).toThrow();
    expect(() => parseMetaPages({ data: [{ id: "../../me", name: "Page", access_token: "token" }] })).toThrow();
  });
  it("extracts a bounded cursor instead of following a provider URL", () => {
    expect(parseMetaPages({ data: [{ id: "1", name: "Page", access_token: "token", instagram_business_account: { id: "2" } }],
      paging: { next: "https://untrusted.example/?secret=value", cursors: { after: "safe-cursor" } } })).toMatchObject({ after: "safe-cursor", pages: [{ id: "1", instagram: { id: "2" } }] });
    expect(() => parseMetaPages({ data: [], paging: { next: "https://untrusted.example" } })).toThrow();
  });
});
