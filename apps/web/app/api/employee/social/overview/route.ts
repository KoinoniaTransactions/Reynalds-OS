import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Read-only workspace reporting. Does not connect or publish. */
export async function GET() {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
      return NextResponse.json({ error: "Managed login required" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    const [posts, variants, connections, jobs] = await Promise.all([
      prisma.socialPost.count({ where: { workspaceId: actor.workspaceId } }),
      prisma.socialPostVariant.findMany({
        where: { post: { workspaceId: actor.workspaceId } },
        select: { status: true, platform: true, scheduledAt: true },
        take: 1000
      }),
      prisma.socialChannelConnection.findMany({
        where: { workspaceId: actor.workspaceId },
        select: { platform: true, displayName: true, status: true, expiresAt: true }
      }),
      prisma.socialPublishJob.findMany({
        where: { variant: { post: { workspaceId: actor.workspaceId } } },
        select: { status: true, scheduledAt: true, attemptsCount: true },
        take: 100
      })
    ]);
    const byStatus: Record<string, number> = {};
    for (const v of variants) byStatus[v.status] = (byStatus[v.status] ?? 0) + 1;
    return NextResponse.json({
      posts, byStatus, connections, jobs,
      proposedCount: variants.filter(v => v.scheduledAt !== null).length,
      publishingEnabled: false
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social reporting failed", error);
    return NextResponse.json({ error: "Reporting unavailable" }, { status: 503 });
  }
}
