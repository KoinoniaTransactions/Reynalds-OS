import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseResendGlobalUnsubscribe, verifyResendContactWebhook } from "./resend-contact-unsubscribe";

describe("Resend contact unsubscribe fail-closed parser", () => {
  const timestamp = "1788357000";
  const key = Buffer.from("test-contact-only-secret");
  const secret = `whsec_${key.toString("base64")}`;
  const event = {
    type: "contact.updated",
    created_at: "2026-09-02T15:50:00.000Z",
    data: { id: "contact_123", email: "TEST@Example.com", unsubscribed: true }
  };

  it("accepts a valid signed global unsubscribe", () => {
    const payload = JSON.stringify(event);
    const signature = createHmac("sha256", key)
      .update(`msg_1.${timestamp}.${payload}`, "utf8").digest("base64");
    const verified = verifyResendContactWebhook({
      payload, svixId: "msg_1", timestamp, signature: `v1,${signature}`,
      secret, nowSeconds: Number(timestamp)
    });
    expect(parseResendGlobalUnsubscribe(verified)).toMatchObject({
      contactId: "contact_123", email: "test@example.com", unsubscribed: true
    });
  });

  it("rejects invalid signatures and stale timestamps", () => {
    expect(() => verifyResendContactWebhook({
      payload: JSON.stringify(event), svixId: "msg_1", timestamp,
      signature: "v1,ZmFrZQ==", secret, nowSeconds: Number(timestamp)
    })).toThrow("Invalid contact webhook signature");
    expect(() => verifyResendContactWebhook({
      payload: JSON.stringify(event), svixId: "msg_1", timestamp,
      signature: "v1,ZmFrZQ==", secret, nowSeconds: Number(timestamp) + 301
    })).toThrow("outside the accepted window");
  });

  it("ignores re-subscription, unrelated events and malformed contacts", () => {
    expect(parseResendGlobalUnsubscribe({ ...event, data: { ...event.data, unsubscribed: false } })).toBeNull();
    expect(parseResendGlobalUnsubscribe({ ...event, type: "email.sent" })).toBeNull();
    expect(parseResendGlobalUnsubscribe({ ...event, data: { ...event.data, email: "invalid" } })).toBeNull();
    expect(parseResendGlobalUnsubscribe({ ...event, data: { ...event.data, unsubscribed: "true" } })).toBeNull();
  });
});
