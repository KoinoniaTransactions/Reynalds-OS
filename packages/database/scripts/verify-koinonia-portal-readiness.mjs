import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const requiredRoles = [
  "Owner",
  "Operations",
  "Transaction Coordinator",
  "Contract Support",
  "Showing Provider",
  "Customer Success",
  "Finance",
  "Viewer",
  "Client"
];
const approvedSocialLoginProviders = ["google", "microsoft"];

const args = new Set(process.argv.slice(2));
const skipDatabase = args.has("--skip-database");

loadEnvFiles([
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../apps/web/.env.local"),
  resolve(process.cwd(), ".env")
]);

const workspaceId = process.env.ROS_DEFAULT_WORKSPACE_ID || "wks_koinonia";
const checks = [];

recordCheck(
  "AUTH_PROVIDER is clerk",
  process.env.AUTH_PROVIDER === "clerk",
  `found ${process.env.AUTH_PROVIDER || "unset"}`
);
recordCheck("CLERK_SECRET_KEY is set", isPresent(process.env.CLERK_SECRET_KEY));
recordCheck(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set",
  isPresent(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
);
recordCheck(
  "CLERK_SECRET_KEY uses production key shape",
  isProductionClerkKey(process.env.CLERK_SECRET_KEY, "sk_live_"),
  "production portal login should use an sk_live_ key, not a placeholder or test key"
);
recordCheck(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY uses production key shape",
  isProductionClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, "pk_live_"),
  "production portal login should use a pk_live_ key, not a placeholder or test key"
);
const authRedirectOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  ...parseList(process.env.KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS)
].filter(isPresent);
const invalidAuthRedirectOrigins = authRedirectOrigins.filter((origin) => !isPublicHttpsUrl(origin));
recordCheck(
  "auth redirect origins use public HTTPS",
  authRedirectOrigins.length > 0 && invalidAuthRedirectOrigins.length === 0,
  getAuthRedirectOriginDetail(authRedirectOrigins, invalidAuthRedirectOrigins)
);
const hostedSignInUrl = getFirstConfiguredValue(
  process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL
);
const hostedSignOutUrl = getFirstConfiguredValue(
  process.env.NEXT_PUBLIC_AUTH_SIGN_OUT_URL,
  process.env.NEXT_PUBLIC_CLERK_SIGN_OUT_URL
);
recordCheck(
  "hosted sign-in URL is safe",
  isAllowedHostedAuthUrl(hostedSignInUrl, process.env.NODE_ENV),
  getHostedAuthUrlDetail(hostedSignInUrl)
);
if (isPresent(hostedSignOutUrl)) {
  recordCheck(
    "hosted sign-out URL is safe",
    isAllowedHostedAuthUrl(hostedSignOutUrl, process.env.NODE_ENV),
    getHostedAuthUrlDetail(hostedSignOutUrl)
  );
}
recordCheck("DATABASE_URL is set", isPresent(process.env.DATABASE_URL));
recordCheck(
  "ROS_ALLOW_MOCK_AUTH is not enabled",
  process.env.ROS_ALLOW_MOCK_AUTH !== "true",
  "mock auth must stay disabled for production portal data"
);
recordCheck(
  "KOINONIA_PAYMENT_PROCESSOR_PROVIDER is set",
  isConfiguredValue(process.env.KOINONIA_PAYMENT_PROCESSOR_PROVIDER),
  "live payment setup requires an approved payment processor"
);
recordCheck(
  "KOINONIA_PAYMENT_SETUP_URL is public HTTPS",
  isPublicHttpsUrl(process.env.KOINONIA_PAYMENT_SETUP_URL),
  "use a processor-hosted payment setup URL, not a portal card-entry form"
);
recordCheck(
  "KOINONIA_PAYMENT_WEBHOOK_SECRET is set",
  isConfiguredValue(process.env.KOINONIA_PAYMENT_WEBHOOK_SECRET),
  "verified processor events are required before trusting payment status"
);

const socialLoginConfigured = process.env.KOINONIA_SOCIAL_LOGIN_CONFIGURED === "true";
const socialLoginProviders = parseList(process.env.KOINONIA_SOCIAL_LOGIN_PROVIDERS).map(
  normalizeProviderName
);
const unsupportedSocialLoginProviders = socialLoginProviders.filter(
  (provider) => !approvedSocialLoginProviders.includes(provider)
);

if (socialLoginConfigured) {
  recordCheck(
    "social login providers are approved",
    socialLoginProviders.length > 0 && unsupportedSocialLoginProviders.length === 0,
    getSocialLoginProviderDetail(socialLoginProviders, unsupportedSocialLoginProviders)
  );
  recordCheck(
    "social login invite matching test is verified",
    process.env.KOINONIA_SOCIAL_LOGIN_INVITE_MATCHING_VERIFIED === "true",
    "OAuth sign-in must be tested against invited client and staff users"
  );
} else {
  recordCheck(
    "social login optional gate is not enabled",
    true,
    "set KOINONIA_SOCIAL_LOGIN_CONFIGURED=true only after Clerk OAuth setup is ready"
  );
}

const aiReviewEnabled = process.env.KOINONIA_AI_REVIEW_ENABLED === "true";

if (aiReviewEnabled) {
  recordCheck(
    "AI review provider is configured",
    isPresent(process.env.OPENAI_API_KEY) || isConfiguredValue(process.env.AI_PROVIDER),
    "AI review must have an approved provider before it can review staff work"
  );
  recordCheck(
    "AI review prompts are approved",
    process.env.KOINONIA_AI_REVIEW_PROMPTS_APPROVED === "true",
    "checklist-specific prompts must be approved before AI review is enabled"
  );
  recordCheck(
    "AI privacy rules are approved",
    process.env.KOINONIA_AI_PRIVACY_RULES_APPROVED === "true",
    "client data handling rules must be approved before AI review is enabled"
  );
  recordCheck(
    "AI review citations are required",
    process.env.KOINONIA_AI_CITATIONS_REQUIRED === "true",
    "AI findings must cite the source records or checklist rules they rely on"
  );
  recordCheck(
    "AI review audit logging is enabled",
    process.env.KOINONIA_AI_AUDIT_LOGGING_ENABLED === "true",
    "AI review actions must be auditable"
  );
  recordCheck(
    "AI review requires human approval",
    process.env.KOINONIA_AI_HUMAN_APPROVAL_REQUIRED === "true",
    "AI should recommend, not approve client-facing or billing actions"
  );
} else {
  recordCheck(
    "AI review optional gate is not enabled",
    true,
    "set KOINONIA_AI_REVIEW_ENABLED=true only after privacy, citation, audit, and approval controls are ready"
  );
}

if (skipDatabase) {
  recordCheck("document upload storage check skipped", true, "remove --skip-database for production verification");
  recordCheck("document malware scanner check skipped", true, "remove --skip-database for production verification");
} else {
  recordCheck("PORTAL_DOCUMENT_UPLOAD_DIR is set", isPresent(process.env.PORTAL_DOCUMENT_UPLOAD_DIR));
  recordCheck(
    "PORTAL_DOCUMENT_UPLOAD_DIR is absolute",
    !isPresent(process.env.PORTAL_DOCUMENT_UPLOAD_DIR) ||
      isAbsolute(process.env.PORTAL_DOCUMENT_UPLOAD_DIR.trim())
  );
  recordCheck(
    "PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND is set",
    isPresent(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND)
  );
  recordCheck(
    "PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND is absolute",
    !isPresent(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND) ||
      isAbsolute(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND.trim())
  );
  recordCheck(
    "PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND exists",
    !isPresent(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND) ||
      existsSync(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND.trim())
  );
}

if (!skipDatabase && checks.every((check) => check.ok)) {
  await runDatabaseChecks();
} else if (skipDatabase) {
  recordCheck("database checks skipped", true, "remove --skip-database for production verification");
}

printResults();

const failedChecks = checks.filter((check) => !check.ok);

if (failedChecks.length > 0) {
  process.exitCode = 1;
}

async function runDatabaseChecks() {
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    recordCheck("database connection works", true);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    recordCheck("Koinonia workspace exists", Boolean(workspace), workspaceId);

    const roles = await prisma.role.findMany({
      where: {
        workspaceId,
        name: { in: requiredRoles }
      },
      select: { name: true, permissions: true }
    });
    const existingRoles = new Set(roles.map((role) => role.name));
    const missingRoles = requiredRoles.filter((role) => !existingRoles.has(role));
    const rolesMissingPermissions = roles
      .filter((role) => !Array.isArray(role.permissions) || role.permissions.length === 0)
      .map((role) => role.name);

    recordCheck(
      "approved portal roles are seeded",
      missingRoles.length === 0,
      missingRoles.length ? `missing ${missingRoles.join(", ")}` : `${requiredRoles.length} roles found`
    );

    recordCheck(
      "portal role permissions are seeded",
      missingRoles.length === 0 && rolesMissingPermissions.length === 0,
      rolesMissingPermissions.length
        ? `missing permissions for ${rolesMissingPermissions.join(", ")}`
        : "role permission lists are present"
    );

    const users = await prisma.user.findMany({
      where: {
        workspaceId,
        status: "active"
      },
      select: {
        email: true,
        mfaRequired: true,
        portalAccessStatus: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    const ownerUsers = users.filter(
      (user) => user.role?.name === "Owner" && user.portalAccessStatus === "active"
    );

    recordCheck(
      "active owner portal user exists",
      ownerUsers.length > 0,
      ownerUsers.length ? `${ownerUsers.length} owner user(s) found` : "no active owner portal user found"
    );

    const staffWithoutMfa = users.filter(
      (user) => user.role?.name !== "Client" && user.portalAccessStatus === "active" && !user.mfaRequired
    );

    recordCheck(
      "active staff users require MFA",
      staffWithoutMfa.length === 0,
      staffWithoutMfa.length
        ? `missing MFA requirement for ${staffWithoutMfa.map((user) => user.email).join(", ")}`
        : "all active staff users require MFA"
    );

    const acceptedInvitations = await prisma.portalInvitation.findMany({
      where: {
        acceptedAt: { not: null },
        status: "accepted",
        workspaceId
      },
      select: {
        roleName: true
      }
    });
    const acceptedClientInvitations = acceptedInvitations.filter(
      (invitation) => invitation.roleName === "Client"
    );
    const acceptedStaffInvitations = acceptedInvitations.filter(
      (invitation) => invitation.roleName !== "Client"
    );

    recordCheck(
      "accepted client invite test exists",
      acceptedClientInvitations.length > 0,
      acceptedClientInvitations.length
        ? `${acceptedClientInvitations.length} accepted client invite(s)`
        : "no accepted client invite found"
    );

    recordCheck(
      "accepted staff invite test exists",
      acceptedStaffInvitations.length > 0,
      acceptedStaffInvitations.length
        ? `${acceptedStaffInvitations.length} accepted staff invite(s)`
        : "no accepted staff invite found"
    );
  } catch (error) {
    recordCheck(
      "database readiness checks",
      false,
      error instanceof Error ? error.message : "unknown database error"
    );
  } finally {
    await prisma.$disconnect();
  }
}

function loadEnvFiles(paths) {
  for (const path of paths) {
    if (!existsSync(path)) {
      continue;
    }

    const lines = readFileSync(path, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");

      if (!key || process.env[key] !== undefined) {
        continue;
      }

      process.env[key] = stripQuotes(valueParts.join("="));
    }
  }
}

function stripQuotes(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isProductionClerkKey(value, prefix) {
  return isPresent(value) && value.trim().startsWith(prefix) && !isPlaceholderCredential(value);
}

function isConfiguredValue(value) {
  return isPresent(value) && !isPlaceholderCredential(value);
}

function parseList(value) {
  if (!isPresent(value)) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProviderName(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function getSocialLoginProviderDetail(providers, unsupportedProviders) {
  if (unsupportedProviders.length > 0) {
    return `unsupported provider(s): ${unsupportedProviders.join(", ")}`;
  }

  if (providers.length === 0) {
    return "no providers listed";
  }

  return `approved provider(s): ${providers.join(", ")}`;
}

function getAuthRedirectOriginDetail(origins, invalidOrigins) {
  if (origins.length === 0) {
    return "set NEXT_PUBLIC_SITE_URL or KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS";
  }

  if (invalidOrigins.length > 0) {
    return `invalid origin(s): ${invalidOrigins.join(", ")}`;
  }

  return `configured origin(s): ${origins.join(", ")}`;
}

function getHostedAuthUrlDetail(value) {
  if (!isPresent(value)) {
    return "set NEXT_PUBLIC_CLERK_SIGN_IN_URL or NEXT_PUBLIC_AUTH_SIGN_IN_URL";
  }

  if (!isAllowedHostedAuthUrl(value, process.env.NODE_ENV)) {
    return `invalid target: ${value.trim()}`;
  }

  return `configured target: ${value.trim()}`;
}

function isPlaceholderCredential(value) {
  return /\b(placeholder|changeme|change-me|dummy|example|fake|todo|your-key|your_key)\b/i.test(
    value
  );
}

function getFirstConfiguredValue(...values) {
  return values.find(isPresent);
}

function isAllowedHostedAuthUrl(value, nodeEnv) {
  if (!isPresent(value)) {
    return false;
  }

  const trimmed = value.trim();

  if (isSameSitePath(trimmed)) {
    return true;
  }

  if (isPlaceholderCredential(trimmed)) {
    return false;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol === "https:" && !isLocalPreviewHost(url.hostname)) {
      return true;
    }

    return (
      nodeEnv !== "production" &&
      (url.protocol === "http:" || url.protocol === "https:") &&
      isLocalPreviewHost(url.hostname)
    );
  } catch {
    return false;
  }
}

function isPublicHttpsUrl(value) {
  if (!isConfiguredValue(value)) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname !== "::1" &&
      url.hostname !== "[::1]"
    );
  } catch {
    return false;
  }
}

function isSameSitePath(value) {
  return value.startsWith("/") && !value.startsWith("//") && !hasControlCharacter(value);
}

function isLocalPreviewHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function hasControlCharacter(value) {
  return /[\u0000-\u001f\u007f]/.test(value);
}

function recordCheck(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

function printResults() {
  console.log("Koinonia portal production readiness");
  console.log(`Workspace: ${workspaceId}`);

  for (const check of checks) {
    const status = check.ok ? "PASS" : "FAIL";
    const detail = check.detail ? ` - ${check.detail}` : "";
    console.log(`${status} ${check.name}${detail}`);
  }
}
