import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
const enabled = process.env.RUN_PROSPECT_IMPORT_DB_INTEGRATION === "true";
vi.mock("./db", async () => {
  if (process.env.RUN_PROSPECT_IMPORT_DB_INTEGRATION !== "true") return { prisma: {} };
  const raw = process.env.PROSPECT_IMPORT_TEST_DATABASE_URL, url = raw ? new URL(raw) : null;
  if (!url || !["localhost", "127.0.0.1", "postgres"].includes(url.hostname) || url.pathname !== "/resend_webhook_test") throw new Error("Prospect import test requires the disposable local CI database");
  const { PrismaClient } = await import("@reynalds-os/database");
  return { prisma: new PrismaClient({ datasources: { db: { url: raw } } }) };
});
import { prisma } from "./db";
import { importProspects } from "./koinonia-prospect-import";
describe.skipIf(!enabled)("prospect import on disposable PostgreSQL", () => {
  const workspaces: string[] = [];
  const network = vi.fn(() => { throw new Error("No provider traffic permitted"); });
  const csv = "name,email,role,sourceUrl,sourceCheckedAt,audienceType\nExample Agent,agent@example.test,Agent,https://example.test/directory,2026-01-01,prospect\nExample Coordinator,tc@example.test,Transaction Coordinator,https://example.test/directory,2026-01-01,prospect";
  beforeAll(() => { vi.stubEnv("VERCEL_ENV", "preview"); vi.stubGlobal("fetch", network); });
  afterAll(async () => {
    for (const workspaceId of workspaces) { await prisma.auditEvent.deleteMany({ where: { workspaceId } }); await prisma.rosObject.deleteMany({ where: { workspaceId } }); await prisma.user.deleteMany({ where: { workspaceId } }); await prisma.workspace.delete({ where: { id: workspaceId } }); }
    await prisma.$disconnect(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
  });
  async function fixture() {
    const workspaceId = "test_prospects_" + randomUUID(); workspaces.push(workspaceId);
    await prisma.workspace.create({ data: { id: workspaceId, name: "Disposable prospects fixture", type: "company" } });
    const user = await prisma.user.create({ data: { workspaceId, name: "Test Owner", email: randomUUID() + "@example.test" } });
    return { id: user.id, role: "Owner", workspaceId };
  }
  it("reviews without writes then serializes concurrent commits without duplicates or consent", async () => {
    const actor = await fixture(); expect((await importProspects(actor, csv, false, false)).ready).toBe(2);
    expect(await prisma.rosObject.count({ where: { workspaceId: actor.workspaceId } })).toBe(0);
    const results = await Promise.all([importProspects(actor, csv, true, true), importProspects(actor, csv, true, true)]);
    expect(results.reduce((sum, item) => sum + item.created, 0)).toBe(2);
    const records = await prisma.rosObject.findMany({ where: { workspaceId: actor.workspaceId }, orderBy: { name: "asc" } });
    expect(records).toHaveLength(2); expect(records[0].data).toMatchObject({ emailMarketing: { status: "unknown" } });
    expect(records[1].data).toMatchObject({ contact: { audienceType: "competitor" }, emailMarketing: { status: "unknown" } });
    expect(network).not.toHaveBeenCalled();
  });
  it("preserves an archived opted-out record and scopes duplicates to the workspace", async () => {
    const actor = await fixture(), other = await fixture();
    const original = await prisma.rosObject.create({ data: { workspaceId: actor.workspaceId, name: "Suppressed existing", objectType: "Relationship", status: "Client", health: "Healthy", archivedAt: new Date(), data: { contact: { email: "agent@example.test" }, emailMarketing: { status: "do_not_contact" }, custom: "keep" } } });
    expect((await importProspects(actor, csv, true, true)).created).toBe(1);
    expect(await prisma.rosObject.findUnique({ where: { id: original.id } })).toEqual(original);
    expect((await importProspects(other, csv, true, true)).created).toBe(2);
  });
});
