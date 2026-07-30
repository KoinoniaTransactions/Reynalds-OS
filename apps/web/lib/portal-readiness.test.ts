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
    clerkPublishableKey: "pk_live_livevalue",
    clerkSecretKey: "sk_live_livevalue",
    documentMalwareScanCommand: "/bin/sh",
    documentUploadDir: "/tmp/koinonia-portal-documents",
    hostedSignInUrl: "/sign-in",
    nodeEnv: "production",
    paymentProcessorProvider: "stripe",
    paymentProcessorSetupUrl: "https://payments.koinoniatransactions.com/setup",
    paymentProcessorWebhookUrl: "https://www.koinoniatransactions.com/api/portal/payments/webhook",
    paymentProcessorWebhookSecret: "whsec_livevalue",
    rosAllowMockAuth: "false",
    socialLoginConfigured: false,
    siteUrl: "https://www.koinoniatransactions.com",
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

describe("portal readiness report", () => {
  it("keeps social login as an attention item until provider setup is marked ready", () => {
    const report = buildPortalReadinessReport(getReadyInput());
    const socialLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "social-login");

    expect(socialLogin?.status).toBe("attention");
    expect(socialLogin?.detail).toContain("invitation-gated");
  });

  it("blocks enabled social login until approved providers and invite matching are verified", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        socialLoginConfigured: true,
        socialLoginInviteMatchingVerified: false,
        socialLoginProviders: []
      })
    );
    const socialLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "social-login");

    expect(socialLogin?.status).toBe("blocked");
    expect(socialLogin?.proof).toContain("No approved");
  });

  it("marks social login ready when approved providers and invite matching are verified", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        socialLoginConfigured: true,
        socialLoginInviteMatchingVerified: true,
        socialLoginProviders: ["google", "microsoft"]
      })
    );
    const socialLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "social-login");

    expect(socialLogin?.status).toBe("ready");
    expect(socialLogin?.proof).toContain("Google, Microsoft");
  });

  it("tracks the staff review center separately from AI provider readiness", () => {
    const report = buildPortalReadinessReport(getReadyInput());
    const items = report.groups.flatMap((group) => group.items);
    const staffReview = items.find((item) => item.id === "staff-review-center");
    const aiReview = items.find((item) => item.id === "ai-review");

    expect(staffReview?.status).toBe("ready");
    expect(aiReview?.status).toBe("attention");
  });

  it("blocks enabled AI review until provider and launch controls are ready", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        aiProviderConfigured: true,
        aiReviewEnabled: true,
        aiReviewHumanApprovalRequired: true
      })
    );
    const aiReview = report.groups.flatMap((group) => group.items).find((item) => item.id === "ai-review");

    expect(aiReview?.status).toBe("blocked");
    expect(aiReview?.proof).toContain("privacy rules");
    expect(aiReview?.proof).toContain("source citations");
  });

  it("marks AI review ready when provider and required launch controls are configured", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        aiProviderConfigured: true,
        aiReviewAuditLoggingEnabled: true,
        aiReviewCitationsRequired: true,
        aiReviewEnabled: true,
        aiReviewHumanApprovalRequired: true,
        aiReviewPrivacyRulesApproved: true,
        aiReviewPromptsApproved: true
      })
    );
    const aiReview = report.groups.flatMap((group) => group.items).find((item) => item.id === "ai-review");

    expect(aiReview?.status).toBe("ready");
    expect(aiReview?.proof).toContain("human approval");
  });

  it("blocks production readiness when mock auth is enabled in production", () => {
    const report = buildPortalReadinessReport(getReadyInput({ rosAllowMockAuth: "true" }));
    const mockAuth = report.groups.flatMap((group) => group.items).find((item) => item.id === "mock-auth");

    expect(report.overallStatus).toBe("blocked");
    expect(mockAuth?.status).toBe("blocked");
  });

  it("blocks unsafe hosted login URLs", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        hostedSignInUrl: "javascript:alert(1)"
      })
    );
    const hostedLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "hosted-login");

    expect(report.overallStatus).toBe("blocked");
    expect(hostedLogin?.status).toBe("blocked");
    expect(hostedLogin?.proof).toContain("javascript");
  });

  it("allows public HTTPS hosted login URLs", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        hostedSignInUrl: "https://accounts.koinoniatransactions.com/sign-in"
      })
    );
    const hostedLogin = report.groups.flatMap((group) => group.items).find((item) => item.id === "hosted-login");

    expect(hostedLogin?.status).toBe("ready");
    expect(hostedLogin?.proof).toContain("accounts.koinoniatransactions.com");
  });

  it("marks auth redirect origins ready when the production site URL is public HTTPS", () => {
    const report = buildPortalReadinessReport(getReadyInput());
    const authRedirectOrigins = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "auth-redirect-origins");

    expect(authRedirectOrigins?.status).toBe("ready");
    expect(authRedirectOrigins?.proof).toContain("koinoniatransactions.com");
  });

  it("blocks invalid auth redirect origins", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        authRedirectOrigins: ["http://localhost:3000", "https://placeholder.invalid"],
        siteUrl: undefined
      })
    );
    const authRedirectOrigins = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "auth-redirect-origins");

    expect(authRedirectOrigins?.status).toBe("blocked");
    expect(authRedirectOrigins?.proof).toContain("localhost");
    expect(authRedirectOrigins?.proof).toContain("placeholder");
  });

  it("blocks placeholder or test Clerk keys", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        clerkPublishableKey: "pk_test_placeholder",
        clerkSecretKey: "placeholder"
      })
    );
    const keys = report.groups.flatMap((group) => group.items).find((item) => item.id === "clerk-keys");

    expect(keys?.status).toBe("blocked");
    expect(keys?.proof).toContain("placeholder");
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

  it("reports seeded roles without stored permissions", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        database: {
          acceptedClientInvitationCount: 1,
          acceptedStaffInvitationCount: 1,
          activeOwnerCount: 1,
          connected: true,
          missingRoles: [],
          rolesMissingPermissions: ["Operations"],
          staffWithoutMfaCount: 0,
          workspaceExists: true
        }
      })
    );
    const roles = report.groups.flatMap((group) => group.items).find((item) => item.id === "roles");

    expect(roles?.status).toBe("blocked");
    expect(roles?.proof).toContain("Operations");
  });

  it("blocks readiness until client and staff invite acceptance are verified", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        database: {
          acceptedClientInvitationCount: 1,
          acceptedStaffInvitationCount: 0,
          activeOwnerCount: 1,
          connected: true,
          missingRoles: [],
          staffWithoutMfaCount: 0,
          workspaceExists: true
        }
      })
    );
    const inviteAcceptance = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "invite-acceptance");

    expect(inviteAcceptance?.status).toBe("blocked");
    expect(inviteAcceptance?.proof).toContain("0 staff");
  });

  it("blocks relative document upload storage paths", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        documentUploadDir: "portal-documents"
      })
    );
    const storage = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "document-storage");

    expect(storage?.status).toBe("blocked");
    expect(storage?.proof).toContain("absolute");
  });

  it("blocks missing payment processor setup", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        paymentProcessorProvider: undefined,
        paymentProcessorSetupUrl: undefined,
        paymentProcessorWebhookUrl: undefined,
        paymentProcessorWebhookSecret: undefined
      })
    );
    const items = report.groups.flatMap((group) => group.items);

    expect(items.find((item) => item.id === "payment-processor")?.status).toBe("blocked");
    expect(items.find((item) => item.id === "payment-setup-url")?.status).toBe("blocked");
    expect(items.find((item) => item.id === "payment-webhook-url")?.status).toBe("blocked");
    expect(items.find((item) => item.id === "payment-webhook-secret")?.status).toBe("blocked");
  });

  it("blocks non-public payment webhook URLs", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        paymentProcessorWebhookUrl: "http://localhost:3000/api/portal/payments/webhook"
      })
    );
    const webhookUrl = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "payment-webhook-url");

    expect(webhookUrl?.status).toBe("blocked");
    expect(webhookUrl?.proof).toContain("HTTPS");
  });

  it("blocks non-public payment setup URLs", () => {
    const report = buildPortalReadinessReport(
      getReadyInput({
        paymentProcessorSetupUrl: "http://localhost:3000/setup"
      })
    );
    const setupUrl = report.groups
      .flatMap((group) => group.items)
      .find((item) => item.id === "payment-setup-url");

    expect(setupUrl?.status).toBe("blocked");
    expect(setupUrl?.proof).toContain("HTTPS");
  });
});
