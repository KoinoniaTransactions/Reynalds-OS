import { describe, expect, it } from "vitest";
import {
  deriveConfirmedExtractionObligations,
  evaluateTransactionObligation,
  type TransactionObligationRecord
} from "./transaction-obligations";
import type { TransactionExtractionProposal } from "./transaction-extraction";

function proposal(overrides: Partial<TransactionExtractionProposal> = {}): TransactionExtractionProposal {
  return {
    clientNames: ["Example Client"],
    identifiedDocumentType: "Executed Contract to Buy and Sell",
    documentRequirementId: "purchase-contract",
    deadlines: {},
    confidence: "high",
    documentMatch: "match",
    sourceDocumentId: "doc_contract",
    sourceDocumentType: "Pending Classification",
    ...overrides
  };
}

describe("transaction obligations", () => {
  it("derives stable independent obligations from Colorado contract deadlines", () => {
    const obligations = deriveConfirmedExtractionObligations({
      side: "buyer",
      stage: "under_contract",
      confirmedDocumentType: "Executed Contract to Buy and Sell",
      confirmedAt: "2026-09-01T18:00:00.000Z",
      proposal: proposal({
        deadlines: {
          "Inspection Objection Deadline": "2026-09-08",
          "New Loan Availability Deadline": "2026-09-18",
          "Closing Date": "2026-09-30"
        },
        closingDate: "2026-09-30"
      })
    });

    expect(obligations.map((item) => item.obligationKey)).toEqual(
      expect.arrayContaining([
        "contract.inspection-objection",
        "contract.new-loan-availability",
        "contract.closing"
      ])
    );
    expect(obligations.find((item) => item.obligationKey === "contract.inspection-objection")).toMatchObject({
      label: "Inspection Objection Deadline",
      category: "inspection"
    });
  });

  it("does not create standalone obligations for time-only contract fields", () => {
    const obligations = deriveConfirmedExtractionObligations({
      side: "buyer",
      stage: "under_contract",
      confirmedDocumentType: "Executed Contract to Buy and Sell",
      confirmedAt: "2026-09-01T18:00:00.000Z",
      proposal: proposal({
        deadlines: {
          "Time of Day Deadline": "2026-09-01",
          "Possession Time": "2026-09-30",
          "Acceptance Deadline Time": "2026-09-01",
          "Inspection Objection Deadline": "2026-09-08"
        }
      })
    });

    expect(obligations.map((item) => item.obligationKey)).toEqual(["contract.inspection-objection"]);
  });

  it("does not immediately flag a historical deadline from the initial contract", () => {
    const record: TransactionObligationRecord = {
      id: "obl_historical",
      name: "Inspection Objection Deadline",
      status: "Baseline",
      health: "Healthy",
      data: {
        obligationKey: "contract.inspection-objection",
        label: "Inspection Objection Deadline",
        kind: "deadline",
        category: "inspection",
        dueDate: "2026-08-28",
        activatedAt: "2026-09-01T18:00:00.000Z",
        monitorAfter: "2026-09-01",
        state: "baseline",
        sequence: 1,
        sourceDocumentId: "doc_contract",
        sourceDocumentType: "Executed Contract to Buy and Sell"
      }
    };

    expect(evaluateTransactionObligation(record, new Date("2026-09-10T12:00:00.000Z"))).toBeNull();
  });

  it("flags a monitored deadline only after it passes unresolved", () => {
    const record: TransactionObligationRecord = {
      id: "obl_inspection",
      name: "Inspection Objection Deadline",
      status: "Scheduled",
      health: "Healthy",
      data: {
        obligationKey: "contract.inspection-objection",
        label: "Inspection Objection Deadline",
        kind: "deadline",
        category: "inspection",
        dueDate: "2026-09-08",
        activatedAt: "2026-09-01T18:00:00.000Z",
        monitorAfter: "2026-09-01",
        state: "scheduled",
        sequence: 1,
        sourceDocumentId: "doc_contract",
        sourceDocumentType: "Executed Contract to Buy and Sell"
      }
    };

    expect(evaluateTransactionObligation(record, new Date("2026-09-09T12:00:00.000Z"))).toMatchObject({
      state: "passed_needs_review",
      obligationKey: "contract.inspection-objection",
      recommendedDocument: "Agreement to Amend / Extend"
    });
  });

  it("warns when a monitored obligation is due soon without declaring it missing", () => {
    const record: TransactionObligationRecord = {
      id: "obl_loan",
      name: "New Loan Availability Deadline",
      status: "Scheduled",
      health: "Healthy",
      data: {
        obligationKey: "contract.new-loan-availability",
        label: "New Loan Availability Deadline",
        kind: "deadline",
        category: "financing",
        dueDate: "2026-09-18",
        activatedAt: "2026-09-01T18:00:00.000Z",
        monitorAfter: "2026-09-01",
        state: "scheduled",
        sequence: 1,
        sourceDocumentId: "doc_contract",
        sourceDocumentType: "Executed Contract to Buy and Sell"
      }
    };

    expect(evaluateTransactionObligation(record, new Date("2026-09-17T12:00:00.000Z"))).toMatchObject({
      state: "due_soon",
      recommendedDocument: undefined
    });
  });

  it("treats each Amend Extend as a schedule revision for the exact canonical deadline", () => {
    const obligations = deriveConfirmedExtractionObligations({
      side: "buyer",
      stage: "under_contract",
      confirmedDocumentType: "Agreement to Amend / Extend",
      confirmedAt: "2026-09-08T18:00:00.000Z",
      proposal: proposal({
        identifiedDocumentType: "Agreement to Amend / Extend",
        documentRequirementId: "amend-extend",
        sourceDocumentId: "doc_amend_1",
        deadlines: {
          "Inspection Objection Deadline": "2026-09-12"
        }
      })
    });

    expect(obligations).toHaveLength(1);
    expect(obligations[0]).toMatchObject({
      obligationKey: "contract.inspection-objection",
      label: "Inspection Objection Deadline",
      category: "inspection",
      dueDate: "2026-09-12",
      isScheduleRevision: true
    });
  });
});
