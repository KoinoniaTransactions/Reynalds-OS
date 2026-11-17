import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
const enabled = process.env.RUN_CONSULTATION_DB_INTEGRATION === "true";
vi.mock("../../../../lib/db", async () => {
  if (process.env.RUN_CONSULTATION_DB_INTEGRATION !== "true") return { prisma: {} };
  const raw = process.env.CONSULTATION_TEST_DATABASE_URL, url = raw ? new URL(raw) : null;
  if (!url || !["localhost", "127.0.0.1", "postgres"].includes(url.hostname) || url.pathname !== "/resend_webhook_test") throw new Error("Consultation test requires disposable local CI database");
  const { PrismaClient } = await import("@reynalds-os/database"); return { prisma: new PrismaClient({ datasources: { db: { url: raw } } }) };
});
import { prisma } from "../../../../lib/db";
import { POST } from "./route";
describe.skipIf(!enabled)("tagged consultation to CRM on disposable PostgreSQL", () => {
  const ids: string[] = []; let createdWorkspace = false;
  const network = vi.fn(() => { throw new Error("No notification or provider sends permitted"); });
  beforeAll(async () => {
    vi.stubEnv("VERCEL", "1"); vi.stubEnv("VERCEL_ENV", "preview"); vi.stubGlobal("fetch", network);
    if (!await prisma.workspace.findUnique({ where: { id: "wks_koinonia" } })) { await prisma.workspace.create({ data: { id: "wks_koinonia", name: "Disposable Koinonia intake fixture", type: "company" } }); createdWorkspace = true; }
  });
  afterAll(async () => {
    for (const id of ids) { await prisma.task.deleteMany({ where: { relatedObjectId: id } }); await prisma.timelineEvent.deleteMany({ where: { objectId: id } }); await prisma.rosObject.delete({ where: { id } }); }
    if (createdWorkspace) await prisma.workspace.delete({ where: { id: "wks_koinonia" } });
    await prisma.$disconnect(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
  });
  it("persists conversion tags, creates a follow-up, deduplicates repeat requests and preserves opt-outs", async () => {
    const email = randomUUID() + "@example.test";
    const payload = { consultationType: "Transaction Management", name: "Synthetic Agent", email, phone: "303-555-0199", preferredDate: "2026-12-01", preferredTime: "10:00 AM – 11:00 AM", notes: "Synthetic acceptance fixture", attribution: { utmSource: "facebook", utmMedium: "organic_social", utmCampaign: "fixture-campaign", fbclid: "synthetic-click" } };
    const request = () => new Request("https://preview.example/api/koinonia/consultation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    expect((await POST(request())).status).toBe(200);
    const records = await prisma.rosObject.findMany({ where: { workspaceId: "wks_koinonia", objectType: "Relationship" } });
    const record = records.find(row => (row.data as { contact?: { email?: string } })?.contact?.email === email); expect(record).toBeDefined(); if (!record) return;
    ids.push(record.id); expect(record.data).toMatchObject({ acquisition: { conversionTouch: { utmCampaign: "fixture-campaign" }, sourceDetail: "Facebook organic · medium=organic_social" } });
    await prisma.rosObject.update({ where: { id: record.id }, data: { status: "Client", data: { ...(record.data as object), emailMarketing: { status: "unsubscribed", optedOutAt: "2026-01-01T00:00:00Z" } } } });
    expect((await POST(request())).status).toBe(200);
    expect(await prisma.rosObject.count({ where: { workspaceId: "wks_koinonia", objectType: "Relationship" } })).toBe(1);
    expect(await prisma.rosObject.findUnique({ where: { id: record.id } })).toMatchObject({ status: "Client", data: { emailMarketing: { status: "unsubscribed" } } });
    expect(await prisma.task.count({ where: { relatedObjectId: record.id } })).toBe(1); expect(network).not.toHaveBeenCalled();
  });
});
