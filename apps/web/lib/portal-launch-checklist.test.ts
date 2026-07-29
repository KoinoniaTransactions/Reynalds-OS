import { describe, expect, it } from "vitest";
import {
  buildPortalLaunchChecklistReport,
  getPortalLaunchChecklistPhases,
  getPortalLaunchChecklistSummary
} from "./portal-launch-checklist";
import { buildPortalReadinessReport, type PortalReadinessInput } from "./portal-readiness";

function getReadyInput(overrides: Partial<PortalReadinessInput> = {}): PortalReadinessInput {
  return {
    aiProviderConfigured: false,
    authProvider: "clerk",
    clerkPublishableKey: "pk_live_livevalue",
    clerkSecretKey: "sk_live_livevalue",
    documentMalwareScanCommand: "/bin/sh",
    documentUploadDir: "/tmp/koinonia-portal-documents",
    hostedSignInUrl: "/sign-in",
    nodeEnv: "production",
    paymentProcessorProvider: "stripe",
    paymentProcessorSetupUrl: "https://payments.koinoniatransactions.com/setup",
    paymentProcessorWebhookSecret: "whsec_livevalue",
    rosAllowMockAuth: "false",
    socialLoginConfigured: false,
    workspaceId: "wks_koinonia",
    database: {
      acceptedClientInvitationCount: 1,
      acceptedStaffInvitationCount: 1,
      activeOwnerCount: 1,
      connected: true,
      missingRoles: [],
      staffWithoutMfaCount: 0,
      workspaceExists: true
    },
    ...overrides
  };
}

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

  it("maps linked launch checks to the live readiness report", () => {
    const launchReport = buildPortalLaunchChecklistReport(
      buildPortalReadinessReport(getReadyInput())
    );
    const items = launchReport.phases.flatMap((phase) => phase.items);

    expect(items.find((item) => item.id === "clerk-production-auth")?.status).toBe("ready");
    expect(items.find((item) => item.id === "workspace-role-seed")?.status).toBe("ready");
    expect(items.find((item) => item.id === "end-to-end-client-dry-run")?.status).toBe("manual");
    expect(launchReport.overallStatus).toBe("manual");
    expect(launchReport.summary.find((item) => item.label === "Manual Proof Needed")?.value).toBe("7");
    expect(launchReport.summary.find((item) => item.label === "Required Remaining")?.value).toBe("7");
    expect(launchReport.phases.find((phase) => phase.id === "service-workflows")?.summary.manualCount).toBe(4);
  });

  it("blocks launch checks when any linked readiness item is blocked", () => {
    const launchReport = buildPortalLaunchChecklistReport(
      buildPortalReadinessReport(
        getReadyInput({
          clerkPublishableKey: "pk_test_placeholder",
          clerkSecretKey: "placeholder"
        })
      )
    );
    const loginCheck = launchReport.phases
      .flatMap((phase) => phase.items)
      .find((item) => item.id === "clerk-production-auth");

    expect(loginCheck?.status).toBe("blocked");
    expect(loginCheck?.statusDetail).toContain("Add production Clerk keys");
  });

  it("marks manual launch checks ready when completed proof is recorded", () => {
    const launchReport = buildPortalLaunchChecklistReport(
      buildPortalReadinessReport(getReadyInput()),
      [
        {
          checklistItemId: "end-to-end-client-dry-run",
          id: "proof_1",
          notes: "End-to-end dry run completed without unsafe data capture.",
          proofDate: "2026-07-29",
          proofOwner: "Jeremiah Reynalds",
          recordedAt: "2026-07-29T18:00:00.000Z",
          status: "Completed"
        }
      ]
    );
    const dryRun = launchReport.phases
      .flatMap((phase) => phase.items)
      .find((item) => item.id === "end-to-end-client-dry-run");

    expect(dryRun?.status).toBe("ready");
    expect(dryRun?.latestProof?.id).toBe("proof_1");
    expect(launchReport.summary.find((item) => item.label === "Manual Proof Needed")?.value).toBe("6");
    expect(launchReport.summary.find((item) => item.label === "Required Remaining")?.value).toBe("6");
  });
});
