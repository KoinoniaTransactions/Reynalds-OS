import { readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  collectArchivedCommunicationCandidates
} from "./walmart-tanks-communication-batches";
import {
  normalizeArchivedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";

describe("WalMart Tanks archived communication inventory", () => {
  it("normalizes and deduplicates the archived candidate batches", () => {
    const directory = resolve(
      process.cwd(),
      "../../02_Companies/Reynalds_Brothers/04_Communications"
    );

    const files = readdirSync(directory)
      .filter((name) =>
        /^walmart_tanks_gmail_batch_.*\.json$/.test(name)
      )
      .sort();

    const candidates = files.flatMap((name) => {
      const path = join(directory, name);
      const batch = JSON.parse(readFileSync(path, "utf8"));

      return collectArchivedCommunicationCandidates({
        sourceFile: basename(path),
        batch
      });
    });

    const normalized = candidates.map((candidate) =>
      normalizeArchivedCommunicationCandidate(candidate)
    );

    const accepted = normalized
      .filter((result) => result.ok)
      .map((result) => {
        if (!result.ok) {
          throw new Error("Unexpected rejected result.");
        }
        return result.value;
      });

    const rejected = normalized.filter((result) => !result.ok);
    const byMessageId = new Map<string, typeof accepted[number]>();
    const duplicateOccurrences: string[] = [];

    for (const communication of accepted) {
      if (byMessageId.has(communication.externalMessageId)) {
        duplicateOccurrences.push(
          communication.externalMessageId
        );
        continue;
      }

      byMessageId.set(
        communication.externalMessageId,
        communication
      );
    }

    const unique = [...byMessageId.values()];

    const summary = {
      files: files.length,
      candidateOccurrences: candidates.length,
      acceptedOccurrences: accepted.length,
      rejectedOccurrences: rejected.length,
      uniqueMessages: unique.length,
      duplicateOccurrences: duplicateOccurrences.length,
      readyToFile: unique.filter(
        (item) => item.status === "ready_to_file"
      ).length,
      review: unique.filter(
        (item) => item.status === "review"
      ).length,
      duplicate: unique.filter(
        (item) => item.status === "duplicate"
      ).length
    };

    console.log("ARCHIVED COMMUNICATION DRY RUN", summary);
    console.log("REJECTED", rejected);
    console.log(
      "DUPLICATE MESSAGE IDS",
      Array.from(new Set(duplicateOccurrences))
    );

    expect(files.length).toBe(12);
    expect(candidates.length).toBe(90);
    expect(rejected.length).toBe(1);
    expect(unique.length).toBe(86);
    expect(duplicateOccurrences.length).toBe(3);
  });
});
