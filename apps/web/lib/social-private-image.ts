import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { imageMimeFromBytes, SOCIAL_IMAGE_MAX_BYTES } from "./social-media";
import type { SocialSnapshot } from "./social-queue-policy";

/** Read only an approved scoped image; bounded streaming prevents oversized allocations. */
export async function readPrivateSocialImage(snapshot: SocialSnapshot, key: string) {
  const asset = snapshot.media.find(item => item.key === key);
  if (!asset || !["image/jpeg", "image/png"].includes(asset.type) || asset.size > SOCIAL_IMAGE_MAX_BYTES) throw new Error("Unsupported approved image");
  const accountId = process.env.R2_ACCOUNT_ID, accessKeyId = process.env.R2_ACCESS_KEY_ID, secretAccessKey = process.env.R2_SECRET_ACCESS_KEY, bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !/^[\w-]+$/.test(accountId)) throw new Error("Private media storage unavailable");
  const client = new S3Client({ endpoint: "https://" + accountId + ".r2.cloudflarestorage.com", region: "auto", credentials: { accessKeyId, secretAccessKey } });
  try {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: asset.key }), { abortSignal: AbortSignal.timeout(15000) });
  if (!response.Body) throw new Error("Private media missing");
  const reader = response.Body.transformToWebStream().getReader();
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    if (response.ContentLength !== asset.size || response.ContentType !== asset.type) throw new Error("Private media metadata changed");
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength; if (total > SOCIAL_IMAGE_MAX_BYTES || total > asset.size) throw new Error("Private image exceeds approved size"); chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  if (total !== asset.size) throw new Error("Private media size mismatch");
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  if (imageMimeFromBytes(bytes) !== asset.type) throw new Error("Private image content type mismatch");
  return bytes;
  } finally { client.destroy(); }
}
