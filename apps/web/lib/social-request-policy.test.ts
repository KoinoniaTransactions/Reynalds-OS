import { describe, expect, it } from "vitest";
import { isSameOriginSocialMutation } from "./social-request-policy";
describe("social mutation CSRF boundary", () => {
  it("accepts same-origin browser writes only", () => {
    const url = "https://preview.example/api/employee/social/posts";
    expect(isSameOriginSocialMutation(new Request(url, { headers: { origin: "https://preview.example" } }))).toBe(true);
    for (const origin of ["https://attacker.example", "null", "https://preview.example:8443"]) {
      expect(isSameOriginSocialMutation(new Request(url, { headers: { origin } }))).toBe(false);
    }
    expect(isSameOriginSocialMutation(new Request(url))).toBe(false);
    expect(isSameOriginSocialMutation(new Request(url, { headers: { origin: "https://preview.example", "sec-fetch-site": "cross-site" } }))).toBe(false);
  });
});
