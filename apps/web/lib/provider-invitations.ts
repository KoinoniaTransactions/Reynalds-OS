import type { RoleName } from "@reynalds-os/auth";
import { AuthProviderConfigurationError } from "./auth";

type ClerkInvitationParams = {
  emailAddress: string;
  publicMetadata: Record<string, unknown>;
  redirectUrl: string;
};

type ClerkInvitationResult = {
  id: string;
  status?: string;
  url?: string;
};

type ClerkClient = {
  invitations: {
    createInvitation(params: ClerkInvitationParams): Promise<ClerkInvitationResult>;
  };
};

type ClerkServerModule = {
  clerkClient: () => ClerkClient | Promise<ClerkClient>;
};

export type ProviderInvitationInput = {
  clientObjectId?: string;
  email: string;
  invitedByUserId: string;
  name?: string;
  redirectUrl?: string;
  roleName: RoleName;
  serviceContext?: Record<string, unknown>;
  workspaceId: string;
};

export type ProviderInvitationResult = {
  id: string;
  provider: "clerk";
  status?: string;
  url?: string;
};

export function buildClerkInvitationParams(input: ProviderInvitationInput): ClerkInvitationParams {
  return {
    emailAddress: input.email,
    redirectUrl: input.redirectUrl ?? "/sign-in",
    publicMetadata: withoutUndefined({
      koinoniaRole: input.roleName,
      koinoniaWorkspaceId: input.workspaceId,
      koinoniaInvitationName: input.name,
      koinoniaInvitedByUserId: input.invitedByUserId,
      koinoniaClientObjectId: input.clientObjectId,
      koinoniaServiceContext: input.serviceContext
    })
  };
}

export async function createClerkPortalInvitation(
  input: ProviderInvitationInput
): Promise<ProviderInvitationResult> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new AuthProviderConfigurationError(
      "CLERK_SECRET_KEY is required before provider invitations can be sent."
    );
  }

  const clerk = await loadClerkServerModule();
  const client = await Promise.resolve(clerk.clerkClient());
  const invitation = await client.invitations.createInvitation(buildClerkInvitationParams(input));

  return {
    provider: "clerk",
    id: invitation.id,
    status: invitation.status,
    url: invitation.url
  };
}

async function loadClerkServerModule(): Promise<ClerkServerModule> {
  try {
    return (await import("@clerk/nextjs/server")) as ClerkServerModule;
  } catch {
    throw new AuthProviderConfigurationError(
      "Provider invitations require @clerk/nextjs before invitation email delivery can run."
    );
  }
}

function withoutUndefined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}
