import { describe, expect, it } from "vitest";
import { AuthProviderConfigurationError, AuthenticationRequiredError } from "./auth";
import { getAuthErrorResponse } from "./api-auth";

describe("api auth responses", () => {
  it("returns null for non-auth errors", () => {
    expect(getAuthErrorResponse(new Error("plain failure"))).toBeNull();
  });

  it("turns missing authentication into a 401 response", async () => {
    const response = getAuthErrorResponse(new AuthenticationRequiredError());

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({ error: "Authentication required" });
  });

  it("can include a null user payload for the current-user endpoint", async () => {
    const response = getAuthErrorResponse(new AuthProviderConfigurationError("Missing auth keys."), {
      includeUser: true
    });

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({
      user: null,
      error: "Missing auth keys."
    });
  });
});
