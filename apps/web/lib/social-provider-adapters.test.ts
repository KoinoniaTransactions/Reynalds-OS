import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocialProviderError, socialProviderAdapter, linkedinImageUploadUrl, type ProviderContext } from "./social-provider-adapters";
const fetcher = vi.fn();
const base: ProviderContext = { snapshot: { workspaceId: "w1", variantId: "v1", revision: 1, platform: "facebook", caption: "Approved caption", media: [], campaignKey: null }, accountId: "101", accessToken: "fake-secret-token", mediaUrl: () => "https://storage.example/private?signature=fake", state: {} };
beforeEach(() => { fetcher.mockReset(); vi.stubGlobal("fetch", fetcher); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("provider dispatch boundaries", () => {
  it("prepares Facebook text without networking and publishes to its fixed Page endpoint", async () => {
    const adapter = socialProviderAdapter("facebook");
    expect((await adapter.prepare(base)).ready).toBe(true); expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockResolvedValue(new Response(JSON.stringify({ id: "101_202" })));
    expect(await adapter.publish(base)).toBe("101_202");
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toBe("https://graph.facebook.com/v25.0/101/feed");
    expect(String(url)).not.toContain(base.accessToken);
    expect(init.redirect).toBe("error"); expect(init.body.get("message")).toBe("Approved caption");
  });
  it("keeps unpublished Facebook image upload separate from feed publication", async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ id: "303" })));
    const adapter = socialProviderAdapter("facebook");
    const result = await adapter.prepare({ ...base, snapshot: { ...base.snapshot, media: [{ key: "social-preview/w1/v1/photo.jpg", type: "image/jpeg", size: 100, name: "photo" }] } });
    expect(result.state).toEqual({ mediaIds: ["303"] });
    expect(fetcher.mock.calls[0][1].body.get("published")).toBe("false");
    expect(String(fetcher.mock.calls[0][0])).toContain("/photos");
  });
  it("classifies timeouts, 5xx and missing post IDs as uncertain, never safe retries", async () => {
    const adapter = socialProviderAdapter("facebook");
    for (const response of [new Response(JSON.stringify({ error: { code: 2, message: "private token" } }), { status: 503 }), new Response(JSON.stringify({ success: true }))]) {
      fetcher.mockResolvedValueOnce(response);
      await expect(adapter.publish(base)).rejects.toMatchObject({ kind: "ambiguous" });
    }
    fetcher.mockRejectedValueOnce(new Error("includes secret request URL"));
    await expect(adapter.publish(base)).rejects.toMatchObject({ kind: "ambiguous", code: "transport_failure" });
  });
  it("retries explicit rate-limit rejection and requires reauthorization on expired grants", async () => {
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 4 } }), { status: 429, headers: { "retry-after": "120" } }));
    await expect(socialProviderAdapter("facebook").publish(base)).rejects.toMatchObject({ kind: "retryable", retryAfterSeconds: 120 });
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 190 } }), { status: 400 }));
    await expect(socialProviderAdapter("facebook").publish(base)).rejects.toMatchObject({ kind: "reauthorize" });
  });
  it("persists Instagram container identity before publishing", async () => {
    const adapter = socialProviderAdapter("instagram");
    const context = { ...base, snapshot: { ...base.snapshot, platform: "instagram" as const, media: [{ key: "social-preview/w1/v1/photo.jpg", type: "image/jpeg", size: 100, name: "photo" }] } };
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ id: "404" })));
    expect(await adapter.prepare(context)).toEqual({ ready: false, state: { containerId: "404" } });
    expect(fetcher.mock.calls[0][1].body.get("image_url")).toContain("storage.example");
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ status_code: "IN_PROGRESS" })));
    expect((await adapter.prepare({ ...context, state: { containerId: "404" } })).ready).toBe(false);
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ status_code: "FINISHED" })));
    expect((await adapter.prepare({ ...context, state: { containerId: "404" } })).ready).toBe(true);
    expect(fetcher.mock.calls.every(([url]) => !String(url).includes("media_publish"))).toBe(true);
  });
  it("accepts LinkedIn's empty 201 body and reads the external post ID header", async () => {
    vi.stubEnv("SOCIAL_LINKEDIN_API_VERSION", "202609");
    fetcher.mockResolvedValueOnce(new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:202" } }));
    expect(await socialProviderAdapter("linkedin").publish({ ...base, accountId: "urn:li:organization:101" })).toBe("urn:li:share:202");
  });
  it("does not allow TikTok Direct Post or arbitrary provider/account paths", async () => {
    expect(() => socialProviderAdapter("tiktok")).toThrow(SocialProviderError);
    await expect(socialProviderAdapter("facebook").publish({ ...base, accountId: "../me" })).rejects.toMatchObject({ code: "invalid_account_id" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects off-provider upload URLs before forwarding authorization", () => {
    for (const url of ["https://attacker.example/dms-uploads/file", "https://www.linkedin.com.attacker.example/dms-uploads/file", "http://www.linkedin.com/dms-uploads/file", "https://secret@www.linkedin.com/dms-uploads/file", "https://www.linkedin.com/other"]) expect(() => linkedinImageUploadUrl(url)).toThrow();
    expect(linkedinImageUploadUrl("https://www.linkedin.com/dms-uploads/image?signature=test").hostname).toBe("www.linkedin.com");
  });
  it("uploads and checkpoints a LinkedIn image without publishing", async () => {
    vi.stubEnv("SOCIAL_LINKEDIN_API_VERSION", "202609");
    const bytes = new Uint8Array([255, 216, 255]);
    const context = { ...base, accountId: "urn:li:organization:101", snapshot: { ...base.snapshot, platform: "linkedin" as const, media: [{ key: "social-preview/w1/v1/photo.jpg", type: "image/jpeg", size: 3, name: "photo" }] }, mediaBytes: vi.fn(async () => bytes) };
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ value: { image: "urn:li:image:abc", uploadUrl: "https://www.linkedin.com/dms-uploads/image?signature=test", uploadUrlExpiresAt: Date.now() + 60000 } }))).mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await socialProviderAdapter("linkedin").prepare(context)).toEqual({ ready: false, state: { imageUrns: ["urn:li:image:abc"] } });
    expect(fetcher.mock.calls[1][1].method).toBe("PUT"); expect(fetcher.mock.calls.some(([url]) => String(url).endsWith("/posts"))).toBe(false);
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ id: "urn:li:image:abc", owner: context.accountId, status: "AVAILABLE" })));
    expect((await socialProviderAdapter("linkedin").prepare({ ...context, state: { imageUrns: ["urn:li:image:abc"] } })).ready).toBe(true);
  });
  it("requires the post's actual author and approved caption during verification", async () => {
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ id: "101_202", is_published: true, from: { id: "999" }, message: base.snapshot.caption })));
    expect(await socialProviderAdapter("facebook").verify(base, "101_202")).toBe(false);
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ id: "101_202", is_published: true, from: { id: "101" }, message: base.snapshot.caption })));
    expect(await socialProviderAdapter("facebook").verify(base, "101_202")).toBe(true);
  });
});
