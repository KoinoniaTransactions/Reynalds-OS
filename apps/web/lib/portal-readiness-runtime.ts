import { prisma } from "./db";
import {
  buildPortalReadinessReport,
  portalReadinessRequiredRoles,
  type PortalDatabaseReadiness,
  type PortalReadinessReport
} from "./portal-readiness";

export async function buildCurrentPortalReadinessReport(): Promise<PortalReadinessReport> {
  const workspaceId = process.env.ROS_DEFAULT_WORKSPACE_ID ?? "wks_koinonia";
  const database = await getPortalDatabaseReadiness(workspaceId);

  return buildPortalReadinessReport({
    aiProviderConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER),
    aiReviewAuditLoggingEnabled: process.env.KOINONIA_AI_AUDIT_LOGGING_ENABLED === "true",
    aiReviewCitationsRequired: process.env.KOINONIA_AI_CITATIONS_REQUIRED === "true",
    aiReviewEnabled: process.env.KOINONIA_AI_REVIEW_ENABLED === "true",
    aiReviewHumanApprovalRequired: process.env.KOINONIA_AI_HUMAN_APPROVAL_REQUIRED === "true",
    aiReviewPrivacyRulesApproved: process.env.KOINONIA_AI_PRIVACY_RULES_APPROVED === "true",
    aiReviewPromptsApproved: process.env.KOINONIA_AI_REVIEW_PROMPTS_APPROVED === "true",
    authRedirectOrigins: getConfiguredList(process.env.KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS),
    authProvider: process.env.AUTH_PROVIDER,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    documentMalwareScanCommand: process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND,
    documentUploadDir: process.env.PORTAL_DOCUMENT_UPLOAD_DIR,
    hostedSignInUrl: getFirstConfiguredValue(
      process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL
    ),
    nodeEnv: process.env.NODE_ENV,
    paymentProcessorProvider: process.env.KOINONIA_PAYMENT_PROCESSOR_PROVIDER,
    paymentProcessorSetupUrl: process.env.KOINONIA_PAYMENT_SETUP_URL,
    paymentProcessorWebhookUrl: process.env.KOINONIA_PAYMENT_WEBHOOK_URL,
    paymentProcessorWebhookSecret: process.env.KOINONIA_PAYMENT_WEBHOOK_SECRET,
    rosAllowMockAuth: process.env.ROS_ALLOW_MOCK_AUTH,
    socialLoginConfigured: process.env.KOINONIA_SOCIAL_LOGIN_CONFIGURED === "true",
    socialLoginInviteMatchingVerified:
      process.env.KOINONIA_SOCIAL_LOGIN_INVITE_MATCHING_VERIFIED === "true",
    socialLoginProviders: getConfiguredList(process.env.KOINONIA_SOCIAL_LOGIN_PROVIDERS),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    workspaceId,
    database
  });
}

export async function getPortalDatabaseReadiness(
  workspaceId: string
): Promise<PortalDatabaseReadiness> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [workspace, roles, users, invitations] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true }
      }),
      prisma.role.findMany({
        where: {
          workspaceId,
          name: { in: [...portalReadinessRequiredRoles] }
        },
        select: { name: true, permissions: true }
      }),
      prisma.user.findMany({
        where: {
          workspaceId,
          status: "active"
        },
        select: {
          mfaRequired: true,
          portalAccessStatus: true,
          role: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.portalInvitation.findMany({
        where: {
          acceptedAt: { not: null },
          status: "accepted",
          workspaceId
        },
        select: {
          roleName: true
        }
      })
    ]);

    const seededRoles = new Set(roles.map((role) => role.name));
    const missingRoles = portalReadinessRequiredRoles.filter((role) => !seededRoles.has(role));
    const rolesMissingPermissions = roles
      .filter((role) => !Array.isArray(role.permissions) || role.permissions.length === 0)
      .map((role) => role.name);
    const activeOwnerCount = users.filter(
      (user) => user.role?.name === "Owner" && user.portalAccessStatus === "active"
    ).length;
    const staffWithoutMfaCount = users.filter(
      (user) => user.role?.name !== "Client" && user.portalAccessStatus === "active" && !user.mfaRequired
    ).length;
    const acceptedClientInvitationCount = invitations.filter(
      (invitation) => invitation.roleName === "Client"
    ).length;
    const acceptedStaffInvitationCount = invitations.filter(
      (invitation) => invitation.roleName !== "Client"
    ).length;

    return {
      acceptedClientInvitationCount,
      acceptedStaffInvitationCount,
      activeOwnerCount,
      connected: true,
      detail: "Database connection check passed.",
      missingRoles,
      rolesMissingPermissions,
      staffWithoutMfaCount,
      workspaceExists: Boolean(workspace)
    };
  } catch {
    return {
      connected: false,
      detail: "Database readiness check failed."
    };
  }
}

function getConfiguredList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFirstConfiguredValue(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}
