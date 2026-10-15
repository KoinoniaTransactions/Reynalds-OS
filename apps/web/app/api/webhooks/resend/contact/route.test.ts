import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../../lib/db", () => ({
  prisma: { $transaction: vi.fn(() => { throw new Error("Database must not be touched"); }) }
}));

import { POST } from "./route";

const keys = [
  "KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED",
  "KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID",
  "RESEND_CONTACT_WEBHOOK_SECRET"
] as const;
const originals = keys.map((key) => process.env[key]);
afterEach(() => {
  keys.forEach((key, i) => {
    if (originals[i] === undefined) delete process.env[key];
    else process.env[key] = originals[i];
  });
});

describe("Resend contact webhook activation gate", () => {
  it("rejects requests with no activation or configuration", async () => {
    keys.forEach((key) => delete process.env[key]);
    const result = await POST(new Request("https://example.com/api/webhooks/resend/contact", { method: "POST", body: "{}" }));
    expect(result.status).toBe(503);
  });

  it("rejects unsigned requests before database access", async () => {
    process.env.KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED = "true";
    process.env.KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID = "test_workspace";
    process.env.RESEND_CONTACT_WEBHOOK_SECRET = `whsec_${Buffer.from("test-secret").toString("base64")}`;
    const result = await POST(new Request("https://example.com/api/webhooks/resend/contact", { method: "POST", body: "{}" }));
    expect(result.status).toBe(401);
  });
});
