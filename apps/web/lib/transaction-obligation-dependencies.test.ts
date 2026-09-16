import { describe, expect, it } from "vitest";
import { getTransactionObligationDependencyStatus } from "./transaction-obligation-dependencies";
import type { TransactionObligationRecord } from "./transaction-obligations";

function obligation(
  id: string,
  key: string,
  state: "scheduled" | "satisfied" | "not_applicable",
  outcome?: "occurred" | "no_event" | "completed"
): TransactionObligationRecord {
  return {
    id,
    name: key,
    status: state,
    health: "Healthy",
    data: {
      obligationKey: key,
      label: key,
      kind: "deadline",
      category: "inspection",
      dueDate: "2026-09-12",
      activatedAt: "2026-09-01T18:00:00.000Z",
      monitorAfter: "2026-09-01",
      state,
      sequence: 1,
      ...(outcome ? { satisfactionOutcome: outcome } : {})
    }
  };
}

describe("transaction obligation dependencies", () => {
  it("keeps Inspection Resolution conditional while the objection outcome is unknown", () => {
    const objection = obligation("o1", "contract.inspection-objection", "scheduled");
    const resolution = obligation("o2", "contract.inspection-resolution", "scheduled");

    expect(getTransactionObligationDependencyStatus(resolution, [objection, resolution])).toBe(
      "conditional_waiting"
    );
  });

  it("activates Inspection Resolution when an objection occurred", () => {
    const objection = obligation("o1", "contract.inspection-objection", "satisfied", "occurred");
    const resolution = obligation("o2", "contract.inspection-resolution", "scheduled");

    expect(getTransactionObligationDependencyStatus(resolution, [objection, resolution])).toBe(
      "active"
    );
  });

  it("makes Inspection Resolution not applicable when no objection occurred", () => {
    const objection = obligation("o1", "contract.inspection-objection", "satisfied", "no_event");
    const resolution = obligation("o2", "contract.inspection-resolution", "scheduled");

    expect(getTransactionObligationDependencyStatus(resolution, [objection, resolution])).toBe(
      "not_applicable"
    );
  });

  it("activates Title Resolution when either title objection occurred", () => {
    const recordTitle = obligation("t1", "contract.record-title-objection", "satisfied", "no_event");
    const offRecord = obligation("t2", "contract.off-record-title-objection", "satisfied", "occurred");
    const resolution = obligation("t3", "contract.title-resolution", "scheduled");

    expect(
      getTransactionObligationDependencyStatus(resolution, [recordTitle, offRecord, resolution])
    ).toBe("active");
  });

  it("dismisses Appraisal Resolution when no appraisal objection occurred", () => {
    const objection = obligation("a1", "contract.appraisal-objection", "satisfied", "no_event");
    const resolution = obligation("a2", "contract.appraisal-resolution", "scheduled");

    expect(getTransactionObligationDependencyStatus(resolution, [objection, resolution])).toBe(
      "not_applicable"
    );
  });
});
