import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { metaOAuthConfigured } from "../../../../../lib/social-meta-oauth";
import { linkedinOAuthConfigured } from "../../../../../lib/social-linkedin-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const providers = [
  { platform: "facebook", label: "Facebook Pages", settings: ["META_APP_ID", "META_APP_SECRET", "META_BUSINESS_LOGIN_CONFIG_ID", "SOCIAL_META_CALLBACK_URL", "SOCIAL_CONNECTION_VAULT_KEY", "SOCIAL_META_OAUTH_ENABLED"], portal: "https://developers.facebook.com/apps/", capabilities: ["Page authentication", "Page selection", "Page publishing permissions"] },
  { platform: "instagram", label: "Instagram Professional", settings: ["META_APP_ID", "META_APP_SECRET", "META_BUSINESS_LOGIN_CONFIG_ID", "SOCIAL_META_CALLBACK_URL", "SOCIAL_CONNECTION_VAULT_KEY", "SOCIAL_META_OAUTH_ENABLED"], portal: "https://developers.facebook.com/apps/", capabilities: ["Professional account discovery", "Instagram publishing permissions"] },
  { platform: "linkedin", label: "LinkedIn", settings: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "SOCIAL_LINKEDIN_CALLBACK_URL", "SOCIAL_LINKEDIN_ORGANIZATION_URN", "SOCIAL_LINKEDIN_API_VERSION", "SOCIAL_CONNECTION_VAULT_KEY", "SOCIAL_LINKEDIN_OAUTH_ENABLED"], portal: "https://www.linkedin.com/developers/apps", capabilities: ["Owner authorization", "Configured company-page role verification", "Token introspection and encrypted grants"] },
  { platform: "tiktok", label: "TikTok", settings: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"], portal: "https://developers.tiktok.com/", capabilities: ["Login Kit approval", "Content Posting API approval", "Video upload permissions"] }
] as const;

/** Read-only provider launch checklist; no tokens or secret values are returned. */
export async function GET() {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
      return NextResponse.json({ error: "Managed authentication required" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    const items = providers.map(provider => ({
      platform: provider.platform,
      label: provider.label,
      portal: provider.portal,
      capabilities: provider.capabilities,
      configured: provider.platform === "facebook" || provider.platform === "instagram" ? metaOAuthConfigured() : provider.platform === "linkedin" ? linkedinOAuthConfigured() : false,
      missingSettings: provider.settings.filter(key => !process.env[key] || (key.endsWith("_OAUTH_ENABLED") && process.env[key] !== "true")),
      blockedReason: provider.platform === "tiktok" ? "Direct Post intended-use rules exclude internal utilities used only for team-managed accounts. A permitted publishing route requires separate review." : null,
      connectEnabled: actor.role === "Owner" && getAuthProvider() === "clerk" && ((provider.platform === "facebook" || provider.platform === "instagram") ? metaOAuthConfigured() : provider.platform === "linkedin" ? linkedinOAuthConfigured() : false)
    }));
    return NextResponse.json({ providers: items, ownerCanConfigure: actor.role === "Owner", callbackPath: "/api/employee/social/oauth/meta/callback", publishingEnabled: false }, { headers: { "Cache-Control": "private, no-store" } });
  } catch(error) {
    const auth = getAuthErrorResponse(error);
    if(auth) return auth;
    return NextResponse.json({ error: "Provider readiness unavailable" }, { status: 503 });
  }
}
