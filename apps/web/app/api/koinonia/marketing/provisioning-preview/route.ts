import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { previewKoinoniaMarketingProvisioning } from "../../../../../lib/koinonia-marketing-eligibility";
import { checkMarketingPreviewAccess } from "../../../../../lib/koinonia-marketing-preview-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Read-only, access-controlled Preview report. Deliberately never calls Resend.
 * Provider verification is UNKNOWN: this endpoint never authorizes enrollment.
 */
export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.KOINONIA_MARKETING_PROVISIONING_PREVIEW_ENABLED !== "true") {
    return NextResponse.json({ error: "Preview report disabled." }, { status: 404 });
  }

  // Never trust mock authentication on a remotely deployed Preview endpoint.
  if (getAuthProvider() !== "clerk") {
    return NextResponse.json({ error: "Managed authentication required." }, { status: 503 });
  }
  const databaseUrl = process.env.DATABASE_URL;
  let host: string;
  try { host = new URL(databaseUrl ?? "").hostname; }
  catch { return NextResponse.json({ error: "Approved Preview database required." }, { status: 503 }); }
  // Fail closed unless this is the isolated, previously verified Neon child branch.
  if (!/^ep-wild-star-afpyagbo(?:-pooler)?\.c-2\.us-west-2\.aws\.neon\.tech$/.test(host)) {
    return NextResponse.json({ error: "Approved Preview database required." }, { status: 503 });
  }

  let user: Awaited<ReturnType<typeof assertPermission>>;
  try {
    user = await assertPermission("objects:view");
  } catch (error) {
    // Clerk can reject an unauthenticated request. Return a safe HTTP status
    // instead of leaking an uncaught server exception as HTTP 500.
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status : undefined;
    if (status === 401) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (status === 403) return NextResponse.json({ error: "Access denied." }, { status: 403 });
    throw error;
  }
  const access = checkMarketingPreviewAccess(user.role, user.workspaceId);
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }
  const relationships = await prisma.rosObject.findMany({
    where: { workspaceId: user.workspaceId, objectType: "Relationship", archivedAt: null },
    select: { id: true, name: true, data: true },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return NextResponse.json({
    mode: "dry_run",
    providerStatus: "unknown",
    warning: "No provider suppression verification was performed. This report cannot approve enrollment.",
    evaluated: relationships.length,
    rows: relationships.map((relationship) => ({
      id: relationship.id,
      name: relationship.name,
      ...previewKoinoniaMarketingProvisioning(relationship.data)
    }))
  }, { headers: { "Cache-Control": "no-store" } });
}
