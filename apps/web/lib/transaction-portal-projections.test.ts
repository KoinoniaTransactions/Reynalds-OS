import { describe, expect, it } from "vitest";
import {
  buildRealtorTransactionOverview,
  buildStaffTransactionOperations
} from "./transaction-portal-projections";
import type { TransactionObligationRecord } from "./transaction-obligations";

function obligation(input: {
  id: string;
  key: string;
  label: string;
  category: string;
  dueDate: string;
  state?: "baseline" | "scheduled" | "due_soon" | "satisfied" | "passed_needs_review" | "superseded" | "not_applicable";
  activatedAt?: string;
}): TransactionObligationRecord {
  return {
    id: input.id,
    name: input.label,
    status: "Scheduled",
    health: "Healthy",
    data: {
      obligationKey: input.key,
      label: input.label,
      kind: "deadline",
      category: input.category,
      dueDate: input.dueDate,
      activatedAt: input.activatedAt ?? "2026-09-01T12:00:00.000Z",
      monitorAfter: "2026-09-01",
      state: input.state ?? "scheduled",
      sequence: 1,
      sourceDocumentId: "doc_contract",
      sourceDocumentType: "Executed Contract to Buy and Sell"
    }
  };
}

describe("transaction portal projections", () => {
  it("runs the staff file chronologically from current contractual obligations", () => {
    const staff = buildStaffTransactionOperations({
      side: "buyer",
      stage: "under_contract",
      closingDate: "2026-09-30",
      status: "Under Contract",
      now: new Date("2026-09-10T12:00:00.000Z"),
      obligations: [
        obligation({
          id: "inspection",
          key: "contract.inspection-objection",
          label: "Inspection Objection Deadline",
          category: "inspection",
          dueDate: "2026-09-09"
        }),
        obligation({
          id: "title",
          key: "contract.title-resolution",
          label: "Title Resolution Deadline",
          category: "title",
          dueDate: "2026-09-10"
        }),
        obligation({
          id: "loan",
          key: "contract.new-loan-availability",
          label: "New Loan Availability Deadline",
          category: "financing",
          dueDate: "2026-09-12"
        }),
        obligation({
          id: "appraisal",
          key: "contract.appraisal",
          label: "Appraisal Deadline",
          category: "appraisal",
          dueDate: "2026-09-20"
        }),
        obligation({
          id: "closing",
          key: "contract.closing",
          label: "Closing Date",
          category: "closing",
          dueDate: "2026-09-30"
        })
      ]
    });

    expect(staff.needsReview.map((item) => item.id)).toEqual(["inspection"]);
    expect(staff.dueToday.map((item) => item.id)).toEqual(["title"]);
    expect(staff.dueSoon.map((item) => item.id)).toEqual(["loan"]);
    expect(staff.upcoming.map((item) => item.id)).toEqual(["appraisal", "closing"]);
    expect(staff.nextMilestone?.id).toBe("title");
  });

  it("advances lifecycle from the next live obligation", () => {
    const staff = buildStaffTransactionOperations({
      side: "seller",
      stage: "under_contract",
      closingDate: "2026-09-30",
      status: "Under Contract",
      now: new Date("2026-09-10T12:00:00.000Z"),
      obligations: [
        obligation({
          id: "inspection",
          key: "contract.inspection-objection",
          label: "Inspection Objection Deadline",
          category: "inspection",
          dueDate: "2026-09-11"
        }),
        obligation({
          id: "appraisal",
          key: "contract.appraisal",
          label: "Appraisal Deadline",
          category: "appraisal",
          dueDate: "2026-09-20"
        })
      ]
    });

    expect(staff.lifecycle).toBe("Inspection / Due Diligence");
  });

  it("keeps internal deadline trouble out of the realtor action list unless Koinonia needs the realtor", () => {
    const realtor = buildRealtorTransactionOverview({
      side: "buyer",
      stage: "under_contract",
      closingDate: "2026-09-30",
      status: "Under Contract",
      now: new Date("2026-09-10T12:00:00.000Z"),
      obligations: [
        obligation({
          id: "inspection",
          key: "contract.inspection-objection",
          label: "Inspection Objection Deadline",
          category: "inspection",
          dueDate: "2026-09-09"
        })
      ],
      realtorNeeds: []
    });

    expect(realtor.status).toBe("attention");
    expect(realtor.needsFromRealtor).toEqual([]);
    expect(realtor.summary).toContain("Nothing is needed from you right now");
  });

  it("surfaces only explicit Koinonia requests to the realtor", () => {
    const realtor = buildRealtorTransactionOverview({
      side: "buyer",
      stage: "under_contract",
      closingDate: "2026-09-30",
      status: "Under Contract",
      now: new Date("2026-09-10T12:00:00.000Z"),
      obligations: [],
      realtorNeeds: ["Please upload the earnest money receipt."]
    });

    expect(realtor.status).toBe("needs_you");
    expect(realtor.needsFromRealtor).toEqual(["Please upload the earnest money receipt."]);
  });
});
