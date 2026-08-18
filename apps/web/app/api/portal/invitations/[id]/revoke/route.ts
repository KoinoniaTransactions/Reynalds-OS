import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { canRevokeInvitationStatus } from "../../../../../../lib/portal-invitations";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await assertPermission("employee-portal:assignments:update");
    const { id } = await params;

    const invitation = await prisma.portalInvitation.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Portal invitation not found." }, { status: 404 });
    }

    if (invitation.status === "revoked" || invitation.revokedAt) {
      return NextResponse.json({ invitation });
    }

    if (!canRevokeInvitationStatus(invitation.status)) {
      return NextResponse.json(
        {
          error: "This invitation cannot be revoked. Deactivate the portal user access instead.",
          invitation
        },
        { status: 409 }
      );
    }

    const revokedInvitation = await prisma.portalInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "revoked",
        revokedAt: new Date()
      }
    });

    await prisma.auditEvent.create({
      data: {
        workspaceId: user.workspaceId,
        actorId: user.id,
        actorEmail: user.email,
        action: "portal.invitation.revoked",
        subjectType: "PortalInvitation",
        subjectId: invitation.id,
        summary: `Portal invitation revoked for ${invitation.email}`,
        metadata: {
          previousStatus: invitation.status,
          provider: invitation.provider,
          providerInvitationId: invitation.providerInvitationId
        }
      }
    });

    return NextResponse.json({ invitation: revokedInvitation });
  } catch (error) {
    return handleRevokeError(error);
  }
}

function handleRevokeError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
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
