import { describe, expect, it } from "vitest";
import {
  getPortalLaunchChecklistPhases,
  getPortalLaunchChecklistSummary
} from "./portal-launch-checklist";

describe("portal launch checklist", () => {
  it("keeps the full verifier as a required launch gate", () => {
    const items = getPortalLaunchChecklistPhases().flatMap((phase) => phase.items);
    const verifier = items.find((item) => item.id === "full-production-verifier");

    expect(verifier?.required).toBe(true);
    expect(verifier?.readinessGate).toContain("pnpm verify:portal");
    expect(verifier?.readinessGate).toContain("without --skip-database");
  });

  it("treats social login and AI review as optional base-launch gates", () => {
    const optionalIds = getPortalLaunchChecklistPhases()
      .flatMap((phase) => phase.items)
      .filter((item) => !item.required)
      .map((item) => item.id);

    expect(optionalIds).toEqual(["social-login-provider-test", "ai-review-controls"]);
  });

  it("covers the core Koinonia service workflows", () => {
    const workflowIds = getPortalLaunchChecklistPhases()
      .find((phase) => phase.id === "service-workflows")
      ?.items.map((item) => item.id);

    expect(workflowIds).toEqual([
      "transaction-support-qa",
      "contract-document-support-qa",
      "showing-request-qa",
      "monthly-operations-qa"
    ]);
  });

  it("keeps summary counts aligned with checklist items", () => {
    const phases = getPortalLaunchChecklistPhases();
    const items = phases.flatMap((phase) => phase.items);
    const summary = getPortalLaunchChecklistSummary();

    expect(summary.phaseCount).toBe(phases.length);
    expect(summary.itemCount).toBe(items.length);
    expect(summary.requiredCount + summary.optionalCount).toBe(items.length);
  });
});
