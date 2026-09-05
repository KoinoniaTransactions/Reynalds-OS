import { createHmac, timingSafeEqual } from "node:crypto";

const resendApiBase = "https://api.resend.com";
const webhookToleranceSeconds = 5 * 60;

export type ResendInboundAttachment = {
  id: string;
  filename: string;
  content_type: string;
  content_disposition?: string | null;
  content_id?: string | null;
  size?: number;
  download_url?: string;
};

export type ResendEmailReceivedEvent = {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    bcc?: string[];
    cc?: string[];
    message_id?: string;
    subject: string;
    attachments?: ResendInboundAttachment[];
  };
};

type ResendAttachmentListResponse = {
  object: "list";
  has_more: boolean;
  data: ResendInboundAttachment[];
};

export function isResendInboundConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_WEBHOOK_SECRET?.trim() &&
      process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN?.trim()
  );
}

export function verifyAndParseResendWebhook({
  payload,
  signature,
  svixId,
  timestamp,
  nowSeconds = Math.floor(Date.now() / 1000)
}: {
  payload: string;
  signature: string | null;
  svixId: string | null;
  timestamp: string | null;
  nowSeconds?: number;
}): unknown {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Resend webhook verification is not configured.");
  if (!signature || !svixId || !timestamp) throw new Error("Missing Resend webhook signature headers.");

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(nowSeconds - timestampNumber) > webhookToleranceSeconds) {
    throw new Error("Resend webhook timestamp is outside the accepted window.");
  }

  const secretBytes = decodeSvixSecret(secret);
  const expected = createHmac("sha256", secretBytes)
    .update(`${svixId}.${timestamp}.${payload}`, "utf8")
    .digest();

  const valid = signature
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => {
      const separator = part.indexOf(",");
      if (separator < 0 || part.slice(0, separator) !== "v1") return false;
      try {
        const candidate = Buffer.from(part.slice(separator + 1), "base64");
        return candidate.length === expected.length && timingSafeEqual(candidate, expected);
      } catch {
        return false;
      }
    });

  if (!valid) throw new Error("Invalid Resend webhook signature.");

  return JSON.parse(payload) as unknown;
}

export function parseResendEmailReceivedEvent(value: unknown): ResendEmailReceivedEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.type !== "email.received") return null;
  const data = record.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const item = data as Record<string, unknown>;
  const to = Array.isArray(item.to) ? item.to.filter((entry): entry is string => typeof entry === "string") : [];
  if (
    typeof record.created_at !== "string" ||
    typeof item.email_id !== "string" ||
    typeof item.created_at !== "string" ||
    typeof item.from !== "string" ||
    typeof item.subject !== "string" ||
    !to.length
  ) {
    throw new Error("Resend email.received payload is incomplete.");
  }

  return {
    type: "email.received",
    created_at: record.created_at,
    data: {
      email_id: item.email_id,
      created_at: item.created_at,
      from: item.from,
      to,
      bcc: stringArray(item.bcc),
      cc: stringArray(item.cc),
      message_id: typeof item.message_id === "string" ? item.message_id : undefined,
      subject: item.subject,
      attachments: parseAttachmentMetadata(item.attachments)
    }
  };
}

export async function listResendReceivedAttachments(emailId: string): Promise<ResendInboundAttachment[]> {
  const response = await resendFetch(
    `/emails/receiving/${encodeURIComponent(emailId)}/attachments`
  );
  const payload = (await response.json()) as ResendAttachmentListResponse;
  if (!response.ok || !payload || !Array.isArray(payload.data)) {
    throw new Error(`Could not retrieve inbound email attachments (${response.status}).`);
  }
  return payload.data;
}

export async function downloadResendInboundAttachment(attachment: ResendInboundAttachment): Promise<File> {
  if (!attachment.download_url) throw new Error("Inbound attachment did not include a download URL.");
  const response = await fetch(attachment.download_url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not download inbound attachment (${response.status}).`);
  const bytes = await response.arrayBuffer();
  return new File([bytes], attachment.filename, {
    type: attachment.content_type || response.headers.get("content-type") || "application/octet-stream"
  });
}

async function resendFetch(path: string): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("Resend inbound API is not configured.");
  return fetch(`${resendApiBase}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });
}

function decodeSvixSecret(secret: string): Buffer {
  const encoded = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  return Buffer.from(encoded, "base64");
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((entry): entry is string => typeof entry === "string");
}

function parseAttachmentMetadata(value: unknown): ResendInboundAttachment[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.filename !== "string" || typeof item.content_type !== "string") return [];
    return [{
      id: item.id,
      filename: item.filename,
      content_type: item.content_type,
      content_disposition: typeof item.content_disposition === "string" ? item.content_disposition : null,
      content_id: typeof item.content_id === "string" ? item.content_id : null,
      size: typeof item.size === "number" ? item.size : undefined
    }];
  });
}
