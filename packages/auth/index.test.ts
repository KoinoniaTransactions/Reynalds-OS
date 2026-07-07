import { describe, expect, it } from "vitest";
import { can, getMockUser } from "./index";

describe("auth permissions", () => {
  it("allows owner to update objects", () => {
    expect(can(getMockUser(), "objects:update")).toBe(true);
  });
});
