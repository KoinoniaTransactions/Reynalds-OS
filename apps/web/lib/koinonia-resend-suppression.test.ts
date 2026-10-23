import { describe, it, expect, vi } from "vitest";
import { getResendSuppressionSnapshot as check } from "./koinonia-resend-suppression";
describe("Resend suppression lookup (read only)", () => {
  const email = "qa@example.com";
  const f = (body: unknown, status = 200) => vi.fn(async () => new Response(status === 404 ? null : JSON.stringify(body), { status }));
  it.each(["bounce","complaint","manual"] as const)("identifies %s suppressions", async origin => {
    const fetcher = f({ object: "suppression", email, origin, created_at: "2026-10-22T12:00:00Z" });
    expect(await check(" QA@example.com ", "re_test", fetcher as unknown as typeof fetch))
      .toEqual({state:"suppressed",origin,observedAt:"2026-10-22T12:00:00Z"});
    expect((fetcher.mock.calls[0] as unknown[])[1]).toMatchObject({method:"GET",cache:"no-store"});
  });
  it("does not treat unrelated email as a match", async () => {
    const fetcher = f({object:"suppression",email:"other@example.com",origin:"bounce",created_at:"2026-10-22T12:00:00Z"});
    expect((await check(email,"re_test",fetcher as unknown as typeof fetch)).state).toBe("unavailable");
  });
  it("distinguishes not_found from verified permission", async () => {
    const fetcher = f(null,404);
    expect(await check(email,"re_test",fetcher as unknown as typeof fetch)).toEqual({state:"not_found"});
  });
  it("fails closed on unauthorized API, invalid payload and network errors", async () => {
    expect((await check(email,"re_test",f({},401) as unknown as typeof fetch)).state).toBe("unavailable");
    expect((await check(email,"re_test",f({}) as unknown as typeof fetch)).state).toBe("unavailable");
    const err=vi.fn(async()=>{throw Error("offline")});
    expect((await check(email,"re_test",err as unknown as typeof fetch)).state).toBe("unavailable");
  });
  it("refuses invalid email and key without calling provider", async () => {
    const fetcher=vi.fn();
    expect((await check("invalid","re_test",fetcher as unknown as typeof fetch)).state).toBe("unavailable");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
