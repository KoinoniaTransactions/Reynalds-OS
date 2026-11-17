import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { runSocialPublishingWorker } from "../../../../../../lib/social-publishing-worker";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST() {
  try {
    if (process.env.VERCEL_ENV !== "preview" || getAuthProvider() !== "clerk" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") return NextResponse.json({ error: "Managed Preview required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    return NextResponse.json(await runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId }), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return getAuthErrorResponse(error) ?? NextResponse.json({ error: "Preview worker unavailable" }, { status: 503 }); }
}
