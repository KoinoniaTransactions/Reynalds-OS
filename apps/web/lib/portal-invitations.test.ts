import { describe, expect, it } from "vitest";
import { InvitationValidationError, validateInvitationInput } from "./portal-invitations";

describe("portal invitation validation", () => {
  it("normalizes valid invitation input", () => {
    expect(
      validateInvitationInput({
        clientObjectId: " obj_client ",
        email: " Realtor@Example.COM ",
        name: " Realtor Client ",
        providerInvitationId: " inv_123 ",
        roleName: " Client ",
        serviceContext: { package: "Transaction Coordination Plus" }
      })
    ).toEqual({
      clientObjectId: "obj_client",
      email: "realtor@example.com",
      name: "Realtor Client",
      providerInvitationId: "inv_123",
      roleName: "Client",
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
});
