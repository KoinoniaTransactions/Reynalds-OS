import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";
import { enqueueSocialVariant, SocialQueueError } from "../../../../../lib/social-queue";
import { liveSocialPublishingEnabled } from "../../../../../lib/social-queue-policy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function staff() {
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") throw new SocialQueueError("Managed authentication required", 503);
  if (process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") throw new SocialQueueError("Content Studio disabled", 503);
  return assertPermission("employee-portal:view");
}
function failure(error: unknown) {
  return getAuthErrorResponse(error) ?? NextResponse.json({ error: error instanceof SocialQueueError ? error.message : "Queue unavailable" }, { status: error instanceof SocialQueueError ? error.status : 503 });
}
export async function GET() {
  try {
    const actor = await staff();
    const jobs = await prisma.socialPublishJob.findMany({ where: { variant: { post: { workspaceId: actor.workspaceId } } }, orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, variantId: true, revision: true, status: true, mode: true, scheduledAt: true, timeZone: true, attemptsCount: true, externalPostId: true, nextAttemptAt: true, lastErrorCode: true, lastErrorMessage: true,
        variant: { select: { platform: true, post: { select: { title: true } } } }, attempts: { orderBy: { attempt: "desc" }, take: 10 } } });
    return NextResponse.json({ jobs, ownerCanManage: actor.role === "Owner", livePublishingEnabled: liveSocialPublishingEnabled(), previewSimulationsEnabled: process.env.VERCEL_ENV === "preview" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const actor = await staff();
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (typeof input.variantId !== "string" || !Number.isSafeInteger(input.revision) || typeof input.scheduledAt !== "string" || typeof input.timeZone !== "string" || !["dry_run", "live"].includes(String(input.mode)) || !(input.connectionId === null || input.connectionId === undefined || typeof input.connectionId === "string")) return NextResponse.json({ error: "Invalid queue request" }, { status: 400 });
    const job = await enqueueSocialVariant(actor, { variantId: input.variantId, revision: input.revision as number, scheduledAt: input.scheduledAt, timeZone: input.timeZone, mode: input.mode as "dry_run" | "live", connectionId: typeof input.connectionId === "string" ? input.connectionId : null });
    return NextResponse.json({ job }, { status: job.existing ? 200 : 201 });
  } catch (error) { return failure(error); }
}
