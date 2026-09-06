import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { AuthUser } from "@reynalds-os/auth";

export type PortalDocumentR2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

export type StoredR2Document = {
  fileUrl: string;
  storageKey: string;
};

export function getPortalDocumentR2Config(): PortalDocumentR2Config | null {
  const accountId = normalizeR2EnvironmentValue(process.env.R2_ACCOUNT_ID);
  const accessKeyId = normalizeR2EnvironmentValue(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = normalizeR2EnvironmentValue(
    process.env.R2_SECRET_ACCESS_KEY
  );
  const bucketName = normalizeR2EnvironmentValue(process.env.R2_BUCKET_NAME);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

export function isPortalDocumentR2Configured(): boolean {
  return getPortalDocumentR2Config() !== null;
}

export function isPortalDocumentR2UploadEnabled(): boolean {
  return (
    isPortalDocumentR2Configured() &&
    process.env.PORTAL_DOCUMENT_R2_UPLOADS_ENABLED === "true"
  );
}

export async function persistPortalDocumentToR2({
  actor,
  cleanName,
  file
}: {
  actor: AuthUser;
  cleanName: string;
  file: File;
}): Promise<StoredR2Document> {
  return persistPortalDocumentToR2ForWorkspace({
    workspaceId: actor.workspaceId,
    cleanName,
    file
  });
}

export async function persistPortalDocumentToR2ForWorkspace({
  workspaceId,
  cleanName,
  file
}: {
  workspaceId: string;
  cleanName: string;
  file: File;
}): Promise<StoredR2Document> {
  const config = requirePortalDocumentR2Config();
  const workspaceSegment = getSafeStorageSegment(workspaceId);
  const storageFileName = `${randomUUID()}-${cleanName}`;
  const storageKey = `${workspaceSegment}/${storageFileName}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await createR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: storageKey,
      Body: body,
      ContentLength: file.size,
      ContentType: file.type || "application/octet-stream",
      Metadata: {
        originalFileName: cleanName,
        workspaceId
      }
    })
  );

  return {
    fileUrl: `r2://${config.bucketName}/${storageKey}`,
    storageKey
  };
}

export async function getPortalDocumentFromR2(storageKey: string): Promise<Uint8Array> {
  const config = requirePortalDocumentR2Config();
  const response = await createR2Client(config).send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: storageKey
    })
  );

  if (!response.Body) {
    throw new Error("Stored document did not contain a readable body.");
  }

  return response.Body.transformToByteArray();
}

export async function removePortalDocumentFromR2Quietly(storageKey: string) {
  try {
    const config = requirePortalDocumentR2Config();
    await createR2Client(config).send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: storageKey
      })
    );
  } catch {
    // Best-effort cleanup. Preserve the original upload or database failure.
  }
}

function requirePortalDocumentR2Config(): PortalDocumentR2Config {
  const config = getPortalDocumentR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 document storage is not configured.");
  }
  return config;
}

function createR2Client(config: PortalDocumentR2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
}

function normalizeR2EnvironmentValue(rawValue: string | undefined): string | null {
  if (!rawValue) return null;

  const lines = rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;
  const [firstLine] = lines;
  if (!lines.every((line) => line === firstLine)) return null;
  if (/[^\x20-\x7E]/.test(firstLine)) return null;
  return firstLine;
}

function getSafeStorageSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "workspace";
}
