import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { presignR2Object } from "../../../../../lib/r2-presign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function origin() {
  const value = process.env.SOCIAL_PREVIEW_ORIGIN ?? (process.env.VERCEL_BRANCH_URL ? "https://" + process.env.VERCEL_BRANCH_URL : "");
  if (!/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(value)) throw new Error("Stable Preview origin is missing");
  return value;
}
function credentials() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 object-storage credentials are missing");
  return { accountId, accessKeyId, secretAccessKey, bucket };
}
export async function GET() {
  try {
    if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" ||
      (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk")) {
      return NextResponse.json({ error: "Preview inspection unavailable" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    const previewOrigin = origin();
    const c = credentials();
    // A CORS preflight uses the same browser upload origin and does not require
    // bucket-admin credentials, create objects, or read existing objects.
    const signedUrl = presignR2Object({ ...c, key: "social-preview/cors-probe/no-object", method: "PUT", expiresSeconds: 60 });
    const result = await fetch(signedUrl, { method: "OPTIONS", headers: {
      Origin: previewOrigin, "Access-Control-Request-Method": "PUT"
    }, cache: "no-store" });
    const allowedOrigin = result.headers.get("access-control-allow-origin");
    const allowedMethods = (result.headers.get("access-control-allow-methods") ?? "").toUpperCase().split(",").map(x => x.trim());
    const configured = result.ok && allowedOrigin === previewOrigin && (!allowedMethods.length || allowedMethods.includes("PUT"));
    return NextResponse.json({
      origin: previewOrigin, configured, canConfigure: false, canVerify: actor.role === "Owner",
      source: "object_storage_preflight", message: configured ? "Browser upload origin recognized by R2" : "R2 is not allowing PUT from this Preview origin"
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview R2 browser-access probe failed", error);
    return NextResponse.json({ error: "Unable to verify R2 browser access. Review storage endpoint and network configuration." }, { status: 503 });
  }
}
// The existing R2 credentials are object-scoped. Bucket CORS configuration is
// intentionally managed in the Cloudflare console, not by the web application.
export async function POST() {
  return NextResponse.json({ error: "Bucket-level policy changes are disabled in this application. Manage CORS in Cloudflare." }, { status: 405 });
}
