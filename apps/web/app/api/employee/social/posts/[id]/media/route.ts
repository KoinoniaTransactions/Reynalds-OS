import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { imageMimeFromBytes, SOCIAL_IMAGE_MAX_BYTES, SOCIAL_IMAGE_MAX_COUNT, socialImageExtension, socialMediaImages, socialMediaPrefix } from "../../../../../../../lib/social-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

function storage() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("Media storage not configured");
  return { bucket, s3: new S3Client({ region: "auto", endpoint: "https://" + accountId + ".r2.cloudflarestorage.com", credentials: { accessKeyId, secretAccessKey } }) };
}
async function access() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" || process.env.SOCIAL_MEDIA_UPLOADS_ENABLED !== "true") {
    return { error: NextResponse.json({ error: "Preview social media management disabled" }, { status: 503 }) };
  }
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
    return { error: NextResponse.json({ error: "Managed authentication required" }, { status: 503 }) };
  }
  return { actor: await assertPermission("employee-portal:view") };
}
async function lookup(workspaceId: string, postId: string, variantId: string) {
  const post = await prisma.socialPost.findFirst({ where: { id: postId, workspaceId }, include: { variants: { where: { id: variantId } } } });
  return { post, variant: post?.variants[0] };
}
function editable(post: { status: string } | null | undefined, variant: { status: string; revision: number } | null | undefined, revision: number) {
  return !!post && !!variant && post.status === "draft" && ["draft", "changes_requested"].includes(variant.status) && variant.revision === revision;
}
async function updateMedia(input: { workspaceId: string; actorId: string; postId: string; variantId: string; revision: number; media: { key: string; type: string; size: number; name: string }[]; action: string; key: string }) {
  return prisma.$transaction(async tx => {
    const changed = await tx.socialPostVariant.updateMany({ where: { id: input.variantId, revision: input.revision, status: { in: ["draft", "changes_requested"] } }, data: { media: input.media, status: "draft", scheduledAt: null, revision: { increment: 1 } } });
    if (changed.count !== 1) return false;
    await tx.socialApproval.updateMany({ where: { variantId: input.variantId, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.auditEvent.create({ data: { workspaceId: input.workspaceId, actorId: input.actorId, action: input.action, subjectType: "SocialPostVariant", subjectId: input.variantId, summary: "Preview media changed; approvals revoked and revision incremented", metadata: { postId: input.postId, key: input.key, previousRevision: input.revision } } });
    return true;
  });
}

export async function POST(request: Request, { params }: Context) {
  try {
    const auth = await access();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const data = await request.formData();
    const variantId = data.get("variantId");
    const file = data.get("file");
    const revision = Number(data.get("revision"));
    if (typeof variantId !== "string" || !(file instanceof File) || !Number.isSafeInteger(revision) || revision < 1) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    const extension = socialImageExtension(file.type);
    if (!extension || file.size < 1 || file.size > SOCIAL_IMAGE_MAX_BYTES) return NextResponse.json({ error: "Only JPG, PNG or WebP images up to 3 MB are accepted" }, { status: 400 });
    const { post, variant } = await lookup(actor.workspaceId, id, variantId);
    if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!editable(post, variant, revision)) return NextResponse.json({ error: "Draft was updated; refresh first" }, { status: 409 });
    const current = socialMediaImages(variant.media);
    if (current.length >= SOCIAL_IMAGE_MAX_COUNT) return NextResponse.json({ error: "Maximum four images per platform" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (imageMimeFromBytes(bytes) !== file.type) return NextResponse.json({ error: "Image contents do not match the selected file type" }, { status: 400 });
    const { bucket, s3 } = storage();
    const key = socialMediaPrefix(actor.workspaceId, variantId) + randomUUID() + "." + extension;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentLength: bytes.length, ContentType: file.type, CacheControl: "private, no-store" }));
    const record = { key, type: file.type, size: bytes.length, name: file.name.slice(0, 120) };
    let stored = false;
    try {
      stored = await updateMedia({ workspaceId: actor.workspaceId, actorId: actor.id, postId: id, variantId, revision, media: [...current, record], action: "social.media.uploaded", key });
    } catch (error) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(cleanupError => console.error("Preview upload cleanup failed", cleanupError));
      throw error;
    }
    if (!stored) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(cleanupError => console.error("Preview upload conflict cleanup failed", cleanupError));
      return NextResponse.json({ error: "Draft changed during upload; please retry" }, { status: 409 });
    }
    return NextResponse.json({ uploaded: true, media: record }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social preview media upload failed", error);
    return NextResponse.json({ error: "Unable to upload image" }, { status: 503 });
  }
}

export async function GET(request: Request, { params }: Context) {
  try {
    const auth = await access();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const paramsIn = new URL(request.url).searchParams;
    const variantId = paramsIn.get("variantId") ?? "";
    const key = paramsIn.get("key") ?? "";
    const { variant } = await lookup(actor.workspaceId, id, variantId);
    if (!socialMediaImages(variant?.media).some(m => m.key === key) || !key.startsWith(socialMediaPrefix(actor.workspaceId, variantId))) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    const { bucket, s3 } = storage();
    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.Body) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    const source = await object.Body.transformToByteArray();
    const bytes = new Uint8Array(source.length); bytes.set(source);
    return new NextResponse(bytes.buffer, { headers: { "Content-Type": object.ContentType ?? "application/octet-stream", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social preview media retrieval failed", error);
    return NextResponse.json({ error: "Unable to retrieve image" }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const auth = await access();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const input: unknown = await request.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const body = input as Record<string, unknown>;
    const variantId = typeof body.variantId === "string" ? body.variantId : "";
    const key = typeof body.key === "string" ? body.key : "";
    const revision = body.revision;
    if (!Number.isSafeInteger(revision) || (revision as number) < 1) return NextResponse.json({ error: "Invalid revision" }, { status: 400 });
    const { post, variant } = await lookup(actor.workspaceId, id, variantId);
    if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!editable(post, variant, revision as number)) return NextResponse.json({ error: "Draft changed; refresh first" }, { status: 409 });
    const current = socialMediaImages(variant.media);
    if (!current.some(m => m.key === key) || !key.startsWith(socialMediaPrefix(actor.workspaceId, variantId))) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    const updated = await updateMedia({ workspaceId: actor.workspaceId, actorId: actor.id, postId: id, variantId, revision: revision as number, media: current.filter(m => m.key !== key), action: "social.media.removed", key });
    if (!updated) return NextResponse.json({ error: "Draft changed; refresh and retry" }, { status: 409 });
    const { bucket, s3 } = storage();
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (cleanupError) {
      console.error("Social preview image removed from draft but object cleanup failed", cleanupError);
      return NextResponse.json({ removed: true, storageCleanupPending: true }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json({ removed: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social preview image removal failed", error);
    return NextResponse.json({ error: "Unable to remove image" }, { status: 503 });
  }
}
