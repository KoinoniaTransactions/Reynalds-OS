import { createHash } from "node:crypto";
import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";

export class ProspectImportError extends Error {}
export type Prospect = { name: string; email: string; phone: string; brokerage: string; role: string; market: string; licenseNumber: string; externalId: string; sourceUrl: string; sourceCheckedAt: string; audienceType: string };
const columns = ["name", "email", "phone", "brokerage", "role", "market", "licenseNumber", "externalId", "sourceUrl", "sourceCheckedAt", "audienceType"] as const;
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const phoneKey = (value: string) => value.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
const sourceKey = (value: string) => { const url = new URL(value); return url.origin + url.pathname; };

/** Strict RFC-style quoted CSV, bounded before parsing; no spreadsheet formulas are executed. */
export function parseProspectCsv(csv: string): Prospect[] {
  if (Buffer.byteLength(csv, "utf8") > 1024 * 1024) throw new ProspectImportError("CSV must be at most 1 MiB");
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false, endedQuote = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (quoted) { if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') { quoted = false; endedQuote = true; } else cell += c; continue; }
    if (c === '"') { if (cell || endedQuote) throw new ProspectImportError("Malformed CSV quotes"); quoted = true; }
    else if (c === "," || c === "\n" || c === "\r") {
      row.push(cell); cell = ""; endedQuote = false;
      if (c !== ",") { if (c === "\r" && csv[i + 1] === "\n") i++; if (row.some(value => value.trim())) rows.push(row); row = []; }
    } else { if (endedQuote) throw new ProspectImportError("Unexpected text after CSV quote"); cell += c; }
    if (rows.length > 1001) throw new ProspectImportError("CSV must contain at most 1,000 prospects");
  }
  if (quoted) throw new ProspectImportError("Unclosed CSV quote");
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  const header = rows.shift()?.map(value => value.trim().replace(/^\uFEFF/, ""));
  if (!header || new Set(header).size !== header.length || header.some(value => !(columns as readonly string[]).includes(value)) || !["name", "sourceUrl", "sourceCheckedAt"].every(value => header.includes(value))) throw new ProspectImportError("Use the template headers, including name, sourceUrl and sourceCheckedAt");
  if (!rows.length || rows.length > 1000) throw new ProspectImportError("CSV must contain 1–1,000 prospects");
  return rows.map((values, index) => {
    const fail = (message: string): never => { throw new ProspectImportError("Row " + (index + 2) + ": " + message); };
    if (values.length !== header.length) fail("column count differs from header");
    const data = Object.fromEntries(columns.map(key => [key, ""])) as Prospect;
    header.forEach((key, i) => { data[key as keyof Prospect] = values[i].trim(); });
    if (Object.values(data).some(value => value.length > 500 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value))) fail("field exceeds limits");
    if (!data.name || !(data.email || data.phone || data.licenseNumber || data.externalId)) fail("name and an email, phone, licenseNumber or externalId are required");
    data.email = data.email.toLowerCase();
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail("invalid email");
    if (data.phone && !/^\d{10,15}$/.test(phoneKey(data.phone))) fail("invalid phone");
    let url: URL; try { url = new URL(data.sourceUrl); } catch { return fail("sourceUrl must be an HTTPS URL"); }
    if (url.protocol !== "https:" || url.username || url.password) fail("sourceUrl must be an HTTPS URL without credentials");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.sourceCheckedAt) || !Number.isFinite(Date.parse(data.sourceCheckedAt)) || new Date(data.sourceCheckedAt).toISOString().slice(0, 10) !== data.sourceCheckedAt || data.sourceCheckedAt > new Date().toISOString().slice(0, 10)) fail("sourceCheckedAt must be a valid past or current YYYY-MM-DD date");
    data.audienceType ||= "unreviewed";
    if (!["unreviewed", "prospect", "partner", "competitor"].includes(data.audienceType)) fail("audienceType must be unreviewed, prospect, partner or competitor");
    if (/transaction\s*(coordinat|management)|contract.to.close|\bTC\s+(services|provider|company)\b/i.test(data.role + " " + data.brokerage)) data.audienceType = "competitor";
    return data;
  });
}
function identities(prospect: Prospect) {
  return [prospect.email && "email:" + prospect.email.toLowerCase(), prospect.phone && "phone:" + phoneKey(prospect.phone), prospect.licenseNumber && "license:" + prospect.licenseNumber.toLowerCase().replace(/\s/g, ""), prospect.externalId && "source:" + sourceKey(prospect.sourceUrl) + ":" + prospect.externalId].filter(Boolean) as string[];
}
export function planProspectImport(prospects: Prospect[], records: { data: unknown }[]) {
  const known = new Set<string>();
  for (const record of records) {
    const root = object(record.data), contact = object(root.contact), provenance = object(root.prospectImport);
    const existing = { email: text(contact.email), phone: text(contact.phone), licenseNumber: text(provenance.licenseNumber || contact.licenseNumber), externalId: text(provenance.externalId), sourceUrl: text(provenance.sourceUrl) } as Prospect;
    // Legacy malformed provenance cannot abort a review; email/phone/license still participate.
    try { identities(existing).forEach(key => known.add(key)); } catch { identities({ ...existing, externalId: "" }).forEach(key => known.add(key)); }
  }
  return prospects.map((prospect, index) => {
    const keys = identities(prospect), duplicate = keys.some(key => known.has(key));
    keys.forEach(key => known.add(key));
    return { row: index + 2, name: prospect.name, audienceType: prospect.audienceType, action: duplicate ? "skip_duplicate" as const : "create" as const };
  });
}
export async function importProspects(actor: { id: string; role: string; workspaceId: string }, csv: string, commit: boolean, reviewed: boolean) {
  if (actor.role !== "Owner" || process.env.VERCEL_ENV !== "preview") throw new ProspectImportError("Prospect import is available only to the owner in Preview");
  const prospects = parseProspectCsv(csv);
  if (commit && !reviewed) throw new ProspectImportError("Confirm source and audience review before importing");
  return prisma.$transaction(async tx => {
    // Serialize this import path per workspace; all duplicate checks are repeated at commit.
    if (commit) await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${actor.workspaceId + ":prospect-import"}, 0))`;
    const records = await tx.rosObject.findMany({ where: { workspaceId: actor.workspaceId, objectType: "Relationship" }, select: { data: true }, take: 10001 });
    if (records.length > 10000) throw new ProspectImportError("CRM exceeds the safe import review limit; use a reviewed migration");
    const plan = planProspectImport(prospects, records);
    let created = 0;
    if (commit) {
      const fingerprint = createHash("sha256").update(csv).digest("hex");
      const incoming = prospects.filter((_, index) => plan[index].action === "create");
      if (incoming.length) created = (await tx.rosObject.createMany({ data: incoming.map(prospect => ({ workspaceId: actor.workspaceId, objectType: "Relationship", name: prospect.name, status: "Awareness", health: "Healthy", ownerId: actor.id, nextAction: prospect.audienceType === "competitor" ? "Exclude from acquisition outreach" : "Review source, fit and contact permission",
          data: { relationshipProfileVersion: 1, contact: { email: prospect.email, phone: prospect.phone, brokerage: prospect.brokerage, role: prospect.role, market: prospect.market, audienceType: prospect.audienceType }, acquisition: { source: "Other", sourceDetail: "Reviewed prospect source import" }, emailMarketing: { status: "unknown" }, prospectImport: { sourceUrl: prospect.sourceUrl, sourceCheckedAt: prospect.sourceCheckedAt, licenseNumber: prospect.licenseNumber, externalId: prospect.externalId, fingerprint, importedAt: new Date().toISOString(), importedBy: actor.id } } as Prisma.InputJsonValue })) })).count;
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "marketing.prospects.imported", subjectType: "Relationship", summary: "Reviewed prospect import; existing records and consent preserved", metadata: { fingerprint, created, skipped: prospects.length - created, sourceReviewAcknowledged: true } } });
    }
    return { plan, committed: commit, created, skipped: plan.filter(row => row.action === "skip_duplicate").length, ready: plan.filter(row => row.action === "create").length };
  }, { timeout: 30000 });
}
