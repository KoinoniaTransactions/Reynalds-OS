import { describe, expect, it } from "vitest";
import {
  getWorkItemLane,
  getWorkItemLocation,
  getWorkItemMetrics,
  reynaldsBrothersFallbackWorkItems,
  validateWorkItemCreate,
  validateWorkItemUpdate
} from "./reynalds-brothers-work-items";

describe("Reynalds Brothers work item engine", () => {
  it("summarizes the operational work queue", () => {
    const metrics = getWorkItemMetrics(reynaldsBrothersFallbackWorkItems);

    expect(metrics.total).toBe(4);
    expect(metrics.active).toBe(4);
    expect(metrics.attention).toBe(2);
    expect(metrics.missingCrew).toBe(3);
    expect(metrics.missingDocumentation).toBe(4);
  });

  it("derives lanes from work status and phase", () => {
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[0])).toBe("Planning");
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[3])).toBe("Waiting");
  });

  it("formats Walmart store locations without changing the Reynalds spelling", () => {
    expect(getWorkItemLocation(reynaldsBrothersFallbackWorkItems[0])).toBe("Store 1540 - South Haven, MI");
  });

  it("validates a new work item payload", () => {
    const input = validateWorkItemCreate({
      name: "WM 9001 - Emergency Plumbing",
      nextAction: "Confirm access window",
      data: {
        serviceLine: "Plumbing",
        customer: "Walmart",
        equipmentRequired: "Jet, PPE",
        documentationRequired: ["Before photos", "Completion notes"]
      }
    });

    expect(input.status).toBe("Intake");
    expect(input.health).toBe("Healthy");
    expect(input.data.equipmentRequired).toEqual(["Jet", "PPE"]);
    expect(input.data.documentationRequired).toEqual(["Before photos", "Completion notes"]);
  });

  it("requires at least one update field", () => {
    expect(() => validateWorkItemUpdate({})).toThrow("At least one Work Item field is required.");
  });
});
