import { isKnownRoleName } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { InvitationValidationError, validateInvitationInput } from "../../../../lib/portal-invitations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await assertPermission("employee-portal:assignments:update");
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  try {
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
  const user = await assertPermission("employee-portal:assignments:update");

  try {
    const input = validateInvitationInput(await request.json());

    if (!isKnownRoleName(input.roleName)) {
      return NextResponse.json({ error: "roleName must match an approved Koinonia role." }, { status: 400 });
    }

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
        status: "pending"
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

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return handleInvitationError(error);
  }
}

function handleInvitationError(error: unknown) {
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
