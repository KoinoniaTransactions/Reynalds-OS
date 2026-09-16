import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  parseResendEmailReceivedEvent,
  verifyAndParseResendWebhook
} from "./resend-inbound-email";

const priorSecret = process.env.RESEND_WEBHOOK_SECRET;

afterEach(() => {
  if (priorSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
  else process.env.RESEND_WEBHOOK_SECRET = priorSecret;
});

describe("Resend inbound webhook verification", () => {
  it("verifies a valid Svix signature and parses email.received", () => {
    const key = Buffer.from("koinonia-test-webhook-secret");
    process.env.RESEND_WEBHOOK_SECRET = `whsec_${key.toString("base64")}`;
    const timestamp = "1788357000";
    const svixId = "msg_test_123";
    const payload = JSON.stringify({
      type: "email.received",
      created_at: "2026-09-02T15:50:00.000Z",
      data: {
        email_id: "email_123",
        created_at: "2026-09-02T15:50:00.000Z",
        from: "agent@example.com",
        to: ["tx-abc@files.koinoniatransactions.com"],
        subject: "Contract docs"
      }
    });
    const signature = createHmac("sha256", key)
      .update(`${svixId}.${timestamp}.${payload}`, "utf8")
      .digest("base64");

    const verified = verifyAndParseResendWebhook({
      payload,
      svixId,
      timestamp,
      signature: `v1,${signature}`,
      nowSeconds: Number(timestamp)
    });
    const event = parseResendEmailReceivedEvent(verified);

    expect(event?.data.email_id).toBe("email_123");
    expect(event?.data.to).toEqual(["tx-abc@files.koinoniatransactions.com"]);
  });

  it("rejects an invalid signature", () => {
    const key = Buffer.from("koinonia-test-webhook-secret");
    process.env.RESEND_WEBHOOK_SECRET = `whsec_${key.toString("base64")}`;

    expect(() => verifyAndParseResendWebhook({
      payload: "{}",
      svixId: "msg_test_123",
      timestamp: "1788357000",
      signature: "v1,ZmFrZQ==",
      nowSeconds: 1788357000
    })).toThrow("Invalid Resend webhook signature");
  });

  it("ignores unrelated webhook event types after signature verification", () => {
    expect(parseResendEmailReceivedEvent({ type: "email.sent", data: {} })).toBeNull();
  });
});
