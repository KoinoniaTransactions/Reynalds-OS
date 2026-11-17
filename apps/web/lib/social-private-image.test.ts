import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ send: vi.fn(), destroy: vi.fn() }));
vi.mock("@aws-sdk/client-s3", () => ({ S3Client: class { send = mocks.send; destroy = mocks.destroy; }, GetObjectCommand: class { constructor(public input: unknown) {} } }));
import { readPrivateSocialImage } from "./social-private-image";
import type { SocialSnapshot } from "./social-queue-policy";
const snapshot: SocialSnapshot = { workspaceId: "w1", variantId: "v1", revision: 1, platform: "linkedin", caption: "Example", campaignKey: null, media: [{ key: "approved/image.jpg", name: "image.jpg", type: "image/jpeg", size: 3 }] };
describe("private LinkedIn image reader", () => {
  beforeEach(() => { mocks.send.mockReset(); mocks.destroy.mockReset(); for (const key of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]) vi.stubEnv(key, "fixture"); });
  afterEach(() => vi.unstubAllEnvs());
  function response(bytes = new Uint8Array([255, 216, 255]), type = "image/jpeg", size = 3) { return { ContentLength: size, ContentType: type, Body: { transformToWebStream: () => new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }) } }; }
  it("reads only approved keys and validates metadata, size and file signature", async () => {
    await expect(readPrivateSocialImage(snapshot, "other")).rejects.toThrow("Unsupported"); expect(mocks.send).not.toHaveBeenCalled();
    mocks.send.mockResolvedValue(response()); expect(await readPrivateSocialImage(snapshot, "approved/image.jpg")).toEqual(new Uint8Array([255, 216, 255])); expect(mocks.destroy).toHaveBeenCalledOnce();
  });
  it("rejects changed metadata, oversized streams and mismatched content", async () => {
    for (const result of [response(undefined, "image/png"), response(new Uint8Array(4)), response(new Uint8Array([1, 2, 3]))]) { mocks.send.mockResolvedValue(result); await expect(readPrivateSocialImage(snapshot, "approved/image.jpg")).rejects.toThrow(); }
    expect(mocks.destroy).toHaveBeenCalledTimes(3);
  });
  it("bounds the storage request and destroys the client on network failure", async () => {
    mocks.send.mockRejectedValue(new Error("network")); await expect(readPrivateSocialImage(snapshot, "approved/image.jpg")).rejects.toThrow();
    expect(mocks.send.mock.calls[0][1].abortSignal).toBeInstanceOf(AbortSignal); expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});
