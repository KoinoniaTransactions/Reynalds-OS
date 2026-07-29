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
});
