import { describe, expect, it } from "vitest";
import {
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  addCommunicationToWorkItemData,
  applyChecklistAutomation,
  getBillingPassoffSummary,
  getChecklistProgress,
  getCommunicationSummary,
  getActivationPhaseForJobType,
  getOpenChecklistItems,
  getPhaseTrackForJobType,
  getFieldProofSummary,
  getRouteBatches,
  getTankInventorySummary,
  getWorkItemAlerts,
  getWorkItemChecklist,
  getWorkItemLane,
  getWorkItemLocation,
  getWorkItemMetrics,
  previewTrialWorkItemImport,
  reynaldsBrothersFallbackWorkItems,
  validateWorkItemCreate,
  validateWorkItemUpdate
} from "./reynalds-brothers-work-items";

describe("Reynalds Brothers work item engine", () => {
  it("summarizes the operational work queue", () => {
    const metrics = getWorkItemMetrics(reynaldsBrothersFallbackWorkItems);

    expect(metrics.total).toBe(4);
    expect(metrics.active).toBe(3);
    expect(metrics.completed).toBe(1);
    expect(metrics.communicationNeedsResponse).toBe(1);
    expect(metrics.needsApproval).toBe(0);
    expect(metrics.attention).toBe(3);
    expect(metrics.redFlags).toBeGreaterThan(0);
    expect(metrics.missingCrew).toBe(3);
    expect(metrics.missingDocumentation).toBe(3);
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
    expect(getWorkItemLane(reynaldsBrothersFallbackWorkItems[3])).toBe("Complete");
    expect(getWorkItemLane({
      ...reynaldsBrothersFallbackWorkItems[1],
      status: "Needs Approval",
      data: {
        ...(reynaldsBrothersFallbackWorkItems[1].data ?? {}),
        approvalStatus: "Needs Approval",
        completionDate: "2026-07-10"
      }
    })).toBe("Complete");
  });

  it("formats Walmart store locations without changing the Reynalds spelling", () => {
    expect(getWorkItemLocation(reynaldsBrothersFallbackWorkItems[0])).toBe("Store 1590 - Hialeah, FL");
  });

  it("raises division red flags for missing PO, permitting, tanks, oil removal, and documents", () => {
    const alerts = getWorkItemAlerts(reynaldsBrothersFallbackWorkItems[0]);

    expect(alerts).toContain("1 communication need human response documentation.");
    expect(alerts).toContain("PO missing; alert all office staff after 5 business days.");
    expect(alerts).toContain("Coordinated oil removal is not confirmed.");
    expect(alerts).toContain("25 required checklist items still open.");
  });

  it("summarizes filed communications and clears response flags when human action is documented", () => {
    const baseData = reynaldsBrothersFallbackWorkItems[1].data ?? {};
    const withInboundEmail = addCommunicationToWorkItemData(baseData, {
      id: "comm_test_needs_response",
      channel: "email",
      direction: "inbound",
      sourceLabel: "wmtanks",
      subject: "WM 4672 UCO tank delivery question",
      from: "projects@walmart.com",
      occurredAt: "2026-07-29T10:00:00-06:00",
      snippet: "Please confirm Frontline delivery.",
      humanResponseStatus: "Needs Response"
    });
    const withDocumentedAction = addCommunicationToWorkItemData(withInboundEmail, {
      id: "comm_test_documented",
      channel: "phone",
      direction: "outbound",
      sourceLabel: "wmtanks",
      subject: "Called store about UCO delivery",
      occurredAt: "2026-07-29T10:30:00-06:00",
      humanResponseStatus: "Documented",
      humanResponseBy: "Shay Reynalds",
      humanActionTaken: "Called Walmart and confirmed delivery timing."
    });
    const item = {
      ...reynaldsBrothersFallbackWorkItems[1],
      data: withDocumentedAction
    };
    const summary = getCommunicationSummary(item);

    expect(summary.total).toBe(2);
    expect(summary.needsResponse).toBe(1);
    expect(summary.documented).toBe(1);
    expect(summary.lastCommunication?.subject).toBe("Called store about UCO delivery");
    expect(withInboundEmail.communicationNeedsResponse).toBe(true);
    expect(withDocumentedAction.lastCommunicationSubject).toBe("Called store about UCO delivery");
    expect(getWorkItemAlerts(item)).toContain("1 communication need human response documentation.");
  });

  it("keeps completed jobs clear unless a new communication needs response", () => {
    const completedWithCommunication = {
      ...reynaldsBrothersFallbackWorkItems[3],
      data: addCommunicationToWorkItemData(reynaldsBrothersFallbackWorkItems[3].data ?? {}, {
        id: "comm_test_completed_response",
        channel: "email",
        direction: "inbound",
        sourceLabel: "wmtanks",
        subject: "Billing documentation question",
        from: "billing@walmart.com",
        occurredAt: "2026-07-29T11:00:00-06:00",
        humanResponseStatus: "Needs Response"
      })
    };

    expect(getWorkItemAlerts(reynaldsBrothersFallbackWorkItems[3])).toEqual([]);
    expect(getWorkItemAlerts(completedWithCommunication)).toEqual(["1 communication need human response documentation."]);
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

  it("summarizes ACC and UCO tank inventory readiness", () => {
    const accSummary = getTankInventorySummary({
      ...reynaldsBrothersFallbackWorkItems[0],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[0].data ?? {}),
        tankStatus: "Received",
        tankSerialNumbers: ["S1", "S2", "S3", "S4", "S5"]
      }
    });
    const ucoSummary = getTankInventorySummary({
      ...reynaldsBrothersFallbackWorkItems[1],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[1].data ?? {}),
        tankStatus: "Received from Frontline LLC",
        tankSerialNumbers: []
      }
    });

    expect(accSummary.requiredTanks).toHaveLength(5);
    expect(accSummary.readyForScheduling).toBe(true);
    expect(ucoSummary.requiredTanks).toHaveLength(1);
    expect(ucoSummary.readyForScheduling).toBe(false);
    expect(ucoSummary.missingSerialCount).toBe(1);
  });

  it("summarizes field proof readiness before billing", () => {
    const blocked = getFieldProofSummary(reynaldsBrothersFallbackWorkItems[0]);
    const ready = getFieldProofSummary({
      ...reynaldsBrothersFallbackWorkItems[0],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[0].data ?? {}),
        companyCamUrl: "https://companycam.example/project/1590",
        managerName: "Store Manager",
        managerTitle: "ACC Manager",
        signatureStatus: "Captured",
        completionDate: "2026-08-01",
        checklistCompleted: [
          "acc_serials_recorded",
          "acc_companycam_complete",
          "acc_manager_signature",
          "acc_completion_date"
        ]
      }
    });

    expect(blocked.readyForBilling).toBe(false);
    expect(blocked.nextAction).toContain("CompanyCam");
    expect(ready.readyForBilling).toBe(true);
    expect(ready.missingProofItems).toEqual([]);
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
    const smartData = applyChecklistAutomation(getActivePressureWashingData(), [
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
    const data = applyChecklistAutomation(getActivePressureWashingData(), [
      "pw_after_photos",
      "pw_disposal_manifest",
      "pw_manager_signature",
      "pw_completion_date"
    ]);

    expect(data.invoiceStatus).toBe("Ready to Invoice");
    expect(data.billingApprovalStatus).toBe("Needs Shay Review");
    expect(data.phase).toBe("Billing Review");
  });

  it("summarizes billing pass-off ownership and pending approvals", () => {
    const blocked = getBillingPassoffSummary({
      ...reynaldsBrothersFallbackWorkItems[0],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[0].data ?? {}),
        invoiceStatus: "Not Ready",
        billingApprovalStatus: "Not Started"
      }
    });
    const inReview = getBillingPassoffSummary({
      ...reynaldsBrothersFallbackWorkItems[0],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[0].data ?? {}),
        invoiceStatus: "Ready to Invoice",
        billingApprovalStatus: "Needs Jeremiah Approval"
      }
    });
    const approved = getBillingPassoffSummary({
      ...reynaldsBrothersFallbackWorkItems[0],
      data: {
        ...(reynaldsBrothersFallbackWorkItems[0].data ?? {}),
        invoiceStatus: "Ready to Invoice",
        billingApprovalStatus: "Approved"
      }
    });

    expect(blocked.currentOwner).toBe("Field / Office");
    expect(blocked.nextAction).toContain("field proof");
    expect(inReview.currentOwner).toBe("Jeremiah Reynalds");
    expect(inReview.completedSteps).toEqual(["Shay starts billing packet"]);
    expect(inReview.pendingSteps).toEqual([
      "Jeremiah approval",
      "Darren final approval",
      "Josh visibility"
    ]);
    expect(approved.approved).toBe(true);
    expect(approved.pendingSteps).toEqual([]);
  });

  it("previews pasted trial spreadsheet rows as needs-approval jobs", () => {
    const preview = previewTrialWorkItemImport([
      "Store Number\tCity\tState\tJob Type\tPO\tWO\tLucernex Link\tNext Action",
      "1590\tHialeah\tFlorida\tACC Tank Replacement\t\t247399487\thttps://lucernex.example/1590\tConfirm permits.",
      "450\tShreveport\tLouisiana\tPW\t\t\t\tSecure vac truck."
    ].join("\n"));

    expect(preview.errors).toEqual([]);
    expect(preview.records).toHaveLength(2);
    expect(preview.records[0].input.name).toBe("WM-1590 Hialeah, Florida - ACC Tank Replacement");
    expect(preview.records[0].input.status).toBe("Needs Approval");
    expect(preview.records[0].input.data.workOrderNumber).toBe("247399487");
    expect(preview.records[0].input.data.sourceSystem).toBe("trial_import");
    expect(preview.records[1].input.data.jobType).toBe("Pressure Washing");
    expect(preview.records[1].input.data.poStatus).toBe("Not Required Yet");
  });

  it("marks pasted rows with completion dates as complete", () => {
    const preview = previewTrialWorkItemImport([
      "Completion Date\tStore Number\tCity\tState\tJob Type\tPO\tInvoiced",
      "2026-07-10\t128\tJonesboro\tAR\tACC Tank Replacement\tPO# 40774173\tPAID",
      "2024-10-03\t348\tMonticello\tAR\tPressure Washing\t\tPAID"
    ].join("\n"));

    expect(preview.errors).toEqual([]);
    expect(preview.records).toHaveLength(2);
    expect(preview.records[0].input.status).toBe("Complete");
    expect(preview.records[0].input.health).toBe("Healthy");
    expect(preview.records[0].input.data.approvalStatus).toBe("Approved");
    expect(preview.records[0].input.data.phase).toBe("Complete");
    expect(preview.records[0].input.data.invoiceStatus).toBe("Paid");
    expect(preview.records[0].input.data.billingApprovalStatus).toBe("Approved");
    expect(preview.records[0].input.data.dataQualityStatus).toBe("Needs Line Review");
    expect(preview.records[0].input.data.spreadsheetFields).toMatchObject({
      "Completion Date": "2026-07-10",
      "Store Number": "128",
      Invoiced: "PAID"
    });
    expect(preview.records[1].input.status).toBe("Complete");
    expect(preview.records[1].warnings).toEqual([]);
  });

  it("keeps unclear billing on completed imports in billing review", () => {
    const preview = previewTrialWorkItemImport([
      "Completion Date\tStore Number\tCity\tState\tJob Type\tNotes",
      "2026-07-10\t2058\tRaleigh\tNC\tACC Tank Replacement\tCompletion date entered, billing unknown"
    ].join("\n"));

    expect(preview.records[0].input.status).toBe("Complete");
    expect(preview.records[0].input.data.invoiceStatus).toBe("Needs Billing Review");
    expect(preview.records[0].input.data.billingApprovalStatus).toBe("Needs Shay Review");
    expect(preview.records[0].input.data.billingReviewNotes).toContain("line-by-line review");
    expect(preview.records[0].input.data.spreadsheetFields?.Notes).toContain("billing unknown");
  });

  it("flags pasted trial rows that are missing required job identity fields", () => {
    const preview = previewTrialWorkItemImport([
      "Store Number\tCity\tState\tJob Type",
      "1590\t\tFlorida\tACC Tank Replacement"
    ].join("\n"));

    expect(preview.records).toEqual([]);
    expect(preview.errors).toEqual([{ rowNumber: 2, message: "Missing required city, job title." }]);
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
        managerName: "Jamie Store",
        managerTitle: "Store Manager",
        signatureStatus: "Captured",
        vacTruckCompany: "Vac2Go",
        disposalFacility: "Shreveport Disposal",
        completionDate: "2026-08-01",
        billingApprovalStatus: "Needs Shay Review",
        billingReviewNotes: "IP2P and QuickBooks need checked line by line.",
        dataQualityStatus: "Needs Line Review",
        sourceSheet: "ACC Tanks",
        sourceRowNumber: "42",
        spreadsheetFields: {
          "Completion Date": "2026-08-01",
          "Master Invoice # for Job": "Needs review"
        },
        checklistCompleted: ["pw_vac_truck_secured"],
        sourceSystem: "email",
        sourceReferenceId: "gmail_preview_new_uco_9001",
        approvalDecisionAt: "2026-07-29T17:00:00.000Z",
        intakeReasons: ["Email appears to describe new work."],
        communicationLog: [
          {
            id: "comm_123",
            channel: "email",
            direction: "inbound",
            sourceLabel: "wmtanks",
            subject: "Store update",
            from: "facility.coordinator@walmart.com",
            occurredAt: "2026-07-29T18:00:00.000Z",
            humanResponseStatus: "Needs Response",
            attachments: ["scope.pdf"]
          }
        ],
        lastCommunicationAt: "2026-07-29T18:00:00.000Z",
        lastCommunicationSubject: "Store update",
        communicationNeedsResponse: true,
        communicationResponseStatus: "Needs Office Review"
      }
    });

    expect(update.data?.approvalStatus).toBe("Approved");
    expect(update.data?.lucernexUrl).toContain("lucernex");
    expect(update.data?.poNumber).toBe("PO-123");
    expect(update.data?.managerName).toBe("Jamie Store");
    expect(update.data?.signatureStatus).toBe("Captured");
    expect(update.data?.billingReviewNotes).toContain("QuickBooks");
    expect(update.data?.dataQualityStatus).toBe("Needs Line Review");
    expect(update.data?.sourceSheet).toBe("ACC Tanks");
    expect(update.data?.sourceRowNumber).toBe("42");
    expect(update.data?.spreadsheetFields?.["Master Invoice # for Job"]).toBe("Needs review");
    expect(update.data?.checklistCompleted).toEqual(["pw_vac_truck_secured"]);
    expect(update.data?.sourceReferenceId).toBe("gmail_preview_new_uco_9001");
    expect(update.data?.approvalDecisionAt).toBe("2026-07-29T17:00:00.000Z");
    expect(update.data?.intakeReasons).toEqual(["Email appears to describe new work."]);
    expect(update.data?.communicationLog?.[0]?.sourceLabel).toBe("wmtanks");
    expect(update.data?.communicationLog?.[0]?.attachments).toEqual(["scope.pdf"]);
    expect(update.data?.communicationNeedsResponse).toBe(true);
    expect(update.data?.communicationResponseStatus).toBe("Needs Office Review");
  });
});

function getActivePressureWashingData() {
  return {
    ...(reynaldsBrothersFallbackWorkItems[3].data ?? {}),
    approvalStatus: "Approved",
    phase: "Planning",
    checklistCompleted: [],
    vacTruckCompany: "",
    disposalFacility: "",
    completionDate: null,
    invoiceStatus: "Not Ready",
    billingApprovalStatus: "Not Started",
    customerUpdateStatus: "Ready for planning.",
    mediaStatus: "No media yet"
  };
}
