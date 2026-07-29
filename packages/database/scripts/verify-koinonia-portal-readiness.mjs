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
recordCheck("DATABASE_URL is set", isPresent(process.env.DATABASE_URL));
recordCheck(
  "ROS_ALLOW_MOCK_AUTH is not enabled",
  process.env.ROS_ALLOW_MOCK_AUTH !== "true",
  "mock auth must stay disabled for production portal data"
);

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

function isPlaceholderCredential(value) {
  return /\b(placeholder|changeme|change-me|dummy|example|fake|todo|your-key|your_key)\b/i.test(
    value
  );
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
