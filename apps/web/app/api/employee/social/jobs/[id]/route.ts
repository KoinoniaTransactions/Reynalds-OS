import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { changeSocialJob, SocialQueueError } from "../../../../../../lib/social-queue";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if ((process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") return NextResponse.json({ error: "Managed Content Studio unavailable" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    const input = await request.json();
    if (input?.action !== "cancel" && input?.action !== "retry") return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    return NextResponse.json(await changeSocialJob(actor, (await params).id, input.action));
  } catch (error) {
    return getAuthErrorResponse(error) ?? NextResponse.json({ error: error instanceof SocialQueueError ? error.message : "Unable to change job" }, { status: error instanceof SocialQueueError ? error.status : 503 });
  }
}
