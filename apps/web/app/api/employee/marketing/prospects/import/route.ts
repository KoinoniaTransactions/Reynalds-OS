import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { importProspects, ProspectImportError } from "../../../../../../lib/koinonia-prospect-import";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    if (getAuthProvider() !== "clerk" || process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "Preview with managed authentication required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Same-origin JSON required" }, { status: 403 });
    const length = Number(request.headers.get("content-length"));
    if (length > 2 * 1024 * 1024) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 2 * 1024 * 1024) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const body = JSON.parse(raw);
    if (typeof body?.csv !== "string" || !["preview", "commit"].includes(body?.action)) return NextResponse.json({ error: "CSV and preview/commit action required" }, { status: 400 });
    return NextResponse.json(await importProspects(actor, body.csv, body.action === "commit", body.reviewed === true), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return getAuthErrorResponse(error) ?? NextResponse.json({ error: error instanceof ProspectImportError ? error.message : "Prospect import unavailable" }, { status: error instanceof ProspectImportError || error instanceof SyntaxError ? 400 : 503 });
  }
}
