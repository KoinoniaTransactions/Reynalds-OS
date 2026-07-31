import { describe, expect, it } from "vitest";

import {
  normalizeArchivedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";

describe("WalMart Tanks communication normalizer", () => {
  it("normalizes a high-confidence filing candidate", () => {
    const result = normalizeArchivedCommunicationCandidate({
      bucket: "filingCandidates",
      sourceFile: "batch.json",
      candidate: {
        gmailId: "msg-1068",
        threadId: "thread-1068",
        storeNumber: "1068",
        workOrderNumber: "1068.1017",
        city: "Sebastian",
        state: "FL",
        subject:
          "[LxRetail] 1068.1017 Sebastian FL ACC Tank Replacement Workflow Updated",
        sender: "Walmart via WalMart Tanks Program",
        matchConfidence: "high",
        recommendedCard:
          "WM 1068 - Sebastian ACC Tank Replacement"
      }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("ready_to_file");
    expect(result.value.externalMessageId).toBe("msg-1068");
    expect(result.value.externalThreadId).toBe("thread-1068");
    expect(result.value.matchConfidence).toBe(95);
    expect(result.value.identifiers.storeNumbers).toContain("1068");
    expect(result.value.identifiers.workOrderNumbers).toContain(
      "1068.1017"
    );
    expect(result.value.location).toEqual({
      city: "Sebastian",
      state: "FL"
    });
    expect(result.value.suggestedWorkItemName).toBe(
      "WM 1068 - Sebastian ACC Tank Replacement"
    );
  });

  it("creates review metadata for a review candidate", () => {
    const result = normalizeArchivedCommunicationCandidate({
      bucket: "reviewCandidates",
      sourceFile: "batch.json",
      candidate: {
        gmailId: "msg-review",
        threadId: "thread-review",
        subject: "Apr 2026 Frontline Monthly Statement",
        sender: "Orders atomlinson@frontlineii.com",
        reason:
          "Monthly supplier statement spans multiple invoices."
      }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("review");
    expect(result.value.review).toBeDefined();
    expect(result.value.review?.reason).toContain(
      "Monthly supplier statement"
    );
  });

  it("marks already-filed candidates as duplicates", () => {
    const result = normalizeArchivedCommunicationCandidate({
      bucket: "alreadyFiled",
      sourceFile: "batch.json",
      candidate: {
        gmailId: "msg-duplicate",
        subject: "RE: 121 Okmulgee, OK - used cooking oil tank"
      }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("duplicate");
  });

  it("rejects candidates without a stable external message ID", () => {
    const result = normalizeArchivedCommunicationCandidate({
      bucket: "heldForNextReview",
      sourceFile: "batch.json",
      candidate: {
        threadId: "thread-only",
        storeNumber: "970",
        subject:
          "RE: 970 Picayune MS - Used Cooking Oil Tank replacement"
      }
    });

    expect(result).toEqual({
      ok: false,
      reason:
        "Missing external message ID in batch.json:heldForNextReview"
    });
  });

  it("uses existingCard for enrichment candidates", () => {
    const result = normalizeArchivedCommunicationCandidate({
      bucket: "enrichmentCandidates",
      sourceFile: "batch.json",
      candidate: {
        gmailId: "msg-enrichment",
        storeNumber: "4702",
        city: "Friendswood",
        state: "TX",
        subject:
          "Re: Sams 4702 Friendswood TX - Larger Used Cooking Oil Tank Installation",
        existingCard: "SC 4702 - Friendswood Project Release"
      }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.suggestedWorkItemName).toBe(
      "SC 4702 - Friendswood Project Release"
    );
  });
});
