import { describe, expect, it } from "vitest";
import {
  buildPortalLaunchProofName,
  getPortalLaunchProofHealth,
  getPortalLaunchProofRecord,
  PortalLaunchProofValidationError,
  validatePortalLaunchProofInput
} from "./portal-launch-proof";

describe("portal launch proof", () => {
  it("validates safe manual proof input", () => {
    const input = validatePortalLaunchProofInput({
      checklistItemId: "transaction-support-qa",
      evidenceUrl: "https://docs.koinoniatransactions.com/proof/transaction-dry-run",
      notes: "Dry run completed with assigned owner, backup owner, package, status, and next touch visible.",
      proofDate: "2026-07-29",
      proofOwner: "Jeremiah Reynalds",
      status: "Completed"
    });

    expect(input.checklistItemId).toBe("transaction-support-qa");
    expect(buildPortalLaunchProofName(input)).toContain("Transaction Support workflow is testable");
    expect(getPortalLaunchProofHealth(input.status)).toBe("Healthy");
  });

  it("rejects proof for automated readiness checks", () => {
    expect(() =>
      validatePortalLaunchProofInput({
        checklistItemId: "clerk-production-auth",
        notes: "Trying to manually override the provider readiness gate.",
        proofDate: "2026-07-29",
        proofOwner: "Jeremiah Reynalds",
        status: "Completed"
      })
    ).toThrow(PortalLaunchProofValidationError);
  });

  it("rejects sensitive proof notes", () => {
    expect(() =>
      validatePortalLaunchProofInput({
        checklistItemId: "showing-request-qa",
        notes: "The proof includes a password and access code, which should never be saved here.",
        proofDate: "2026-07-29",
        proofOwner: "Jeremiah Reynalds",
        status: "Completed"
      })
    ).toThrow("Do not include passwords");
  });

  it("normalizes stored proof records for display", () => {
    const record = getPortalLaunchProofRecord({
      createdAt: new Date("2026-07-29T18:00:00.000Z"),
      id: "proof_1",
      data: {
        checklistItemId: "end-to-end-client-dry-run",
        notes: "End-to-end dry run completed without unsafe sensitive data capture.",
        proofDate: "2026-07-29",
        proofOwner: "Jeremiah Reynalds",
        recordedByEmail: "jeremiah@example.com",
        recordedByName: "Jeremiah Reynalds",
        status: "Needs Follow-up"
      }
    });

    expect(record?.status).toBe("Needs Follow-up");
    expect(record?.recordedAt).toBe("2026-07-29T18:00:00.000Z");
  });
});
