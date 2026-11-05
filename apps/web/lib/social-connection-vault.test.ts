import { afterEach, describe, expect, it } from "vitest";
import { openSocialConnection, sealSocialConnection } from "./social-connection-vault";

describe("social connection secret storage", () => {
  afterEach(() => { delete process.env.SOCIAL_CONNECTION_VAULT_KEY; });
  it("encrypts without revealing tokens and binds ciphertext to workspace and connection", () => {
    process.env.SOCIAL_CONNECTION_VAULT_KEY = Buffer.alloc(32, 17).toString("base64");
    const envelope = sealSocialConnection({ accessToken: "secret-test-value" }, "w1", "c1");
    expect(envelope).not.toContain("secret-test-value");
    expect(openSocialConnection(envelope, "w1", "c1")).toEqual({ accessToken: "secret-test-value" });
    expect(() => openSocialConnection(envelope, "w2", "c1")).toThrow();
    expect(() => openSocialConnection(envelope, "w1", "c2")).toThrow();
    expect(sealSocialConnection({ accessToken: "secret-test-value" }, "w1", "c1")).not.toEqual(envelope);
  });
  it("fails closed if key is unavailable", () => {
    expect(() => sealSocialConnection({ accessToken: "x" }, "w1", "c1")).toThrow();
  });
});
