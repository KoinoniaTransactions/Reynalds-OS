import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const providers = [
  { platform: "facebook", label: "Facebook Pages", settings: ["META_APP_ID", "META_APP_SECRET"], portal: "https://developers.facebook.com/apps/", capabilities: ["Page authentication", "Page selection", "Page publishing permissions"] },
  { platform: "instagram", label: "Instagram Professional", settings: ["META_APP_ID", "META_APP_SECRET"], portal: "https://developers.facebook.com/apps/", capabilities: ["Professional account discovery", "Instagram publishing permissions"] },
  { platform: "linkedin", label: "LinkedIn", settings: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"], portal: "https://www.linkedin.com/developers/apps", capabilities: ["Member authorization", "Organization permissions if needed"] },
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
      configured: provider.settings.every(key => Boolean(process.env[key])),
      missingSettings: provider.settings.filter(key => !process.env[key]),
      connectEnabled: false
    }));
    return NextResponse.json({ providers: items, ownerCanConfigure: actor.role === "Owner", publishingEnabled: false }, { headers: { "Cache-Control": "private, no-store" } });
  } catch(error) {
    const auth = getAuthErrorResponse(error);
    if(auth) return auth;
    return NextResponse.json({ error: "Provider readiness unavailable" }, { status: 503 });
  }
}
