import { afterEach, describe, expect, it } from "vitest";
import { buildMetaLoginUrl, metaCallbackUrl, nonceHash } from "./social-meta-oauth";

describe("Meta OAuth callback policy", () => {
  afterEach(() => {
    for (const key of ["SOCIAL_META_CALLBACK_URL", "VERCEL_ENV", "VERCEL_BRANCH_URL", "META_APP_ID", "META_BUSINESS_LOGIN_CONFIG_ID"]) delete process.env[key];
  });
  it("accepts exact permanent callback, rejects arbitrary domains and paths", () => {
    process.env.SOCIAL_META_CALLBACK_URL = "https://koinoniatransactions.com/api/employee/social/oauth/meta/callback";
    expect(metaCallbackUrl()).toContain("koinoniatransactions.com");
    process.env.SOCIAL_META_CALLBACK_URL = "https://attacker.example/api/employee/social/oauth/meta/callback";
    expect(() => metaCallbackUrl()).toThrow();
    process.env.SOCIAL_META_CALLBACK_URL = "https://koinoniatransactions.com/other";
    expect(() => metaCallbackUrl()).toThrow();
  });
  it("supports one fixed preview branch callback and encodes state", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_BRANCH_URL = "demo-koinonia.vercel.app";
    process.env.SOCIAL_META_CALLBACK_URL = "https://demo-koinonia.vercel.app/api/employee/social/oauth/meta/callback";
    process.env.META_APP_ID = "app123";
    process.env.META_BUSINESS_LOGIN_CONFIG_ID = "config123";
    const url = new URL(buildMetaLoginUrl("nonce abc"));
    expect(url.searchParams.get("state")).toBe("nonce abc");
    expect(url.searchParams.get("config_id")).toBe("config123");
    expect(url.searchParams.get("redirect_uri")).toBe(process.env.SOCIAL_META_CALLBACK_URL);
    expect(nonceHash("a")).not.toEqual(nonceHash("b"));
  });
});
