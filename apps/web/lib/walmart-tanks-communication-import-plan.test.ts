import { describe, expect, it } from "vitest";

import {
  buildCommunicationImportPlan
} from "./walmart-tanks-communication-import-plan";
import type {
  ArchivedCommunicationCandidateEnvelope
} from "./walmart-tanks-communication-batches";

function envelope(input: {
  bucket:
    | "filingCandidates"
    | "reviewCandidates"
    | "alreadyFiled";
  gmailId?: string;
  storeNumber?: string;
  workOrderNumber?: string;
  subject?: string;
  reason?: string;
}): ArchivedCommunicationCandidateEnvelope {
  return {
    bucket: input.bucket,
    sourceFile: "batch.json",
    candidate: {
      gmailId: input.gmailId,
      storeNumber: input.storeNumber,
      workOrderNumber: input.workOrderNumber,
      subject: input.subject ?? "Test message",
      reason: input.reason
    }
  };
}

const workItems = [
  {
    id: "rb_wi_uco_4672",
    name: "WM 4672 — UCO Tank Replacement",
    storeNumber: "4672",
    workOrderNumber: "RB-WO-4672-001"
  },
  {
    id: "rb_wi_acc_1540",
    name: "WM 1540 — ACC Lower Bay Pressure Washing",
    storeNumber: "1540",
    workOrderNumber: "RB-WO-1540-001"
  }
];

describe("WalMart Tanks communication import planner", () => {
  it("plans exact work-item links", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "filingCandidates",
          gmailId: "msg-4672",
          storeNumber: "4672",
          subject: "WM 4672 UCO tank replacement"
        })
      ],
      workItems
    });

    expect(plan.items).toHaveLength(1);
    expect(plan.items[0]).toMatchObject({
      action: "insert_and_link",
      match: {
        workItemId: "rb_wi_uco_4672",
        requiresReview: false
      }
    });
  });

  it("plans review records for unmatched messages", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "filingCandidates",
          gmailId: "msg-9999",
          storeNumber: "9999"
        })
      ],
      workItems
    });

    expect(plan.items[0]).toMatchObject({
      action: "insert_for_review",
      match: {
        requiresReview: true
      }
    });
  });

  it("preserves archived review decisions", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "reviewCandidates",
          gmailId: "msg-review",
          reason: "Needs manual classification."
        })
      ],
      workItems
    });

    expect(plan.items[0]).toMatchObject({
      action: "insert_for_review",
      match: {
        requiresReview: true,
        reviewReason: "Needs manual classification."
      }
    });
  });

  it("stores archived duplicates without creating review work", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "alreadyFiled",
          gmailId: "msg-duplicate"
        })
      ],
      workItems
    });

    expect(plan.items[0]).toMatchObject({
      action: "insert_duplicate",
      match: {
        requiresReview: false
      }
    });
  });

  it("skips Gmail IDs already present in the database", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "filingCandidates",
          gmailId: "msg-existing",
          storeNumber: "4672"
        })
      ],
      workItems,
      existingMessageIds: ["msg-existing"]
    });

    expect(plan.items[0]?.action).toBe("skip_existing");
    expect(plan.summary.skipExisting).toBe(1);
  });

  it("deduplicates repeated candidate occurrences", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "filingCandidates",
          gmailId: "msg-repeated",
          storeNumber: "4672"
        }),
        envelope({
          bucket: "reviewCandidates",
          gmailId: "msg-repeated",
          reason: "Repeated occurrence."
        })
      ],
      workItems
    });

    expect(plan.items).toHaveLength(1);
    expect(plan.duplicateOccurrences).toEqual([
      "msg-repeated"
    ]);
    expect(plan.summary).toMatchObject({
      candidateOccurrences: 2,
      normalizedOccurrences: 2,
      uniqueMessages: 1,
      duplicateOccurrences: 1
    });
  });

  it("records candidates rejected by normalization", () => {
    const plan = buildCommunicationImportPlan({
      candidates: [
        envelope({
          bucket: "reviewCandidates"
        })
      ],
      workItems
    });

    expect(plan.items).toHaveLength(0);
    expect(plan.rejected).toHaveLength(1);
    expect(plan.summary).toMatchObject({
      rejectedOccurrences: 1,
      uniqueMessages: 0
    });
  });
});
