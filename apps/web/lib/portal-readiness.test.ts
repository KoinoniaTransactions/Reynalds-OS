import { describe, expect, it } from "vitest";
import {
  buildPortalReadinessReport,
  portalReadinessRequiredRoles,
  type PortalReadinessInput
} from "./portal-readiness";

function getReadyInput(overrides: Partial<PortalReadinessInput> = {}): PortalReadinessInput {
  return {
    aiProviderConfigured: false,
    authProvider: "clerk",
    clerkPublishableKey: "present",
    clerkSecretKey: "present",
    documentMalwareScanCommand: "/bin/sh",
    documentUploadDir: "/tmp/koinonia-portal-documents",
    hostedSignInUrl: "/sign-in",
    nodeEnv: "production",
    rosAllowMockAuth: "false",
    socialLoginConfigured: false,
    workspaceId: "wks_koinonia",
    database: {
      activeOwnerCount: 1,
      connected: true,
      missingRoles: [],
      staffWithoutMfaCount: 0,
      workspaceExists: true
    },
    ...overrides
  };
}

describe("portal readiness report", () => {
  it("keeps social login as an attention item until provider setup is marked ready", () => {
    const report = buildPortalReadinessReport(getReadyInput());
    const socialLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "social-login");

    expect(socialLogin?.status).toBe("attention");
    expect(socialLogin?.detail).toContain("invitation-gated");
  });

  it("tracks the staff review center separately from AI provider readiness", () => {
    const report = buildPortalReadinessReport(getReadyInput());
    const items = report.groups.flatMap((group) => group.items);
    const staffReview = items.find((item) => item.id === "staff-review-center");
    const aiReview = items.find((item) => item.id === "ai-review");

    expect(staffReview?.status).toBe("ready");
    expect(aiReview?.status).toBe("attention");
  });

  it("blocks production readiness when mock auth is enabled in production", () => {
    const report = buildPortalReadinessReport(getReadyInput({ rosAllowMockAuth: "true" }));
    const mockAuth = report.groups.flatMap((group) => group.items).find((item) => item.id === "mock-auth");

    expect(report.overallStatus).toBe("blocked");
    expect(mockAuth?.status).toBe("blocked");
  });

  it("reports missing portal roles from the database check", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        database: {
          activeOwnerCount: 1,
          connected: true,
          missingRoles: ["Finance"],
          staffWithoutMfaCount: 0,
          workspaceExists: true
        }
      })
    );
    const roles = report.groups.flatMap((group) => group.items).find((item) => item.id === "roles");

    expect(portalReadinessRequiredRoles).toContain("Finance");
    expect(roles?.status).toBe("blocked");
    expect(roles?.proof).toContain("Finance");
  });
});
