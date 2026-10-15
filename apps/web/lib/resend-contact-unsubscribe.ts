import { createHmac, timingSafeEqual } from "node:crypto";

const toleranceSeconds = 300;

export type ResendGlobalUnsubscribeEvent = {
  type: "contact.updated";
  createdAt: string;
  contactId: string;
  email: string;
  audienceId?: string;
  unsubscribed: true;
};

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

/**
 * Verify the exact raw body before examining contact identifiers.
 * A dedicated secret is required: do not reuse the existing inbound-email endpoint secret.
 * This helper makes no database writes and does not enroll or re-enroll contacts.
 */
export function verifyResendContactWebhook({
  payload, svixId, timestamp, signature, secret, nowSeconds = Math.floor(Date.now() / 1000)
}: {
  payload: string;
  svixId: string | null;
  timestamp: string | null;
  signature: string | null;
  secret: string | undefined;
  nowSeconds?: number;
}): unknown {
  if (!secret?.startsWith("whsec_")) throw new Error("Contact webhook secret is not configured.");
  if (!svixId || !timestamp || !signature) throw new Error("Missing contact webhook signature headers.");
  const time = Number(timestamp);
  if (!Number.isSafeInteger(time) || Math.abs(nowSeconds - time) > toleranceSeconds) {
    throw new Error("Contact webhook timestamp is outside the accepted window.");
  }
  const key = Buffer.from(secret.slice(6), "base64");
  if (!key.length) throw new Error("Invalid contact webhook secret.");
  const expected = createHmac("sha256", key).update(`${svixId}.${timestamp}.${payload}`, "utf8").digest();
  const valid = signature.split(" ").some((candidate) => {
    if (!candidate.startsWith("v1,")) return false;
    const received = Buffer.from(candidate.slice(3), "base64");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
  if (!valid) throw new Error("Invalid contact webhook signature.");
  return JSON.parse(payload) as unknown;
}

/** Only global unsubscriptions are actionable. Topic changes and resubscriptions fail closed. */
export function parseResendGlobalUnsubscribe(value: unknown): ResendGlobalUnsubscribeEvent | null {
  const event = object(value);
  if (!event || event.type !== "contact.updated") return null;
  const data = object(event.data);
  if (!data || data.unsubscribed !== true) return null;
  if (typeof event.created_at !== "string" || !Number.isFinite(Date.parse(event.created_at))) return null;
  if (typeof data.id !== "string" || !data.id.trim() || typeof data.email !== "string") return null;
  const email = data.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return {
    type: "contact.updated",
    createdAt: event.created_at,
    contactId: data.id,
    email,
    audienceId: typeof data.audience_id === "string" ? data.audience_id : undefined,
    unsubscribed: true
  };
}
