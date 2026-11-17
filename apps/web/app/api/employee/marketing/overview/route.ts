import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";
import { buildKoinoniaMarketingReport } from "../../../../../lib/koinonia-marketing-report";
import { liveSocialPublishingEnabled } from "../../../../../lib/social-queue-policy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (getAuthProvider() !== "clerk") return NextResponse.json({ error: "Managed authentication required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    const where = { workspaceId: actor.workspaceId, objectType: "Relationship", archivedAt: null };
    const [records, total, jobs, channels, followUps, issues] = await Promise.all([
      prisma.rosObject.findMany({ where, select: { status: true, data: true }, take: 5001, orderBy: { id: "asc" } }),
      prisma.rosObject.count({ where }),
      prisma.socialPublishJob.groupBy({ by: ["status", "mode"], where: { variant: { post: { workspaceId: actor.workspaceId } } }, _count: { _all: true } }),
      prisma.socialChannelConnection.findMany({ where: { workspaceId: actor.workspaceId }, select: { platform: true, displayName: true, status: true, expiresAt: true, publishingEnabled: true } }),
      prisma.task.count({ where: { workspaceId: actor.workspaceId, dueAt: { lte: new Date() }, status: { notIn: ["Complete", "Completed", "Canceled"] } } }),
      prisma.socialPublishJob.findMany({ where: { variant: { post: { workspaceId: actor.workspaceId } }, status: { in: ["failed", "needs_reauthorization", "needs_reconciliation"] } }, select: { id: true, status: true, mode: true, lastErrorMessage: true }, take: 10, orderBy: { updatedAt: "desc" } })
    ]);
    return NextResponse.json({ report: buildKoinoniaMarketingReport(records.slice(0, 5000)), totalRecords: total, truncated: records.length > 5000, jobs, channels, overdueFollowUps: followUps, issues, livePublishingEnabled: liveSocialPublishingEnabled(), asOf: new Date().toISOString() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return getAuthErrorResponse(error) ?? NextResponse.json({ error: "Marketing reporting unavailable" }, { status: 503 }); }
}
