import { describe, expect, it } from "vitest";
import {
  can,
  getMockClientUser,
  getMockEmployeeUser,
  getMockUser,
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

  it("does not allow client users to update access requests", () => {
    expect(can(getMockClientUser(), "client-portal:access:update")).toBe(false);
  });

  it("allows operations employees to assign work", () => {
    const employee = getMockEmployeeUser();

    expect(can(employee, "employee-portal:view")).toBe(true);
    expect(can(employee, "employee-portal:assignments:update")).toBe(true);
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
  });

  it("allows contract support to draft and request approval", () => {
    const permissions = rolePermissions["Contract Support"];

    expect(permissions).toContain("document-workspace:drafts:create");
    expect(permissions).toContain("document-workspace:drafts:update");
    expect(permissions).toContain("document-workspace:approval:request");
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

  it("allows clients to view and set up their billing profile", () => {
    const client = getMockClientUser();

    expect(can(client, "client-portal:billing:view")).toBe(true);
    expect(can(client, "client-portal:billing:setup")).toBe(true);
    expect(can(client, "billing-workspace:payments:process")).toBe(false);
  });

  it("allows finance to manage billing and process payments", () => {
    const permissions = rolePermissions.Finance;

    expect(permissions).toContain("billing-workspace:view");
    expect(permissions).toContain("billing-workspace:profiles:update");
    expect(permissions).toContain("billing-workspace:invoices:create");
    expect(permissions).toContain("billing-workspace:payments:process");
  });

  it("keeps showing providers out of payment records", () => {
    const permissions = rolePermissions["Showing Provider"];

    expect(permissions).not.toContain("client-portal:billing:view");
    expect(permissions).not.toContain("billing-workspace:view");
    expect(permissions).not.toContain("billing-workspace:payments:process");
  });
});
