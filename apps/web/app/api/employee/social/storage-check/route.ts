import { randomUUID } from "node:crypto";
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";
import { presignR2Object } from "../../../../../lib/r2-presign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function storage() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 credentials are not configured");
  return { accountId, accessKeyId, secretAccessKey, bucket,
    s3: new S3Client({ endpoint: "https://" + accountId + ".r2.cloudflarestorage.com",
      region: "auto", credentials: { accessKeyId, secretAccessKey } }) };
}
function previewOrigin() {
  const url = process.env.SOCIAL_PREVIEW_ORIGIN ?? "";
  if (!/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(url)) throw new Error("Stable Preview origin is unavailable");
  return url;
}

/** Owner-triggered private R2 multipart integration check. Does not touch social publishing or live posts. */
export async function POST(request: Request) {
  let cleanup: { s3: S3Client; bucket: string; key: string; uploadId?: string } | null = null;
  try {
    if (process.env.VERCEL_ENV !== "preview" || process.env.SOCIAL_VIDEO_UPLOADS_ENABLED !== "true" ||
      process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true" ||
      (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk")) {
      return NextResponse.json({ error: "Preview storage check is unavailable" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
      (body as Record<string, unknown>).confirm !== "run_private_multipart_probe") {
      return NextResponse.json({ error: "Explicit storage test confirmation required" }, { status: 400 });
    }
    const c = storage();
    const origin = previewOrigin();
    const key = "social-preview/integration-probe/" + randomUUID() + ".mp4";
    cleanup = { s3: c.s3, bucket: c.bucket, key };
    const started = await c.s3.send(new CreateMultipartUploadCommand({
      Bucket: c.bucket, Key: key, ContentType: "video/mp4", CacheControl: "private, no-store"
    }));
    if (!started.UploadId) throw new Error("R2 did not provide a multipart upload ID");
    cleanup.uploadId = started.UploadId;
    const signature = (partNumber: number) => presignR2Object({
      accountId: c.accountId, accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey,
      bucket: c.bucket, key, method: "PUT", expiresSeconds: 300,
      operationQuery: { partNumber: String(partNumber), uploadId: started.UploadId! }
    });
    const firstUrl = signature(1);
    const preflight = await fetch(firstUrl, { method: "OPTIONS", headers: {
      Origin: origin, "Access-Control-Request-Method": "PUT"
    }, cache: "no-store" });
    const allowOrigin = preflight.headers.get("access-control-allow-origin");
    if (!preflight.ok || allowOrigin !== origin) {
      throw new Error("R2 CORS preflight denied this Preview origin; configure browser upload access first");
    }
    const parts: { PartNumber: number; ETag: string }[] = [];
    for (const [index, buffer] of [Buffer.alloc(5 * 1024 * 1024, 1), Buffer.from("r2-check-last-part", "utf8")].entries()) {
      const partNumber = index + 1;
      const response = await fetch(signature(partNumber), {
        method: "PUT", headers: { Origin: origin }, body: buffer, cache: "no-store"
      });
      if (!response.ok) throw new Error("Signed multipart upload part " + partNumber + " failed with HTTP " + response.status);
      const etag = response.headers.get("etag");
      if (!etag) throw new Error("ETag was not visible to browser-origin uploads");
      parts.push({ PartNumber: partNumber, ETag: etag });
    }
    await c.s3.send(new CompleteMultipartUploadCommand({
      Bucket: c.bucket, Key: key, UploadId: started.UploadId, MultipartUpload: { Parts: parts }
    }));
    cleanup.uploadId = undefined;
    const head = await c.s3.send(new HeadObjectCommand({ Bucket: c.bucket, Key: key }));
    const expected = 5 * 1024 * 1024 + Buffer.byteLength("r2-check-last-part", "utf8");
    if (head.ContentLength !== expected) throw new Error("Stored video test object size did not match uploaded parts");
    await prisma.auditEvent.create({ data: {
      workspaceId: actor.workspaceId, actorId: actor.id, action: "social.storage.multipart_probe_passed",
      subjectType: "R2Bucket", subjectId: "social-preview",
      summary: "Private signed multipart storage, CORS preflight and ETag verified",
      metadata: { origin, size: expected, partCount: 2 }
    } });
    return NextResponse.json({
      verified: true, checks: ["R2 multipart initialization", "signed upload part 1", "signed upload part 2",
        "Preview origin CORS preflight", "browser-visible ETag", "multipart completion", "stored object length"],
      testObjectRemoved: true
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Private R2 multipart integration check failed", error);
    return NextResponse.json({ verified: false, error: error instanceof Error ? error.message : "Storage check failed" }, { status: 503 });
  } finally {
    if (cleanup) {
      const c = cleanup as { s3: S3Client; bucket: string; key: string; uploadId?: string };
      if (c.uploadId) {
        await c.s3.send(new AbortMultipartUploadCommand({ Bucket: c.bucket, Key: c.key, UploadId: c.uploadId })).catch(e => console.error("R2 probe abort failed", e));
      }
      await c.s3.send(new DeleteObjectCommand({ Bucket: c.bucket, Key: c.key })).catch(e => console.error("R2 probe object cleanup failed", e));
    }
  }
}
