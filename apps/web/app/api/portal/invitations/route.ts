import { isKnownRoleName, type AuthUser, type RoleName } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission, AuthProviderConfigurationError } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  InvitationValidationError,
  type InvitationInput,
  validateInvitationInput
} from "../../../../lib/portal-invitations";
import { createClerkPortalInvitation } from "../../../../lib/provider-invitations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await assertPermission("employee-portal:assignments:update");
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const invitations = await prisma.portalInvitation.findMany({
      where: {
        workspaceId: user.workspaceId,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    return handleInvitationError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await assertPermission("employee-portal:assignments:update");
    const input = validateInvitationInput(await request.json());

    if (!isKnownRoleName(input.roleName)) {
      return NextResponse.json({ error: "roleName must match an approved Koinonia role." }, { status: 400 });
    }

    const typedInput: InvitationInput & { roleName: RoleName } = {
      ...input,
      roleName: input.roleName
    };

    if (input.clientObjectId) {
      const clientObject = await prisma.rosObject.findFirst({
        where: {
          id: input.clientObjectId,
          workspaceId: user.workspaceId,
          archivedAt: null
        }
      });

      if (!clientObject) {
        return NextResponse.json({ error: "clientObjectId was not found in this workspace." }, { status: 404 });
      }
    }

    const existingPendingInvitation = await prisma.portalInvitation.findFirst({
      where: {
        workspaceId: user.workspaceId,
        email: input.email,
        status: { in: ["pending", "provider_pending"] }
      }
    });

    if (existingPendingInvitation) {
      return NextResponse.json(
        {
          error: "A pending portal invitation already exists for this email.",
          invitation: existingPendingInvitation
        },
        { status: 409 }
      );
    }

    const invitation = await prisma.portalInvitation.create({
      data: {
        workspaceId: user.workspaceId,
        email: input.email,
        name: input.name,
        roleName: input.roleName,
        provider: "clerk",
        providerInvitationId: input.providerInvitationId,
        invitedByUserId: user.id,
        clientObjectId: input.clientObjectId,
        serviceContext: input.serviceContext as Prisma.InputJsonValue | undefined,
        status: input.sendProviderInvitation ? "provider_pending" : "pending",
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: user.workspaceId,
        actorId: user.id,
        actorEmail: user.email,
        action: "portal.invitation.created",
        subjectType: "PortalInvitation",
        subjectId: invitation.id,
        summary: `Portal invitation created for ${invitation.email}`,
        metadata: {
          roleName: invitation.roleName,
          clientObjectId: invitation.clientObjectId
        }
      }
    });

    if (typedInput.sendProviderInvitation) {
      return sendProviderInvitation({
        invitation,
        input: typedInput,
        user
      });
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return handleInvitationError(error);
  }
}

type CreatedPortalInvitation = {
  clientObjectId: string | null;
  email: string;
  id: string;
};

type SendProviderInvitationInput = {
  input: InvitationInput & { roleName: RoleName };
  invitation: CreatedPortalInvitation;
  user: AuthUser;
};

async function sendProviderInvitation({ invitation, input, user }: SendProviderInvitationInput) {
  try {
    const providerInvitation = await createClerkPortalInvitation({
      clientObjectId: input.clientObjectId,
      email: input.email,
      invitedByUserId: user.id,
      name: input.name,
      redirectUrl: input.redirectUrl,
      roleName: input.roleName,
      serviceContext: input.serviceContext,
      workspaceId: user.workspaceId
    });

    const updatedInvitation = await prisma.portalInvitation.update({
      where: { id: invitation.id },
      data: {
        providerInvitationId: providerInvitation.id,
        status: providerInvitation.status ?? "pending"
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: user.workspaceId,
        actorId: user.id,
        actorEmail: user.email,
        action: "portal.invitation.provider_sent",
        subjectType: "PortalInvitation",
        subjectId: invitation.id,
        summary: `Provider invitation sent for ${invitation.email}`,
        metadata: {
          provider: providerInvitation.provider,
          providerInvitationId: providerInvitation.id,
          ...(providerInvitation.status ? { providerStatus: providerInvitation.status } : {})
        }
      }
    });

    return NextResponse.json(
      {
        invitation: updatedInvitation,
        providerInvitation
      },
      { status: 201 }
    );
  } catch (error) {
    const updatedInvitation = await prisma.portalInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "provider_error"
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: user.workspaceId,
        actorId: user.id,
        actorEmail: user.email,
        action: "portal.invitation.provider_error",
        subjectType: "PortalInvitation",
        subjectId: invitation.id,
        summary: `Provider invitation failed for ${invitation.email}`,
        metadata: {
          provider: "clerk",
          error: error instanceof Error ? error.message : "Unknown provider invitation error"
        }
      }
    });

    return NextResponse.json(
      {
        invitation: updatedInvitation,
        error:
          error instanceof AuthProviderConfigurationError
            ? error.message
            : "Provider invitation could not be sent. The invitation record was kept for review."
      },
      { status: error instanceof AuthProviderConfigurationError ? 503 : 502 }
    );
  }
}

function handleInvitationError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof InvitationValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Portal invitation storage is temporarily unavailable." }, { status: 503 });
  }

  throw error;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
