import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client, type CORSRule } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const RULE_ID = "koinonia-social-preview-direct-upload";

function previewOrigin() {
  if (process.env.VERCEL_ENV !== "preview") throw new Error("Preview only");
  const url = process.env.SOCIAL_PREVIEW_ORIGIN ?? (process.env.VERCEL_BRANCH_URL ? "https://" + process.env.VERCEL_BRANCH_URL : "");
  if (!url || !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(url)) throw new Error("Stable Preview origin not configured");
  return url;
}
function r2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 credentials missing");
  return { bucket, client: new S3Client({ endpoint: "https://" + accountId + ".r2.cloudflarestorage.com", region: "auto", credentials: { accessKeyId, secretAccessKey } }) };
}
async function rules(client: S3Client, bucket: string): Promise<CORSRule[]> {
  try {
    const response = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    return response.CORSRules ?? [];
  } catch (error) {
    const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (candidate.name === "NoSuchCORSConfiguration" || candidate.name === "NoSuchCORS" || candidate.$metadata?.httpStatusCode === 404) return [];
    throw error;
  }
}
function configured(current: CORSRule[], origin: string) {
  return current.some(rule => rule.AllowedOrigins?.includes(origin) &&
    rule.AllowedMethods?.includes("PUT") &&
    rule.ExposeHeaders?.some(value => value.toLowerCase() === "etag"));
}
async function authorized() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" ||
    (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk")) {
    return { error: NextResponse.json({ error: "Preview administrator only" }, { status: 503 }) };
  }
  return { actor: await assertPermission("employee-portal:view") };
}
export async function GET() {
  try {
    const auth = await authorized();
    if (auth.error) return auth.error;
    const origin = previewOrigin();
    const { bucket, client } = r2();
    const current = await rules(client, bucket);
    return NextResponse.json({ origin, configured: configured(current, origin), ruleCount: current.length, canConfigure: auth.actor!.role === "Owner" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview R2 CORS inspection failed", error);
    return NextResponse.json({ error: "Unable to inspect R2 CORS configuration. Verify bucket-level credentials." }, { status: 503 });
  }
}
export async function POST(request: Request) {
  try {
    const auth = await authorized();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    const requestBody: unknown = await request.json();
    if (!requestBody || typeof requestBody !== "object" || Array.isArray(requestBody) ||
      (requestBody as Record<string, unknown>).confirm !== "add_preview_origin_only") return NextResponse.json({ error: "Explicit confirmation required" }, { status: 400 });
    const origin = previewOrigin();
    const { bucket, client } = r2();
    const current = await rules(client, bucket);
    if (configured(current, origin)) return NextResponse.json({ configured: true, alreadyConfigured: true, origin });
    if (current.length >= 90) return NextResponse.json({ error: "Too many bucket CORS rules; review in Cloudflare" }, { status: 409 });
    const addition: CORSRule = { ID: RULE_ID, AllowedOrigins: [origin], AllowedMethods: ["PUT", "GET", "HEAD"], AllowedHeaders: ["Content-Type"], ExposeHeaders: ["ETag"], MaxAgeSeconds: 3600 };
    const existing = current.filter(rule => rule.ID !== RULE_ID);
    await client.send(new PutBucketCorsCommand({ Bucket: bucket, CORSConfiguration: { CORSRules: [...existing, addition] } }));
    await prisma.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.storage.preview_cors_configured", subjectType: "R2Bucket", subjectId: "social-preview", summary: "Added restricted browser upload CORS origin to existing private R2 bucket", metadata: { origin, previousRuleCount: current.length, retainedRules: existing.length } } });
    const updated = await rules(client, bucket);
    return NextResponse.json({ configured: configured(updated, origin), origin, retainedRules: existing.length });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview R2 CORS update failed", error);
    return NextResponse.json({ error: "Unable to configure Preview uploads. Bucket-level R2 permissions may be required; no rules were intentionally removed." }, { status: 503 });
  }
}
