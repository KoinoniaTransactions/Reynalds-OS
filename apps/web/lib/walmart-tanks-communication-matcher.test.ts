import { describe, expect, it } from "vitest";

import {
  planCommunicationWorkItemMatch
} from "./walmart-tanks-communication-matcher";
import type {
  NormalizedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";

function communication(
  overrides: Partial<NormalizedCommunicationCandidate> = {}
): NormalizedCommunicationCandidate {
  return {
    source: "gmail",
    externalMessageId: "msg-1",
    subject: "WM 4672 UCO tank replacement",
    sender: "sender@example.com",
    status: "ready_to_file",
    identifiers: {
      storeNumbers: ["4672"],
      workOrderNumbers: [],
      purchaseOrderNumbers: []
    },
    location: {
      city: "Montgomery",
      state: "AL"
    },
    rawMetadata: {
      bucket: "filingCandidates",
      sourceFile: "batch.json",
      original: {}
    },
    ...overrides
  };
}

const workItems = [
  {
    id: "rb_wi_uco_4672",
    name: "WM 4672 — UCO Tank Replacement",
    storeNumber: "4672",
    workOrderNumber: "RB-WO-4672-001",
    city: "Montgomery",
    state: "AL"
  },
  {
    id: "rb_wi_acc_1540",
    name: "WM 1540 — ACC Lower Bay Pressure Washing",
    storeNumber: "1540",
    workOrderNumber: "RB-WO-1540-001",
    city: "South Haven",
    state: "MI"
  }
];

describe("WalMart Tanks communication matcher", () => {
  it("matches one exact store number", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication(),
      workItems
    });

    expect(result).toEqual({
      workItemId: "rb_wi_uco_4672",
      confidence: 100,
      evidence: ["Exact store number match: 4672"],
      requiresReview: false
    });
  });

  it("falls back to an exact work order match", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication({
        identifiers: {
          storeNumbers: [],
          workOrderNumbers: ["RB-WO-1540-001"],
          purchaseOrderNumbers: []
        }
      }),
      workItems
    });

    expect(result.workItemId).toBe("rb_wi_acc_1540");
    expect(result.confidence).toBe(100);
    expect(result.requiresReview).toBe(false);
  });

  it("sends unmatched ready-to-file messages to review", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication({
        identifiers: {
          storeNumbers: ["9999"],
          workOrderNumbers: [],
          purchaseOrderNumbers: []
        }
      }),
      workItems
    });

    expect(result.workItemId).toBeUndefined();
    expect(result.requiresReview).toBe(true);
    expect(result.reviewReason).toContain(
      "No existing work item matches"
    );
  });

  it("preserves archived review requirements", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication({
        status: "review",
        review: {
          category: "vendor_statement",
          reason: "Statement spans multiple invoices."
        }
      }),
      workItems
    });

    expect(result.requiresReview).toBe(true);
    expect(result.reviewReason).toBe(
      "Statement spans multiple invoices."
    );
  });

  it("does not create review work for archived duplicates", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication({
        status: "duplicate"
      }),
      workItems
    });

    expect(result.workItemId).toBeUndefined();
    expect(result.requiresReview).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it("requires review when multiple work items share a store", () => {
    const result = planCommunicationWorkItemMatch({
      communication: communication(),
      workItems: [
        ...workItems,
        {
          id: "rb_wi_uco_4672_second",
          name: "WM 4672 — Second Project",
          storeNumber: "4672"
        }
      ]
    });

    expect(result.workItemId).toBeUndefined();
    expect(result.requiresReview).toBe(true);
    expect(result.confidence).toBe(60);
  });
});
