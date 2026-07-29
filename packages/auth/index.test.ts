import { describe, expect, it } from "vitest";
import { can, getMockClientUser, getMockUser } from "./index";

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
});
