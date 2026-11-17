import { describe, expect, it, vi } from "vitest";
vi.mock("./db", () => ({ prisma: {} }));
import { parseProspectCsv, planProspectImport, importProspects } from "./koinonia-prospect-import";
const header = "name,email,phone,brokerage,role,licenseNumber,externalId,sourceUrl,sourceCheckedAt,audienceType\n";
const row = '"Agent, Example",agent@example.test,(303) 555-0100,Example Brokerage,Agent,CO-123,123,https://example.test/directory,2026-01-01,prospect';
describe("prospect import source and identity review", () => {
  it("parses quoted commas, CRLF and escaped quotes", () => {
    const parsed = parseProspectCsv(header.replace(/\n/, "\r\n") + row.replace('"Agent, Example"', '"Agent, ""Example"""'));
    expect(parsed[0]).toMatchObject({ name: 'Agent, "Example"', email: "agent@example.test", audienceType: "prospect" });
  });
  it("rejects missing sources, unknown columns, unclosed quotes and invalid dates", () => {
    for (const csv of [header + row.replace("https://example.test/directory", "http://example.test"), header.replace("role", "optedIn") + row, header + row.replace('"Agent, Example"', '"Agent, Example'), header + row.replace("2026-01-01", "2026-02-30"), header + row.replace("2026-01-01", "2999-01-01")]) expect(() => parseProspectCsv(csv)).toThrow();
  });
  it("forces recognizable transaction coordinators to competitor without granting permission", () => {
    expect(parseProspectCsv(header + row.replace(",Agent,CO-123", ",Transaction Coordinator,CO-123"))[0].audienceType).toBe("competitor");
    expect(() => parseProspectCsv(header + row.replace(",prospect", ",client"))).toThrow();
  });
  it("deduplicates repeated rows, normalized phone, license and existing source IDs", () => {
    const [prospect] = parseProspectCsv(header + row);
    expect(planProspectImport([prospect, prospect], [])[1].action).toBe("skip_duplicate");
    for (const data of [{ contact: { email: "AGENT@example.test" } }, { contact: { phone: "+1 303-555-0100" } }, { contact: { licenseNumber: "co-123" } }, { prospectImport: { externalId: "123", sourceUrl: "https://example.test/directory?page=2" } }]) expect(planProspectImport([prospect], [{ data }])[0].action).toBe("skip_duplicate");
  });
  it("fails closed outside owner Preview access before touching the database", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    await expect(importProspects({ id: "owner", role: "Owner", workspaceId: "w" }, header + row, false, false)).rejects.toThrow("Preview");
    vi.stubEnv("VERCEL_ENV", "preview");
    await expect(importProspects({ id: "staff", role: "Employee", workspaceId: "w" }, header + row, true, true)).rejects.toThrow("owner");
    await expect(importProspects({ id: "owner", role: "Owner", workspaceId: "w" }, header + row, true, false)).rejects.toThrow("Confirm");
    vi.unstubAllEnvs();
  });
});
