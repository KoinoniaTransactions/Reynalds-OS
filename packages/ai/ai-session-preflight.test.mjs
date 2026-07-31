import { describe, expect, it } from "vitest";

import {
  displayName,
  normalizeChangedPaths,
  parseRequiredReading,
  resolveActiveDomain
} from "../../scripts/ai-session-preflight-lib.mjs";

describe("AI session preflight", () => {
  it("discovers the numbered Markdown reading order", () => {
    const startHere = `
# Required Reading Order

1. BRAIN/README.md
2. \`BRAIN/REYNALDS_OS_CONSTITUTION.md\`
3. BRAIN/CANONICAL_REGISTRY.md

- This item is not part of the numbered reading order.
`;

    expect(parseRequiredReading(startHere)).toEqual([
      "BRAIN/README.md",
      "BRAIN/REYNALDS_OS_CONSTITUTION.md",
      "BRAIN/CANONICAL_REGISTRY.md"
    ]);
  });

  it("converts repository directory names to display names", () => {
    expect(displayName("Reynalds_Brothers")).toBe(
      "Reynalds Brothers"
    );
  });

  it("normalizes changed and renamed paths from Git status", () => {
    expect(
      normalizeChangedPaths(
        [
          " M package.json",
          "?? scripts/ai-session-preflight.mjs",
          "R  old-name.md -> new-name.md"
        ].join("\n")
      )
    ).toEqual([
      "package.json",
      "scripts/ai-session-preflight.mjs",
      "new-name.md"
    ]);
  });

  it("prioritizes a company identified by changed files", () => {
    const result = resolveActiveDomain({
      root: "/repo",
      branch: "feature/unrelated",
      changedPaths: [
        "02_Companies/Reynalds_Brothers/06_Brain/README.md"
      ],
      companyBrains: [
        {
          company: "Reynalds_Brothers",
          brain: "/repo/02_Companies/Reynalds_Brothers/06_Brain"
        }
      ]
    });

    expect(result).toEqual({
      activeDomain: "Reynalds Brothers",
      domainSource: "02_Companies/Reynalds_Brothers/06_Brain"
    });
  });

  it("uses the branch as a fallback domain signal", () => {
    const result = resolveActiveDomain({
      root: "/repo",
      branch: "reynalds-brothers-only",
      changedPaths: ["package.json"],
      companyBrains: [
        {
          company: "Reynalds_Brothers",
          brain: "/repo/02_Companies/Reynalds_Brothers/06_Brain"
        }
      ]
    });

    expect(result.activeDomain).toBe("Reynalds Brothers");
  });

  it("stays unresolved when domain signals are ambiguous", () => {
    const result = resolveActiveDomain({
      root: "/repo",
      branch: "feature/governance",
      changedPaths: ["package.json"],
      companyBrains: []
    });

    expect(result.activeDomain).toBe("Global / unresolved");
  });
});
