import { createHash, randomBytes } from "node:crypto";

export const META_GRAPH_VERSION = "v25.0";
export const META_OAUTH_COOKIE = "koinonia_meta_oauth_state";

export function metaOAuthConfigured() {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET &&
    process.env.META_BUSINESS_LOGIN_CONFIG_ID && process.env.SOCIAL_META_CALLBACK_URL &&
    process.env.SOCIAL_CONNECTION_VAULT_KEY && process.env.SOCIAL_META_OAUTH_ENABLED === "true");
}

export function metaCallbackUrl(): string {
  const raw = process.env.SOCIAL_META_CALLBACK_URL ?? "";
  const url = new URL(raw);
  const permitted = url.hostname === "koinoniatransactions.com" ||
    url.hostname === "www.koinoniatransactions.com" ||
    (process.env.VERCEL_ENV === "preview" && url.hostname === process.env.VERCEL_BRANCH_URL);
  if (url.protocol !== "https:" || !permitted ||
    url.pathname !== "/api/employee/social/oauth/meta/callback" || url.search || url.hash) {
    throw new Error("Unapproved Meta OAuth callback URL");
  }
  return url.href;
}

export function nonceHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
export function newMetaOAuthState() {
  return randomBytes(32).toString("base64url");
}
export function buildMetaLoginUrl(state: string) {
  const destination = new URL("https://www.facebook.com/" + META_GRAPH_VERSION + "/dialog/oauth");
  destination.searchParams.set("client_id", process.env.META_APP_ID ?? "");
  destination.searchParams.set("config_id", process.env.META_BUSINESS_LOGIN_CONFIG_ID ?? "");
  destination.searchParams.set("redirect_uri", metaCallbackUrl());
  destination.searchParams.set("response_type", "code");
  destination.searchParams.set("state", state);
  return destination.toString();
}
export function safeSocialSettingsRedirect(status: "connected" | "denied" | "invalid" | "unavailable") {
  return "/employee/social?tab=accounts&meta=" + encodeURIComponent(status);
}
