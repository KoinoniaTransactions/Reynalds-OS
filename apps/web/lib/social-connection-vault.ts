import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function keyFromEnvironment() {
  const raw = process.env.SOCIAL_CONNECTION_VAULT_KEY;
  const key = raw ? Buffer.from(raw, "base64") : null;
  if (!key || key.length !== 32) throw new Error("Social connection vault key is missing or invalid");
  return key;
}

/** Authenticated AES-256-GCM envelope with workspace/connection authenticated context. */
export function sealSocialConnection(data: Record<string, unknown>, workspaceId: string, connectionId: string): string {
  if (!workspaceId || !connectionId) throw new Error("Connection identity required");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromEnvironment(), iv);
  cipher.setAAD(Buffer.from(workspaceId + ":" + connectionId, "utf8"));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),encrypted.toString("base64url")].join(".");
}

export function openSocialConnection(payload: string, workspaceId: string, connectionId: string): Record<string, unknown> {
  const pieces = payload.split(".");
  if (pieces.length !== 4 || pieces[0] !== "v1") throw new Error("Invalid vault envelope");
  const iv = Buffer.from(pieces[1], "base64url");
  const tag = Buffer.from(pieces[2], "base64url");
  if (iv.length !== 12 || tag.length !== 16) throw new Error("Invalid vault envelope");
  const decipher = createDecipheriv("aes-256-gcm", keyFromEnvironment(), iv);
  decipher.setAAD(Buffer.from(workspaceId + ":" + connectionId, "utf8"));
  decipher.setAuthTag(tag);
  const decoded = Buffer.concat([decipher.update(Buffer.from(pieces[3], "base64url")), decipher.final()]).toString("utf8");
  const data: unknown = JSON.parse(decoded);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid vault contents");
  return data as Record<string, unknown>;
}
