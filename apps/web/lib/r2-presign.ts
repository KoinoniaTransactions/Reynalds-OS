import { createHash, createHmac } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function hmac(key: Buffer | string, message: string) {
  return createHmac("sha256", key).update(message).digest();
}
function encode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase());
}
function canonicalQuery(params: Record<string, string>) {
  return Object.entries(params).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => encode(key) + "=" + encode(value)).join("&");
}
/** Standard SigV4 query authorization for a single R2 object and operation.
 * Never sign arbitrary user-provided bucket or object paths. Callers must construct private scoped keys.
 */
export function presignR2Object(input: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  method: "PUT" | "GET";
  contentType?: string;
  expiresSeconds?: number;
  now?: Date;
  operationQuery?: Record<string, string>;
}): string {
  const expiresSeconds = input.expiresSeconds ?? 300;
  if (!Number.isSafeInteger(expiresSeconds) || expiresSeconds < 1 || expiresSeconds > 900) throw new Error("Invalid URL lifetime");
  if (!/^[a-zA-Z0-9_-]{4,80}$/.test(input.accountId) || !input.accessKeyId || !input.secretAccessKey || !input.bucket || !input.key.startsWith("social-preview/")) throw new Error("Invalid storage configuration or key");
  const date = (input.now ?? new Date()).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const day = date.slice(0, 8);
  const scope = day + "/auto/s3/aws4_request";
  const host = input.accountId + ".r2.cloudflarestorage.com";
  const path = "/" + [input.bucket, ...input.key.split("/")].map(encode).join("/");
  const signedHeaders = input.contentType ? "content-type;host" : "host";
  const headers = (input.contentType ? "content-type:" + input.contentType.trim().toLowerCase() + "\n" : "") + "host:" + host + "\n";
  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": input.accessKeyId + "/" + scope,
    "X-Amz-Date": date,
    "X-Amz-Expires": String(expiresSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD"
  };
  for (const [queryKey, queryValue] of Object.entries(input.operationQuery ?? {})) {
    if (!["partNumber", "uploadId"].includes(queryKey) || !queryValue) throw new Error("Unsupported upload operation");
    params[queryKey] = queryValue;
  }
  const query = canonicalQuery(params);
  const canonical = [input.method, path, query, headers, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", date, scope, sha256(canonical)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac("AWS4" + input.secretAccessKey, day), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return "https://" + host + path + "?" + query + "&X-Amz-Signature=" + signature;
}
