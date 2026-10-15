import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@reynalds-os/database";
import { POST } from "./route";

/**
 * Opt-in isolated database integration test. Never runs in routine CI.
 * Requires an explicitly provisioned disposable PostgreSQL database with migrations.
 * Refuses to run without both opt-in flag and URL naming the disposable test DB.
 */
const url = process.env.RESEND_WEBHOOK_TEST_DATABASE_URL;
const enabled = process.env.RUN_RESEND_WEBHOOK_DB_INTEGRATION === "true" &&
  Boolean(url && /(?:^|[/?])[^/?]*resend_webhook_test(?:[?&]|$)/.test(url));
const suite = enabled ? describe : describe.skip;
const prisma = enabled ? new PrismaClient({ datasources: { db: { url } } }) : null;
const secretBytes = Buffer.from("isolated-resend-webhook-test-secret");
const secret = `whsec_${secretBytes.toString("base64")}`;
const time = "2026-10-15T19:00:00.000Z";
const oldEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED: process.env.KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED,
  KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID: process.env.KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID,
  RESEND_CONTACT_WEBHOOK_SECRET: process.env.RESEND_CONTACT_WEBHOOK_SECRET
};

suite("isolated Resend webhook PostgreSQL integration", () => {
  const workspaceId = "resend-webhook-integration-ws";
  const relationshipId = "resend-webhook-integration-contact";
  const contactId = "resend-contact-integration";
  const email = "only-qa@example.invalid";

  beforeAll(async () => {
    if (!prisma || !url) throw new Error("Isolated test DB missing");
    process.env.DATABASE_URL = url;
    process.env.KOINONIA_RESEND_CONTACT_WEBHOOK_ENABLED = "true";
    process.env.KOINONIA_RESEND_WEBHOOK_WORKSPACE_ID = workspaceId;
    process.env.RESEND_CONTACT_WEBHOOK_SECRET = secret;
    await prisma.workspace.create({
      data: { id: workspaceId, name: "Resend disposable integration", type: "test" }
    });
    await prisma.rosObject.create({
      data: {
        id: relationshipId, workspaceId, objectType: "Contact", name: "QA Subscriber",
        status: "Lead", health: "Healthy",
        data: {
          contact: { email },
          emailMarketing: { resendContactId: contactId, status: "eligible" }
        }
      }
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.resendContactWebhookEvent.deleteMany({ where: { workspaceId } });
      await prisma.timelineEvent.deleteMany({ where: { workspaceId } });
      await prisma.rosObject.deleteMany({ where: { workspaceId } });
      await prisma.workspace.deleteMany({ where: { id: workspaceId } });
      await prisma.$disconnect();
    }
    for (const [key, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  function request(id: string, override?: Partial<{ email: string; contactId: string }>) {
    const payload = JSON.stringify({
      type: "contact.updated", created_at: time,
      data: { id: override?.contactId ?? contactId, email: override?.email ?? email, unsubscribed: true }
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", secretBytes)
      .update(`${id}.${timestamp}.${payload}`).digest("base64");
    return new Request("https://example.invalid/api/webhooks/resend/contact", {
      method: "POST", body: payload,
      headers: { "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${signature}` }
    });
  }

  it("applies once, ignores duplicate, and rejects a mismatched address", async () => {
    if (!prisma) throw new Error("DB missing");
    // Route module reads the app Prisma singleton, which must be backed by this
    // disposable DATABASE_URL at process startup. Never run in a mixed test process.
    const first = await POST(request("msg-integration-one"));
    expect(first.status).toBe(200);
    expect((await first.json()).outcome).toBe("unsubscribed");
    const duplicate = await POST(request("msg-integration-one"));
    expect((await duplicate.json()).duplicate).toBe(true);
    const unmatched = await POST(request("msg-integration-mismatch", { email: "other@example.invalid" }));
    expect((await unmatched.json()).outcome).toBe("unmatched");
    const saved = await prisma.rosObject.findUniqueOrThrow({ where: { id: relationshipId } });
    expect((saved.data as { emailMarketing: { status: string } }).emailMarketing.status).toBe("unsubscribed");
    expect(await prisma.resendContactWebhookEvent.count({ where: { workspaceId } })).toBe(2);
    expect(await prisma.timelineEvent.count({ where: { workspaceId, eventType: "marketing.unsubscribed" } })).toBe(1);
  });
});
