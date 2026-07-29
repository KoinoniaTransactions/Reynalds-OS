import { describe, expect, it } from "vitest";
import {
  canRevokeInvitationStatus,
  InvitationValidationError,
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
    ).toThrow("redirectUrl must be an http(s) URL or same-site path.");
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
