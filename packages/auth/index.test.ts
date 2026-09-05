import { describe, expect, it } from "vitest";
import {
  can,
  createAuthUser,
  getPermissionsForRole,
  getMockClientUser,
  getMockEmployeeUser,
  getMockUser,
  getMockUserId,
  normalizeRoleName,
  PermissionDeniedError,
  requirePermission,
  rolePermissions
} from "./index";

describe("auth permissions", () => {
  it("allows owner to update objects", () => {
    expect(can(getMockUser(), "objects:update")).toBe(true);
  });

  it("allows client users to view and upload portal documents", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:view")).toBe(true);
    expect(can(client, "client-portal:documents:upload")).toBe(true);
  });

  it("allows client users to request showing support without object-admin access", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:showings:view")).toBe(true);
    expect(can(client, "client-portal:showings:create")).toBe(true);
    expect(can(client, "objects:create")).toBe(false);
  });

  it("allows client users to submit access requests without object-admin access", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:access:view")).toBe(true);
    expect(can(client, "client-portal:access:update")).toBe(true);
    expect(can(client, "objects:update")).toBe(false);
  });

  it("allows operations employees to assign work", () => {
    const employee = getMockEmployeeUser();

    expect(can(employee, "employee-portal:view")).toBe(true);
    expect(can(employee, "employee-portal:assignments:update")).toBe(true);
    expect(can(employee, "employee-portal:reviews:view")).toBe(true);
  });

  it("keeps client users out of the employee portal", () => {
    expect(can(getMockClientUser(), "employee-portal:view")).toBe(false);
  });

  it("limits showing providers to assigned work", () => {
    const permissions = rolePermissions["Showing Provider"];

    expect(permissions).toContain("employee-portal:assigned-work:view");
    expect(permissions).toContain("employee-portal:assigned-work:update");
    expect(permissions).not.toContain("employee-portal:assignments:update");
    expect(permissions).not.toContain("employee-portal:clients:view");
    expect(permissions).not.toContain("employee-portal:reviews:view");
  });

  it("allows contract support to draft and request approval", () => {
    const permissions = rolePermissions["Contract Support"];

    expect(permissions).toContain("document-workspace:drafts:create");
    expect(permissions).toContain("document-workspace:drafts:update");
    expect(permissions).toContain("document-workspace:approval:request");
    expect(permissions).toContain("employee-portal:reviews:view");
    expect(permissions).not.toContain("document-workspace:templates:update");
  });

  it("allows clients to approve portal documents without staff document tools", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:documents:approve")).toBe(true);
    expect(can(client, "document-workspace:view")).toBe(false);
    expect(can(client, "document-workspace:send")).toBe(false);
  });

  it("keeps showing providers out of transaction document drafting", () => {
    const permissions = rolePermissions["Showing Provider"];

    expect(permissions).not.toContain("document-workspace:drafts:create");
    expect(permissions).not.toContain("document-workspace:send");
  });

  it("allows clients to view, set up, and pay their own billing", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:billing:view")).toBe(true);
    expect(can(client, "client-portal:billing:setup")).toBe(true);
    expect(can(client, "client-portal:billing:pay")).toBe(true);
    expect(can(client, "billing-workspace:payments:process")).toBe(false);
  });

  it("allows the owner to use the client invoice payment path", () => {
    expect(can(getMockUser(), "client-portal:billing:pay")).toBe(true);
  });

  it("allows finance to manage billing and process payments", () => {
    const permissions = rolePermissions.Finance;

    expect(permissions).toContain("billing-workspace:view");
    expect(permissions).toContain("billing-workspace:profiles:update");
    expect(permissions).toContain("billing-workspace:invoices:create");
    expect(permissions).toContain("billing-workspace:payments:process");
    expect(permissions).not.toContain("client-portal:billing:pay");
    expect(permissions).not.toContain("employee-portal:reviews:view");
  });

  it("keeps showing providers out of payment records", () => {
    const permissions = rolePermissions["Showing Provider"];

    expect(permissions).not.toContain("client-portal:billing:view");
    expect(permissions).not.toContain("client-portal:billing:pay");
    expect(permissions).not.toContain("billing-workspace:view");
    expect(permissions).not.toContain("billing-workspace:payments:process");
  });

  it("maps provider role metadata to the matching portal permissions", () => {
    const user = createAuthUser({
      id: "usr_provider_client",
      workspaceId: "wks_koinonia",
      name: "Provider Client",
      email: "client@example.com",
      role: "Client"
    });

    expect(user.role).toBe("Client");
    expect(can(user, "client-portal:view")).toBe(true);
    expect(can(user, "employee-portal:view")).toBe(false);
  });

  it("falls unknown provider roles back to viewer permissions", () => {
    const user = createAuthUser({
      id: "usr_unknown",
      workspaceId: "wks_koinonia",
      name: "Unknown Role",
      email: "unknown@example.com",
      role: "External Admin"
    });

    expect(normalizeRoleName("External Admin")).toBe("Viewer");
    expect(user.role).toBe("Viewer");
    expect(getPermissionsForRole("External Admin")).toEqual(rolePermissions.Viewer);
    expect(can(user, "client-portal:view")).toBe(false);
  });

  it("creates different mock identities for the same role in different workspaces", () => {
    const koinoniaClientId = getMockUserId("wks_koinonia", "Client");
    const reynaldsBrothersClientId = getMockUserId(
      "wks_reynalds_brothers",
      "Client"
    );

    expect(koinoniaClientId).toBe("usr_mock_wks_koinonia_client");
    expect(reynaldsBrothersClientId).toBe(
      "usr_mock_wks_reynalds_brothers_client"
    );
    expect(koinoniaClientId).not.toBe(reynaldsBrothersClientId);
  });

  it("preserves the seeded Koinonia owner id while isolating owners in other workspaces", () => {
    expect(getMockUserId("wks_koinonia", "Owner")).toBe("usr_owner");
    expect(getMockUserId("wks_reynalds_brothers", "Owner")).toBe(
      "usr_mock_wks_reynalds_brothers_owner"
    );
  });

  it("throws a typed denial when a role lacks a permission", () => {
    expect(() =>
      requirePermission(getMockClientUser(), "employee-portal:view")
    ).toThrow(PermissionDeniedError);
  });
});
