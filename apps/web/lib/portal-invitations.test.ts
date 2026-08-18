import { describe, expect, it } from "vitest";
import {
  canRevokeInvitationStatus,
  getAllowedAuthRedirectOrigins,
  InvitationValidationError,
  isAllowedRedirectUrl,
  validateInvitationInput
} from "./portal-invitations";

describe("portal invitation validation", () => {
  it("normalizes valid invitation input", () => {
    expect(
      validateInvitationInput({
        clientObjectId: " obj_client ",
        email: " Realtor@Example.COM ",
        name: " Realtor Client ",
        providerInvitationId: " inv_123 ",
        redirectUrl: "/sign-in",
        roleName: " Client ",
        sendProviderInvitation: false,
        serviceContext: { package: "Transaction Coordination Plus" }
      })
    ).toEqual({
      clientObjectId: "obj_client",
      email: "realtor@example.com",
      name: "Realtor Client",
      providerInvitationId: "inv_123",
      redirectUrl: "/sign-in",
      roleName: "Client",
      sendProviderInvitation: false,
      serviceContext: { package: "Transaction Coordination Plus" }
    });
  });

  it("requires a valid email address", () => {
    expect(() =>
      validateInvitationInput({
        email: "not-an-email",
        roleName: "Client"
      })
    ).toThrow(InvitationValidationError);
  });

  it("requires a role name", () => {
    expect(() =>
      validateInvitationInput({
        email: "client@example.com"
      })
    ).toThrow(InvitationValidationError);
  });

  it("ignores array service context values", () => {
    expect(
      validateInvitationInput({
        email: "client@example.com",
        roleName: "Client",
        serviceContext: ["unexpected"]
      }).serviceContext
    ).toBeUndefined();
  });

  it("allows provider invitation sending when no provider id is supplied", () => {
    expect(
      validateInvitationInput({
        email: "client@example.com",
        roleName: "Client",
        sendProviderInvitation: true
      })
    ).toMatchObject({
      email: "client@example.com",
      roleName: "Client",
      sendProviderInvitation: true
    });
  });

  it("rejects unsafe redirect URLs", () => {
    expect(() =>
      validateInvitationInput({
        email: "client@example.com",
        roleName: "Client",
        redirectUrl: "javascript:alert(1)"
      })
    ).toThrow("redirectUrl must be a same-site path or a configured Koinonia redirect origin.");
  });

  it("rejects absolute invitation redirects outside configured Koinonia origins", () => {
    expect(() =>
      validateInvitationInput({
        email: "client@example.com",
        roleName: "Client",
        redirectUrl: "https://not-koinonia.example/client/dashboard"
      })
    ).toThrow("redirectUrl must be a same-site path or a configured Koinonia redirect origin.");
  });

  it("allows configured Koinonia redirect origins", () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    process.env.NEXT_PUBLIC_SITE_URL = "https://www.koinoniatransactions.com";

    try {
      expect(isAllowedRedirectUrl("https://www.koinoniatransactions.com/client/dashboard")).toBe(true);
    } finally {
      restoreEnvValue("NEXT_PUBLIC_SITE_URL", originalSiteUrl);
    }
  });

  it("supports an explicit auth redirect origin allowlist", () => {
    const originalAllowlist = process.env.KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS;
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS =
      "https://portal.koinoniatransactions.com, https://example-placeholder.invalid";

    try {
      expect(getAllowedAuthRedirectOrigins()).toEqual(["https://portal.koinoniatransactions.com"]);
      expect(isAllowedRedirectUrl("https://portal.koinoniatransactions.com/employee/dashboard")).toBe(true);
    } finally {
      restoreEnvValue("KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS", originalAllowlist);
      restoreEnvValue("NEXT_PUBLIC_SITE_URL", originalSiteUrl);
    }
  });

  it("rejects sending a provider invitation with an existing provider id", () => {
    expect(() =>
      validateInvitationInput({
        email: "client@example.com",
        providerInvitationId: "inv_existing",
        roleName: "Client",
        sendProviderInvitation: true
      })
    ).toThrow("providerInvitationId cannot be supplied when sendProviderInvitation is true.");
  });

  it("allows only unaccepted invitation statuses to be revoked", () => {
    expect(canRevokeInvitationStatus("pending")).toBe(true);
    expect(canRevokeInvitationStatus("provider_pending")).toBe(true);
    expect(canRevokeInvitationStatus("provider_error")).toBe(true);
    expect(canRevokeInvitationStatus("accepted")).toBe(false);
    expect(canRevokeInvitationStatus("revoked")).toBe(false);
  });
});

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
