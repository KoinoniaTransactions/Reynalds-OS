import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { buildLinkedinLoginUrl, findLinkedinOrganizationRole, linkedinCallbackUrl, linkedinOAuthConfigured, LINKEDIN_REQUIRED_SCOPES, validateLinkedinGrant } from "./social-linkedin-oauth";
beforeEach(() => {
  for (const [key, value] of Object.entries({ LINKEDIN_CLIENT_ID: "client123", LINKEDIN_CLIENT_SECRET: "test-secret", SOCIAL_CONNECTION_VAULT_KEY: "test-key", SOCIAL_LINKEDIN_OAUTH_ENABLED: "true", SOCIAL_LINKEDIN_API_VERSION: "202609", SOCIAL_LINKEDIN_ORGANIZATION_URN: "urn:li:organization:101", SOCIAL_LINKEDIN_CALLBACK_URL: "https://www.koinoniatransactions.com/api/employee/social/oauth/linkedin/callback" })) vi.stubEnv(key, value);
});
afterEach(() => vi.unstubAllEnvs());
describe("LinkedIn company authorization policy", () => {
  it("requires explicit organization, activation, credentials, API version and fixed callback", () => {
    expect(linkedinOAuthConfigured()).toBe(true);
    vi.stubEnv("SOCIAL_LINKEDIN_ORGANIZATION_URN", "urn:li:person:private"); expect(linkedinOAuthConfigured()).toBe(false);
    vi.stubEnv("SOCIAL_LINKEDIN_ORGANIZATION_URN", "urn:li:organization:101"); vi.stubEnv("SOCIAL_LINKEDIN_OAUTH_ENABLED", "false"); expect(linkedinOAuthConfigured()).toBe(false);
  });
  it("rejects unapproved callback hosts, ports, credentials and query strings", () => {
    for (const url of ["https://attacker.example/api/employee/social/oauth/linkedin/callback", "https://user:secret@www.koinoniatransactions.com/api/employee/social/oauth/linkedin/callback", "https://www.koinoniatransactions.com:8443/api/employee/social/oauth/linkedin/callback", "https://www.koinoniatransactions.com/api/employee/social/oauth/linkedin/callback?redirect=elsewhere"]) {
      vi.stubEnv("SOCIAL_LINKEDIN_CALLBACK_URL", url); expect(() => linkedinCallbackUrl()).toThrow();
    }
  });
  it("builds the provider URL with encoded single-use state and required company scopes", () => {
    const url = new URL(buildLinkedinLoginUrl("nonce with spaces"));
    expect(url.origin).toBe("https://www.linkedin.com"); expect(url.searchParams.get("state")).toBe("nonce with spaces");
    expect(url.searchParams.get("scope")).toBe(LINKEDIN_REQUIRED_SCOPES.join(" "));
  });
  it("rejects inactive, wrong-app, expired and insufficient grants", () => {
    const valid = { active: true, client_id: "client123", auth_type: "3L", expires_at: 2000000000, scope: LINKEDIN_REQUIRED_SCOPES.join(",") };
    expect(validateLinkedinGrant(valid, "client123", 1).scopes).toEqual([...LINKEDIN_REQUIRED_SCOPES]);
    for (const patch of [{ active: false }, { client_id: "other" }, { auth_type: "2L" }, { expires_at: 1 }, { scope: "w_member_social" }]) expect(() => validateLinkedinGrant({ ...valid, ...patch }, "client123")).toThrow();
  });
  it("accepts an approved publishing role for the configured organization only", () => {
    const role = { organization: "urn:li:organization:101", roleAssignee: "urn:li:person:member1", state: "APPROVED", role: "CONTENT_ADMINISTRATOR" };
    expect(findLinkedinOrganizationRole({ elements: [role] }, role.organization).matched).toBe(true);
    for (const patch of [{ state: "REQUESTED" }, { organization: "urn:li:organization:999" }, { role: "ANALYST" }]) expect(findLinkedinOrganizationRole({ elements: [{ ...role, ...patch }] }, role.organization).matched).toBe(false);
  });
});
