import { describe, expect, it } from "vitest";
import { calculateHealth } from "./index";

describe("calculateHealth", () => {
  it("counts object health states", () => {
    const result = calculateHealth([
      { id: "1", workspaceId: "w1", objectType: "Task", name: "A", status: "Open", health: "Critical" },
      { id: "2", workspaceId: "w1", objectType: "Task", name: "B", status: "Open", health: "Healthy" }
    ]);

    expect(result.total).toBe(2);
    expect(result.critical).toBe(1);
    expect(result.healthy).toBe(1);
  });
});
