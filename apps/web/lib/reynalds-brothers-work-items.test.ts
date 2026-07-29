import { describe, expect, it } from "vitest";
import {
  getWorkItemAlerts,
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
    expect(metrics.needsApproval).toBe(1);
    expect(metrics.attention).toBe(4);
    expect(metrics.redFlags).toBeGreaterThan(0);
    expect(metrics.missingCrew).toBe(4);
    expect(metrics.missingDocumentation).toBe(4);
  });

  it("derives lanes from work status and phase", () => {
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[0])).toBe("Permits");
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[2])).toBe("Triage");
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[3])).toBe("Needs Approval");
  });

  it("formats Walmart store locations without changing the Reynalds spelling", () => {
    expect(getWorkItemLocation(reynaldsBrothersFallbackWorkItems[0])).toBe("Store 1590 - Hialeah, FL");
  });

  it("raises division red flags for missing PO, permitting, tanks, oil removal, and documents", () => {
    const alerts = getWorkItemAlerts(reynaldsBrothersFallbackWorkItems[0]);

    expect(alerts).toContain("PO missing; alert all office staff after 5 business days.");
    expect(alerts).toContain("Coordinated oil removal is not confirmed.");
  });

  it("validates a new work item payload", () => {
    const input = validateWorkItemCreate({
      name: "WM-9001 Tulsa, Oklahoma - UCO Tank Replacement",
      nextAction: "Confirm Frontline tank delivery",
      data: {
        serviceLine: "UCO",
        customer: "Walmart",
        jobType: "UCO Tank Replacement",
        storeNumber: "9001",
        city: "Tulsa",
        state: "OK",
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
