import {
  createAuthUser,
  getMockUser,
  normalizeRoleName,
  requirePermission,
  type AuthUser,
  type Permission,
  type RoleName
} from "@reynalds-os/auth";

export type AuthProvider = "mock" | "clerk";

type ClerkAuthResult = {
  orgId?: string | null;
  sessionClaims?: Record<string, unknown> | null;
  userId?: string | null;
};

type ClerkUser = {
  id: string;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
  firstName?: string | null;
  fullName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  privateMetadata?: Record<string, unknown> | null;
  publicMetadata?: Record<string, unknown> | null;
};

type ClerkServerModule = {
  auth: () => ClerkAuthResult | Promise<ClerkAuthResult>;
  currentUser: () => ClerkUser | null | Promise<ClerkUser | null>;
};

export class AuthenticationRequiredError extends Error {
  status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export class AuthProviderConfigurationError extends Error {
  status = 503;

  constructor(message: string) {
    super(message);
    this.name = "AuthProviderConfigurationError";
  }
}

export function getAuthProvider(): AuthProvider {
  const provider = process.env.AUTH_PROVIDER ?? "mock";

  if (provider === "mock") {
    return "mock";
  }

  if (provider === "clerk") {
    return "clerk";
  }

  if (provider === "managed") {
    return hasClerkConfiguration() ? "clerk" : "mock";
  }

  throw new AuthProviderConfigurationError(
    `Unsupported AUTH_PROVIDER "${provider}". Use "mock" for local preview or "clerk" for production login.`
  );
}

function hasClerkConfiguration(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isAuthError(error: unknown): error is Error & { status: number } {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  const provider = getAuthProvider();

  if (provider === "mock") {
    return getMockAuthUser();
  }

  return getClerkAuthUser();
}

export async function assertPermission(permission: Permission): Promise<AuthUser> {
  const user = await getCurrentUser();
  requirePermission(user, permission);
  return user;
}

function getMockAuthUser(): AuthUser {
  if (process.env.NODE_ENV === "production" && process.env.ROS_ALLOW_MOCK_AUTH !== "true") {
    throw new AuthProviderConfigurationError(
      "Mock auth is disabled for production portal routes. Set AUTH_PROVIDER=clerk before accepting real client or staff login."
    );
  }

  const role = normalizeRoleName(process.env.ROS_MOCK_USER_ROLE, "Owner");

  if (role === "Owner") {
    return getMockUser();
  }

  return createAuthUser({
    id: `usr_mock_${role.toLowerCase().replaceAll(" ", "_")}`,
    workspaceId: process.env.ROS_MOCK_WORKSPACE_ID ?? "wks_koinonia",
    name: process.env.ROS_MOCK_USER_NAME ?? `${role} Preview`,
    email: process.env.ROS_MOCK_USER_EMAIL ?? "preview@example.com",
    role
  });
}

async function getClerkAuthUser(): Promise<AuthUser> {
  if (!hasClerkConfiguration()) {
    throw new AuthProviderConfigurationError(
      "Managed auth requires CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY before production login can run."
    );
  }

  const clerk = await loadClerkServerModule();
  const session = await Promise.resolve(clerk.auth());

  if (!session.userId) {
    throw new AuthenticationRequiredError();
  }

  const clerkUser = await Promise.resolve(clerk.currentUser());
  const publicMetadata = toRecord(clerkUser?.publicMetadata);
  const privateMetadata = toRecord(clerkUser?.privateMetadata);
  const sessionClaims = toRecord(session.sessionClaims);
  const sessionMetadata = toRecord(sessionClaims.metadata);

  const role = normalizeRoleName(
    firstString(
      publicMetadata.koinoniaRole,
      publicMetadata.role,
      privateMetadata.koinoniaRole,
      privateMetadata.role,
      sessionClaims.koinoniaRole,
      sessionClaims.role,
      sessionMetadata.koinoniaRole,
      sessionMetadata.role
    ),
    "Viewer"
  );

  return createAuthUser({
    id: session.userId,
    workspaceId:
      firstString(
        publicMetadata.koinoniaWorkspaceId,
        publicMetadata.workspaceId,
        privateMetadata.koinoniaWorkspaceId,
        privateMetadata.workspaceId,
        sessionClaims.koinoniaWorkspaceId,
        sessionClaims.workspaceId,
        session.orgId,
        process.env.ROS_DEFAULT_WORKSPACE_ID
      ) ?? "wks_koinonia",
    name: getClerkDisplayName(clerkUser, role),
    email: getClerkEmail(clerkUser),
    role
  });
}

async function loadClerkServerModule(): Promise<ClerkServerModule> {
  try {
    return (await import("@clerk/nextjs/server")) as ClerkServerModule;
  } catch (error) {
    throw new AuthProviderConfigurationError(
      "AUTH_PROVIDER=clerk requires @clerk/nextjs to be installed before production login can run."
    );
  }
}

function getClerkDisplayName(clerkUser: ClerkUser | null, role: RoleName): string {
  if (!clerkUser) {
    return `${role} User`;
  }

  const fullName = firstString(
    clerkUser.fullName,
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
  );

  return fullName ?? getClerkEmail(clerkUser);
}

function getClerkEmail(clerkUser: ClerkUser | null): string {
  return (
    firstString(
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.emailAddresses?.[0]?.emailAddress
    ) ?? "unknown@example.com"
  );
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0);
}
