import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { AuthUser } from "@reynalds-os/auth";

export type StoredR2Document = { fileUrl: string; storageKey: string };

type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucketName: string };

function getPortalDocumentR2Config(): R2Config | null {
  const accountId = normalize(process.env.R2_ACCOUNT_ID);
  const accessKeyId = normalize(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = normalize(process.env.R2_SECRET_ACCESS_KEY);
  const bucketName = normalize(process.env.R2_BUCKET_NAME);
  return accountId && accessKeyId && secretAccessKey && bucketName ? { accountId, accessKeyId, secretAccessKey, bucketName } : null;
}

export function isPortalDocumentR2UploadEnabled(): boolean {
  return getPortalDocumentR2Config() !== null && process.env.PORTAL_DOCUMENT_R2_UPLOADS_ENABLED === "true";
}

export async function persistPortalDocumentToR2({ actor, cleanName, file }: { actor: AuthUser; cleanName: string; file: File }): Promise<StoredR2Document> {
  const config = requireConfig();
  const workspaceSegment = safeSegment(actor.workspaceId);
  const storageKey = `${workspaceSegment}/${randomUUID()}-${cleanName}`;
  await client(config).send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: storageKey,
    Body: new Uint8Array(await file.arrayBuffer()),
    ContentLength: file.size,
    ContentType: file.type || "application/octet-stream",
    Metadata: { originalFileName: cleanName, workspaceId: actor.workspaceId }
  }));
  return { fileUrl: `r2://${config.bucketName}/${storageKey}`, storageKey };
}

export async function removePortalDocumentFromR2Quietly(storageKey: string) {
  try {
    const config = requireConfig();
    await client(config).send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: storageKey }));
  } catch { }
}

function requireConfig(): R2Config {
  const config = getPortalDocumentR2Config();
  if (!config) throw new Error("Cloudflare R2 document storage is not configured.");
  return config;
}
function client(config: R2Config) {
  return new S3Client({ region: "auto", endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
}
function normalize(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed && !/[^\x20-\x7E]/.test(trimmed) ? trimmed : null;
}
function safeSegment(value: string): string { return value.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "workspace"; }
