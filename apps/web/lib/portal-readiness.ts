import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";

export type PortalReadinessStatus = "attention" | "blocked" | "ready";

export type PortalDatabaseReadiness = {
  acceptedClientInvitationCount?: number;
  acceptedStaffInvitationCount?: number;
  activeOwnerCount?: number;
  connected: boolean;
  detail?: string;
  missingRoles?: string[];
  rolesMissingPermissions?: string[];
  staffWithoutMfaCount?: number;
  workspaceExists?: boolean;
};

export type PortalReadinessInput = {
  aiProviderConfigured?: boolean;
  authProvider?: string;
  clerkPublishableKey?: string;
  clerkSecretKey?: string;
  documentMalwareScanCommand?: string;
  documentUploadDir?: string;
  hostedSignInUrl?: string;
  nodeEnv?: string;
  paymentProcessorProvider?: string;
  paymentProcessorSetupUrl?: string;
  paymentProcessorWebhookSecret?: string;
  rosAllowMockAuth?: string;
  socialLoginConfigured?: boolean;
  workspaceId: string;
  database: PortalDatabaseReadiness;
};

export type PortalReadinessItem = {
  detail: string;
  id: string;
  nextAction?: string;
  proof: string;
  status: PortalReadinessStatus;
  title: string;
};

export type PortalReadinessGroup = {
  id: string;
  items: PortalReadinessItem[];
  title: string;
};

export type PortalReadinessReport = {
  generatedAt: string;
  groups: PortalReadinessGroup[];
  overallStatus: PortalReadinessStatus;
  summary: Array<{
    label: string;
    value: string;
  }>;
  workspaceId: string;
};

export const portalReadinessRequiredRoles = [
  "Owner",
  "Operations",
  "Transaction Coordinator",
  "Contract Support",
  "Showing Provider",
  "Customer Success",
  "Finance",
  "Viewer",
  "Client"
] as const;

export function buildPortalReadinessReport(input: PortalReadinessInput): PortalReadinessReport {
  const groups: PortalReadinessGroup[] = [
    {
      id: "login",
      title: "Login",
      items: [
        getAuthProviderReadiness(input),
        getClerkKeyReadiness(input),
        getHostedLoginReadiness(input),
        getMockAuthReadiness(input),
        getSocialLoginReadiness(input)
      ]
    },
    {
      id: "data",
      title: "Data",
      items: [
        getDatabaseConnectionReadiness(input.database),
        getWorkspaceReadiness(input.database, input.workspaceId),
        getRoleSeedReadiness(input.database),
        getOwnerReadiness(input.database),
        getStaffMfaReadiness(input.database),
        getInvitationAcceptanceReadiness(input.database)
      ]
    },
    {
      id: "portal",
      title: "Portal Workflows",
      items: [
        readyItem(
          "portal-routes",
          "Protected client and employee routes",
          "Client dashboard, documents, billing, employee access, employee dashboard, and employee billing routes are permission-gated.",
          "Route guards use portal permissions and redirect signed-out users to the login path."
        ),
        readyItem(
          "portal-requests",
          "Client requests",
          "Showing requests, external access requests, and billing setup requests now create portal records without accepting passwords or card numbers.",
          "The request APIs validate sensitive notes and write audit history."
        ),
        readyItem(
          "portal-assignment",
          "Client and staff assignment fields",
          "Work objects now separate client visibility from internal staff assignment.",
          "RosObject has clientUserId, clientObjectId, assignedStaffUserId, and backupStaffUserId."
        )
      ]
    },
    {
      id: "documents",
      title: "Documents",
      items: [
        getDocumentStorageReadiness(input),
        getDocumentScannerReadiness(input),
        readyItem(
          "document-downloads",
          "Authorized downloads",
          "Portal documents have a protected download route that checks user permissions and rejects unsafe storage paths.",
          "Downloads use stored private file keys instead of public file links."
        )
      ]
    },
    {
      id: "billing",
      title: "Billing",
      items: [
        readyItem(
          "billing-metadata",
          "Billing setup metadata",
          "Billing setup requests collect service, consent, billing model, and safe notes without storing card data.",
          "The portal stores BillingSetupRequest records and rejects raw payment secrets."
        ),
        getPaymentProcessorReadiness(input),
        getPaymentSetupUrlReadiness(input),
        getPaymentWebhookReadiness(input)
      ]
    },
    {
      id: "oversight",
      title: "Oversight",
      items: [
        readyItem(
          "readiness-view",
          "Live readiness view",
          "Staff can review the current login, data, document, portal, and AI gates from one protected page.",
          "This page is generated from current configuration and database checks."
        ),
        readyItem(
          "staff-review-center",
          "Staff review center",
          "Koinonia has a protected rules-based review queue for missing assignments, documents, billing setup, access, and showing issues.",
          "/employee/review uses current portal records and does not rely on generative output."
        ),
        getAiReadiness(input)
      ]
    }
  ];
  const items = groups.flatMap((group) => group.items);
  const readyCount = items.filter((item) => item.status === "ready").length;
  const attentionCount = items.filter((item) => item.status === "attention").length;
  const blockedCount = items.filter((item) => item.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    groups,
    overallStatus: blockedCount > 0 ? "blocked" : attentionCount > 0 ? "attention" : "ready",
    summary: [
      { label: "Ready", value: String(readyCount) },
      { label: "Needs Attention", value: String(attentionCount) },
      { label: "Blocked", value: String(blockedCount) },
      { label: "Total Checks", value: String(items.length) }
    ],
    workspaceId: input.workspaceId
  };
}

function getAuthProviderReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const provider = input.authProvider ?? "unset";

  if (provider === "clerk") {
    return readyItem(
      "auth-provider",
      "Managed auth provider",
      "Production login is set to Clerk.",
      "AUTH_PROVIDER is clerk."
    );
  }

  if (provider === "managed") {
    return attentionItem(
      "auth-provider",
      "Managed auth provider",
      "Managed mode can fall back to mock auth when keys are missing.",
      "AUTH_PROVIDER is managed.",
      "Use AUTH_PROVIDER=clerk before accepting real client or staff data."
    );
  }

  return blockedItem(
    "auth-provider",
    "Managed auth provider",
    `The current provider is ${provider}.`,
    "Production portal login requires Clerk-backed managed authentication.",
    "Set AUTH_PROVIDER=clerk for production."
  );
}

function getClerkKeyReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const secretReadiness = getCredentialReadiness(input.clerkSecretKey, "sk_live_");
  const publishableReadiness = getCredentialReadiness(input.clerkPublishableKey, "pk_live_");

  if (secretReadiness.ok && publishableReadiness.ok) {
    return readyItem(
      "clerk-keys",
      "Clerk keys",
      "Clerk server and browser keys look production-ready.",
      "Both Clerk environment variables are present and use production key prefixes."
    );
  }

  return blockedItem(
    "clerk-keys",
    "Clerk keys",
    "Clerk cannot run production login until both production keys are configured.",
    getCredentialProof(secretReadiness.detail, publishableReadiness.detail),
    "Add production Clerk keys in the deployment environment."
  );
}

function getHostedLoginReadiness(input: PortalReadinessInput): PortalReadinessItem {
  if (isPresent(input.hostedSignInUrl)) {
    return readyItem(
      "hosted-login",
      "Hosted login route",
      "The sign-in path is configured for redirects back into the portal.",
      "A hosted sign-in URL environment value is present."
    );
  }

  return attentionItem(
    "hosted-login",
    "Hosted login route",
    "The app can use the internal sign-in route, but production should explicitly configure the hosted sign-in URL.",
    "No hosted sign-in URL is set.",
    "Set NEXT_PUBLIC_CLERK_SIGN_IN_URL or NEXT_PUBLIC_AUTH_SIGN_IN_URL."
  );
}

function getMockAuthReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const mockEnabled = input.rosAllowMockAuth === "true";
  const production = input.nodeEnv === "production";

  if (!mockEnabled) {
    return readyItem(
      "mock-auth",
      "Mock auth safety",
      "Mock auth is not explicitly enabled.",
      "ROS_ALLOW_MOCK_AUTH is not true."
    );
  }

  return production
    ? blockedItem(
        "mock-auth",
        "Mock auth safety",
        "Mock auth is enabled in production.",
        "Real portal data must not run with mock users.",
        "Set ROS_ALLOW_MOCK_AUTH=false in production."
      )
    : attentionItem(
        "mock-auth",
        "Mock auth safety",
        "Mock auth is enabled for local preview.",
        "This is acceptable for local testing only.",
        "Keep this disabled in production."
      );
}

function getSocialLoginReadiness(input: PortalReadinessInput): PortalReadinessItem {
  if (input.socialLoginConfigured) {
    return readyItem(
      "social-login",
      "Social login",
      "Social login is marked configured for the auth provider.",
      "External provider configuration has been marked ready."
    );
  }

  return attentionItem(
    "social-login",
    "Social login",
    "Google and Microsoft login are appropriate for Realtor clients and staff, but must stay invitation-gated.",
    "Provider configuration is outside this codebase and has not been marked ready.",
    "Enable selected OAuth providers in Clerk, then verify invite matching, role assignment, and staff MFA."
  );
}

function getDatabaseConnectionReadiness(database: PortalDatabaseReadiness): PortalReadinessItem {
  if (database.connected) {
    return readyItem(
      "database",
      "Database connection",
      "The portal can reach the production data store.",
      database.detail ?? "Database check passed."
    );
  }

  return blockedItem(
    "database",
    "Database connection",
    "The portal cannot prove database readiness right now.",
    database.detail ?? "Database check did not run.",
    "Run the full readiness verifier with a production DATABASE_URL."
  );
}

function getWorkspaceReadiness(database: PortalDatabaseReadiness, workspaceId: string): PortalReadinessItem {
  if (!database.connected) {
    return blockedItem(
      "workspace",
      "Koinonia workspace",
      "The configured portal workspace could not be checked.",
      workspaceId,
      "Run the full readiness verifier with a production DATABASE_URL."
    );
  }

  if (database.workspaceExists) {
    return readyItem(
      "workspace",
      "Koinonia workspace",
      "The configured portal workspace exists.",
      workspaceId
    );
  }

  return blockedItem(
    "workspace",
    "Koinonia workspace",
    "The configured portal workspace was not found.",
    workspaceId,
    "Seed or configure the Koinonia workspace before production login."
  );
}

function getRoleSeedReadiness(database: PortalDatabaseReadiness): PortalReadinessItem {
  const missingRoles = database.missingRoles ?? [];
  const rolesMissingPermissions = database.rolesMissingPermissions ?? [];

  if (missingRoles.length === 0 && rolesMissingPermissions.length === 0 && database.connected) {
    return readyItem(
      "roles",
      "Portal roles",
      "All approved Koinonia portal roles and permission lists are seeded.",
      `${portalReadinessRequiredRoles.length} required roles are present with permissions.`
    );
  }

  return blockedItem(
    "roles",
    "Portal roles",
    "One or more required portal roles are missing.",
    getRoleReadinessProof(missingRoles, rolesMissingPermissions),
    "Run the database seed and full readiness verifier."
  );
}

function getRoleReadinessProof(missingRoles: string[], rolesMissingPermissions: string[]): string {
  if (missingRoles.length > 0) {
    return `Missing: ${missingRoles.join(", ")}`;
  }

  if (rolesMissingPermissions.length > 0) {
    return `Missing permissions: ${rolesMissingPermissions.join(", ")}`;
  }

  return "Role check did not complete.";
}

function getOwnerReadiness(database: PortalDatabaseReadiness): PortalReadinessItem {
  if (!database.connected) {
    return blockedItem(
      "owner",
      "Active owner access",
      "The owner access check could not run.",
      "Owner check did not complete.",
      "Run the full readiness verifier with a production DATABASE_URL."
    );
  }

  const ownerCount = database.activeOwnerCount ?? 0;

  if (ownerCount > 0) {
    return readyItem(
      "owner",
      "Active owner access",
      "At least one active Owner portal user exists.",
      `${ownerCount} owner user(s) found.`
    );
  }

  return blockedItem(
    "owner",
    "Active owner access",
    "The portal has no active Owner user to administer access.",
    "No active owner found.",
    "Create or activate an Owner user before inviting real clients."
  );
}

function getStaffMfaReadiness(database: PortalDatabaseReadiness): PortalReadinessItem {
  if (!database.connected) {
    return blockedItem(
      "staff-mfa",
      "Staff MFA",
      "The staff MFA check could not run.",
      "MFA check did not complete.",
      "Run the full readiness verifier with a production DATABASE_URL."
    );
  }

  const staffWithoutMfaCount = database.staffWithoutMfaCount ?? 0;

  if (database.connected && staffWithoutMfaCount === 0) {
    return readyItem(
      "staff-mfa",
      "Staff MFA",
      "Active staff users are marked as MFA-required.",
      "No active staff users are missing the MFA flag."
    );
  }

  return blockedItem(
    "staff-mfa",
    "Staff MFA",
    "Staff MFA is required before production client files or billing work are accepted.",
    `${staffWithoutMfaCount} active staff user(s) missing MFA requirement.`,
    "Require MFA for every active non-client portal user."
  );
}

function getInvitationAcceptanceReadiness(database: PortalDatabaseReadiness): PortalReadinessItem {
  if (!database.connected) {
    return blockedItem(
      "invite-acceptance",
      "Invite acceptance test",
      "The invitation acceptance check could not run.",
      "Invite acceptance check did not complete.",
      "Run the full readiness verifier with a production DATABASE_URL."
    );
  }

  const clientCount = database.acceptedClientInvitationCount ?? 0;
  const staffCount = database.acceptedStaffInvitationCount ?? 0;

  if (clientCount > 0 && staffCount > 0) {
    return readyItem(
      "invite-acceptance",
      "Invite acceptance test",
      "At least one client invitation and one staff invitation have been accepted.",
      `${clientCount} client invite(s) and ${staffCount} staff invite(s) accepted.`
    );
  }

  return blockedItem(
    "invite-acceptance",
    "Invite acceptance test",
    "Production login needs a real accepted invite test for both client and staff access.",
    `${clientCount} client invite(s) and ${staffCount} staff invite(s) accepted.`,
    "Send and accept one real client invite and one real staff invite before production launch."
  );
}

function getDocumentStorageReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const uploadDir = input.documentUploadDir?.trim();

  if (uploadDir && isAbsolute(uploadDir)) {
    return readyItem(
      "document-storage",
      "Private document storage",
      "Document upload storage is configured.",
      "PORTAL_DOCUMENT_UPLOAD_DIR is present and absolute."
    );
  }

  return blockedItem(
    "document-storage",
    "Private document storage",
    "Clients cannot upload real files until private storage is configured.",
    uploadDir ? "Upload directory must be an absolute path." : "Upload directory is missing.",
    "Set PORTAL_DOCUMENT_UPLOAD_DIR to an absolute private storage path on the production host."
  );
}

function getDocumentScannerReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const command = input.documentMalwareScanCommand?.trim();

  if (command && isAbsolute(command) && existsSync(command)) {
    return readyItem(
      "document-scanner",
      "Document malware scanning",
      "Document upload scanning is configured.",
      "The scanner command is absolute and exists on disk."
    );
  }

  return blockedItem(
    "document-scanner",
    "Document malware scanning",
    "Clients cannot upload real files until malware scanning is configured.",
    command ? "Scanner command is missing, relative, or unavailable." : "Scanner command is missing.",
    "Set PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND to an absolute scanner executable."
  );
}

function getPaymentProcessorReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const provider = input.paymentProcessorProvider?.trim();

  if (provider && !isPlaceholderCredential(provider)) {
    return readyItem(
      "payment-processor",
      "Payment processor",
      "A payment processor provider is named for processor-hosted setup.",
      `KOINONIA_PAYMENT_PROCESSOR_PROVIDER is set to ${provider}.`
    );
  }

  return blockedItem(
    "payment-processor",
    "Payment processor",
    "Billing can track setup requests, but live payment methods require an approved processor.",
    provider ? "Payment processor provider looks like a placeholder." : "Payment processor provider is missing.",
    "Set KOINONIA_PAYMENT_PROCESSOR_PROVIDER before accepting live payment setup."
  );
}

function getPaymentSetupUrlReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const setupUrl = input.paymentProcessorSetupUrl?.trim();

  if (setupUrl && isPublicHttpsUrl(setupUrl) && !isPlaceholderCredential(setupUrl)) {
    return readyItem(
      "payment-setup-url",
      "Processor-hosted setup URL",
      "Clients can be sent to a secure processor-hosted payment setup destination.",
      "KOINONIA_PAYMENT_SETUP_URL is a public HTTPS URL."
    );
  }

  return blockedItem(
    "payment-setup-url",
    "Processor-hosted setup URL",
    "The portal must not collect card numbers directly.",
    getPaymentUrlProof(setupUrl),
    "Set KOINONIA_PAYMENT_SETUP_URL to a public HTTPS processor-hosted setup destination."
  );
}

function getPaymentWebhookReadiness(input: PortalReadinessInput): PortalReadinessItem {
  const webhookSecret = input.paymentProcessorWebhookSecret?.trim();

  if (webhookSecret && !isPlaceholderCredential(webhookSecret)) {
    return readyItem(
      "payment-webhook-secret",
      "Payment webhook secret",
      "A payment webhook secret is configured so processor events can be verified before payment state changes are trusted.",
      "KOINONIA_PAYMENT_WEBHOOK_SECRET is present."
    );
  }

  return blockedItem(
    "payment-webhook-secret",
    "Payment webhook secret",
    "Koinonia needs verified processor events before treating payment setup, failed payments, refunds, or charge status as final.",
    webhookSecret ? "Payment webhook secret looks like a placeholder." : "Payment webhook secret is missing.",
    "Configure KOINONIA_PAYMENT_WEBHOOK_SECRET before payment status is treated as production-ready."
  );
}

function getAiReadiness(input: PortalReadinessInput): PortalReadinessItem {
  if (input.aiProviderConfigured) {
    return attentionItem(
      "ai-review",
      "AI staff review",
      "AI provider configuration is present, but checklist-specific prompts and approval policy still need a production pass.",
      "The staff review center is rules-based and the current Copilot is read-only.",
      "Add checklist-specific AI review prompts, citations, audit events, and approval gates."
    );
  }

  return attentionItem(
    "ai-review",
    "AI staff review",
    "AI can help staff prioritize missed deadlines, missing documents, billing gaps, showing access issues, and unsigned approvals after the rules-based review center is proven.",
    "The staff review center is active without sending portal data to an AI provider.",
    "Keep AI read-only until model configuration, privacy rules, citations, audit events, and human approval gates are verified."
  );
}

function readyItem(id: string, title: string, detail: string, proof: string): PortalReadinessItem {
  return { detail, id, proof, status: "ready", title };
}

function attentionItem(
  id: string,
  title: string,
  detail: string,
  proof: string,
  nextAction?: string
): PortalReadinessItem {
  return { detail, id, nextAction, proof, status: "attention", title };
}

function blockedItem(
  id: string,
  title: string,
  detail: string,
  proof: string,
  nextAction?: string
): PortalReadinessItem {
  return { detail, id, nextAction, proof, status: "blocked", title };
}

function isPresent(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getCredentialReadiness(
  value: unknown,
  productionPrefix: "pk_live_" | "sk_live_"
): { detail: string; ok: boolean } {
  if (!isPresent(value)) {
    return { detail: productionPrefix === "sk_live_" ? "Secret key is missing." : "Publishable key is missing.", ok: false };
  }

  const credential = value.trim();

  if (isPlaceholderCredential(credential)) {
    return {
      detail:
        productionPrefix === "sk_live_"
          ? "Secret key still looks like a placeholder."
          : "Publishable key still looks like a placeholder.",
      ok: false
    };
  }

  if (!credential.startsWith(productionPrefix)) {
    return {
      detail:
        productionPrefix === "sk_live_"
          ? "Secret key does not use the sk_live_ production prefix."
          : "Publishable key does not use the pk_live_ production prefix.",
      ok: false
    };
  }

  return { detail: "Production key shape found.", ok: true };
}

function getCredentialProof(secretDetail: string, publishableDetail: string): string {
  if (secretDetail === "Production key shape found.") {
    return publishableDetail;
  }

  if (publishableDetail === "Production key shape found.") {
    return secretDetail;
  }

  return `${secretDetail} ${publishableDetail}`;
}

function isPlaceholderCredential(value: string): boolean {
  return /\b(placeholder|changeme|change-me|dummy|example|fake|todo|your-key|your_key)\b/i.test(value);
}

function getPaymentUrlProof(setupUrl: string | undefined): string {
  if (!setupUrl) {
    return "Payment setup URL is missing.";
  }

  if (isPlaceholderCredential(setupUrl)) {
    return "Payment setup URL looks like a placeholder.";
  }

  return "Payment setup URL must be public HTTPS and cannot point to localhost.";
}

function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname !== "::1"
    );
  } catch {
    return false;
  }
}
