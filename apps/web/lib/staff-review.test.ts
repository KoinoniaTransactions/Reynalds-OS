import { describe, expect, it } from "vitest";
import { buildStaffReviewReport, type StaffReviewSourceObject } from "./staff-review";

const now = new Date("2026-07-29T16:00:00.000Z");

function workItem(overrides: Partial<StaffReviewSourceObject> = {}): StaffReviewSourceObject {
  return {
    assignedStaffUserId: "usr_staff",
    clientObjectId: "obj_client",
    health: "Healthy",
    id: "obj_work",
    name: "Smith Contract to Close",
    nextAction: "Review deadline checklist.",
    objectType: "Transaction",
    status: "Active",
    updatedAt: now,
    ...overrides
  };
}

describe("buildStaffReviewReport", () => {
  it("flags active work without staff assignment or client link", () => {
    const report = buildStaffReviewReport({
      documents: [],
      generatedAt: now,
      workItems: [
        workItem({
          assignedStaffUserId: null,
          clientObjectId: null,
          clientUserId: null,
          health: "Critical"
        })
      ]
    });

    expect(report.overallStatus).toBe("critical");
    expect(report.items.map((item) => item.id)).toContain("obj_work:assignment");
    expect(report.items.map((item) => item.id)).toContain("obj_work:client-link");
  });

  it("flags showing requests without Realtor authorization", () => {
    const report = buildStaffReviewReport({
      documents: [],
      generatedAt: now,
      workItems: [
        workItem({
          data: {
            authorization: false,
            preferredWindow: "Today after 3 PM"
          },
          id: "obj_showing",
          objectType: "ShowingRequest",
          status: "Requested"
        })
      ]
    });

    expect(report.overallStatus).toBe("critical");
    expect(report.items).toContainEqual(
      expect.objectContaining({
        id: "obj_showing:showing",
        severity: "critical",
        title: "Showing authorization needed"
      })
    );
  });

  it("flags billing setup without recorded consent", () => {
    const report = buildStaffReviewReport({
      documents: [],
      generatedAt: now,
      workItems: [
        workItem({
          data: {
            consentAcknowledged: false,
            serviceName: "Contract Support"
          },
          id: "obj_billing",
          objectType: "BillingSetupRequest",
          status: "Consent Needed"
        })
      ]
    });

    expect(report.items[0]).toEqual(
      expect.objectContaining({
        category: "billing",
        id: "obj_billing:billing",
        severity: "critical"
      })
    );
  });

  it("flags documents missing private storage or requested action", () => {
    const report = buildStaffReviewReport({
      documents: [
        {
          documentType: "Purchase Agreement",
          fileName: "purchase-agreement.pdf",
          id: "doc_1",
          requestedAction: null,
          status: "Uploaded",
          storageKey: null
        }
      ],
      generatedAt: now,
      workItems: []
    });

    expect(report.overallStatus).toBe("critical");
    expect(report.items.map((item) => item.id)).toContain("doc_1:storage");
    expect(report.items.map((item) => item.id)).toContain("doc_1:requested-action");
    expect(report.items.map((item) => item.id)).toContain("doc_1:review");
  });

  it("returns a clear report when all reviewed work is closed or healthy", () => {
    const report = buildStaffReviewReport({
      documents: [
        {
          documentType: "Final Archive",
          fileName: "archive.pdf",
          id: "doc_archive",
          requestedAction: "Archive only",
          status: "Archived",
          storageKey: "portal/wks/doc_archive/archive.pdf"
        }
      ],
      generatedAt: now,
      workItems: [
        workItem({
          id: "obj_complete",
          status: "Completed"
        }),
        workItem({
          id: "obj_canceled",
          objectType: "ShowingRequest",
          status: "Canceled"
        })
      ]
    });

    expect(report.overallStatus).toBe("clear");
    expect(report.items).toEqual([]);
    expect(report.summary).toContainEqual({ label: "Clear", value: "Ready" });
  });
});
