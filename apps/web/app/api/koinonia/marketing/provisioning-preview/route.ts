import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { previewKoinoniaMarketingProvisioning } from "../../../../../lib/koinonia-marketing-eligibility";

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

  const user = await assertPermission("objects:view");
  // Report access is more sensitive than general CRM viewing.
  if (user.role !== "Owner" && user.role !== "Admin") {
    return NextResponse.json({ error: "Marketing administrator access required." }, { status: 403 });
  }
  if (user.workspaceId !== "wks_koinonia") {
    return NextResponse.json({ error: "Wrong workspace." }, { status: 403 });
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
