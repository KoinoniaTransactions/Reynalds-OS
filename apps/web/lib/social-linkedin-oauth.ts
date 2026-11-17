export const LINKEDIN_OAUTH_COOKIE = "koinonia_linkedin_oauth_state";
export const LINKEDIN_REQUIRED_SCOPES = ["r_organization_admin", "w_organization_social", "r_organization_social"] as const;
export function linkedinCallbackUrl() {
  const url = new URL(process.env.SOCIAL_LINKEDIN_CALLBACK_URL ?? "");
  const allowed = ["koinoniatransactions.com", "www.koinoniatransactions.com"].includes(url.hostname) ||
    (process.env.VERCEL_ENV === "preview" && url.hostname === process.env.VERCEL_BRANCH_URL);
  if (!allowed || url.protocol !== "https:" || url.port || url.username || url.password || url.search || url.hash || url.pathname !== "/api/employee/social/oauth/linkedin/callback") throw new Error("Unapproved LinkedIn callback");
  return url.href;
}
export function linkedinOrganizationUrn() {
  const urn = process.env.SOCIAL_LINKEDIN_ORGANIZATION_URN ?? "";
  if (!/^urn:li:organization:\d{1,30}$/.test(urn)) throw new Error("LinkedIn organization must be explicitly configured");
  return urn;
}
export function linkedinOAuthConfigured() {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET || !process.env.SOCIAL_CONNECTION_VAULT_KEY ||
      process.env.SOCIAL_LINKEDIN_OAUTH_ENABLED !== "true" || !/^20\d{4}$/.test(process.env.SOCIAL_LINKEDIN_API_VERSION ?? "")) return false;
  try { linkedinCallbackUrl(); linkedinOrganizationUrn(); return true; } catch { return false; }
}
export function buildLinkedinLoginUrl(state: string) {
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code"); url.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", linkedinCallbackUrl()); url.searchParams.set("state", state);
  url.searchParams.set("scope", LINKEDIN_REQUIRED_SCOPES.join(" "));
  return url.href;
}
export function linkedinRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Malformed LinkedIn response");
  return value as Record<string, unknown>;
}
export function validateLinkedinGrant(value: unknown, clientId: string, now = Date.now()) {
  const record = linkedinRecord(value);
  if (record.active !== true || record.client_id !== clientId || record.auth_type !== "3L" ||
      typeof record.expires_at !== "number" || !Number.isSafeInteger(record.expires_at) || record.expires_at * 1000 <= now || typeof record.scope !== "string") throw new Error("LinkedIn grant invalid or expired");
  const scopes = record.scope.split(/[\s,]+/).filter(Boolean);
  if (!LINKEDIN_REQUIRED_SCOPES.every(scope => scopes.includes(scope))) throw new Error("LinkedIn permissions missing");
  return { scopes, expiresAt: new Date(record.expires_at * 1000) };
}
export function findLinkedinOrganizationRole(value: unknown, organization: string) {
  const response = linkedinRecord(value);
  if (!Array.isArray(response.elements) || response.elements.length > 100) throw new Error("Invalid LinkedIn roles response");
  const roles = response.elements.map(linkedinRecord);
  const matched = roles.some(role => role.organization === organization && role.state === "APPROVED" &&
    ["ADMINISTRATOR", "CONTENT_ADMINISTRATOR", "CONTENT_ADMIN"].includes(String(role.role)) && /^urn:li:person:[\w-]+$/.test(String(role.roleAssignee)));
  const paging = response.paging ? linkedinRecord(response.paging) : {};
  if (paging.links !== undefined && !Array.isArray(paging.links)) throw new Error("Invalid LinkedIn paging");
  return { matched, hasNext: Array.isArray(paging.links) && paging.links.some(link => linkedinRecord(link).rel === "next") };
}
export async function linkedinJson(endpoint: "accessToken" | "introspectToken" | "organizationAcls", input: { form?: URLSearchParams; token?: string; start?: number }) {
  const url = endpoint === "organizationAcls" ? new URL("https://api.linkedin.com/rest/organizationAcls") : new URL("https://www.linkedin.com/oauth/v2/" + endpoint);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (endpoint === "organizationAcls") {
    url.searchParams.set("q", "roleAssignee"); url.searchParams.set("state", "APPROVED"); url.searchParams.set("count", "100"); url.searchParams.set("start", String(input.start ?? 0));
    headers.Authorization = "Bearer " + input.token;
    headers["Linkedin-Version"] = process.env.SOCIAL_LINKEDIN_API_VERSION ?? ""; headers["X-Restli-Protocol-Version"] = "2.0.0";
  }
  const response = await fetch(url, { method: input.form ? "POST" : "GET", headers, ...(input.form ? { body: input.form } : {}), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("LinkedIn authorization request failed");
  return linkedinRecord(await response.json());
}
