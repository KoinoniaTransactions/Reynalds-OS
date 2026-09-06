import {
  createAuthUser,
  getPermissionsForRole,
  getMockUser,
  getMockUserId,
  normalizeRoleName,
  requirePermission,
  type AuthUser,
  type Permission,
  type RoleName
} from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";

export type AuthProvider = "mock" | "clerk";

type ClerkAuthResult = {
  orgId?: string | null;
  sessionClaims?: Record<string, unknown> | null;
  userId?: string | null;
};

type ClerkAuthOptions = {
  treatPendingAsSignedOut?: boolean;
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
  auth: (options?: ClerkAuthOptions) => ClerkAuthResult | Promise<ClerkAuthResult>;
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

export function getMockAuthUser(): AuthUser {
  if (process.env.NODE_ENV === "production" && process.env.ROS_ALLOW_MOCK_AUTH !== "true") {
    throw new AuthProviderConfigurationError(
      "Mock auth is disabled for production portal routes. Set AUTH_PROVIDER=clerk before accepting real client or staff login."
    );
  }

  const role =
    normalizeRoleName(
      process.env.ROS_MOCK_USER_ROLE,
      "Owner"
    );

  const workspaceId =
    process.env.ROS_MOCK_WORKSPACE_ID ??
    "wks_koinonia";

  if (role === "Owner") {
    return getMockUser();
  }

  return createAuthUser({
    id:
      getMockUserId(
        workspaceId,
        role
      ),
    workspaceId,
    name:
      process.env.ROS_MOCK_USER_NAME ??
      `${role} Preview`,
    email:
      process.env.ROS_MOCK_USER_EMAIL ??
      "preview@example.com",
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
  const session = await Promise.resolve(clerk.auth({ treatPendingAsSignedOut: true }));

  if (!session.userId) {
    throw new AuthenticationRequiredError();
  }

  const clerkUser = await Promise.resolve(clerk.currentUser());
  const email = getRequiredClerkEmail(clerkUser);
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

  const providerUser = createAuthUser({
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
    name: getClerkDisplayName(clerkUser, role, email),
    email,
    role
  });

  return resolveClerkDatabaseUser(providerUser);
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

function getClerkDisplayName(clerkUser: ClerkUser | null, role: RoleName, email: string): string {
  if (!clerkUser) {
    return `${role} User`;
  }

  const fullName = firstString(
    clerkUser.fullName,
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
  );

  return fullName ?? email;
}

export function normalizeClerkEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

function getRequiredClerkEmail(clerkUser: ClerkUser | null): string {
  const email = firstString(
    clerkUser?.primaryEmailAddress?.emailAddress,
    clerkUser?.emailAddresses?.[0]?.emailAddress
  );

  if (!email) {
    throw new AuthProviderConfigurationError(
      "Clerk users must expose an email address before Koinonia portal access can be granted."
    );
  }

  return normalizeClerkEmailAddress(email);
}

async function resolveClerkDatabaseUser(providerUser: AuthUser): Promise<AuthUser> {
  const dbUser = await prisma.user.findFirst({
    where: getClerkDatabaseUserWhere(providerUser),
    include: {
      role: true
    }
  });

  if (!dbUser || dbUser.status !== "active" || dbUser.portalAccessStatus !== "active") {
    const invitedUser = !dbUser ? await acceptPortalInvitationForProviderUser(providerUser) : null;

    if (invitedUser) {
      return invitedUser;
    }

    return createAuthUser({
      id: providerUser.id,
      workspaceId: providerUser.workspaceId,
      name: providerUser.name,
      email: providerUser.email,
      role: "Viewer"
    });
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      authProvider: "clerk",
      authProviderUserId: providerUser.id,
      lastLoginAt: new Date()
    }
  });

  return createAuthUser({
    id: dbUser.id,
    workspaceId: dbUser.workspaceId,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role?.name ?? "Viewer"
  });
}

async function acceptPortalInvitationForProviderUser(providerUser: AuthUser): Promise<AuthUser | null> {
  const now = new Date();
  const invitation = await prisma.portalInvitation.findFirst({
    where: getPortalInvitationAcceptanceWhere(providerUser, now),
    orderBy: { createdAt: "desc" }
  });

  if (!invitation) {
    return null;
  }

  const roleName = normalizeRoleName(invitation.roleName, "Viewer");
  const role = await ensureWorkspaceRole(invitation.workspaceId, roleName);

  const dbUser = await prisma.user.create({
    data: {
      workspaceId: invitation.workspaceId,
      name: firstString(invitation.name, providerUser.name, providerUser.email) ?? providerUser.email,
      email: providerUser.email,
      roleId: role.id,
      status: "active",
      authProvider: "clerk",
      authProviderUserId: providerUser.id,
      mfaRequired: roleName !== "Client",
      portalAccessStatus: "active",
      invitedAt: invitation.createdAt,
      lastLoginAt: now
    },
    include: {
      role: true
    }
  });

  await prisma.portalInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "accepted",
      acceptedAt: now
    }
  });

  await prisma.auditEvent.create({
    data: {
      workspaceId: invitation.workspaceId,
      actorId: dbUser.id,
      actorEmail: dbUser.email,
      action: "portal.invitation.accepted",
      subjectType: "PortalInvitation",
      subjectId: invitation.id,
      summary: `Portal invitation accepted by ${dbUser.email}`,
      metadata: {
        roleName,
        provider: "clerk",
        authProviderUserId: providerUser.id
      }
    }
  });

  return createAuthUser({
    id: dbUser.id,
    workspaceId: dbUser.workspaceId,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role?.name ?? roleName
  });
}

export function getClerkDatabaseUserWhere(providerUser: AuthUser): Prisma.UserWhereInput {
  return {
    OR: [
      {
        authProvider: "clerk",
        authProviderUserId: providerUser.id
      },
      {
        workspaceId: providerUser.workspaceId,
        email: providerUser.email
      }
    ]
  };
}

export function getPortalInvitationAcceptanceWhere(
  providerUser: AuthUser,
  now = new Date()
): Prisma.PortalInvitationWhereInput {
  return {
    provider: "clerk",
    workspaceId: providerUser.workspaceId,
    email: providerUser.email,
    revokedAt: null,
    status: { in: ["pending", "provider_pending"] },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
  };
}

async function ensureWorkspaceRole(workspaceId: string, roleName: RoleName) {
  const existingRole = await prisma.role.findFirst({
    where: {
      workspaceId,
      name: roleName
    }
  });

  if (existingRole) {
    return existingRole;
  }

  return prisma.role.create({
    data: {
      workspaceId,
      name: roleName,
      permissions: getPermissionsForRole(roleName)
    }
  });
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
