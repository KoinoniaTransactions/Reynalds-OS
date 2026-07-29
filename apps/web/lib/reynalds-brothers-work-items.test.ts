import { describe, expect, it } from "vitest";
import {
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  applyChecklistAutomation,
  getChecklistProgress,
  getActivationPhaseForJobType,
  getOpenChecklistItems,
  getPhaseTrackForJobType,
  getRouteBatches,
  getWorkItemAlerts,
  getWorkItemChecklist,
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

  it("groups approved active work into route batches", () => {
    const batches = getRouteBatches(reynaldsBrothersFallbackWorkItems);
    const louisiana = batches.find((batch) => batch.region === "Louisiana");

    expect(louisiana?.workItems.map((item) => item.name)).toContain("WM-331 Sulphur, Louisiana - ACC Level 1 Triage");
    expect(louisiana?.workItems.map((item) => item.name)).not.toContain("WM-450 Shreveport, Louisiana - Pressure Washing");
    expect(louisiana?.blockedCount).toBeGreaterThan(0);
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
    expect(alerts).toContain("25 required checklist items still open.");
  });

  it("selects job-specific checklist templates", () => {
    expect(getWorkItemChecklist(reynaldsBrothersFallbackWorkItems[0]).some((item) => item.id === "acc_oil_removal_coordinated")).toBe(true);
    expect(getWorkItemChecklist(reynaldsBrothersFallbackWorkItems[1]).some((item) => item.id === "uco_frontline_received")).toBe(true);
    expect(getWorkItemChecklist(reynaldsBrothersFallbackWorkItems[3]).some((item) => item.id === "pw_vac_truck_secured")).toBe(true);
  });

  it("calculates checklist progress from completed item IDs", () => {
    const progress = getChecklistProgress(reynaldsBrothersFallbackWorkItems[1]);

    expect(progress.complete).toBe(1);
    expect(progress.total).toBe(9);
    expect(getOpenChecklistItems(reynaldsBrothersFallbackWorkItems[1])).toHaveLength(8);
  });

  it("selects phase tracks by job type", () => {
    expect(getPhaseTrackForJobType("Pressure Washing")).toContain("Vac Truck Secured");
    expect(getPhaseTrackForJobType("UCO Tank Replacement")).toContain("Tank Received");
    expect(getPhaseTrackForJobType("ACC Level 1 Triage")).toContain("Level 2 Triage");
  });

  it("activates approved jobs into their first working phase", () => {
    expect(getActivationPhaseForJobType("ACC Level 1 Triage")).toBe("Level 1 Triage");
    expect(getActivationPhaseForJobType("ACC Level 2 Triage")).toBe("Level 2 Triage");
    expect(getActivationPhaseForJobType("ACC Tank Replacement")).toBe("Permitting");
    expect(getActivationPhaseForJobType("UCO Tank Replacement")).toBe("Planning");
    expect(getActivationPhaseForJobType("Pressure Washing")).toBe("Planning");
  });

  it("automates related status fields from completed checklist items", () => {
    const data = applyChecklistAutomation(reynaldsBrothersFallbackWorkItems[1].data ?? {}, [
      "uco_frontline_ordered",
      "uco_frontline_received",
      "uco_po_confirmed",
      "uco_permits_approved",
      "uco_oil_removal_coordinated"
    ]);

    expect(data.poStatus).toBe("Received");
    expect(data.permitStatus).toBe("Approved");
    expect(data.tankStatus).toBe("Received from Frontline LLC");
    expect(data.oilRemovalStatus).toBe("Coordinated");
    expect(data.phase).toBe("Scheduled");
  });

  it("clears pressure washing red flags from smart checklist completion", () => {
    const smartData = applyChecklistAutomation(reynaldsBrothersFallbackWorkItems[3].data ?? {}, [
      "pw_vac_truck_secured",
      "pw_disposal_facility"
    ]);
    const alerts = getWorkItemAlerts({
      id: "test_pw",
      objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
      name: "PW test",
      status: smartData.phase ?? "Scheduling",
      health: "Watch",
      data: smartData
    });

    expect(smartData.vacTruckCompany).toBe("Secured - details pending");
    expect(smartData.disposalFacility).toBe("Secured - details pending");
    expect(alerts).not.toContain("Vac truck company is not secured.");
    expect(alerts).not.toContain("Disposal facility is not secured.");
  });

  it("marks jobs ready to invoice when completion proof is checked", () => {
    const data = applyChecklistAutomation(reynaldsBrothersFallbackWorkItems[3].data ?? {}, [
      "pw_after_photos",
      "pw_disposal_manifest",
      "pw_manager_signature",
      "pw_completion_date"
    ]);

    expect(data.invoiceStatus).toBe("Ready to Invoice");
    expect(data.billingApprovalStatus).toBe("Needs Shay Review");
    expect(data.phase).toBe("Billing Review");
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

  it("accepts expanded job control fields during updates", () => {
    const update = validateWorkItemUpdate({
      data: {
        approvalStatus: "Approved",
        approvedBy: "Jeremiah Reynalds",
        lucernexUrl: "https://lucernex.example/job/123",
        poNumber: "PO-123",
        poStatus: "Received",
        permitStatus: "Approved",
        permitSubmittedDate: "2026-07-29",
        permitApprovedDate: "2026-07-30",
        tankStatus: "Received",
        oilRemovalStatus: "Coordinated",
        companyCamUrl: "https://companycam.example/project/123",
        vacTruckCompany: "Vac2Go",
        disposalFacility: "Shreveport Disposal",
        completionDate: "2026-08-01",
        billingApprovalStatus: "Needs Shay Review",
        checklistCompleted: ["pw_vac_truck_secured"],
        sourceSystem: "email",
        sourceReferenceId: "gmail_preview_new_uco_9001",
        approvalDecisionAt: "2026-07-29T17:00:00.000Z",
        intakeReasons: ["Email appears to describe new work."]
      }
    });

    expect(update.data?.approvalStatus).toBe("Approved");
    expect(update.data?.lucernexUrl).toContain("lucernex");
    expect(update.data?.poNumber).toBe("PO-123");
    expect(update.data?.checklistCompleted).toEqual(["pw_vac_truck_secured"]);
    expect(update.data?.sourceReferenceId).toBe("gmail_preview_new_uco_9001");
    expect(update.data?.approvalDecisionAt).toBe("2026-07-29T17:00:00.000Z");
    expect(update.data?.intakeReasons).toEqual(["Email appears to describe new work."]);
  });
});
