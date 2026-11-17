import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const run = vi.hoisted(() => vi.fn());
vi.mock("../../../../../lib/social-publishing-worker", () => ({ runSocialPublishingWorker: run }));
import { GET } from "./route";
const secret = "a".repeat(40);
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", secret); vi.stubEnv("SOCIAL_PUBLISHING_ENABLED", "false"); });
afterEach(() => vi.unstubAllEnvs());
describe("server dispatcher activation and authentication", () => {
  it("rejects missing, wrong and multibyte credentials without running jobs", async () => {
    for (const authorization of ["", "Bearer " + "b".repeat(40), "Bearer " + "é".repeat(40)]) expect((await GET(new Request("https://preview.example/api/internal/social/dispatch", { headers: { authorization } }))).status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });
  it("returns a disabled result before database or provider access", async () => {
    const response = await GET(new Request("https://preview.example/api/internal/social/dispatch", { headers: { authorization: "Bearer " + secret } }));
    expect(await response.json()).toEqual({ disabled: true, processed: 0 }); expect(run).not.toHaveBeenCalled();
  });
});
