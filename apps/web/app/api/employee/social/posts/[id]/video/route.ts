import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { presignR2Object } from "../../../../../../../lib/r2-presign";
import { socialMediaImages, socialMediaPrefix } from "../../../../../../../lib/social-media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const CHUNK = 8 * 1024 * 1024;
const MAX_BYTES = 512 * 1024 * 1024;
const MAX_PARTS = Math.ceil(MAX_BYTES / CHUNK);
type Session = { actorId: string; workspaceId: string; postId: string; variantId: string; revision: number; key: string; uploadId: string; size: number; type: string; partCount: number; expires: number };

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 storage unavailable");
  return { accountId, accessKeyId, secretAccessKey, bucket, client: new S3Client({ endpoint: "https://" + accountId + ".r2.cloudflarestorage.com", region: "auto", credentials: { accessKeyId, secretAccessKey } }) };
}
async function authorize() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" || process.env.SOCIAL_VIDEO_UPLOADS_ENABLED !== "true") {
    return { error: NextResponse.json({ error: "Preview video upload not activated" }, { status: 503 }) };
  }
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") return { error: NextResponse.json({ error: "Managed authentication required" }, { status: 503 }) };
  return { actor: await assertPermission("employee-portal:view") };
}
function token(session: Session, secret: string) {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = createHmac("sha256", secret).update("social-video-v1:" + data).digest("base64url");
  return data + "." + sig;
}
function verifyToken(raw: unknown, secret: string): Session | null {
  if (typeof raw !== "string" || raw.length > 4096) return null;
  const [data, signature, extra] = raw.split(".");
  if (!data || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update("social-video-v1:" + data).digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, "base64url"); } catch { return null; }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const candidate: Session = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!candidate || !Number.isSafeInteger(candidate.expires) || candidate.expires < Date.now() ||
      !Number.isSafeInteger(candidate.partCount) || candidate.partCount < 1 || candidate.partCount > MAX_PARTS ||
      !Number.isSafeInteger(candidate.size) || candidate.size < 1 || candidate.size > MAX_BYTES ||
      !["video/mp4", "video/webm"].includes(candidate.type) || !candidate.uploadId || !candidate.key) return null;
    return candidate;
  } catch { return null; }
}
async function draft(workspaceId: string, postId: string, variantId: string, revision: number) {
  const post = await prisma.socialPost.findFirst({ where: { id: postId, workspaceId }, include: { variants: { where: { id: variantId } } } });
  const variant = post?.variants[0];
  if (!variant) return null;
  if (post?.status !== "draft" || !["draft", "changes_requested"].includes(variant.status) || variant.revision !== revision) return null;
  return variant;
}
function signParts(s: Session, c: ReturnType<typeof config>, numbers: number[]) {
  return numbers.map(number => ({ number, url: presignR2Object({ accountId: c.accountId, accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey, bucket: c.bucket, key: s.key, method: "PUT", expiresSeconds: 900, operationQuery: { partNumber: String(number), uploadId: s.uploadId } }) }));
}
function scoped(s: Session, actor: { id: string; workspaceId: string }, id: string) {
  return s.workspaceId === actor.workspaceId && s.actorId === actor.id && s.postId === id && s.key.startsWith(socialMediaPrefix(actor.workspaceId, s.variantId));
}

/** Begin or renew a multipart upload. The browser sends bytes directly to R2. */
export async function POST(request: Request, { params }: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    const body = payload as Record<string, unknown>;
    const c = config();
    const renewal = typeof body.token === "string" ? verifyToken(body.token, c.secretAccessKey) : null;
    if (renewal) {
      if (!scoped(renewal, actor, id) || !await draft(actor.workspaceId, id, renewal.variantId, renewal.revision)) return NextResponse.json({ error: "Upload no longer authorized" }, { status: 409 });
      const requested = Array.isArray(body.parts) ? body.parts : [];
      if (requested.length < 1 || requested.length > renewal.partCount || !requested.every(n => Number.isSafeInteger(n) && n >= 1 && n <= renewal.partCount)) return NextResponse.json({ error: "Invalid part numbers" }, { status: 400 });
      return NextResponse.json({ parts: signParts(renewal, c, requested as number[]) }, { headers: { "Cache-Control": "no-store" } });
    }
    const variantId = typeof body.variantId === "string" ? body.variantId : "";
    const revision = body.revision;
    const size = body.size;
    const type = body.type;
    const name = typeof body.name === "string" ? body.name.slice(0, 120) : "";
    if (!Number.isSafeInteger(revision) || (revision as number) < 1 || !Number.isSafeInteger(size) || (size as number) < 1 || (size as number) > MAX_BYTES || !(typeof type === "string" && ["video/mp4", "video/webm"].includes(type)) || !name) return NextResponse.json({ error: "Only MP4 or WebM video, maximum 512 MiB" }, { status: 400 });
    const variant = await draft(actor.workspaceId, id, variantId, revision as number);
    if (!variant) return NextResponse.json({ error: "Draft changed; refresh" }, { status: 409 });
    if (socialMediaImages(variant.media).some(file => file.type.startsWith("video/"))) return NextResponse.json({ error: "Only one video per platform version" }, { status: 409 });
    const key = socialMediaPrefix(actor.workspaceId, variantId) + randomUUID() + (type === "video/mp4" ? ".mp4" : ".webm");
    const created = await c.client.send(new CreateMultipartUploadCommand({ Bucket: c.bucket, Key: key, ContentType: type, CacheControl: "private, no-store" }));
    if (!created.UploadId) throw new Error("Multipart upload was not initialized");
    const partCount = Math.ceil((size as number) / CHUNK);
    const session: Session = { actorId: actor.id, workspaceId: actor.workspaceId, postId: id, variantId, revision: revision as number, key, uploadId: created.UploadId, size: size as number, type: type as string, partCount, expires: Date.now() + 2 * 3600000 };
    return NextResponse.json({ token: token(session, c.secretAccessKey), parts: signParts(session, c, Array.from({ length: partCount }, (_, i) => i + 1)), partSize: CHUNK, name, maxFileSize: MAX_BYTES }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview video preparation failed", error);
    return NextResponse.json({ error: "Unable to prepare video upload" }, { status: 503 });
  }
}

/** Finish multipart upload only after verifying exact size, type, bytes, and draft revision. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Invalid completion" }, { status: 400 });
    const body = payload as Record<string, unknown>;
    const c = config();
    const session = verifyToken(body.token, c.secretAccessKey);
    if (!session || !scoped(session, actor, id)) return NextResponse.json({ error: "Upload authorization expired" }, { status: 403 });
    const variant = await draft(actor.workspaceId, id, session.variantId, session.revision);
    if (!variant) return NextResponse.json({ error: "Draft changed; upload cannot be attached" }, { status: 409 });
    const parts = body.parts;
    if (!Array.isArray(parts) || parts.length !== session.partCount || !parts.every((p, i) => p && typeof p === "object" && p.number === i + 1 && typeof p.etag === "string" && p.etag.length > 0 && p.etag.length < 150)) return NextResponse.json({ error: "Incomplete part manifest" }, { status: 400 });
    await c.client.send(new CompleteMultipartUploadCommand({ Bucket: c.bucket, Key: session.key, UploadId: session.uploadId, MultipartUpload: { Parts: parts.map(p => ({ PartNumber: p.number, ETag: p.etag })) } }));
    const cleanup = async () => c.client.send(new DeleteObjectCommand({ Bucket: c.bucket, Key: session.key })).catch(error => console.error("Video cleanup failed", error));
    try {
      const head = await c.client.send(new HeadObjectCommand({ Bucket: c.bucket, Key: session.key }));
      if (head.ContentLength !== session.size || head.ContentType !== session.type) throw new Error("Video size or MIME mismatch");
      const chunk = await c.client.send(new GetObjectCommand({ Bucket: c.bucket, Key: session.key, Range: "bytes=0-15" }));
      const data = chunk.Body ? await chunk.Body.transformToByteArray() : new Uint8Array();
      const valid = session.type === "video/mp4" ? data.length >= 8 && String.fromCharCode(...data.slice(4, 8)) === "ftyp" :
        data.length >= 4 && data[0] === 0x1a && data[1] === 0x45 && data[2] === 0xdf && data[3] === 0xa3;
      if (!valid) throw new Error("Video file signature mismatch");
      const current = socialMediaImages(variant.media);
      if (current.some(file => file.type.startsWith("video/"))) throw new Error("Video already attached");
      const record = { key: session.key, type: session.type, size: session.size, name: typeof body.name === "string" ? body.name.slice(0, 120) : "Uploaded video" };
      const saved = await prisma.$transaction(async tx => {
        const updated = await tx.socialPostVariant.updateMany({ where: { id: session.variantId, revision: session.revision, status: { in: ["draft", "changes_requested"] } }, data: { media: [...current, record], revision: { increment: 1 }, status: "draft", scheduledAt: null } });
        if (updated.count !== 1) return false;
        await tx.socialApproval.updateMany({ where: { variantId: session.variantId, revokedAt: null }, data: { revokedAt: new Date() } });
        await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.video.attached", subjectType: "SocialPostVariant", subjectId: session.variantId, summary: "Verified video attached; revision changed and approvals revoked", metadata: { key: session.key, size: session.size, type: session.type } } });
        return true;
      });
      if (!saved) throw new Error("Draft changed before video could be attached");
      return NextResponse.json({ attached: true, media: record }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      await cleanup();
      throw error;
    }
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview video completion failed", error);
    return NextResponse.json({ error: "Video verification or attachment failed. Please retry upload." }, { status: 503 });
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;
    const actor = auth.actor!;
    const { id } = await params;
    const payload: unknown = await request.json();
    const raw = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>).token : null;
    const c = config();
    const session = verifyToken(raw, c.secretAccessKey);
    if (!session || !scoped(session, actor, id)) return NextResponse.json({ error: "Unauthorized upload" }, { status: 403 });
    await c.client.send(new AbortMultipartUploadCommand({ Bucket: c.bucket, Key: session.key, UploadId: session.uploadId }));
    return NextResponse.json({ aborted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Preview video cancellation failed", error);
    return NextResponse.json({ error: "Unable to abort multipart video" }, { status: 503 });
  }
}
