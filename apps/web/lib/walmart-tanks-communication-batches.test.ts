import { describe, expect, it } from "vitest";

import {
  collectArchivedCommunicationCandidates
} from "./walmart-tanks-communication-batches";

describe("WalMart Tanks archived batch reader", () => {
  it("collects candidates from supported buckets", () => {
    const result = collectArchivedCommunicationCandidates({
      sourceFile: "batch.json",
      batch: {
        filingCandidates: [
          { gmailId: "file-1", subject: "File me" }
        ],
        reviewCandidates: [
          { gmailId: "review-1", subject: "Review me" }
        ],
        ignoredField: [
          { gmailId: "ignored-1" }
        ]
      }
    });

    expect(result).toEqual([
      {
        bucket: "filingCandidates",
        sourceFile: "batch.json",
        candidate: {
          gmailId: "file-1",
          subject: "File me"
        }
      },
      {
        bucket: "reviewCandidates",
        sourceFile: "batch.json",
        candidate: {
          gmailId: "review-1",
          subject: "Review me"
        }
      }
    ]);
  });

  it("preserves the canonical bucket order", () => {
    const result = collectArchivedCommunicationCandidates({
      sourceFile: "batch.json",
      batch: {
        reviewCandidates: [{ gmailId: "review-1" }],
        filingCandidates: [{ gmailId: "file-1" }],
        alreadyFiled: [{ gmailId: "duplicate-1" }]
      }
    });

    expect(result.map((entry) => entry.bucket)).toEqual([
      "filingCandidates",
      "reviewCandidates",
      "alreadyFiled"
    ]);
  });

  it("skips malformed bucket entries", () => {
    const result = collectArchivedCommunicationCandidates({
      sourceFile: "batch.json",
      batch: {
        filingCandidates: [
          null,
          "not-an-object",
          [],
          { gmailId: "valid-1" }
        ]
      }
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.candidate).toEqual({
      gmailId: "valid-1"
    });
  });

  it("returns an empty list for non-object batches", () => {
    expect(
      collectArchivedCommunicationCandidates({
        sourceFile: "batch.json",
        batch: null
      })
    ).toEqual([]);

    expect(
      collectArchivedCommunicationCandidates({
        sourceFile: "batch.json",
        batch: []
      })
    ).toEqual([]);
  });
});
