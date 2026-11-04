import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const maxBytes = 3 * 1024 * 1024;
const types = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

function client() {
  const account = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) throw new Error("Media storage not configured");
  return { bucket, s3: new S3Client({ region: "auto", endpoint: "https://" + account + ".r2.cloudflarestorage.com", credentials: { accessKeyId, secretAccessKey } }) };
}
async function authorize() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" || process.env.SOCIAL_MEDIA_UPLOADS_ENABLED !== "true") {
    return { error: NextResponse.json({ error: "Preview social media uploads disabled" }, { status: 503 }) };
  }
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
    return { error: NextResponse.json({ error: "Managed authentication required" }, { status: 503 }) };
  }
  return { actor: await assertPermission("employee-portal:view") };
}
export async function POST(request: Request, context: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await context.params;
    const form = await request.formData();
    const variantId = form.get("variantId");
    const file = form.get("file");
    const expectedRevision = Number(form.get("revision"));
    if (typeof variantId !== "string" || !(file instanceof File) || !Number.isSafeInteger(expectedRevision) || expectedRevision < 1) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    const ext = types.get(file.type);
    if (!ext || file.size < 1 || file.size > maxBytes) return NextResponse.json({ error: "Only JPG, PNG and WebP images up to 3 MB are accepted" }, { status: 400 });
    const post = await prisma.socialPost.findFirst({ where: { id, workspaceId: actor.workspaceId }, include: { variants: { where: { id: variantId } } } });
    const variant = post?.variants[0];
    if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post!.status !== "draft" || !["draft", "changes_requested"].includes(variant.status) || variant.revision !== expectedRevision) return NextResponse.json({ error: "Draft changed; refresh and retry" }, { status: 409 });
    const existing = Array.isArray(variant.media) ? variant.media : [];
    if (existing.length >= 4) return NextResponse.json({ error: "Maximum four images per platform version" }, { status: 400 });
    const key = "social-preview/" + encodeURIComponent(actor.workspaceId) + "/" + encodeURIComponent(variant.id) + "/" + randomUUID() + "." + ext;
    const { bucket, s3 } = client();
    const bytes = Buffer.from(await file.arrayBuffer());
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentLength: bytes.length, ContentType: file.type, CacheControl: "private, no-store" }));
    const entry = { key, type: file.type, size: bytes.length, name: file.name.slice(0, 120) };
    const result = await prisma.$transaction(async tx => {
      const updated = await tx.socialPostVariant.updateMany({
        where: { id: variant.id, revision: expectedRevision, status: { in: ["draft", "changes_requested"] } },
        data: { media: [...existing, entry], revision: { increment: 1 }, status: "draft", scheduledAt: null }
      });
      if (updated.count !== 1) return false;
      await tx.socialApproval.updateMany({ where: { variantId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.media.uploaded", subjectType: "SocialPostVariant", subjectId: variantId, summary: "Preview image added; revision changed and approvals revoked", metadata: { postId: id, key, size: bytes.length } } });
      return true;
    });
    if (!result) return NextResponse.json({ error: "Draft changed after upload; uploaded object is orphaned and must be cleaned up" }, { status: 409 });
    return NextResponse.json({ uploaded: true, media: entry });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social media upload failed", error);
    return NextResponse.json({ error: "Unable to upload image" }, { status: 503 });
  }
}
/** Private object retrieval, scoped to an authenticated employee and their workspace. */
export async function GET(request: Request, context: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const { id } = await context.params;
    const url = new URL(request.url);
    const variantId = url.searchParams.get("variantId") ?? "";
    const key = url.searchParams.get("key") ?? "";
    const actor = auth.actor!;
    const post = await prisma.socialPost.findFirst({ where: { id, workspaceId: actor.workspaceId }, include: { variants: { where: { id: variantId } } } });
    const variant = post?.variants[0];
    const entries = Array.isArray(variant?.media) ? variant.media : [];
    const found = entries.some(item => item && typeof item === "object" && "key" in item && item.key === key);
    if (!found || !key.startsWith("social-preview/" + encodeURIComponent(actor.workspaceId) + "/" + encodeURIComponent(variantId) + "/")) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { bucket, s3 } = client();
    const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!result.Body) return NextResponse.json({ error: "Missing media" }, { status: 404 });
    const bytes = await result.Body.transformToByteArray();
    return new NextResponse(bytes, { headers: { "Content-Type": result.ContentType ?? "application/octet-stream", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    return NextResponse.json({ error: "Unable to retrieve media" }, { status: 503 });
  }
}
