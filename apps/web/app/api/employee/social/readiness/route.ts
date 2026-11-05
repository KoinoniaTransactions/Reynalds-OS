import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Workspace-only readiness summary. Never enqueues work or invokes social networks. */
export async function GET() {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") return NextResponse.json({ error: "Managed authentication required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    const [connections, approved, jobs] = await Promise.all([
      prisma.socialChannelConnection.count({ where: { workspaceId: actor.workspaceId, status: "connected" } }),
      prisma.socialPostVariant.count({ where: { post: { workspaceId: actor.workspaceId }, status: "approved" } }),
      prisma.socialPublishJob.count({ where: { variant: { post: { workspaceId: actor.workspaceId } } } })
    ]);
    const report = {
      workspace: { connectedChannels: connections, approvedVariants: approved, existingJobs: jobs },
      configuration: {
        draftStudio: process.env.SOCIAL_CONTENT_STUDIO_ENABLED === "true",
        previewImageUploads: process.env.VERCEL_ENV === "preview" && process.env.SOCIAL_MEDIA_UPLOADS_ENABLED === "true",
        publishDispatch: false,
        queueWorkers: false,
        oauthConnections: false
      },
      nextSteps: ["Securely connect each platform", "Validate media requirements by provider", "Implement explicit approved-revision queueing", "Add worker retries and audit evidence"],
      statement: "No social media requests are sent by this endpoint."
    };
    return NextResponse.json(report, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    return NextResponse.json({ error: "Unable to load readiness report" }, { status: 503 });
  }
}
